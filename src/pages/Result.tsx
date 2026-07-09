import { useLocation, useNavigate } from 'react-router-dom'

const results: Record<string, { emoji: string; message: string; subMessage: string }> = {
  A: {
    emoji: '🥶😔💔🤗',
    message: 'mmlz',
    subMessage: '抱抱你，下次记得加热一下~',
  },
  B: {
    emoji: '😊🔥👍',
    message: '有进步啊～',
    subMessage: '再接再厉！',
  },
  C: {
    emoji: '🎉✨🍛🥰',
    message: '好耶！',
    subMessage: '热饭就是香~',
  },
  D: {
    emoji: '😱😱😱🥶😔💔🤗',
    message: 'mmlz',
    subMessage: '怎么能没吃上饭呢！抱抱安慰~',
  },
}

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const choice = location.state?.choice || 'A'
  const result = results[choice] || results['A']

  const handleBack = () => {
    navigate('/')
  }

  const handleNextQuestion = () => {
    navigate('/hangzhou')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-8xl mb-6 animate-pulse">
          {result.emoji}
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {result.message}
        </h2>
        
        <p className="text-xl text-gray-600 mb-8">
          {result.subMessage}
        </p>
        
        <button
          onClick={handleNextQuestion}
          className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl text-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl mb-4"
        >
          📝 下一题
        </button>
        
        <button
          onClick={handleBack}
          className="w-full py-4 px-6 bg-gray-200 text-gray-700 rounded-xl text-lg font-medium hover:bg-gray-300 transition-all duration-200"
        >
          返回重新选择
        </button>
        
        <div className="mt-8">
          <p className="text-sm text-gray-400">选择记录已保存~</p>
        </div>
      </div>
    </div>
  )
}