export type GigaChatMode = 'text' | 'image'

const IMAGE_KEYWORDS = [
    'нарисуй',
    'нарисуйте',
    'изобрази',
    'создай изображение',
    'покажи',
    'картинку',
    'рисунок',
    'draw',
    'paint',
    'image',
    'picture',
    'сгенерируй изображение',
]

export function detectGigaChatMode(prompt: string): GigaChatMode {
    const lowerPrompt = prompt.toLowerCase()

    return IMAGE_KEYWORDS.some((keyword) => lowerPrompt.includes(keyword)) ? 'image' : 'text'
}
