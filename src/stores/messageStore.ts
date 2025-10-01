import { DecodedMessage, Dm, Group, SortDirection } from "@xmtp/browser-sdk";
import type { Identifier } from "@xmtp/wasm-bindings";
import { defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { useConversationStore } from "./conversationStore";
import { useWalletStore } from "./walletStore";

export type MessageItem = {
  id: string;
  content: string;
  sender: string;
  time: string;
  sentAtNs: bigint;
  isSelf: boolean;
};

export type SendPayload = {
  content: string;
  recipients: string[];
};

const nsToDate = (ns: bigint) => new Date(Number(ns / 1_000_000n));

const formatTime = (ns: bigint) => {
  const date = nsToDate(ns);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const parseIdentifier = (value: string): Identifier | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return {
      identifier: trimmed,
      identifierKind: "Ethereum",
    } as Identifier;
  }
  return null;
};

const toMessageItem = (
  message: DecodedMessage,
  selfInboxId: string | null
): MessageItem => {
  const content =
    typeof message.content === "string"
      ? message.content
      : message.content == null
      ? "[不支持的消息类型]"
      : JSON.stringify(message.content);
  return {
    id: message.id,
    content,
    sender: message.senderInboxId,
    time: formatTime(message.sentAtNs),
    sentAtNs: message.sentAtNs,
    isSelf: selfInboxId === message.senderInboxId,
  };
};

export const useMessageStore = defineStore("message", () => {
  const walletStore = useWalletStore();
  const conversationStore = useConversationStore();
  const { client } = storeToRefs(walletStore);
  const { current } = storeToRefs(conversationStore);

  const loading = ref(false);
  const sending = ref(false);
  const items = ref<MessageItem[]>([]);
  const error = ref<string | null>(null);

  const loadMessages = async () => {
    const activeClient = client.value;
    const activeConversation = current.value;
    if (!activeClient || !activeConversation) {
      items.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const decoded = await activeConversation.raw.messages({
        limit: 50n,
        direction: SortDirection.Descending,
      });
      const inboxId = activeClient.inboxId ?? null;
      const mapped = decoded
        .map((msg) => toMessageItem(msg, inboxId))
        .sort((a, b) => (a.sentAtNs < b.sentAtNs ? -1 : 1));
      items.value = mapped;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error("加载消息失败", err);
      items.value = [];
    } finally {
      loading.value = false;
    }
  };

  const sendToConversation = async (
    conversation: Dm | Group,
    content: string
  ) => {
    await conversation.send(content);
    await loadMessages();
  };

  const sendMessage = async ({ content, recipients }: SendPayload) => {
    const activeClient = client.value;
    const activeConversation = current.value;
    if (!activeClient) {
      throw new Error("请先连接 XMTP 客户端");
    }
    const trimmedContent = content.trim();
    const normalizedRecipients = recipients
      .flatMap((item) => item.split(/[\s,]+/))
      .map((item) => item.trim())
      .filter(Boolean);

    if (!trimmedContent) {
      throw new Error("请输入要发送的消息内容");
    }

    sending.value = true;
    error.value = null;

    try {
      if (normalizedRecipients.length === 0 && activeConversation) {
        await sendToConversation(
          activeConversation.raw as Dm | Group,
          trimmedContent
        );
      } else {
        const identifiers = normalizedRecipients
          .map(parseIdentifier)
          .filter((identifier): identifier is Identifier => identifier != null);

        if (identifiers.length === 0) {
          throw new Error("请输入正确的钱包地址，目前仅支持以太坊地址");
        }

        for (const identifier of identifiers) {
          const dm = await activeClient.conversations.newDmWithIdentifier(
            identifier
          );
          await dm.send(trimmedContent);
        }
        await conversationStore.fetchConversations();
        await loadMessages();
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      sending.value = false;
    }
  };

  watch(
    () => current.value?.id,
    () => {
      void loadMessages();
    },
    { immediate: true }
  );

  return {
    loading,
    sending,
    items,
    error,
    loadMessages,
    sendMessage,
  };
});
