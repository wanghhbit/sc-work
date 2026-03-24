import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'unhealthy'
  message: string
}

interface ApiLog {
  path: string
  method: string
  status: number
  duration: number
  time: string
}

export function Monitor() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: '前端服务', status: 'healthy', message: '运行正常' },
    { name: '后端 API', status: 'healthy', message: '运行正常' },
    { name: '数据库', status: 'healthy', message: '连接正常' },
  ])
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([])
  const [dbStats, setDbStats] = useState({ connections: 5, size: '2.5 MB' })

  useEffect(() => {
    checkBackendHealth()
    generateMockLogs()
  }, [])

  const checkBackendHealth = async () => {
    try {
      await api.get('/health')
      setServices(prev => prev.map(s => 
        s.name === '后端 API' ? { ...s, status: 'healthy', message: '运行正常' } : s
      ))
    } catch {
      setServices(prev => prev.map(s => 
        s.name === '后端 API' ? { ...s, status: 'unhealthy', message: '服务异常' } : s
      ))
    }
  }

  const generateMockLogs = () => {
    const paths = ['/api/auth/login', '/api/agents', '/api/tasks', '/api/dashboard/stats']
    const methods = ['GET', 'POST', 'PUT', 'DELETE']
    const logs: ApiLog[] = []
    for (let i = 0; i < 10; i++) {
      logs.push({
        path: paths[Math.floor(Math.random() * paths.length)],
        method: methods[Math.floor(Math.random() * methods.length)],
        status: Math.random() > 0.1 ? 200 : 500,
        duration: Math.floor(Math.random() * 200) + 10,
        time: new Date(Date.now() - i * 60000).toLocaleString(),
      })
    }
    setApiLogs(logs)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">系统监控</h2>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">前端服务</h3>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${services[0].status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-green-600">{services[0].message}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">后端 API</h3>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${services[1].status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={services[1].status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
              {services[1].message}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">数据库</h3>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${services[2].status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-green-600">{services[2].message}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">数据库状态</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">连接数</span>
              <span>{dbStats.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">数据库大小</span>
              <span>{dbStats.size}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">系统信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">系统版本</span>
              <span>v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">运行环境</span>
              <span>内部测试环境</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">启动时间</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="font-semibold mb-3">接口调用日志</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">路径</th>
              <th className="px-3 py-2 text-left">方法</th>
              <th className="px-3 py-2 text-left">状态</th>
              <th className="px-3 py-2 text-left">耗时</th>
              <th className="px-3 py-2 text-left">时间</th>
            </tr>
          </thead>
          <tbody>
            {apiLogs.map((log, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{log.path}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                    log.method === 'POST' ? 'bg-green-100 text-green-800' :
                    log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.method}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={log.status === 200 ? 'text-green-600' : 'text-red-600'}>
                    {log.status}
                  </span>
                </td>
                <td className="px-3 py-2">{log.duration}ms</td>
                <td className="px-3 py-2 text-gray-500">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
