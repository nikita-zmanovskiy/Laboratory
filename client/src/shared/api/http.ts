import axios from "axios"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ""

export const http = axios.create({
    baseURL: apiUrl,
    timeout: 60000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})
