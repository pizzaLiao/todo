// import '@/styles/app.css'
import '@/styles/globals.scss'
import '@/styles/forum.scss'
import { AuthProvider } from '@/hooks/use-auth'
import DefaultLayout from '@/components/layout/default-layout'
import { useEffect } from 'react'
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
// import Todo from '@/pages/cs-0905/todo-page'

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap')
  }, [])
  // Use the layout defined at the page level, if available
  const getLayout =
    Component.getLayout || ((page) => <DefaultLayout>{page}</DefaultLayout>)

  return <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>
  // return (
  //   <AuthProvider>
  //     <Router>
  //       <Switch>
  //         {/* <Route path="/" exact component={Home} /> 首页 */}
  //         <Route path="/todo" component={Todo} /> {/* 论坛页面 */}
  //         <Route component={Component} /> {/* 默认路由 */}
  //       </Switch>
  //     </Router>
  //   </AuthProvider>
  // )
}
