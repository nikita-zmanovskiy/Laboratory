"use client"

import { CopyCodeButtonProps } from "../../types"

export const CopyCodeButton = ({ code, copied, onCopy }: CopyCodeButtonProps) => (
    <button
        onClick={onCopy}
        className={`flex items-center cursor-pointer gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
            copied
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-transparent"
        }`}
    >
        {copied ? (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
                Скопировано!
            </>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {code}
            </>
        )}
    </button>
)