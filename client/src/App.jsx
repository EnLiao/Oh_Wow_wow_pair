import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import MainPage from './pages/main_page'
import DollPage from './pages/doll_page'
import NavBar from './components/nav_bar'
import Login from './pages/login'

function AppLayout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <>
      {!isLoginPage && <NavBar />}
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path="/doll_page" element={<DollPage />} />
        <Route path="/main_page" element={<MainPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}