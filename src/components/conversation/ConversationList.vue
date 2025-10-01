<template>
  <div class="conversation-list">
    <div class="list-header">
      <h2>会话列表</h2>
      <button class="refresh" @click="refresh">刷新</button>
    </div>

    <p v-if="loading" class="hint">正在加载会话…</p>
    <p v-else-if="conversations.length === 0" class="hint">
      尚无会话，尝试发起新的私信。
    </p>

    <ul v-else>
      <li
        v-for="conversation in conversations"
        :key="conversation.id"
        :class="{ active: conversation.id === activeId }"
        @click="select(conversation.id)"
      >
        <div class="meta">
          <h3>{{ conversation.title }}</h3>
          <small>{{ conversation.subtitle }}</small>
        </div>
        <span class="badge" :class="conversation.kind">{{
          conversation.kindLabel
        }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted } from "vue";
import { useConversationStore } from "../../stores/conversationStore";

const conversationStore = useConversationStore();
const { loading, itemsView, activeId, initialized } =
  storeToRefs(conversationStore);

const conversations = computed(() => itemsView.value);

const refresh = () => {
  void conversationStore.fetchConversations();
};

const select = (id: string) => {
  conversationStore.setActive(id);
};

onMounted(() => {
  if (!initialized.value) {
    refresh();
  }
});
</script>

<style scoped>
.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.refresh {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8ff;
  border: 1px solid rgba(148, 163, 255, 0.25);
  padding: 0.35rem 0.8rem;
  border-radius: 12px;
  cursor: pointer;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  background: rgba(19, 26, 56, 0.8);
  border: 1px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.1s ease;
}

li:hover {
  border-color: rgba(94, 234, 212, 0.35);
  transform: translateY(-1px);
}

li.active {
  border-color: rgba(94, 234, 212, 0.6);
  box-shadow: 0 18px 30px -25px rgba(94, 234, 212, 0.75);
}

.meta h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: #f7f9ff;
}

.meta small {
  color: rgba(226, 232, 255, 0.7);
  letter-spacing: 0.01em;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(148, 163, 255, 0.2);
  color: rgba(226, 232, 255, 0.85);
}

.badge.dm {
  background: rgba(56, 189, 248, 0.2);
  color: #bae6fd;
}

.badge.group {
  background: rgba(167, 139, 250, 0.2);
  color: #ddd6fe;
}

.hint {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(226, 232, 255, 0.7);
  background: rgba(94, 113, 255, 0.08);
  border: 1px dashed rgba(94, 113, 255, 0.25);
  padding: 0.8rem 1rem;
  border-radius: 12px;
}
</style>
