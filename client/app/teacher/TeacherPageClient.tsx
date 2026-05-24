"use client";

import { useEffect } from "react";

import { useSessionStore } from "@/entities/session";
import { CreateClassroomContainer } from "@/features/create-classroom";

export function TeacherPageClient() {
  const initialize = useSessionStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <CreateClassroomContainer />;
}