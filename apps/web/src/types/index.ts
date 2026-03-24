export interface User {
  user_id: number
  username: string
  role: string
  dept: string | null
  post: string | null
  status: number
  create_time: string
}

export interface Agent {
  agent_id: number
  agent_name: string
  agent_type: string
  description: string | null
  params: string | null
  status: number
  create_user: number
  create_time: string
}

export interface Task {
  task_id: number
  agent_id: number
  task_content: string
  status: string
  execute_time: number | null
  result: string | null
  create_user: number
  create_time: string
  end_time: string | null
}

export interface TaskLog {
  log_id: number
  task_id: number
  step: number
  thinking: string | null
  action: string | null
  log_time: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  code: number
  message: string
  data: T[]
  total: number
  page: number
  page_size: number
}

export interface TokenStats {
  total_tokens: number
  total_prompt_tokens: number
  total_completion_tokens: number
  total_calls: number
  today_tokens: number
}

export interface TokenTrendItem {
  date: string
  total_tokens: number
  total_calls: number
}

export interface AgentTokenStats {
  agent_id: number
  agent_name: string
  agent_type: string
  total_tokens: number
  prompt_tokens: number
  completion_tokens: number
  call_count: number
}
