"use client";

import { useEffect, useReducer, useCallback, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────

interface Choice { key: string; text: string; }

interface Question {
  _id: string;
  questionType: string;
  skill: string;
  part?: number;
  content: {
    question: string;
    passage?: string;
    audioUrl?: string;
    imageUrl?: string;
    choices?: Choice[];
  };
}

interface ExamSection {
  name: string;
  skill: string;
  questions: Question[];
}

interface ExamData {
  _id: string;
  title: string;
  examType: string;
  slug: string;
  sections: ExamSection[];
  totalQuestions: number;
  timeLimitSeconds: number;
  maxScore: number;
}

interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  timeSpentSeconds: number;
}

interface ResultData {
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  sectionScores: { sectionName: string; score: number; total: number }[];
  answers: { questionId: string; userAnswer: string; isCorrect: boolean }[];
  timeTakenSeconds: number;
}

// ── State machine ──────────────────────────────────────────────────

type Phase = "loading" | "error" | "ready" | "running" | "submitting" | "result";

interface State {
  phase: Phase;
  exam: ExamData | null;
  error: string;
  currentSection: number;
  currentQuestion: number;
  answers: Map<string, AnswerRecord>;
  timeLeft: number;
  result: ResultData | null;
}

type Action =
  | { type: "LOADED"; exam: ExamData }
  | { type: "ERROR"; message: string }
  | { type: "START" }
  | { type: "ANSWER"; questionId: string; answer: string; timeSpent: number }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "JUMP"; section: number; question: number }
  | { type: "TICK" }
  | { type: "SUBMITTING" }
  | { type: "RESULT"; result: ResultData };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOADED":
      return { ...state, phase: "ready", exam: action.exam, timeLeft: action.exam.timeLimitSeconds };
    case "ERROR":
      return { ...state, phase: "error", error: action.message };
    case "START":
      return { ...state, phase: "running" };
    case "ANSWER": {
      const next = new Map(state.answers);
      next.set(action.questionId, { questionId: action.questionId, userAnswer: action.answer, timeSpentSeconds: action.timeSpent });
      return { ...state, answers: next };
    }
    case "NEXT": {
      if (!state.exam) return state;
      const section = state.exam.sections[state.currentSection];
      if (state.currentQuestion < section.questions.length - 1) {
        return { ...state, currentQuestion: state.currentQuestion + 1 };
      }
      if (state.currentSection < state.exam.sections.length - 1) {
        return { ...state, currentSection: state.currentSection + 1, currentQuestion: 0 };
      }
      return state;
    }
    case "PREV": {
      if (state.currentQuestion > 0) {
        return { ...state, currentQuestion: state.currentQuestion - 1 };
      }
      if (state.currentSection > 0 && state.exam) {
        const prevSection = state.exam.sections[state.currentSection - 1];
        return { ...state, currentSection: state.currentSection - 1, currentQuestion: prevSection.questions.length - 1 };
      }
      return state;
    }
    case "JUMP":
      return { ...state, currentSection: action.section, currentQuestion: action.question };
    case "TICK":
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };
    case "SUBMITTING":
      return { ...state, phase: "submitting" };
    case "RESULT":
      return { ...state, phase: "result", result: action.result };
    default:
      return state;
  }
}

const init: State = {
  phase: "loading",
  exam: null,
  error: "",
  currentSection: 0,
  currentQuestion: 0,
  answers: new Map(),
  timeLeft: 0,
  result: null,
};

// ── Component ──────────────────────────────────────────────────────

