"use client"

import { useJoinClassroom } from "../hooks/useJoinClassroom"

import { CodeInput } from "./CodeInput"

export const CodeInputContainer = ({ onBack }: { onBack: () => void }) => {
    const { code, setCode, isLoading, error, handleJoin } = useJoinClassroom()

    return (
        <CodeInput
            code={code}
            isLoading={isLoading}
            error={error}
            onCodeChange={setCode}
            onSubmit={handleJoin}
            onBack={onBack}
        />
    )
}
