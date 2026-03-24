import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { User, PaginatedResponse } from '@/types'

export function Settings() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'employee',
    dept: '',
    post: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get<unknown, PaginatedResponse<User>>('/users')
      setUsers(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({ username: '', password: '', role: 'employee', dept: '', post: '' })
    setShowModal(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      dept: user.dept || '',
      post: user.post || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingUser) {
        const updateData: Record<string, unknown> = {
          dept: formData.dept,
          post: formData.post,
        }
        await api.put(`/users/${editingUser.user_id}`, updateData)
      } else {
        await api.post('/users', formData)
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      console.error('提交失败:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('确定要删除此用户吗？')) return
    try {
      await api.delete(`/users/${userId}`)
      fetchUsers()
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.user_id}`, { status: user.status === 1 ? 0 : 1 })
      fetchUsers()
    } catch (err) {
      console.error('状态切换失败:', err)
    }
  }

  const roleLabels: Record<string, string> = {
    admin: '管理员',
    tech: '技术人员',
    employee: '普通员工',
  }

  if (loading) return <div className="p-4">加载中...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">系统设置</h2>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">用户管理</h3>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            新增用户
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">用户名</th>
              <th className="px-4 py-3 text-left">角色</th>
              <th className="px-4 py-3 text-left">部门</th>
              <th className="px-4 py-3 text-left">岗位</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-t">
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{roleLabels[user.role] || user.role}</td>
                <td className="px-4 py-3">{user.dept || '-'}</td>
                <td className="px-4 py-3">{user.post || '-'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status === 1 ? '正常' : '禁用'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-primary-600 hover:underline mr-2"
                  >
                    编辑
                  </button>
                  {user.user_id !== currentUser?.user_id && (
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      className="text-red-600 hover:underline"
                    >
                      删除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingUser ? '编辑用户' : '新增用户'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={!!editingUser}
                />
              </div>
              {!editingUser && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">密码</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required={!editingUser}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!!editingUser}
                >
                  <option value="employee">普通员工</option>
                  <option value="admin">管理员</option>
                  <option value="tech">技术人员</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">部门</label>
                <input
                  type="text"
                  value={formData.dept}
                  onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">岗位</label>
                <input
                  type="text"
                  value={formData.post}
                  onChange={(e) => setFormData({ ...formData, post: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '确定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
