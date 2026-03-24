import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/api'

export function Profile() {
  const { user, setUser } = useAuthStore()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('/auth/change-password', passwordData)
      setSuccess('密码修改成功')
      setShowPasswordModal(false)
      setPasswordData({ old_password: '', new_password: '' })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      setError(error.response?.data?.detail || '密码修改失败')
    } finally {
      setSubmitting(false)
    }
  }

  const roleLabels: Record<string, string> = {
    admin: '系统管理员',
    tech: '技术支持',
    employee: '普通员工',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">个人中心</h2>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">基本信息</h3>
        <div className="space-y-4">
          <div className="flex">
            <span className="w-24 text-gray-500">用户名</span>
            <span className="font-medium">{user?.username}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500">角色</span>
            <span className="font-medium">{roleLabels[user?.role || ''] || user?.role}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500">部门</span>
            <span className="font-medium">{user?.dept || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-gray-500">岗位</span>
            <span className="font-medium">{user?.post || '-'}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            修改密码
          </button>
        </div>

        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
            {success}
          </div>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">修改密码</h3>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">原密码</label>
                <input
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">新密码</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  minLength={6}
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
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
