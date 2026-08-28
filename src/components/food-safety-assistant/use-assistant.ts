"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type {
  AssistantAction,
  AssistantResponse,
  ConversationState,
  ProductSnapshot,
  QuestionField,
} from "@/types/food-safety-assistant";
import {
  initialConversationState,
} from "./state";

export type UseAssistantArgs = {
  product: ProductSnapshot | null;
  language?: "en" | "hi";
};

export type UseAssistantResult = {
  state: ConversationState;
  pending: boolean;
  error: string | null;
  meta: { aiAvailable: boolean; reportingUrlAvailable: boolean } | null;
  start: () => Promise<void>;
  sendMessage: (input: {
    message?: string | null;
    answerKey?: QuestionField | null;
    answerValue?: unknown;
  }) => Promise<void>;
  generateDraft: () => Promise<void>;
  reset: () => Promise<void>;
  setLanguage: (language: "en" | "hi") => void;
};

async function callAssistant(body: {
  action: AssistantAction;
  state: Partial<ConversationState>;
  productContext?: ProductSnapshot | null;
  message?: string | null;
  answerKey?: QuestionField | null;
  answerValue?: unknown;
  language?: "en" | "hi";
  conversationId?: string | null;
}): Promise<AssistantResponse> {
  const response = await fetch("/api/food-safety-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as {
    success: boolean;
    data?: AssistantResponse;
    error?: { message?: string } | null;
  } | null;
  if (!response.ok || !payload || !payload.success || !payload.data) {
    const message = payload?.error?.message ?? "The assistant could not respond. Please try again.";
    throw new Error(message);
  }
  return payload.data;
}

export function useAssistant({ product, language }: UseAssistantArgs): UseAssistantResult {
  const [state, setState] = useState<ConversationState>(() => initialConversationState(product, language ?? "en"));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ aiAvailable: boolean; reportingUrlAvailable: boolean } | null>(null);

  const start = useCallback(async () => {
    setError(null);
    startTransition(() => {
      Promise.resolve()
        .then(async () => {
          const resp = await callAssistant({
            action: "start",
            state: state,
            productContext: product,
            language: state.language,
          });
          setState(resp.state);
          setMeta(resp.meta);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Could not start the assistant.");
        });
    });
  }, [product, state]);

  const sendMessage = useCallback(
    async (input: { message?: string | null; answerKey?: QuestionField | null; answerValue?: unknown }) => {
      setError(null);
      try {
        const resp = await callAssistant({
          action: "message",
          state,
          productContext: state.productSnapshot ?? product,
          message: input.message ?? null,
          answerKey: input.answerKey ?? null,
          answerValue: input.answerValue,
          language: state.language,
          conversationId: null,
        });
        setState(resp.state);
        setMeta(resp.meta);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not send the answer.");
      }
    },
    [product, state],
  );

  const generateDraft = useCallback(async () => {
    setError(null);
    try {
      const resp = await callAssistant({
        action: "generate",
        state,
        productContext: state.productSnapshot ?? product,
        language: state.language,
      });
      setState(resp.state);
      setMeta(resp.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not generate the draft.");
    }
  }, [product, state]);

  const reset = useCallback(async () => {
    setError(null);
    try {
      const resp = await callAssistant({
        action: "reset",
        state,
        productContext: product,
        language: state.language,
      });
      setState(resp.state);
      setMeta(resp.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not reset the assistant.");
    }
  }, [product, state]);

  const setLanguage = useCallback((language: "en" | "hi") => {
    setState((prev) => ({ ...prev, language }));
  }, []);

  return useMemo(
    () => ({ state, pending, error, meta, start, sendMessage, generateDraft, reset, setLanguage }),
    [state, pending, error, meta, start, sendMessage, generateDraft, reset, setLanguage],
  );
}
