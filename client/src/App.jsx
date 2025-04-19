import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/main_page'
import DollPage from './pages/doll_page'
import NavBar from './components/nav_bar'
import Login from './pages/login'

function AppLayout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/'

  return (
    <>
      {!isLoginPage && <NavBar />}
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path="/profile" element={<DollPage />} />
        <Route path="/home" element={<Home />} />
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