<template>
  <form class="composer" @submit.prevent="handleSend">
    <div class="field">
      <label>收件人（支持多个地址/标识，逗号或空格分隔）</label>
      <textarea
        v-model="recipients"
        rows="2"
        placeholder="0x1234..., farcaster:alice ..."
      ></textarea>
    </div>

    <div class="field">
      <label>消息内容</label>
      <textarea
        v-model="content"
        rows="3"
        placeholder="请输入要发送的消息"
      ></textarea>
    </div>

    <div class="actions">
      <button type="submit" :disabled="sending || !content.trim()">
        {{ sending ? "发送中…" : "发送消息" }}
      </button>
      <span class="tip">发送前请确保双方都已开通 XMTP V3。</span>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMessageStore } from "../../stores/messageStore";

const messageStore = useMessageStore();
const recipients = ref("");
const content = ref("");

const sending = messageStore.sending;

const handleSend = async () => {
  if (!content.value.trim()) return;

  try {
    await messageStore.sendMessage({
      content: content.value,
      recipients: recipients.value.split(/[\n]+/),
    });
    content.value = "";
  } catch (err) {
    console.error("发送消息失败", err);
  }
};
</script>

<style scoped>
.composer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(15, 22, 45, 0.8);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

label {
  font-size: 0.85rem;
  color: rgba(209, 213, 255, 0.75);
}

textarea {
  background: rgba(18, 24, 58, 0.85);
  border: 1px solid rgba(148, 163, 255, 0.3);
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  color: #f5f7ff;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button {
  border: none;
  border-radius: 14px;
  padding: 0.65rem 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #5eead4, #38bdf8);
  color: #051124;
  cursor: pointer;
  transition: transform 0.1s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tip {
  font-size: 0.8rem;
  color: rgba(209, 213, 255, 0.6);
}
</style>
