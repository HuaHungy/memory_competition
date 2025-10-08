<template>
  <div class="results-section">
    <!-- 润色结果 -->
    <div v-if="showPolished" class="polished-text-container">
      <h3 class="section-title">润色后的回忆</h3>
      <div class="polished-text">{{ polishedText }}</div>
      <div v-if="moodAnalysis" class="mood-analysis">
        <div class="mood-indicator">
          <span class="mood-label">{{ moodAnalysis.mood }}</span>
        </div>
      </div>
    </div>

    <!-- 图片结果 -->
    <div v-if="showImages && images.length > 0" class="image-container">
      <h3 class="section-title">记忆画面</h3>
      <div class="image-gallery">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="image-item"
        >
          <img :src="image.url" :alt="`记忆图片 ${index + 1}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultsSection',
  props: {
    polishedText: {
      type: String,
      default: ''
    },
    moodAnalysis: {
      type: Object,
      default: null
    },
    images: {
      type: Array,
      default: () => []
    },
    showPolished: {
      type: Boolean,
      default: false
    },
    showImages: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.results-section {
  margin-bottom: 40px;
}

.polished-text-container,
.image-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #6b5b73;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.polished-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #5d4e75;
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 15px;
  border-left: 4px solid #d4a574;
  text-indent: 2em;
}

.mood-analysis {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-indent: 2em
}

.mood-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mood-label {
  font-weight: 600;
  color: #8b5a6b;
  font-size: 1.1rem;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.image-item {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.3s ease;
  aspect-ratio: 1;
}

.image-item:hover {
  transform: scale(1.02);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .polished-text-container,
  .image-container {
    padding: 20px;
    border-radius: 15px;
  }
  
  .image-gallery {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .polished-text {
    font-size: 1rem;
    padding: 15px;
  }
}
</style>