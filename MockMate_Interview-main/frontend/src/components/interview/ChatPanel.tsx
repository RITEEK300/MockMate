import { useState } from 'react';

import { Button } from '../common/Button';
import type { ChatMessage } from '../../types';

export function ChatPanel({
  messages,
  currentUserId,
  onSend
}: {
  messages: ChatMessage[];
  currentUserId: string;
  onSend: (message: string) => void;
}) {
  const [message, setMessage] = useState('');

  return (
    <section className="flex h-full flex-col rounded-[28px] border border-white/10 bg-white/5">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Side chat</p>
        <h3 className="font-display text-2xl text-white">Keep context flowing</h3>
      </div>
      <div className="flex min-h-[14rem] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate/50 px-4 py-5 text-sm text-mist/70">
            Use chat for follow-up prompts, code snippets, or quick clarifications.
          </div>
        ) : messages.map((item) => (
          <div
            key={`${item.sentAt}-${item.message}`}
            className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm ${
              item.senderId === currentUserId
                ? 'self-end bg-coral text-ink'
                : 'self-start bg-slate text-white'
            }`}
          >
            <div className="mb-1 text-[11px] uppercase tracking-[0.18em] opacity-70">{item.senderName}</div>
            <div className="leading-6">{item.message}</div>
          </div>
        ))}
      </div>
      <form
        className="grid gap-3 border-t border-white/10 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = message.trim();
          if (!trimmed) {
            return;
          }
          onSend(trimmed);
          setMessage('');
        }}
      >
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Send a quick message..."
          className="min-h-24 rounded-3xl border border-white/10 bg-slate/60 px-4 py-3 text-sm text-white outline-none placeholder:text-mist/40 focus:border-mint"
        />
        <Button variant="secondary" type="submit">Send message</Button>
      </form>
    </section>
  );
}
