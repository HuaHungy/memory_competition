<template>
  <header class="header">
    <h1 class="title">
      拾光记忆
    </h1>
    <p class="subtitle">记录美好时光，润色珍贵回忆</p>
  </header>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  background-color: rgb(236,236,233);
  width: 900px;
  border-radius: 18px;
  margin-left: 420px;
  background-color: rgba(252,251,251, 0.4); /* 白色半透明背景 */
  color: #000; 
}

.title {
  font-family: 'Dancing Script', cursive;
  font-size: 4rem;
  font-weight: bolder;
  color:rgb(255, 255, 255);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.subtitle {
  font-family: 'Dancing Script', cursive;
  font-size: 1.8rem;
  font-weight: bolder;
  color:rgb(107, 91,115);
  opacity: 0.9;
  font-weight: 400;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .heart-icon {
    width: 32px;
    height: 32px;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}
</style>