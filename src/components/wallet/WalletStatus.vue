<template>
  <div class="wallet-status">
    <div class="status-block">
      <span class="status-label">XMTP 状态：</span>
      <span :class="['status-dot', statusClass]"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>

    <div class="wallet-info" v-if="account">
      <span class="wallet-label">当前钱包：</span>
      <span class="wallet-address">{{ shortAddress }}</span>
    </div>

    <div class="actions">
      <button v-if="!account" class="primary" @click="connectWallet">
        连接钱包
      </button>
      <button v-else class="secondary" @click="disconnectWallet">
        断开连接
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useWalletStore } from "../../stores/walletStore";

const walletStore = useWalletStore();
const { account, xmtpStatus, statusText } = storeToRefs(walletStore);

const shortAddress = computed(() => {
  const addr = account.value;
  if (!addr) return "未连接";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
});

const statusClass = computed(() => {
  switch (xmtpStatus.value) {
    case "ready":
      return "ok";
    case "connecting":
      return "pending";
    case "error":
      return "error";
    default:
      return "idle";
  }
});

const connectWallet = async () => {
  await walletStore.connect();
};

const disconnectWallet = async () => {
  await walletStore.disconnect();
};
</script>

<style scoped>
.wallet-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}

.status-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.status-label {
  color: rgba(255, 255, 255, 0.6);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.status-dot.idle {
  color: rgba(255, 255, 255, 0.3);
}

.status-dot.pending {
  color: #ffc75f;
}

.status-dot.ok {
  color: #5eead4;
}

.status-dot.error {
  color: #f87171;
}

.status-text {
  font-weight: 600;
}

.wallet-info {
  display: flex;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
}

.wallet-address {
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  background: rgba(94, 234, 212, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

button {
  padding: 0.45rem 1.1rem;
  border-radius: 14px;
  border: none;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

button:hover {
  transform: translateY(-1px);
}

button.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 15px 30px -18px rgba(99, 102, 241, 0.8);
}

button.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #f5f7ff;
  border: 1px solid rgba(148, 163, 255, 0.2);
}
</style>
