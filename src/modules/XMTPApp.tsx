import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { Conversation } from "@xmtp/xmtp-js";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";
import { useXmtpClient } from "../xmtp/useXmtpClient";
import { ConversationList } from "./components/ConversationList.tsx";
import { ConversationPanel } from "./components/ConversationPanel.tsx";
import { InboxPlaceholder } from "./components/InboxPlaceholder";

export const XMTPApp = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { client, status, initClient, error, reset } = useXmtpClient();

  const handleDisconnect = () => {
    setActiveConversation(null);
    setRefreshKey(0);
    reset();
    disconnect();
  };

  useEffect(() => {
    if (!client) {
      setActiveConversation(null);
      return;
    }

    let cancelled = false;

    const syncConversations = async () => {
      const conversations = await client.conversations.list();
      if (cancelled) {
        return;
      }

      if (activeConversation) {
        const match = conversations.find(
          (conversation) => conversation.topic === activeConversation.topic
        );
        if (match) {
          if (match !== activeConversation) {
            setActiveConversation(match);
          }
          return;
        }
      }

      if (conversations.length) {
        setActiveConversation(conversations[0]);
      } else {
        setActiveConversation(null);
      }
    };

    void syncConversations();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, refreshKey, activeConversation?.topic]);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  const handleConversationsUpdated = () => {
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="app-shell">
      <header className="app-shell__topbar">
        <div className="topbar__branding">
          <img src="/vite.svg" alt="XMTP" className="topbar__logo" />
          <div>
            <h1>XMTP Bulk Messenger</h1>
            <p>Secure decentralized messaging across multiple wallets</p>
          </div>
        </div>
        <div className="topbar__actions">
          <ConnectButton />
          {isConnected && (
            <button
              type="button"
              className="secondary"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          )}
        </div>
      </header>

      <main className="app-shell__main">
        {!isConnected || !client ? (
          <InboxPlaceholder
            address={address}
            status={status}
            error={error?.message}
            onConnect={() => {
              if (walletClient && status === "idle") {
                void initClient(walletClient).then(() => {
                  setRefreshKey((value) => value + 1);
                });
              }
            }}
          />
        ) : (
          <div className="inbox-layout">
            <ConversationList
              client={client}
              selectedTopic={activeConversation?.topic}
              refreshKey={refreshKey}
              onSelectConversation={handleSelectConversation}
              onRefresh={handleConversationsUpdated}
            />
            <ConversationPanel
              client={client}
              conversation={activeConversation}
              onRefreshConversations={handleConversationsUpdated}
            />
          </div>
        )}
      </main>
    </div>
  );
};
