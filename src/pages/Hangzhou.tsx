import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Hangzhou() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    
    try {
      await fetch('/api/hangzhou', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: input.trim() }),
      })
      
      navigate('/hangzhou-result', { state: { content: input.trim() } })
    } catch (error) {
      console.error('Failed to submit:', error)
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-6xl mb-6">
          🏮
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          今天想学什么杭州话？
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          或者今天遇到了什么不懂的杭州话？
        </p>
        
        <p className="text-sm text-gray-400 mb-8">
          写下来，坏猫老师帮你解答~
        </p>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：'撮螺蛳'是什么意思？"
          className="w-full h-32 p-4 border-2 border-green-200 rounded-xl text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none resize-none transition-colors duration-200"
          maxLength={200}
        />
        
        <p className="text-right text-sm text-gray-400 mb-4">
          {input.length}/200
        </p>
        
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
            input.trim() && !loading
              ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? '提交中...' : '📤 提交'}
        </button>
        
        <button
          onClick={handleBack}
          className="w-full py-3 px-6 mt-4 bg-gray-100 text-gray-600 rounded-xl text-medium hover:bg-gray-200 transition-all duration-200"
        >
          返回
        </button>
      </div>
    </div>
  )
}