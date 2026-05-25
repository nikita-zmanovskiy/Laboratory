"use client";

import { useParams } from "next/navigation";

import { TeacherPanelContainer } from "@/features/teacher-panel";

export function ClassroomPageClient() {
  const params = useParams();
  const code = (params?.code ?? "") as string;

  return <TeacherPanelContainer code={code} />;
}