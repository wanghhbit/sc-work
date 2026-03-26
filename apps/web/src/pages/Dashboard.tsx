import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import api from '@/lib/api'
import type { TokenStats, TokenTrendItem, AgentTokenStats, TaskDistributionItem, TopTaskItem, UserRankingItem } from '@/types'

interface Stats {
  agent_count: number
  task_count: number
  completed_count: number
  success_rate: number
}

interface TrendItem {
  date: string
  count: number
  success_rate: number
}

interface AgentEfficiency {
  agent_name: string
  agent_type: string
  task_count: number
  completion_rate: number
  avg_time: number
}

function formatTokenCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(2) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [trend, setTrend] = useState<TrendItem[]>([])
  const [efficiency, setEfficiency] = useState<AgentEfficiency[]>([])
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null)
  const [tokenTrend, setTokenTrend] = useState<TokenTrendItem[]>([])
  const [agentTokenStats, setAgentTokenStats] = useState<AgentTokenStats[]>([])
  const [taskDistribution, setTaskDistribution] = useState<TaskDistributionItem[]>([])
  const [topTasks, setTopTasks] = useState<TopTaskItem[]>([])
  const [userRanking, setUserRanking] = useState<UserRankingItem[]>([])

  useEffect(() => {
    fetchStats()
    fetchTrend()
    fetchEfficiency()
    fetchTokenStats()
    fetchTokenTrend()
    fetchAgentTokenStats()
    fetchTaskDistribution()
    fetchTopTasks()
    fetchUserRanking()
  }, [])

  const fetchUserRanking = async () => {
    const res = await api.get('/stats/user/ranking?sort_by=total_tokens&limit=10')
    setUserRanking(res.data)
  }

  const fetchTopTasks = async () => {
    const res = await api.get('/stats/task/top?limit=10')
    setTopTasks(res.data)
  }

  const fetchTaskDistribution = async () => {
    const res = await api.get('/stats/task/distribution?days=30')
    setTaskDistribution(res.data)
  }

  const fetchStats = async () => {
    const res = await api.get('/dashboard/stats')
    setStats(res.data)
  }

  const fetchTrend = async () => {
    const res = await api.get('/dashboard/trend')
    setTrend(res.data)
  }

  const fetchEfficiency = async () => {
    const res = await api.get('/dashboard/agent-efficiency')
    setEfficiency(res.data)
  }

  const fetchTokenStats = async () => {
    const res = await api.get('/token-usage/stats')
    setTokenStats(res.data)
  }

  const fetchTokenTrend = async () => {
    const res = await api.get('/token-usage/trend?days=7')
    setTokenTrend(res.data)
  }

  const fetchAgentTokenStats = async () => {
    const res = await api.get('/token-usage/by-agent')
    setAgentTokenStats(res.data)
  }

  const trendOption = {
    title: { text: '近7天任务趋势', left: 'center' },
    xAxis: { type: 'category', data: trend.map((t) => t.date) },
    yAxis: { type: 'value' },
    series: [
      { name: '任务数', type: 'bar', data: trend.map((t) => t.count) },
      {
        name: '成功率(%)',
        type: 'line',
        data: trend.map((t) => t.success_rate),
      },
    ],
  }

  const tokenTrendOption = {
    title: { text: '近7天Token使用趋势', left: 'center' },
    xAxis: { type: 'category', data: tokenTrend.map((t) => t.date) },
    yAxis: { type: 'value' },
    series: [
      { name: 'Token数', type: 'bar', data: tokenTrend.map((t) => t.total_tokens), itemStyle: { color: '#8b5cf6' } },
      { name: '调用次数', type: 'line', data: tokenTrend.map((t) => t.total_calls), itemStyle: { color: '#f59e0b' } },
    ],
  }

  const taskDistributionOption = {
    title: { text: 'Agent 任务分布 (近30天)', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '任务数量占比',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: taskDistribution.map(item => ({
          name: item.agent_name,
          value: item.task_count
        }))
      }
    ]
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">数据看板</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Agent数量</p>
          <p className="text-3xl font-bold">{stats?.agent_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">任务总数</p>
          <p className="text-3xl font-bold">{stats?.task_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">已完成</p>
          <p className="text-3xl font-bold">{stats?.completed_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">成功率</p>
          <p className="text-3xl font-bold">{stats?.success_rate || 0}%</p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 mt-8">Token用量统计</h3>
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">总Token用量</p>
          <p className="text-3xl font-bold text-purple-600">{formatTokenCount(tokenStats?.total_tokens || 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">输入Token</p>
          <p className="text-3xl font-bold text-blue-600">{formatTokenCount(tokenStats?.total_prompt_tokens || 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">输出Token</p>
          <p className="text-3xl font-bold text-green-600">{formatTokenCount(tokenStats?.total_completion_tokens || 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">今日用量</p>
          <p className="text-3xl font-bold text-orange-600">{formatTokenCount(tokenStats?.today_tokens || 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">总调用次数</p>
          <p className="text-3xl font-bold text-gray-700">{tokenStats?.total_calls || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <ReactECharts option={trendOption} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <ReactECharts option={tokenTrendOption} />
        </div>
      </div>

      <div className="grid grid-cols-1 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <ReactECharts option={taskDistributionOption} style={{ height: '350px' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-4">Agent效率统计</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-2">名称</th>
                <th className="pb-2">类型</th>
                <th className="pb-2">任务数</th>
                <th className="pb-2">完成率</th>
              </tr>
            </thead>
            <tbody>
              {efficiency.map((e, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{e.agent_name}</td>
                  <td className="py-2">{e.agent_type}</td>
                  <td className="py-2">{e.task_count}</td>
                  <td className="py-2">{e.completion_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-4">Agent Token用量统计</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-2">名称</th>
                <th className="pb-2">类型</th>
                <th className="pb-2">Token用量</th>
                <th className="pb-2">调用次数</th>
              </tr>
            </thead>
            <tbody>
              {agentTokenStats.map((a, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{a.agent_name}</td>
                  <td className="py-2">{a.agent_type}</td>
                  <td className="py-2 text-purple-600 font-medium">{formatTokenCount(a.total_tokens)}</td>
                  <td className="py-2">{a.call_count}</td>
                </tr>
              ))}
              {agentTokenStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-4">高消耗任务(记录) TOP 10</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">任务ID</th>
                <th className="pb-2">Agent</th>
                <th className="pb-2">发起人</th>
                <th className="pb-2">总Token</th>
              </tr>
            </thead>
            <tbody>
              {topTasks.map((t, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-2">#{t.task_id}</td>
                  <td className="py-2">{t.agent_name}</td>
                  <td className="py-2">{t.username}</td>
                  <td className="py-2 text-purple-600 font-bold">{formatTokenCount(t.total_tokens)}</td>
                </tr>
              ))}
              {topTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-4">用户 Token 消耗排行榜 TOP 10</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">排名</th>
                <th className="pb-2">用户</th>
                <th className="pb-2">部门</th>
                <th className="pb-2">总消耗 Token</th>
                <th className="pb-2">调用次数</th>
              </tr>
            </thead>
            <tbody>
              {userRanking.map((u, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-2">
                    <span className={`inline-block w-5 h-5 text-center rounded-full text-xs leading-5 ${i < 3 ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-gray-100 text-gray-600'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-2">{u.username}</td>
                  <td className="py-2">{u.dept || '-'}</td>
                  <td className="py-2 text-purple-600 font-bold">{formatTokenCount(u.total_tokens)}</td>
                  <td className="py-2">{u.call_count}</td>
                </tr>
              ))}
              {userRanking.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
