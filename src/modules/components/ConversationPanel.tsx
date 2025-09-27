import {
  SortDirection,
  type Conversation,
  type DecodedMessage,
} from "@xmtp/xmtp-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { XMTPClient } from "../../xmtp/useXmtpClient";
import { MessageComposer } from "./MessageComposer.tsx";

type Props = {
  client: XMTPClient;
  conversation: Conversation | null;
  onRefreshConversations: () => void;
};

type ConversationState = {
  conversation: Conversation | null;
  messages: DecodedMessage[];
};

export const ConversationPanel = ({
  client,
  conversation,
  onRefreshConversations,
}: Props) => {
  const [state, setState] = useState<ConversationState>({
    conversation: null,
    messages: [],
  });
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<AsyncIterableIterator<DecodedMessage> | null>(null);

  useEffect(() => {
    let active = true;
    const loadSelected = async () => {
      if (!conversation) {
        setState({ conversation: null, messages: [] });
        streamRef.current?.return?.();
        streamRef.current = null;
        return;
      }
      setLoading(true);
      setIsStreaming(false);
      try {
        streamRef.current?.return?.();
        streamRef.current = null;
        const messages = await conversation.messages({
          direction: SortDirection.SORT_DIRECTION_ASCENDING,
          limit: 100,
        });
        if (!active) return;
        setState({ conversation, messages });
        setIsStreaming(true);
        const stream = await conversation.streamMessages();
        streamRef.current = stream;
        for await (const message of stream) {
          if (!active) break;
          setState((prev) => {
            if (
              !prev.conversation ||
              prev.conversation.topic !== conversation.topic
            ) {
              return prev;
            }
            const exists = prev.messages.some((item) => item.id === message.id);
            if (exists) {
              return prev;
            }
            return {
              conversation: prev.conversation,
              messages: [...prev.messages, message],
            };
          });
        }
      } finally {
        if (active) {
          setLoading(false);
          setIsStreaming(false);
        }
      }
    };

    void loadSelected();

    return () => {
      active = false;
      streamRef.current?.return?.();
      streamRef.current = null;
    };
  }, [conversation]);

  const handleSendMessage = useCallback(
    async (content: string, recipients: string[]) => {
      const activeConversation = conversation;
      if (!activeConversation) {
        throw new Error("No conversation selected");
      }

      if (
        recipients.length === 1 &&
        recipients[0] === activeConversation.peerAddress
      ) {
        const sent = await activeConversation.send(content);
        setState((prev) => {
          if (
            !prev.conversation ||
            prev.conversation.topic !== activeConversation.topic
          ) {
            return prev;
          }
          return {
            conversation: prev.conversation,
            messages: [...prev.messages, sent],
          };
        });
        return [sent];
      }

      const results = await Promise.all(
        recipients.map(async (address) => {
          const nextConversation = await client.conversations.newConversation(
            address
          );
          const sent = await nextConversation.send(content);
          return sent;
        })
      );
      onRefreshConversations();
      return results;
    },
    [client, conversation, onRefreshConversations]
  );

  const currentConversation = state.conversation;
  const messages = state.messages;
  const peerAddress = currentConversation?.peerAddress;

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.sent.getTime() - b.sent.getTime()),
    [messages]
  );

  const renderedMessages = useMemo(
    () =>
      sortedMessages.map((message) => (
        <li key={message.id}>
          <div className="message">
            <span className="message__author">{message.senderAddress}</span>
            <time dateTime={message.sent.toISOString()}>
              {message.sent.toLocaleTimeString()}
            </time>
            <p>{message.content}</p>
          </div>
        </li>
      )),
    [sortedMessages]
  );

  return (
    <section className="conversation-panel">
      <header>
        <div>
          <h2>{peerAddress ?? "No conversation selected"}</h2>
          {peerAddress && (
            <small>
              Topic: {currentConversation?.topic}
              {isStreaming ? " • Live" : ""}
            </small>
          )}
        </div>
      </header>
      <div className="message-feed">
        {loading ? <p>Loading messages…</p> : <ul>{renderedMessages}</ul>}
      </div>
      <MessageComposer onSend={handleSendMessage} disabled={!conversation} />
    </section>
  );
};
