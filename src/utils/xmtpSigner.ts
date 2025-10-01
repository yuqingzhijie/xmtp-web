import { hexToBytes } from "@noble/hashes/utils";
import type { Identifier, Signer } from "@xmtp/browser-sdk";
import type { WalletClient } from "viem";

const toIdentifier = (address: string): Identifier => ({
  identifier: address,
  identifierKind: "Ethereum",
});

export const createXMTPSigner = (
  walletClient: WalletClient,
  fallbackAddress?: string
): Signer => ({
  type: "EOA",
  async getIdentifier() {
    const address =
      fallbackAddress ??
      walletClient.account?.address ??
      (await walletClient.getAddresses())[0];
    if (!address) {
      throw new Error("无法获取钱包地址，无法初始化 XMTP 标识");
    }
    return toIdentifier(address);
  },
  async signMessage(message) {
    const account =
      walletClient.account ?? (await walletClient.getAddresses())[0];
    if (!account) {
      throw new Error("无可用账户签名 XMTP 消息");
    }
    const payload =
      typeof message === "string" ? message : { raw: new Uint8Array(message) };
    const signature = await walletClient.signMessage({
      message: payload,
      account,
    });
    if (signature instanceof Uint8Array) {
      return signature;
    }
    if (typeof signature === "string") {
      const hex = signature.startsWith("0x") ? signature.slice(2) : signature;
      return hexToBytes(hex);
    }
    throw new Error("钱包返回未知的签名格式");
  },
});