export function ExamRunner({ slug }: { slug: string }) {
  const [state, dispatch] = useReducer(reducer, init);
  const questionStartRef = useRef<number>(Date.now());

  // Load exam
  useEffect(() => {
    fetch(`/api/exams/${slug}`)
      .then(r => r.json())
      .then(res => {
        if (!res.success) throw new Error(res.error);
        dispatch({ type: "LOADED", exam: res.data });
      })
      .catch(e => dispatch({ type: "ERROR", message: e.message }));
  }, [slug]);

  // Timer
  useEffect(() => {
    if (state.phase !== "running") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (state.phase === "running" && state.timeLeft === 0) handleSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timeLeft, state.phase]);

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
    dispatch({ type: "ANSWER", questionId, answer, timeSpent });
    questionStartRef.current = Date.now();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!state.exam) return;
    dispatch({ type: "SUBMITTING" });

    const timeTaken = state.exam.timeLimitSeconds - state.timeLeft;
    const answersArr = Array.from(state.answers.values());

    const res = await fetch(`/api/exams/${slug}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answersArr, timeTakenSeconds: timeTaken }),
    });

    const data = await res.json();
    if (data.success) {
      dispatch({ type: "RESULT", result: data.data });
    } else {
      dispatch({ type: "ERROR", message: data.error });
    }
  }, [slug, state.exam, state.answers, state.timeLeft]);

  // ── Render phases ──

  if (state.phase === "loading") return <CenterMsg>Đang tải đề thi...</CenterMsg>;
  if (state.phase === "error")   return <CenterMsg error>{state.error}</CenterMsg>;
  if (state.phase === "result" && state.result)
    return <ResultScreen result={state.result} exam={state.exam!} slug={slug} />;
  if (state.phase === "ready" && state.exam)
    return <ReadyScreen exam={state.exam} onStart={() => dispatch({ type: "START" })} />;

  if (!state.exam || (state.phase !== "running" && state.phase !== "submitting"))
    return null;

  const section = state.exam.sections[state.currentSection];
  const question = section.questions[state.currentQuestion];
  const totalAnswered = state.answers.size;
  const totalQ = state.exam.totalQuestions;

  // Global question index for display
  let globalIndex = state.currentQuestion;
  for (let i = 0; i < state.currentSection; i++) {
    globalIndex += state.exam.sections[i].questions.length;
  }

  const currentAnswer = state.answers.get(question._id)?.userAnswer ?? null;

  return (
    <div style={runnerWrap}>
      {/* Top bar */}
      <div style={topBar}>
        <div style={examTitle}>{state.exam.title}</div>
        <div style={topCenter}>
          <span style={sectionTag}>{section.name}</span>
          <span style={qCounter}>Câu {globalIndex + 1} / {totalQ}</span>
        </div>
        <div style={topRight}>
          <TimerDisplay seconds={state.timeLeft} />
          <button
            onClick={handleSubmit}
            disabled={state.phase === "submitting"}
            style={submitBtn}
          >
            {state.phase === "submitting" ? "Đang nộp..." : "Nộp bài"}
          </button>
        </div>
      </div>

      <div style={body}>
        {/* Question panel */}
        <div style={qPanel}>
          {question.content.passage && (
            <div style={passage}>{question.content.passage}</div>
          )}

          <p style={qText}>
            <span style={qNum}>Câu {globalIndex + 1}.</span>{" "}
            {question.content.question}
          </p>

          {question.content.choices && (
            <div style={choicesWrap}>
              {question.content.choices.map(c => {
                const selected = currentAnswer === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => handleAnswer(question._id, c.key)}
                    style={{
                      ...choiceBtn,
                      background: selected ? "var(--mint)" : "#fff",
                      borderColor: selected ? "var(--teal, #4ECBA8)" : "var(--ground-2)",
                      fontWeight: selected ? 700 : 400,
                    }}
                  >
                    <span style={{
                      ...choiceKey,
                      background: selected ? "var(--teal, #4ECBA8)" : "var(--ground-2)",
                      color: selected ? "#fff" : "var(--text-mid)",
                    }}>
                      {c.key}
                    </span>
                    {c.text}
                  </button>
                );
              })}
            </div>
          )}

          {/* Nav buttons */}
          <div style={navBtns}>
            <button
              onClick={() => dispatch({ type: "PREV" })}
              disabled={state.currentSection === 0 && state.currentQuestion === 0}
              style={navBtn}
            >
              ← Câu trước
            </button>
            <button
              onClick={() => dispatch({ type: "NEXT" })}
              disabled={
                state.currentSection === state.exam.sections.length - 1 &&
                state.currentQuestion === section.questions.length - 1
              }
              style={{ ...navBtn, background: "var(--accent)", color: "#fff", border: "none" }}
            >
              Câu tiếp →
            </button>
          </div>
        </div>

        {/* Answer map sidebar */}
        <aside style={mapPanel}>
          <div style={mapTitle}>Câu trả lời ({totalAnswered}/{totalQ})</div>
          <div style={progressBar}>
            <div style={{ ...progressFill, width: `${(totalAnswered / totalQ) * 100}%` }} />
          </div>
          {state.exam.sections.map((sec, si) => (
            <div key={si} style={{ marginBottom: "1rem" }}>
              <div style={mapSectionLabel}>{sec.name}</div>
              <div style={mapGrid}>
                {sec.questions.map((q, qi) => {
                  const answered = state.answers.has(q._id);
                  const isCurrent = si === state.currentSection && qi === state.currentQuestion;
                  return (
                    <button
                      key={q._id}
                      onClick={() => dispatch({ type: "JUMP", section: si, question: qi })}
                      style={{
                        ...mapDot,
                        background: isCurrent ? "var(--accent)" : answered ? "var(--teal, #4ECBA8)" : "#fff",
                        color: isCurrent || answered ? "#fff" : "var(--text-mid)",
                        border: isCurrent ? "2px solid var(--accent)" : answered ? "2px solid var(--teal, #4ECBA8)" : "1.5px solid var(--ground-2)",
                      }}
                    >
                      {/* global number */}
                      {(() => {
                        let base = qi;
                        for (let x = 0; x < si; x++) base += state.exam!.sections[x].questions.length;
                        return base + 1;
                      })()}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function CenterMsg({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "50vh", color: error ? "var(--danger, #dc2626)" : "var(--text-mid)" }}>
      {children}
    </div>
  );
}

function TimerDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const urgent = seconds < 300;
  return (
    <div style={{ ...timerBox, background: urgent ? "#fef2f2" : "var(--ground)", color: urgent ? "#dc2626" : "var(--text-mid)" }}>
      ⏱ {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}

function ReadyScreen({ exam, onStart }: { exam: ExamData; onStart: () => void }) {
  const mins = Math.round(exam.timeLimitSeconds / 60);
  return (
    <div style={{ maxWidth: "520px", margin: "4rem auto", textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📝</div>
      <h1 style={{ fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-.02em", marginBottom: ".5rem" }}>
        {exam.title}
      </h1>
      <p style={{ color: "var(--text-mid)", marginBottom: "2rem", lineHeight: 1.65 }}>
        {exam.totalQuestions} câu hỏi · {mins} phút · Thang điểm {exam.maxScore}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: ".75rem", alignItems: "center", marginBottom: "2rem" }}>
        {[
          "Đảm bảo bạn có đủ thời gian và không bị gián đoạn",
          "Trả lời tất cả câu — không bị trừ điểm câu sai",
          "Bạn có thể xem lại và đổi đáp án bất cứ lúc nào",
        ].map(tip => (
          <div key={tip} style={{ display: "flex", gap: ".625rem", alignItems: "flex-start", textAlign: "left", maxWidth: "360px" }}>
            <span style={{ color: "var(--teal, #4ECBA8)", flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: ".9375rem", color: "var(--text-mid)" }}>{tip}</span>
          </div>
        ))}
      </div>
      <button onClick={onStart} style={startBtnStyle}>
        Bắt đầu thi
      </button>
    </div>
  );
}

function ResultScreen({ result, exam, slug }: { result: ResultData; exam: ExamData; slug: string }) {
  const pct = Math.round((result.correctCount / result.totalQuestions) * 100);
  const mins = Math.floor(result.timeTakenSeconds / 60);
  const secs = result.timeTakenSeconds % 60;

  return (
    <div style={{ maxWidth: "600px", margin: "3rem auto" }}>
      <h1 style={{ fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-.02em", marginBottom: "2rem", textAlign: "center" }}>
        Kết quả bài thi
      </h1>

      {/* Score card */}
      <div style={{ background: "var(--mint)", borderRadius: "24px", padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: ".875rem", color: "#0f5c44", fontWeight: 600, marginBottom: ".5rem" }}>
          {exam.examType} · {exam.title}
        </div>
        <div style={{ fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "4rem", color: "var(--text)", lineHeight: 1, marginBottom: ".25rem" }}>
          {result.score}
        </div>
        <div style={{ color: "#0f5c44", fontSize: "1rem" }}>/ {result.maxScore} điểm</div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Câu đúng",    value: `${result.correctCount}/${result.totalQuestions}` },
          { label: "Tỷ lệ đúng",  value: `${pct}%` },
          { label: "Thời gian",   value: `${mins}p${String(secs).padStart(2,"0")}s` },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "14px", padding: "1.25rem", textAlign: "center", border: "1.5px solid var(--ground-2)" }}>
            <div style={{ fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.5rem", marginBottom: ".25rem" }}>{s.value}</div>
            <div style={{ fontSize: ".8rem", color: "var(--text-dim)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section breakdown */}
      {result.sectionScores.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", border: "1.5px solid var(--ground-2)", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>
            Chi tiết từng phần
          </div>
          {result.sectionScores.map(sec => (
            <div key={sec.sectionName} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: ".75rem" }}>
              <span style={{ fontSize: ".875rem", color: "var(--text-mid)", width: "100px", flexShrink: 0 }}>{sec.sectionName}</span>
              <div style={{ flex: 1, height: "8px", background: "var(--ground-2)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${sec.total ? (sec.score / sec.total) * 100 : 0}%`, background: "var(--teal, #4ECBA8)", borderRadius: "4px" }} />
              </div>
              <span style={{ fontSize: ".875rem", fontWeight: 600, width: "50px", textAlign: "right" }}>{sec.score}/{sec.total}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <a href="/dashboard/exam" style={{ ...startBtnStyle, background: "var(--ground-2)", color: "var(--text-mid)" }}>
          ← Về danh sách đề
        </a>
        <a href={`/dashboard/exam/${slug}`} style={startBtnStyle}>
          Làm lại bài này
        </a>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const runnerWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "calc(100vh - 56px)",
  overflow: "hidden",
};

const topBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: ".875rem 1.5rem",
  background: "#fff",
  borderBottom: "1.5px solid var(--ground-2)",
  gap: "1rem",
  flexShrink: 0,
};

const examTitle: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 700,
  fontSize: ".9375rem",
  color: "var(--text)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "200px",
};

const topCenter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: ".75rem",
};

const sectionTag: React.CSSProperties = {
  background: "var(--sky)",
  color: "#1a4a7a",
  padding: ".2rem .65rem",
  borderRadius: "999px",
  fontSize: ".75rem",
  fontWeight: 600,
};

const qCounter: React.CSSProperties = {
  fontSize: ".875rem",
  color: "var(--text-mid)",
  fontWeight: 500,
};

const topRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: ".75rem",
};

const timerBox: React.CSSProperties = {
  padding: ".35rem .875rem",
  borderRadius: "999px",
  fontSize: ".875rem",
  fontWeight: 700,
  fontFamily: "monospace",
  border: "1.5px solid var(--ground-2)",
};

const submitBtn: React.CSSProperties = {
  padding: ".45rem 1.25rem",
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 700,
  fontSize: ".875rem",
  cursor: "pointer",
};

const body: React.CSSProperties = {
  display: "flex",
  flex: 1,
  overflow: "hidden",
};

const qPanel: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "2rem",
};

