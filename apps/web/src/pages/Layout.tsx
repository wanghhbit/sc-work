import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Bot, ListTodo, BarChart3, User, Settings, Activity, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', label: 'AI Agent控制台', icon: Bot },
  { to: '/tasks', label: '任务中心', icon: ListTodo },
  { to: '/dashboard', label: '数据看板', icon: BarChart3 },
  { to: '/profile', label: '个人中心', icon: User },
]

const adminNavItems = [
  { to: '/settings', label: '系统设置', icon: Settings, roles: ['admin'] },
  { to: '/monitor', label: '系统监控', icon: Activity, roles: ['admin', 'tech'] },
]

export function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredAdminNav = adminNavItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  const roleLabels: Record<string, string> = {
    admin: '系统管理员',
    tech: '技术支持',
    employee: '普通员工',
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">EAAW</h1>
          <p className="text-xs text-gray-400">企业AI Agent智能工作台</p>
        </div>
        <nav className="p-4">
          {[...navItems, ...filteredAdminNav].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md mb-1 ${
                  isActive ? 'bg-primary-600' : 'hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            内部测试环境 v1.0.0 | 非生产环境
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {user?.username} ({roleLabels[user?.role || ''] || user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <LogOut size={18} />
              退出
            </button>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
