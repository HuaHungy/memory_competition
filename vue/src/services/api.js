import axios from 'axios'

// API基础URL（可通过 VITE_API_BASE_URL 覆盖）
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:3000'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('响应错误:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

/**
 * 润色文本
 * @param {string} text - 原始文本
 * @returns {Promise<{polishedText: string, moodAnalysis: object}>}
 */
export async function polishText(text) {
  try {
    const response = await apiClient.post('/api/polish', {
      text: text.trim()
    })
    
    if (response.data.success) {
      return {
        polishedText: response.data.polishedText,
        moodAnalysis: response.data.moodAnalysis
      }
    } else {
      throw new Error(response.data.error || '润色失败')
    }
  } catch (error) {
    console.error('润色文本失败:', error)
    
    // 如果是网络错误或服务器错误，返回演示数据
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      console.log('使用演示数据')
      return getDemoPolishResult(text)
    }
    
    throw new Error(error.response?.data?.error || error.message || '润色服务暂时不可用')
  }
}

/**
 * 生成图片
 * @param {string} text - 润色后的文本
 * @returns {Promise<Array>}
 */
export async function generateImages(text) {
  try {
    const response = await apiClient.post('/api/generate-image', {
      text: text.trim()
    })
    
    if (response.data.success) {
      return response.data.images || []
    } else {
      throw new Error(response.data.error || '图片生成失败')
    }
  } catch (error) {
    console.error('生成图片失败:', error)
    
    // 如果是网络错误或服务器错误，返回演示数据
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      console.log('使用演示图片数据')
      return getDemoImageResult()
    }
    
    throw new Error(error.response?.data?.error || error.message || '图片生成服务暂时不可用')
  }
}

/**
 * 获取演示润色结果
 * @param {string} originalText - 原始文本
 * @returns {object}
 */
function getDemoPolishResult(originalText) {
  const enhancedText = enhanceTextDemo(originalText)
  const moodAnalysis = analyzeMoodDemo(originalText)
  
  return {
    polishedText: enhancedText,
    moodAnalysis: moodAnalysis
  }
}

/**
 * 获取演示图片结果
 * @returns {Array}
 */
function getDemoImageResult() {
  return [
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: '温馨的回忆场景'
    },
    {
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: '美好的时光'
    }
  ]
}

/**
 * 演示文本增强
 * @param {string} text - 原始文本
 * @returns {string}
 */
function enhanceTextDemo(text) {
  const enhancements = [
    '那是一段温馨而珍贵的时光，',
    '在记忆的长河中，',
    '如今回想起来，',
    '那个美好的瞬间，'
  ]
  
  const endings = [
    '，这份美好将永远珍藏在心中。',
    '，成为了我最珍贵的回忆。',
    '，那份温暖至今还能感受到。',
    '，是我人生中最美好的片段之一。'
  ]
  
  const randomStart = enhancements[Math.floor(Math.random() * enhancements.length)]
  const randomEnd = endings[Math.floor(Math.random() * endings.length)]
  
  return randomStart + text + randomEnd
}

/**
 * 演示情感分析
 * @param {string} text - 文本内容
 * @returns {object}
 */
function analyzeMoodDemo(text) {
  const positiveWords = ['开心', '快乐', '幸福', '美好', '温馨', '甜蜜', '满足', '感动']
  const negativeWords = ['难过', '伤心', '痛苦', '失落', '孤独', '遗憾', '悲伤', '沮丧']
  const neutralWords = ['平静', '思考', '回忆', '怀念', '感慨', '反思']
  
  let mood = '平静'
  let emoji = '😌'
  let description = '这是一段平静的回忆，带着淡淡的思考。'
  
  const hasPositive = positiveWords.some(word => text.includes(word))
  const hasNegative = negativeWords.some(word => text.includes(word))
  
  if (hasPositive && !hasNegative) {
    mood = '快乐'
    emoji = '😊'
    description = '这段回忆充满了温暖和快乐，让人感到幸福。'
  } else if (hasNegative && !hasPositive) {
    mood = '忧伤'
    emoji = '😢'
    description = '这是一段带着淡淡忧伤的回忆，但也有它独特的美。'
  } else if (hasPositive && hasNegative) {
    mood = '复杂'
    emoji = '😌'
    description = '这段回忆五味杂陈，有快乐也有忧伤，这就是生活的真实。'
  }
  
  return {
    mood,
    emoji,
    description
  }
}