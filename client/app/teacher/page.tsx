import type { Metadata } from "next";

import { TeacherPageClient } from "./TeacherPageClient";

export const metadata: Metadata = {
  title: "Создание урока | Лаборатория ИИ",
  description: "Страница создания урока учебной лаборатории ИИ.",
};

export default function TeacherPage() {
  return <TeacherPageClient />;
}