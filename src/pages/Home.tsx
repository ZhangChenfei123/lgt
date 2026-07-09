import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const options = [
  { key: 'A', label: '冷' },
  { key: 'B', label: '半热' },
  { key: 'C', label: '热' },
  { key: 'D', label: '没吃上' },
]

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSelect = async (key: string) => {
    if (loading) return
    
    setSelected(key)
    setLoading(true)
    
    try {
      await fetch('/api/choices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice: key }),
      })
      
      navigate('/result', { state: { choice: key } })
    } catch (error) {
      console.error('Failed to save choice:', error)
      navigate('/result', { state: { choice: key } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🍛</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">今天的饭是热的吗？</h1>
          <p className="text-gray-500 text-sm">请选择你的真实感受~</p>
        </div>
        
        <div className="space-y-4">
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-between
                ${selected === option.key 
                  ? 'bg-red-500 text-white shadow-lg scale-[1.02]' 
                  : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:shadow-md'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${selected === option.key ? 'bg-white text-red-500' : 'bg-red-100 text-red-500'}
                `}>
                  {option.key}
                </span>
                <span>{option.label}</span>
              </span>
              {selected === option.key && (
                <span className="text-white">✓</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">点击选项后结果将被记录~</p>
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/admin')}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            🔒 管理员查看记录
          </button>
        </div>
      </div>
    </div>
  )
}