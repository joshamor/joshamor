
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  getAdminSession,
  adminLogout,
} from '../../services/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const result = await getAdminSession()
      const currentAdmin = result.data?.admin || result.data || null

      setAdmin(currentAdmin)
      return currentAdmin
    } catch {
      setAdmin(null)
      return null
    }
  }, [])

  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        const result = await getAdminSession()

        if (active) {
          setAdmin(result.data?.admin || result.data || null)
        }
      } catch {
        if (active) setAdmin(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [])

  const logout = async () => {
    try {
      await adminLogout()
    } finally {
      setAdmin(null)
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error(
      'useAdminAuth must be used inside AdminAuthProvider.'
    )
  }

  return context
}
