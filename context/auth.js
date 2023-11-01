import { createContext } from 'react'
//建立與導出它:
export const AuthContext = createContext(null) //習慣以 null 作為初始值

//最外(上)元件階層包裹提供者元件，讓父母元件可以提供它，於 pages/_app.js 引入:
