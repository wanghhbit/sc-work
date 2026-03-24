import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Login } from '@/pages/Login'
import { Layout } from '@/pages/Layout'
import { Agents } from '@/pages/Agents'
import { Tasks } from '@/pages/Tasks'
import { Dashboard } from '@/pages/Dashboard'
import { Profile } from '@/pages/Profile'
import { Settings } from '@/pages/Settings'
import { Monitor } from '@/pages/Monitor'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) {
    return <Navigate to="/login" />
  }
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Agents />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="monitor" element={<Monitor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
