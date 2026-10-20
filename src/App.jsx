import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider } from './lib/auth'
import Landing from './pages/Landing'
import Clipper from './pages/Clipper'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Terms from './pages/Terms'
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/clip" element={<Clipper />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<div className="p-16 text-center"><h1 className="text-3xl font-bold">404 — clip not found</h1></div>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
