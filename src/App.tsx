import { Navigate, Outlet } from 'react-router-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AdminProvider } from '@/context/AdminContext'
import { TestModalProvider } from '@/context/TestModalContext'
import TestVocacionalModal from '@/components/TestVocacionalModal'
import NavBar from '@/components/layout/NavBar'
import BottomBar from '@/components/layout/BottomBar'
import WhatsAppFAB from '@/components/WhatsAppFAB'
// import EvaFAB from '@/components/EvaFAB'  // suspended until Eva Admisiones decision
import Inicio from '@/pages/Inicio'
import Carreras from '@/pages/Carreras'
import EvaIA from '@/pages/EvaIA'
import MiBeca from '@/pages/MiBeca'
import Admin from '@/pages/Admin'
import Intro from '@/pages/Intro'
import Universidad from '@/pages/Universidad'
import CarreraDetalle from '@/pages/CarreraDetalle'

function WebShell() {
  return (
    <div className="min-h-dvh flex flex-col">
      <NavBar />
      <Outlet />
      <BottomBar />
      {/* <EvaFAB />  suspended */}
      <WhatsAppFAB />
      <TestVocacionalModal />
    </div>
  )
}

export default function App() {
  return (
    <AdminProvider>
      <TestModalProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<WebShell />}>
              <Route path="/"            element={<Inicio />} />
              <Route path="/intro"       element={<Intro />} />
              <Route path="/universidad" element={<Universidad />} />
              <Route path="/carreras"    element={<Carreras />} />
              <Route path="/eva-ia"      element={<EvaIA />} />
              <Route path="/mi-beca"     element={<MiBeca />} />
              <Route path="/carrera/:id" element={<CarreraDetalle />} />
              <Route path="/admin"       element={<Admin />} />
              <Route path="*"            element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TestModalProvider>
    </AdminProvider>
  )
}
