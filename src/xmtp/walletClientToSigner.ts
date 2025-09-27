import type { Signer } from "@xmtp/xmtp-js";
import type { SignableMessage, WalletClient } from "viem";

export const walletClientToSigner = (walletClient: WalletClient): Signer => ({
  async getAddress() {
    const [address] = walletClient.account
      ? [walletClient.account.address]
      : await walletClient.getAddresses();
    if (!address) {
      throw new Error("No account found on wallet client");
    }
    return address;
  },
  async signMessage(message) {
    const account =
      walletClient.account ?? (await walletClient.getAddresses())[0];
    if (!account) {
      throw new Error("No account available for signing");
    }
    const payload: SignableMessage =
      typeof message === "string" ? message : { raw: new Uint8Array(message) };
    return walletClient.signMessage({
      message: payload,
      account,
    });
  },
});
