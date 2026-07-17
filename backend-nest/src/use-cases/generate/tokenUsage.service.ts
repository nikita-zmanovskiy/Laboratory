import { Injectable } from '@nestjs/common'
import type { AiUsage } from '../../types/ai'
import { estimateTokens } from '../../utils/tokenEstimate'

export interface TokenUsage {
    input: number
    output: number
    approximate: boolean
}

@Injectable()
export class TokenUsageService {
    createEmpty(): TokenUsage {
        return {
            input: 0,
            output: 0,
            approximate: true,
        }
    }

    fromAiUsage(prompt: string, outputText: string, usage?: AiUsage | null): TokenUsage {
        if (usage) {
            return {
                input: usage.prompt_tokens || usage.input || Math.ceil(prompt.length / 4),
                output: usage.completion_tokens || usage.output || Math.ceil(outputText.length / 4),
                approximate: false,
            }
        }

        return {
            input: estimateTokens(prompt).tokens,
            output: estimateTokens(outputText).tokens,
            approximate: true,
        }
    }
}
