import type { ClientOptions, XmtpEnv } from "@xmtp/xmtp-js";
import { Client } from "@xmtp/xmtp-js";
import { useCallback, useMemo, useState } from "react";
import type { WalletClient } from "viem";

import { walletClientToSigner } from "./walletClientToSigner";

export type XMTPClient = Client;

export type XMTPStatus = "idle" | "connecting" | "ready" | "error";

type InitOptions = {
  env?: XmtpEnv;
  clientOptions?: ClientOptions;
};

const resolveEnv = (): XmtpEnv => {
  const env = import.meta.env.VITE_XMTP_ENV as XmtpEnv | undefined;
  return env ?? "production";
};

export const useXmtpClient = (options: InitOptions = {}) => {
  const [client, setClient] = useState<XMTPClient | null>(null);
  const [status, setStatus] = useState<XMTPStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  const env = options.env ?? resolveEnv();
  const appVersion = useMemo(
    () => options.clientOptions?.appVersion ?? "xmtp-web-bulk/0.1.0",
    [options.clientOptions?.appVersion]
  );

  const initClient = useCallback(
    async (walletClient: WalletClient) => {
      if (!walletClient) {
        throw new Error("Wallet client is required to initialize XMTP");
      }
      if (client) {
        return client;
      }

      setStatus("connecting");
      setError(null);
      try {
        const signer = walletClientToSigner(walletClient);
        const nextClient = await Client.create(signer, {
          env,
          appVersion,
          ...options.clientOptions,
        });
        setClient(nextClient);
        setStatus("ready");
        return nextClient;
      } catch (err) {
        const asError = err instanceof Error ? err : new Error(String(err));
        setError(asError);
        setStatus("error");
        throw asError;
      }
    },
    [appVersion, client, env, options.clientOptions]
  );

  const reset = useCallback(() => {
    setClient(null);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    client,
    status,
    error,
    initClient,
    reset,
  };
};
