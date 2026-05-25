import type { Metadata } from "next";

import { ClassroomPageClient } from "./ClassroomPageClient";

export const metadata: Metadata = {
  title: "Логи класса | Лаборатория ИИ",
  description: "Страница просмотра логов и активности учебного класса.",
};

export default function ClassroomPage() {
  return <ClassroomPageClient />;
}