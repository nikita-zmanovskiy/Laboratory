import type { Metadata } from "next";

import { TeacherPageClient } from "./TeacherPageClient";

export const metadata: Metadata = {
  title: "Страница преподавателя | Лаборатория ИИ",
  description: "Страница преподавателя учебной лаборатории ИИ.",
};

export default function TeacherPage() {
  return <TeacherPageClient />;
}