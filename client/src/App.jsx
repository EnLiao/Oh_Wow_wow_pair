import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import MainPage from './pages/main_page'
import DollPage from './pages/doll_page'
import NavBar from './components/nav_bar'
import Login from './pages/login'
import CreateDoll from './pages/create_doll'
import CreatePost from './pages/create_post'
import { AuthProvider } from './services/auth_context'
import RequireAuth from './services/require_auth'
import RequireDoll from './services/require_doll'

function AppLayout() {
  const location = useLocation()
  const NoNeedNavBar = 
    location.pathname === '/login' ||
    location.pathname === '/create_doll'

  return (
    <>
      {!NoNeedNavBar && <NavBar />}
      <Routes>
        <Route path='/' element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path='/create_doll' element={<CreateDoll />} />
          <Route element={<RequireDoll />}>
            <Route path='/doll_page/:doll_id' element={<DollPage />} />
            <Route path="/main_page" element={<MainPage />} />
            <Route path="/create_post" element={<CreatePost />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  )
}