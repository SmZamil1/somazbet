import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import './styles/global.css'

// User pages
import LandingPage from './pages/user/LandingPage'
import RegisterPage from './pages/user/RegisterPage'
import LoginPage from './pages/user/LoginPage'
import HomePage from './pages/user/HomePage'
import GamesPage from './pages/user/GamesPage'
import GameDetailPage from './pages/user/GameDetailPage'
import WalletPage from './pages/user/WalletPage'
import AccountPage from './pages/user/AccountPage'
import LeaderboardPage from './pages/user/LeaderboardPage'
import SupportPage from './pages/user/SupportPage'
import PromotionsPage from './pages/user/PromotionsPage'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminGames from './pages/admin/AdminGames'
import AdminFinancial from './pages/admin/AdminFinancial'
import AdminLogs from './pages/admin/AdminLogs'
import AdminPromotions from './pages/admin/AdminPromotions'
import AdminAgents from './pages/admin/AdminAgents'
import AdminContent from './pages/admin/AdminContent'
import AdminSupport from './pages/admin/AdminSupport'
import AdminSettings from './pages/admin/AdminSettings'

function Loader() {
  return (
    <div className="page-loader">
      <div className="logo-text">SomazBet</div>
      <div className="spinner" />
    </div>
  )
}

function UserRoute({ children }) {
  const { isUser, loading } = useAuth()
  if (loading) return <Loader />
  return isUser ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <Loader />
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User app */}
          <Route path="/home" element={<UserRoute><HomePage /></UserRoute>} />
          <Route path="/games" element={<UserRoute><GamesPage /></UserRoute>} />
          <Route path="/games/:id" element={<UserRoute><GameDetailPage /></UserRoute>} />
          <Route path="/wallet" element={<UserRoute><WalletPage /></UserRoute>} />
          <Route path="/account" element={<UserRoute><AccountPage /></UserRoute>} />
          <Route path="/leaderboard" element={<UserRoute><LeaderboardPage /></UserRoute>} />
          <Route path="/support" element={<UserRoute><SupportPage /></UserRoute>} />
          <Route path="/promotions" element={<UserRoute><PromotionsPage /></UserRoute>} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/games" element={<AdminRoute><AdminGames /></AdminRoute>} />
          <Route path="/admin/financial" element={<AdminRoute><AdminFinancial /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
          <Route path="/admin/promotions" element={<AdminRoute><AdminPromotions /></AdminRoute>} />
          <Route path="/admin/agents" element={<AdminRoute><AdminAgents /></AdminRoute>} />
          <Route path="/admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
          <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
