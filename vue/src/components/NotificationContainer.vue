<template>
  <div class="notification-container">
    <div 
      v-for="notification in notifications" 
      :key="notification.id"
      :class="['notification', `notification-${notification.type}`]"
    >
      <div class="notification-content">
        <span>{{ notification.message }}</span>
        <button 
          class="notification-close"
          @click="$emit('close', notification.id)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationContainer',
  props: {
    notifications: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close']
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1500;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  min-width: 300px;
  padding: 15px 20px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 0.8;
}

.notification-close svg {
  width: 16px;
  height: 16px;
}

.notification-success {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

.notification-error {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.notification-warning {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.notification-info {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification {
    min-width: auto;
    width: 100%;
  }
}
</style>