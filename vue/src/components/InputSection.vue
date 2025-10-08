<template>
  <div class="input-section">
    <div class="input-container">
      <label for="memory-input" class="input-label">分享你的回忆片段</label>
      <textarea 
        id="memory-input"
        v-model="localMemoryText"
        class="memory-textarea" 
        placeholder="请输入你想要记录的回忆片段，可以是一段经历、一个瞬间、或是内心的感受..."
        rows="6"
        @input="updateMemoryText"
      ></textarea>
      <div class="input-actions">
        <button 
          class="btn btn-primary"
          :disabled="!hasText || isPolishing"
          @click="$emit('polish-text')"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ isPolishing ? '润色中...' : '润色回忆' }}
        </button>
        <button 
          class="btn btn-secondary" 
          :disabled="!canGenerateImage || isGeneratingImage"
          @click="$emit('generate-image')"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          {{ isGeneratingImage ? '生成中...' : '生成记忆图片' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'InputSection',
  props: {
    memoryText: {
      type: String,
      default: ''
    },
    isPolishing: {
      type: Boolean,
      default: false
    },
    isGeneratingImage: {
      type: Boolean,
      default: false
    },
    canGenerateImage: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:memoryText', 'polish-text', 'generate-image'],
  setup(props, { emit }) {
    const localMemoryText = ref(props.memoryText)
    
    const hasText = computed(() => {
      return localMemoryText.value.trim().length > 0
    })
    
    const updateMemoryText = () => {
      emit('update:memoryText', localMemoryText.value)
    }
    
    // 监听外部传入的memoryText变化
    watch(() => props.memoryText, (newValue) => {
      localMemoryText.value = newValue
    })
    
    return {
      localMemoryText,
      hasText,
      updateMemoryText
    }
  }
}
</script>

<style scoped>
.input-section {
  margin-bottom: 40px;
}

.input-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.input-label {
  display: block;
  font-size: 1.3rem;
  font-weight: 500;
  color: #6b5b73;
  margin-bottom: 15px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.memory-textarea {
  width: 100%;
  min-height: 120px;
  padding: 20px;
  border: 2px solid #d4c5a9;
  border-radius: 15px;
  font-size: 1.2rem;
  font-family: inherit;
  color: #5d4e75;
  background: rgba(255, 248, 240, 0.9);
  resize: vertical;
  transition: all 0.3s ease;
  line-height: 1.6;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.memory-textarea:focus {
  outline: none;
  border-color: #8fbc8f;
  box-shadow: 0 0 0 3px rgba(143, 188, 143, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.95);
}

.memory-textarea::placeholder {
  color: #a0829d;
}

.input-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  min-height: 48px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #8fbc8f 0%, #7aa67a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(143, 188, 143, 0.3);
}

.btn-primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(143, 188, 143, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #deb887 0%, #d2b48c 100%);
  color: #5d4e75;
  box-shadow: 0 4px 15px rgba(222, 184, 135, 0.3);
}

.btn-secondary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(222, 184, 135, 0.4);
}

.btn-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .input-container {
    padding: 20px;
    border-radius: 15px;
  }
  
  .input-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
    width: 100%;
  }
}
</style>