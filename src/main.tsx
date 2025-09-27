import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import "./index.css";
import { XMTPApp } from "./modules/XMTPApp";
import { createQueryClient } from "./queryClient";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

const queryClient = createQueryClient();

const config = getDefaultConfig({
  appName: "XMTP Web Bulk Messenger",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains: [baseSepolia, sepolia],
  ssr: false,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <XMTPApp />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