const passage: React.CSSProperties = {
  background: "var(--ground-2)",
  borderRadius: "12px",
  padding: "1.25rem",
  fontSize: ".9375rem",
  lineHeight: 1.75,
  marginBottom: "1.5rem",
  color: "var(--text)",
};

const qNum: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  color: "var(--accent)",
};

const qText: React.CSSProperties = {
  fontSize: "1rem",
  lineHeight: 1.7,
  color: "var(--text)",
  marginBottom: "1.5rem",
};

const choicesWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: ".625rem",
  marginBottom: "2rem",
};

const choiceBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: ".875rem",
  padding: ".75rem 1rem",
  borderRadius: "12px",
  border: "1.5px solid var(--ground-2)",
  cursor: "pointer",
  fontSize: ".9375rem",
  textAlign: "left",
  fontFamily: "inherit",
  transition: "all .15s",
  color: "var(--text)",
};

const choiceKey: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 700,
  fontSize: ".8125rem",
  flexShrink: 0,
};

const navBtns: React.CSSProperties = {
  display: "flex",
  gap: ".75rem",
};

const navBtn: React.CSSProperties = {
  padding: ".6rem 1.25rem",
  borderRadius: "999px",
  border: "1.5px solid var(--ground-2)",
  background: "#fff",
  color: "var(--text-mid)",
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 600,
  fontSize: ".875rem",
  cursor: "pointer",
};

const mapPanel: React.CSSProperties = {
  width: "220px",
  borderLeft: "1.5px solid var(--ground-2)",
  padding: "1.25rem",
  overflowY: "auto",
  background: "#fff",
  flexShrink: 0,
};

const mapTitle: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 700,
  fontSize: ".875rem",
  color: "var(--text)",
  marginBottom: ".625rem",
};

const progressBar: React.CSSProperties = {
  height: "6px",
  background: "var(--ground-2)",
  borderRadius: "3px",
  overflow: "hidden",
  marginBottom: "1.25rem",
};

const progressFill: React.CSSProperties = {
  height: "100%",
  background: "var(--teal, #4ECBA8)",
  borderRadius: "3px",
  transition: "width .3s",
};

const mapSectionLabel: React.CSSProperties = {
  fontSize: ".75rem",
  fontWeight: 600,
  color: "var(--text-dim)",
  letterSpacing: ".06em",
  textTransform: "uppercase",
  marginBottom: ".5rem",
};

const mapGrid: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: ".375rem",
};

const mapDot: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "6px",
  fontSize: ".75rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  fontFamily: "monospace",
};

const startBtnStyle: React.CSSProperties = {
  display: "inline-block",
  padding: ".8rem 2rem",
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  textDecoration: "none",
};
