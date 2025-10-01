import { Conversation, Dm, Group } from "@xmtp/browser-sdk";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useWalletStore } from "./walletStore";

export type ConversationListItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "dm" | "group";
  kindLabel: string;
  raw: Conversation;
};

const asGroup = (conversation: Conversation): Group | null =>
  conversation instanceof Group ? conversation : null;

const asDm = (conversation: Conversation): Dm | null =>
  conversation instanceof Dm ? conversation : null;

export const useConversationStore = defineStore("conversation", () => {
  const walletStore = useWalletStore();
  const { client } = storeToRefs(walletStore);

  const loading = ref(false);
  const items = ref<ConversationListItem[]>([]);
  const activeId = ref<string | null>(null);
  const initialized = ref(false);

  const itemsView = computed(() => items.value);

  const formatConversation = async (
    conversation: Conversation
  ): Promise<ConversationListItem | undefined> => {
    const group = asGroup(conversation);
    if (group) {
      const title = group.name ?? "群组会话";
      const type = (group.metadata?.conversationType ?? "").toString();
      const creator = group.metadata?.creatorInboxId
        ? `创建者：${group.metadata.creatorInboxId}`
        : "匿名创建";
      return {
        id: group.id,
        title,
        subtitle: creator,
        kind: type === "group" ? "group" : "dm",
        kindLabel: type === "group" ? "群组" : "私信",
        raw: group,
      };
    }

    const dm = asDm(conversation);
    if (dm) {
      const peer = await dm.peerInboxId().catch(() => undefined);
      const title = peer ?? "未命名私信";
      return {
        id: dm.id,
        title,
        subtitle: "私信对话",
        kind: "dm",
        kindLabel: "私信",
        raw: dm,
      };
    }

    return undefined;
  };

  const fetchConversations = async () => {
    const activeClient = client.value;
    if (!activeClient) {
      items.value = [];
      return;
    }
    loading.value = true;
    try {
      const convos = await activeClient.conversations.list();
      const mapped: ConversationListItem[] = [];
      for (const convo of convos) {
        const item = await formatConversation(convo);
        if (item) {
          mapped.push(item);
        }
      }
      items.value = mapped;
      initialized.value = true;
      if (!activeId.value && mapped.length > 0) {
        activeId.value = mapped[0]?.id ?? null;
      }
    } finally {
      loading.value = false;
    }
  };

  const setActive = (id: string) => {
    activeId.value = id;
  };

  const current = computed(
    () => items.value.find((item) => item.id === activeId.value) ?? null
  );

  return {
    loading,
    items,
    itemsView,
    activeId,
    current,
    initialized,
    fetchConversations,
    setActive,
  };
});
