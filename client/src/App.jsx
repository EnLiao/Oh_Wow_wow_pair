import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import MainPage from './pages/main_page'
import DollPage from './pages/doll_page'
import NavBar from './components/nav_bar'
import Login from './pages/login'
import CreateDoll from './pages/create_doll'
import CreatePost from './pages/create_post'
import { DollProvider } from './components/auth_context';

function AppLayout() {
  const location = useLocation()
  const NoNeedNavBar = 
    location.pathname === '/login' ||
    location.pathname === '/create_doll' ||
    location.pathname === '/create_post';

  return (
    <>
      {!NoNeedNavBar && <NavBar />}
      <DollProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path="/doll_page" element={<DollPage />} />
          <Route path="/main_page" element={<MainPage />} />
          <Route path="/create_doll" element={<CreateDoll />} />
          <Route path="/create_post" element={<CreatePost />} />
        </Routes>
      </DollProvider>
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