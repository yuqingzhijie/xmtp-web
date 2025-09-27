import type { Conversation } from "@xmtp/xmtp-js";
import { SortDirection } from "@xmtp/xmtp-js";
import { useCallback, useEffect, useState } from "react";
import type { XMTPClient } from "../../xmtp/useXmtpClient";

type Props = {
  client: XMTPClient;
  selectedTopic?: string;
  refreshKey: number;
  onSelectConversation: (conversation: Conversation) => void;
  onRefresh: () => void;
};

type ConversationListItem = {
  conversation: Conversation;
  topic: string;
  peerAddress: string;
  lastMessage?: string;
  lastTimestamp?: number;
};

export const ConversationList = ({
  client,
  selectedTopic,
  refreshKey,
  onSelectConversation,
  onRefresh,
}: Props) => {
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | undefined>(selectedTopic);

  useEffect(() => {
    let active = true;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const conversations = await client.conversations.list();
        const enriched = await Promise.all(
          conversations.map(async (conversation) => {
            const messages = await conversation.messages({
              pageSize: 1,
              direction: SortDirection.SORT_DIRECTION_DESCENDING,
            });
            const last = messages[0];
            return {
              conversation,
              topic: conversation.topic,
              peerAddress: conversation.peerAddress,
              lastMessage: last?.content?.toString(),
              lastTimestamp: last?.sent?.getTime(),
            } satisfies ConversationListItem;
          })
        );

        if (!active) return;
        setItems(
          enriched.sort(
            (a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0)
          )
        );
      } catch (err) {
        console.error("Failed to fetch XMTP conversations", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchConversations();

    return () => {
      active = false;
    };
  }, [client, refreshKey]);

  useEffect(() => {
    setSelected(selectedTopic);
  }, [selectedTopic]);

  const handleSelect = useCallback(
    (topic: string) => {
      setSelected(topic);
      const item = items.find((entry) => entry.topic === topic);
      if (item) {
        onSelectConversation(item.conversation);
      }
    },
    [items, onSelectConversation]
  );

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setSelected(selectedTopic);
    onRefresh();
  }, [onRefresh, selectedTopic]);

  return (
    <aside className="conversation-list">
      <header>
        <h2>Conversations</h2>
        <button type="button" onClick={handleRefresh}>
          Refresh
        </button>
      </header>
      {loading ? (
        <p>Loading conversations…</p>
      ) : items.length === 0 ? (
        <p>No conversations yet. Start a new one!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.topic}>
              <button
                type="button"
                className={item.topic === selected ? "active" : undefined}
                onClick={() => handleSelect(item.topic)}
              >
                <span>{item.peerAddress}</span>
                <small>
                  {item.lastMessage ?? "No messages yet"}
                  {item.lastTimestamp && (
                    <span>
                      {" "}
                      {new Date(item.lastTimestamp).toLocaleString()}
                    </span>
                  )}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};
