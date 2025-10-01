import type { ClientOptions, XmtpEnv } from "@xmtp/browser-sdk";
import { Client } from "@xmtp/browser-sdk";
import { defineStore } from "pinia";
import { computed, markRaw, ref } from "vue";
import {
  connectInjectedWallet,
  disconnectInjectedWallet,
} from "../services/walletService";
import { createXMTPSigner } from "../utils/xmtpSigner";

export type XMTPStatus = "idle" | "connecting" | "ready" | "error";

type BrowserXMTPClient = Client;

type CreateOptions = Omit<ClientOptions, "codecs">;

const XMTP_ENV: XmtpEnv =
  (import.meta.env.VITE_XMTP_ENV as XmtpEnv) ?? "production";
const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "xmtp-v3-web/0.1.0";

const createInitialState = () => ({
  address: null as string | null,
  client: null as BrowserXMTPClient | null,
  status: "idle" as XMTPStatus,
  error: null as string | null,
  inboxId: null as string | null,
});

export const useWalletStore = defineStore("wallet", () => {
  const state = ref(createInitialState());

  const account = computed(() => state.value.address);
  const client = computed(() => state.value.client);
  const xmtpStatus = computed(() => state.value.status);
  const error = computed(() => state.value.error);
  const inboxId = computed(() => state.value.inboxId);

  const statusText = computed(() => {
    switch (state.value.status) {
      case "ready":
        return "已连接";
      case "connecting":
        return "连接中";
      case "error":
        return state.value.error ?? "连接失败";
      default:
        return "待连接";
    }
  });

  const reset = () => {
    state.value = createInitialState();
  };

  const connect = async () => {
    try {
      state.value.status = "connecting";
      state.value.error = null;

      const wallet = await connectInjectedWallet();
      state.value.address = wallet.address;

      const signer = createXMTPSigner(wallet.client, wallet.address);

      const options: CreateOptions = {
        env: XMTP_ENV,
        appVersion: APP_VERSION,
      };
      const nextClient = await Client.create(signer, options);

      state.value.client = markRaw(nextClient);
      state.value.inboxId = nextClient.inboxId ?? state.value.inboxId;
      state.value.status = "ready";
    } catch (err) {
      console.error("Failed to connect wallet/XMTP:", err);
      state.value.status = "error";
      state.value.error = err instanceof Error ? err.message : String(err);
      await disconnect();
    }
  };

  const disconnect = async () => {
    await disconnectInjectedWallet();
    reset();
  };

  return {
    account,
    client,
    xmtpStatus,
    error,
    inboxId,
    statusText,
    connect,
    disconnect,
    reset,
  };
});
