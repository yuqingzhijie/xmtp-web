type Props = {
  address?: `0x${string}`;
  status: string;
  error?: string;
  onConnect: () => void;
};

export const InboxPlaceholder = ({
  address,
  status,
  error,
  onConnect,
}: Props) => (
  <section className="inbox-placeholder">
    <div>
      <h2>Connect a wallet to start messaging</h2>
      <p>
        XMTP lets you message any compatible wallet address with end-to-end
        encryption. Connect and register your wallet to join the decentralized
        messaging network.
      </p>
      <button type="button" onClick={onConnect}>
        Connect wallet
      </button>
    </div>
    <dl>
      <div>
        <dt>Status</dt>
        <dd>{status}</dd>
      </div>
      {address && (
        <div>
          <dt>Wallet</dt>
          <dd>{address}</dd>
        </div>
      )}
      {error && (
        <div className="error">
          <dt>Error</dt>
          <dd>{error}</dd>
        </div>
      )}
    </dl>
  </section>
);
