<template>
  <footer class="footer">
    <p> 拾光记忆 - 让每一个回忆都闪闪发光</p>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 30px 0;
  margin-top: auto;
  color:white;
  font-size: 20px;
  font-weight: 500;
  font-family: 'Dancing Script', cursive;
  font-weight: bold;
}

@media (max-width: 768px) {
  .footer {
    padding: 20px 0;
    font-size: 0.8rem;
  }
}
</style>