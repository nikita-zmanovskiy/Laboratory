import { GenerateMode, GenerateRequestDto } from "../api/dto";


/**
 * cоздает объект запроса для генерации сообщения
 */
export const createGenerateRequest = (
    mode: GenerateMode,
    prompt: string,
    sessionId: string,
    imageBase64?: string | null
): GenerateRequestDto => {
    const body: GenerateRequestDto = { 
        mode, 
        prompt, 
        session_id: sessionId 
    };

    if (imageBase64) {
        body.image = imageBase64;
    }

    return body;
};