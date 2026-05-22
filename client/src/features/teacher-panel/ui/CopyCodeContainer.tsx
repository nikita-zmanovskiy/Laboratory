"use client"

import { useCopyCode } from "../model/useCopyCode"
import { CopyCodeButton } from "./CopyCodeButton"

export const CopyCodeContainer = ({ code }: { code: string }) => {
    const { copied, handleCopy } = useCopyCode(code)

    return <CopyCodeButton code={code} copied={copied} onCopy={handleCopy} />
}