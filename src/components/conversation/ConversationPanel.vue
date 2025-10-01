<template>
  <div class="panel">
    <header class="panel-header">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>
      <button class="sync" @click="loadMessages">同步消息</button>
    </header>

    <section class="messages" ref="scrollContainer">
      <p v-if="loading" class="hint">正在获取消息…</p>
      <p v-else-if="errorText" class="hint error">{{ errorText }}</p>
      <p v-else-if="messages.length === 0" class="hint">
        暂无消息，快来发送第一条吧。
      </p>
      <ul v-else>
        <li
          v-for="message in messages"
          :key="message.id"
          :class="{ self: message.isSelf }"
        >
          <div class="meta">
            <span class="sender">{{ message.sender }}</span>
            <time>{{ message.time }}</time>
          </div>
          <p class="content">{{ message.content }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import { useConversationStore } from "../../stores/conversationStore";
import { useMessageStore } from "../../stores/messageStore";

const conversationStore = useConversationStore();
const messageStore = useMessageStore();

const { current } = storeToRefs(conversationStore);
const { loading: loadingRef, items, error } = storeToRefs(messageStore);

const scrollContainer = ref<HTMLElement | null>(null);

const loading = computed(() => loadingRef.value);
const messages = computed(() => items.value);
const title = computed(() => current.value?.title ?? "未选择会话");
const subtitle = computed(() => current.value?.subtitle ?? "");
const errorText = computed(() => error.value);

const loadMessages = async () => {
  await messageStore.loadMessages();
};

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
};

watch(messages, scrollToBottom, { deep: true });
watch(
  () => current.value?.id,
  () => {
    void loadMessages();
  }
);

onMounted(() => {
  void loadMessages();
});
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(36, 47, 95, 0.45);
  backdrop-filter: blur(18px);
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.panel-header p {
  margin: 0.4rem 0 0;
  color: rgba(228, 233, 255, 0.7);
}

.sync {
  background: rgba(94, 113, 255, 0.18);
  border: 1px solid rgba(148, 163, 255, 0.35);
  border-radius: 12px;
  color: #e0e7ff;
  padding: 0.45rem 1rem;
  cursor: pointer;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.messages ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.messages li {
  max-width: 70%;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  background: rgba(18, 24, 54, 0.85);
  border: 1px solid rgba(141, 162, 255, 0.12);
  backdrop-filter: blur(12px);
  align-self: flex-start;
}

.messages li.self {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.35);
  align-self: flex-end;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  color: rgba(220, 227, 255, 0.75);
}

.content {
  margin: 0;
  color: #f6f9ff;
  word-break: break-word;
}

.hint {
  margin: auto 0;
  text-align: center;
  color: rgba(209, 213, 255, 0.7);
}

.hint.error {
  color: #fca5a5;
}
</style>
