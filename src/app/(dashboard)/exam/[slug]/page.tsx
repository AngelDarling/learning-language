import { ExamRunner } from "@/components/exam/ExamRunner";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ExamPage({ params }: Props) {
  const { slug } = await params;
  return <ExamRunner slug={slug} />;
}
