import { useLocation, useNavigate } from 'react-router-dom'

export default function HangzhouResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const content = location.state?.content || ''

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-8xl mb-6 animate-bounce">
          📚🐱
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          收到！
        </h2>
        
        <p className="text-xl text-gray-600 mb-6">
          坏猫老师正在努力备课中~
        </p>
        
        {content && (
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-600 mb-2">你提交的内容：</p>
            <p className="text-gray-700 italic">{content}</p>
          </div>
        )}
        
        <div className="text-4xl mb-6">
          💪✨
        </div>
        
        <button
          onClick={handleBack}
          className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl text-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          返回首页
        </button>
        
        <div className="mt-8">
          <p className="text-sm text-gray-400">记录已保存~</p>
        </div>
      </div>
    </div>
  )
}