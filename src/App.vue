<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <img src="/vite.svg" alt="XMTP" class="brand-logo" />
        <div>
          <h1>XMTP 批量消息助手</h1>
          <p>基于 XMTP V3 的去中心化安全通信</p>
        </div>
      </div>
      <div class="header-actions">
        <WalletStatus />
      </div>
    </header>

    <main class="app-main">
      <aside class="sidebar">
        <ConversationFilter />
        <ConversationList />
      </aside>
      <section class="conversation-area">
        <ConversationPanel />
        <MessageComposer />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import ConversationFilter from "./components/conversation/ConversationFilter.vue";
import ConversationList from "./components/conversation/ConversationList.vue";
import ConversationPanel from "./components/conversation/ConversationPanel.vue";
import MessageComposer from "./components/conversation/MessageComposer.vue";
import WalletStatus from "./components/wallet/WalletStatus.vue";
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: radial-gradient(
    circle at top,
    #202040 0%,
    #101020 35%,
    #050509 100%
  );
  color: #f5f7ff;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: linear-gradient(
    90deg,
    rgba(33, 51, 121, 0.45),
    rgba(10, 18, 42, 0.65)
  );
  backdrop-filter: blur(18px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.brand-logo {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, #5c71ff, #8a4fff);
  padding: 8px;
}

.brand h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
}

.brand p {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  padding: 1.5rem 2rem 2rem;
}

.sidebar {
  background: rgba(16, 20, 45, 0.8);
  border: 1px solid rgba(92, 113, 255, 0.12);
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 18px 40px -20px rgba(92, 113, 255, 0.4);
}

.conversation-area {
  background: rgba(16, 20, 45, 0.75);
  border: 1px solid rgba(92, 113, 255, 0.1);
  border-radius: 18px;
  display: grid;
  grid-template-rows: 1fr auto;
  box-shadow: 0 25px 35px -28px rgba(92, 113, 255, 0.45);
}

@media (max-width: 1080px) {
  .app-main {
    grid-template-columns: 1fr;
  }

  .conversation-area {
    min-height: 65vh;
  }
}
</style>
