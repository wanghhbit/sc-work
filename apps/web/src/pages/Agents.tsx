import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { Agent, PaginatedResponse, ApiResponse } from '@/types'

const AGENT_TYPES = [
  { value: 'business_query', label: '业务查询Agent' },
  { value: 'process_handler', label: '流程处理Agent' },
  { value: 'doc_summarizer', label: '文档总结Agent' },
]

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    agent_name: '',
    agent_type: 'business_query',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await api.get<unknown, PaginatedResponse<Agent>>('/agents')
      setAgents(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingAgent(null)
    setFormData({ agent_name: '', agent_type: 'business_query', description: '' })
    setShowModal(true)
  }

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      agent_name: agent.agent_name,
      agent_type: agent.agent_type,
      description: agent.description || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingAgent) {
        await api.put(`/agents/${editingAgent.agent_id}`, formData)
      } else {
        await api.post('/agents', formData)
      }
      setShowModal(false)
      fetchAgents()
    } catch (err) {
      console.error('提交失败:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (agentId: number) => {
    if (!confirm('确定要删除此 Agent 吗？')) return
    try {
      await api.delete(`/agents/${agentId}`)
      fetchAgents()
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handleToggleStatus = async (agent: Agent) => {
    try {
      await api.put(`/agents/${agent.agent_id}`, { status: agent.status === 1 ? 0 : 1 })
      fetchAgents()
    } catch (err) {
      console.error('状态切换失败:', err)
    }
  }

  if (loading) return <div className="p-4">加载中...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">AI Agent 控制台</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          创建 Agent
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">名称</th>
              <th className="px-4 py-3 text-left">类型</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">创建时间</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  暂无 Agent，点击"创建 Agent"添加
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.agent_id} className="border-t">
                  <td className="px-4 py-3">{agent.agent_name}</td>
                  <td className="px-4 py-3">
                    {AGENT_TYPES.find(t => t.value === agent.agent_type)?.label || agent.agent_type}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(agent)}
                      className={`px-2 py-1 rounded text-xs ${
                        agent.status === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {agent.status === 1 ? '启用' : '禁用'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(agent.create_time).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEditModal(agent)}
                      className="text-primary-600 hover:underline mr-2"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(agent.agent_id)}
                      className="text-red-600 hover:underline"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingAgent ? '编辑 Agent' : '创建 Agent'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Agent 名称</label>
                <input
                  type="text"
                  value={formData.agent_name}
                  onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Agent 类型</label>
                <select
                  value={formData.agent_type}
                  onChange={(e) => setFormData({ ...formData, agent_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!!editingAgent}
                >
                  {AGENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
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
