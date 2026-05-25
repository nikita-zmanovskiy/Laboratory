import type { Metadata } from "next";

import { TemplateHomePage } from "@/pages/template-home";

export const metadata: Metadata = {
  title: "Чат | Лаборатория ИИ",
  description: "Страница чата учебной лаборатории ИИ.",
};

export default function ChatPage() {
  return <TemplateHomePage />;
}