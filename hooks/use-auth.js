import { createContext, useState, useContext } from 'react'
// 習慣上都以null作為初始化值
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuth: false,
    userData: {
      id: 0,
      name: '',
      username: '',
      email: '',
    },
  })

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)