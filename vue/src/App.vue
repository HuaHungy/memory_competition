<template>
  <div class="container">
    <AppHeader />
    <main class="main-content">
      <InputSection 
        v-model:memory-text="memoryText"
        :is-polishing="isPolishing"
        :is-generating-image="isGeneratingImage"
        :can-generate-image="canGenerateImage"
        @polish-text="handlePolishText"
        @generate-image="handleGenerateImage"
      />
      
      <ResultsSection 
        :polished-text="polishedText"
        :mood-analysis="moodAnalysis"
        :images="generatedImages"
        :show-polished="showPolishedResult"
        :show-images="showImageResult"
      />
      
      <LoadingOverlay 
        v-if="isPolishing || isGeneratingImage"
        :message="loadingMessage"
      />
    </main>
    
    <AppFooter />
    
    <NotificationContainer 
      :notifications="notifications"
      @close="removeNotification"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import InputSection from './components/InputSection.vue'
import ResultsSection from './components/ResultsSection.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import { polishText, generateImages } from './services/api.js'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    InputSection,
    ResultsSection,
    LoadingOverlay,
    NotificationContainer
  },
  setup() {
    // 响应式数据
    const memoryText = ref('')
    const polishedText = ref('')
    const moodAnalysis = ref(null)
    const generatedImages = ref([])
    const isPolishing = ref(false)
    const isGeneratingImage = ref(false)
    const showPolishedResult = ref(false)
    const showImageResult = ref(false)
    const notifications = ref([])
    
    // 计算属性
    const canGenerateImage = computed(() => {
      return polishedText.value.trim().length > 0 && !isPolishing.value
    })
    
    const loadingMessage = computed(() => {
      if (isPolishing.value) return '正在润色您的回忆...'
      if (isGeneratingImage.value) return '正在生成记忆图片...'
      return '正在处理...'
    })
    
    // 方法
    const handlePolishText = async () => {
      if (!memoryText.value.trim()) {
        showNotification('请输入一些文字', 'warning')
        return
      }
      
      isPolishing.value = true
      showPolishedResult.value = false
      
      try {
        const result = await polishText(memoryText.value)
        polishedText.value = result.polishedText
        moodAnalysis.value = result.moodAnalysis
        showPolishedResult.value = true
        showNotification('回忆润色完成！', 'success')
      } catch (error) {
        console.error('润色失败:', error)
        showNotification('润色失败，请稍后重试', 'error')
      } finally {
        isPolishing.value = false
      }
    }
    
    const handleGenerateImage = async () => {
      if (!polishedText.value.trim()) {
        showNotification('请先润色文本', 'warning')
        return
      }
      
      isGeneratingImage.value = true
      showImageResult.value = false
      
      try {
        const images = await generateImages(polishedText.value)
        generatedImages.value = images
        showImageResult.value = true
        showNotification('记忆图片生成完成！', 'success')
      } catch (error) {
        console.error('图片生成失败:', error)
        showNotification('图片生成失败，请稍后重试', 'error')
      } finally {
        isGeneratingImage.value = false
      }
    }
    
    const showNotification = (message, type = 'info') => {
      const notification = {
        id: Date.now(),
        message,
        type
      }
      notifications.value.push(notification)
      
      // 3秒后自动移除
      setTimeout(() => {
        removeNotification(notification.id)
      }, 3000)
    }
    
    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    }
    
    return {
      memoryText,
      polishedText,
      moodAnalysis,
      generatedImages,
      isPolishing,
      isGeneratingImage,
      showPolishedResult,
      showImageResult,
      notifications,
      canGenerateImage,
      loadingMessage,
      handlePolishText,
      handleGenerateImage,
      removeNotification
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-image: url('./assets/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  overflow-x: hidden;
}

.container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  z-index: 0;
}

.main-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 1500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .main-content {
    margin: 1rem;
    padding: 1.5rem;
    border-radius: 15px;
  }
}

/* 温馨的动画效果 */
.container {
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 为主要内容区域添加温馨的悬浮效果 */
.main-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
</style>