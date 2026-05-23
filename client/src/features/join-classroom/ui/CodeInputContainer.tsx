"use client"

import { useJoinClassroom } from "../model/useJoinClassroom"

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
