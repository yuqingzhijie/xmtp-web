<template>
  <div class="filter">
    <input
      v-model="keyword"
      type="text"
      placeholder="搜索收件人或群组"
      @keydown.enter.prevent="emitFilter"
    />
    <button @click="emitFilter">搜索</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const keyword = ref("");

const emitFilter = () => {
  // TODO: implement filter logic with store
  console.debug("filter keyword", keyword.value);
};
</script>

<style scoped>
.filter {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
}

input {
  background: rgba(18, 26, 48, 0.9);
  border: 1px solid rgba(141, 162, 255, 0.25);
  padding: 0.6rem 0.9rem;
  border-radius: 14px;
  color: #edf1ff;
}

input::placeholder {
  color: rgba(173, 189, 255, 0.6);
}

button {
  border: none;
  border-radius: 14px;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
</style>
