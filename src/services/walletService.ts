import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";

export type ConnectedWallet = {
  address: string;
  client: ReturnType<typeof createWalletClient>;
};

export const connectInjectedWallet = async (): Promise<ConnectedWallet> => {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("未检测到可用的钱包扩展，请先安装 MetaMask 或其他兼容钱包");
  }

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom((window as any).ethereum),
  });

  let addresses = await walletClient.getAddresses();

  if (!addresses.length) {
    addresses = await walletClient.requestAddresses();
  }

  const [address] = addresses;
  if (!address) {
    throw new Error("钱包连接失败，未获取到账户地址");
  }

  return {
    address,
    client: walletClient,
  };
};

export const disconnectInjectedWallet = async () => {
  if (typeof window !== "undefined" && (window as any).ethereum?.disconnect) {
    try {
      await (window as any).ethereum.disconnect();
    } catch (err) {
      console.warn("Wallet disconnect failed or not supported", err);
    }
  }
};
