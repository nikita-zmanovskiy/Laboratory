"use client"

import { useNotFoundRedirect } from "../hooks/useNotFoundRedirect"

export const NotFoundPage = () => {
  useNotFoundRedirect(0)

  return (
    <></>
  )
}