import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Choice {
  id: number
  choice: 'A' | 'B' | 'C' | 'D'
  createdAt: string
  ip: string
}

interface HangzhouRecord {
  id: number
  content: string
  createdAt: string
  ip: string
}

const choiceLabels: Record<string, string> = {
  A: '冷',
  B: '半热',
  C: '热',
  D: '没吃上',
}

const choiceColors: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-yellow-100 text-yellow-700',
  C: 'bg-green-100 text-green-700',
  D: 'bg-red-100 text-red-700',
}

type TabType = 'choices' | 'hangzhou'

export default function Admin() {
  const [choices, setChoices] = useState<Choice[]>([])
  const [hangzhouRecords, setHangzhouRecords] = useState<HangzhouRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('choices')
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [choicesRes, hangzhouRes] = await Promise.all([
        fetch('/api/choices'),
        fetch('/api/hangzhou'),
      ])
      
      const choicesData = await choicesRes.json()
      if (choicesData.success) {
        setChoices(choicesData.choices)
      }
      
      const hangzhouData = await hangzhouRes.json()
      if (hangzhouData.success) {
        setHangzhouRecords(hangzhouData.records)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📊</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">选择记录管理</h1>
                <p className="text-gray-500 text-sm">查看所有用户的选择情况</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回首页
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('choices')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'choices'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🍛 饭热不热记录 ({choices.length})
            </button>
            <button
              onClick={() => setActiveTab('hangzhou')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'hangzhou'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🏮 杭州话记录 ({hangzhouRecords.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <p className="mt-4 text-gray-500">加载中...</p>
            </div>
          ) : activeTab === 'choices' ? (
            choices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">暂无选择记录</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">选择</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">选择时间</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">IP地址</th>
                      </tr>
                    </thead>
                    <tbody>
                      {choices.map((choice) => (
                        <tr key={choice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 text-gray-600">#{choice.id}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${choiceColors[choice.choice]}`}>
                              {choice.choice} - {choiceLabels[choice.choice]}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{formatTime(choice.createdAt)}</td>
                          <td className="py-4 px-4 text-gray-600 text-sm">{choice.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">总记录数：</span>
                      <span className="font-bold text-gray-800">{choices.length}</span>
                    </div>
                    {Object.entries(choiceLabels).map(([key, label]) => {
                      const count = choices.filter((c) => c.choice === key).length
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${choiceColors[key]}`}>
                            {key} ({label})
                          </span>
                          <span className="text-gray-600">{count}人</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )
          ) : hangzhouRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500">暂无杭州话记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hangzhouRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">#{record.id}</span>
                    <span className="text-sm text-gray-400">{formatTime(record.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{record.content}</p>
                  <span className="text-xs text-gray-400">IP: {record.ip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}