"use client";

import type { ChatMessageView } from "./ChatPage";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ messages }: { messages: ChatMessageView[] }) {
  return (
    <>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </>
  );
}