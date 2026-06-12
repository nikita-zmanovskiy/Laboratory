import { create } from "zustand"

import { initSession } from "../lib/initSession"

interface SessionStoreState {
	sessionId: string | null
}

interface SessionStoreActions {
	initialize: () => void
}

type SessionStore = SessionStoreState & SessionStoreActions

/**
 * Хранилище идентификатора сессии
 *
 * SessionId генерируется через initSession при вызове initialize
 * Используется для идентификации пользователя в API запросах
 */

/**
 * Хранилище роли пользователя и данных текущего класса
 *
 * При создании читает начальное состояние из localStorage
 * Все сеттеры синхронизируют состояние с localStorage
 * exitChat удаляет данные класса но сохраняет роль
 * reset полностью очищает все данные включая currentClass
 * logout удаляет только роль
 * loadFromStorage восстанавливает состояние из localStorage
 */

export const useSessionStore =
	create<SessionStore>((set) => ({
		sessionId: null,
		initialize: () => {
			const id = initSession()
			if (id) set({ sessionId: id })
		},
	}))

export type UserRole = "student" | "teacher" | null

const readRoleFromStorage = (): RoleStoreState => {
	if (typeof window === "undefined") {
		return { role: null, classroomCode: null, expiresAt: null }
	}

	const role = (localStorage.getItem("role") || null) as UserRole

	return {
		role: role || null,
		classroomCode: localStorage.getItem("classroomCode"),
		expiresAt: localStorage.getItem("expiresAt"),
	}
}

interface RoleStoreState {
	role: UserRole
	classroomCode: string | null
	expiresAt: string | null
}

interface RoleStoreActions {
	setRole: (role: UserRole) => void
	setClassroomCode: (code: string) => void
	setExpiresAt: (expiresAt: string) => void
	reset: () => void
	exitChat: () => void
	loadFromStorage: () => void
	logout: () => void
}

type RoleStore = RoleStoreState & RoleStoreActions

export const useRoleStore = create<RoleStore>((set) => ({
	...readRoleFromStorage(),
	setRole: (role) => {
		localStorage.setItem("role", role || "")
		set({ role })
	},
	setClassroomCode: (code) => {
		localStorage.setItem("classroomCode", code)
		set({ classroomCode: code })
	},
	setExpiresAt: (expiresAt) => {
		localStorage.setItem("expiresAt", expiresAt)
		set({ expiresAt })
	},
	exitChat: () => {
		localStorage.removeItem("role")
		localStorage.removeItem("classroomCode")
		localStorage.removeItem("expiresAt")
		set({ role: null, classroomCode: null, expiresAt: null })
	},
	reset: () => {
		localStorage.removeItem("role")
		localStorage.removeItem("classroomCode")
		localStorage.removeItem("expiresAt")
		localStorage.removeItem("currentClass")
		set({ role: null, classroomCode: null, expiresAt: null })
	},
	logout: () => {
		localStorage.removeItem("role")
		set({ role: null })
	},
	loadFromStorage: () => {
		const role = (localStorage.getItem("role") as UserRole) || null,
		 classroomCode = localStorage.getItem("classroomCode"),
		 expiresAt = localStorage.getItem("expiresAt")

		if (role) {
			set({ role, classroomCode, expiresAt })
		}
	},
}))
