import { useCallback, useState } from "react";

type Props = {
  onSend: (content: string, recipients: string[]) => Promise<unknown>;
  disabled?: boolean;
};

export const MessageComposer = ({ onSend, disabled = false }: Props) => {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!message.trim() || !recipients.trim()) {
        setFeedback("Recipients and message are required");
        return;
      }

      const addresses = recipients
        .split(/[\s,]+/)
        .map((address) => address.trim())
        .filter(Boolean);

      if (!addresses.length) {
        setFeedback("Provide at least one recipient address");
        return;
      }

      setSending(true);
      setFeedback(null);
      try {
        await onSend(message.trim(), addresses);
        setMessage("");
        setRecipients("");
        setFeedback(`Sent to ${addresses.length} recipient(s)`);
      } catch (err) {
        const asError = err instanceof Error ? err : new Error(String(err));
        setFeedback(`Failed to send: ${asError.message}`);
      } finally {
        setSending(false);
      }
    },
    [message, onSend, recipients]
  );

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <div className="message-composer__row">
        <label htmlFor="recipients">Recipients</label>
        <input
          id="recipients"
          placeholder="0x123…, 0x456…, farcaster:xmtp"
          value={recipients}
          onChange={(event) => setRecipients(event.target.value)}
          disabled={disabled || sending}
        />
      </div>
      <div className="message-composer__row">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          placeholder="Type your message"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={disabled || sending}
        />
      </div>
      <div className="message-composer__actions">
        <button type="submit" disabled={disabled || sending}>
          {sending ? "Sending…" : "Send message"}
        </button>
        {feedback && (
          <span className="message-composer__feedback">{feedback}</span>
        )}
      </div>
    </form>
  );
};
