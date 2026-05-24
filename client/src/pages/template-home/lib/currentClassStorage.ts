type StoredClassroom = {
    code: string
    expires_at: string
  }
  
  export const getCurrentClassFromStorage = (): StoredClassroom | null => {
    try {
      const stored = localStorage.getItem("currentClass")
  
      if (!stored) {
        return null
      }
  
      const parsed = JSON.parse(stored) as StoredClassroom
  
      if (!parsed.code || !parsed.expires_at) {
        return null
      }
  
      return parsed
    } catch {
      return null
    }
  } 
  export const isClassroomActive = (expiresAt: string) => {
    return new Date(expiresAt).getTime() > Date.now()
  }