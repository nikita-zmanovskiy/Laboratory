"use client"

import React from "react"

interface EmptyChatStateProps {
    title?: string
    description?: string
}

export const EmptyChatState = React.memo(
    ({
        title = "Учебный веб-сервис «Промт-инженер»",
        description = "Интерактивный инструмент для практического освоения навыков составления промтов",
    }: EmptyChatStateProps) => {
        return (
            <div className="animate-fade-in page__animation flex h-full w-full flex-col items-center justify-center rounded-xl p-8 text-center">
                <h3 className="text-base font-medium text-[var(--color-text-primary)]">
                    {title}
                </h3>
                <p className="mt-1 max-w-[600px] text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {description}
                </p>
                <div className="mt-6 flex flex-col gap-2 text-xs text-[var(--color-text-muted)] max-w-sm">
                    <div className="flex justify-center items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 16 16" fill="currentColor" className="text-[var(--color-text-muted)]">
                        <path fillRule="evenodd" d="M14 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2z"/>
                        <path fillRule="evenodd" d="M9.146 8.146a.5.5 0 0 1 .708 0L11.5 9.793l1.646-1.647a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 0-.708z"/>
                        <path fillRule="evenodd" d="M11.5 5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5z"/>
                        <path d="M3.56 11V7.01h.056l1.428 3.239h.774l1.42-3.24h.056V11h1.073V5.001h-1.2l-1.71 3.894h-.039l-1.71-3.894H2.5V11h1.06z"/>
                      </svg>
                      <p>Можно использовать Markdown для форматирования ответов</p>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                        <svg stroke="var(--color-text-muted)" width="15px" height="15px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        <p>Прикрепляйте изображения для анализа или генерации</p>   
                    </div>
                    <div className="flex justify-center items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19px" height="19px" viewBox="0 0 24 24" version="1.1">
                            <g id="Iconly/Light-Outline/Send" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Send" transform="translate(2.000000, 3.000000)" fill="var(--color-text-muted)">
                                    <path d="M8.8049,11.8178 L12.4619,17.7508 C12.6219,18.0108 12.8719,18.0078 12.9729,17.9938 C13.0739,17.9798 13.3169,17.9178 13.4049,17.6228 L17.9779,2.1778 C18.0579,1.9048 17.9109,1.7188 17.8449,1.6528 C17.7809,1.5868 17.5979,1.4458 17.3329,1.5208 L1.8769,6.0468 C1.5839,6.1328 1.5199,6.3788 1.5059,6.4798 C1.4919,6.5828 1.4879,6.8378 1.7469,7.0008 L7.7479,10.7538 L13.0499,5.3958 C13.3409,5.1018 13.8159,5.0988 14.1109,5.3898 C14.4059,5.6808 14.4079,6.1568 14.1169,6.4508 L8.8049,11.8178 Z M12.8949,19.4998 C12.1989,19.4998 11.5609,19.1458 11.1849,18.5378 L7.3079,12.2468 L0.9519,8.2718 C0.2669,7.8428 -0.0911,7.0788 0.0199,6.2758 C0.1299,5.4728 0.6809,4.8348 1.4549,4.6078 L16.9109,0.0818 C17.6219,-0.1262 18.3839,0.0708 18.9079,0.5928 C19.4319,1.1198 19.6269,1.8898 19.4149,2.6038 L14.8419,18.0478 C14.6129,18.8248 13.9729,19.3738 13.1719,19.4808 C13.0779,19.4928 12.9869,19.4998 12.8949,19.4998 L12.8949,19.4998 Z" id="Fill-1"/>
                                </g>
                            </g>
                        </svg>
                        <p>Введите промпт в поле ниже и нажмите отправить</p>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="var(--color-text-muted)">
                        <path d="M6 12C4.89543 12 4 11.1046 4 10C4 8.89543 4.89543 8 6 8C7.10457 8 8 8.89543 8 10C8 11.1046 7.10457 12 6 12Z"/>
                        <path d="M18 10C18 7.79086 16.2091 6 14 6H6C3.79086 6 2 7.79086 2 10C2 12.2091 3.79086 14 6 14H14C16.2091 14 18 12.2091 18 10ZM14 7C15.6569 7 17 8.34315 17 10C17 11.6569 15.6569 13 14 13H6C4.34315 13 3 11.6569 3 10C3 8.34315 4.34315 7 6 7H14Z"/>
                        </svg>
                        <p>Переключайте режимы Текст или Изображение</p>
                    </div>
                </div>
            </div>
        )
    },
)

EmptyChatState.displayName = "EmptyChatState"