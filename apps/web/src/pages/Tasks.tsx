import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { Task, TaskLog, Agent, PaginatedResponse, ApiResponse } from '@/types'

const AGENT_TYPES: Record<string, string> = {
  business_query: '业务查询Agent',
  process_handler: '流程处理Agent',
  doc_summarizer: '文档总结Agent',
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [logs, setLogs] = useState<TaskLog[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ agent_id: '', task_content: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchAgents()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get<unknown, PaginatedResponse<Task>>('/tasks')
      setTasks(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const res = await api.get<unknown, PaginatedResponse<Agent>>('/agents')
      setAgents((res.data || []).filter(a => a.status === 1))
    } catch (err) {
      console.error('获取Agent列表失败:', err)
    }
  }

  const viewTaskDetail = async (task: Task) => {
    setSelectedTask(task)
    try {
      const res = await api.get<unknown, ApiResponse<TaskLog[]>>(`/tasks/${task.task_id}/logs`)
      setLogs(res.data || [])
    } catch (err) {
      setLogs([])
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/tasks', {
        agent_id: parseInt(formData.agent_id),
        task_content: formData.task_content,
      })
      setShowCreateModal(false)
      setFormData({ agent_id: '', task_content: '' })
      fetchTasks()
    } catch (err) {
      console.error('创建任务失败:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelTask = async (taskId: number) => {
    if (!confirm('确定要取消此任务吗？')) return
    try {
      await api.post(`/tasks/${taskId}/cancel`)
      fetchTasks()
    } catch (err) {
      console.error('取消任务失败:', err)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  const statusLabels: Record<string, string> = {
    pending: '待执行',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }

  if (loading) return <div className="p-4">加载中...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">任务中心</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          下发任务
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">任务ID</th>
              <th className="px-4 py-3 text-left">Agent</th>
              <th className="px-4 py-3 text-left">任务指令</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">耗时</th>
              <th className="px-4 py-3 text-left">提交时间</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  暂无任务，点击"下发任务"创建
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const agent = agents.find(a => a.agent_id === task.agent_id)
                return (
                  <tr key={task.task_id} className="border-t">
                    <td className="px-4 py-3">#{task.task_id}</td>
                    <td className="px-4 py-3">{agent?.agent_name || `Agent #${task.agent_id}`}</td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {task.task_content}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          statusColors[task.status]
                        }`}
                      >
                        {statusLabels[task.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.execute_time ? `${task.execute_time.toFixed(1)}s` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(task.create_time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewTaskDetail(task)}
                        className="text-primary-600 hover:underline mr-2"
                      >
                        详情
                      </button>
                      {(task.status === 'pending' || task.status === 'running') && (
                        <button
                          onClick={() => handleCancelTask(task.task_id)}
                          className="text-red-600 hover:underline"
                        >
                          取消
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h3 className="text-lg font-bold mb-4">下发任务</h3>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">选择 Agent</label>
                <select
                  value={formData.agent_id}
                  onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">请选择 Agent</option>
                  {agents.map((agent) => (
                    <option key={agent.agent_id} value={agent.agent_id}>
                      {agent.agent_name} ({AGENT_TYPES[agent.agent_type] || agent.agent_type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">任务指令</label>
                <textarea
                  value={formData.task_content}
                  onChange={(e) => setFormData({ ...formData, task_content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="例如：查询3月份工单完成情况"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || agents.length === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-bold mb-4">任务详情 #{selectedTask.task_id}</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500">任务指令</p>
              <p className="mt-1">{selectedTask.task_content}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">执行状态</p>
              <span
                className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                  statusColors[selectedTask.status]
                }`}
              >
                {statusLabels[selectedTask.status]}
              </span>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">执行结果</p>
              <p className="mt-1 bg-gray-50 p-3 rounded">{selectedTask.result || '暂无结果'}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">执行日志</p>
              <div className="bg-gray-50 rounded p-4 space-y-3 max-h-60 overflow-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-400 text-sm">暂无执行日志</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.log_id} className="text-sm border-b border-gray-200 pb-2 last:border-0">
                      <p className="font-medium text-primary-600">步骤 {log.step}</p>
                      <p className="text-gray-600 mt-1">💭 思考: {log.thinking}</p>
                      <p className="text-gray-500 mt-1">⚡ 动作: {log.action}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
