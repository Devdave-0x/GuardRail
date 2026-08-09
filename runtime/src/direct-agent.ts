import OpenAI from 'openai';
import { formatEther, isAddress } from 'viem';
import { publicClient } from './account.js';
import { getChain } from './chain.js';
import { directAgentTools, directToolMap, type DirectToolName } from './direct-tools.js';

const networkName = getChain().name;
const nativeSymbol = getChain().nativeCurrency.symbol;

type ProviderName = 'groq' | 'openrouter' | 'google';

type ProviderConfig = {
  name: ProviderName;
  client: OpenAI;
  model: string;
};

function buildProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    providers.push({
      name: 'groq',
      client: new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' }),
      model: 'llama-3.3-70b-versatile',
    });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openRouterKey) {
    providers.push({
      name: 'openrouter',
      client: new OpenAI({ apiKey: openRouterKey, baseURL: 'https://openrouter.ai/api/v1' }),
      model: 'openai/gpt-4o-mini',
    });
  }

  const googleKey = process.env.GOOGLE_API_KEY?.trim();
  if (googleKey) {
    providers.push({
      name: 'google',
      client: new OpenAI({
        apiKey: googleKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
      }),
      model: 'gemini-2.0-flash',
    });
  }

  if (providers.length === 0) {
    throw new Error('No LLM provider configured. Set GROQ_API_KEY (recommended).');
  }

  return providers;
}

function systemPrompt(connectedAddress: string): string {
  return `You are GuardRail, a calm and practical on-chain copilot, running in Direct Wallet Mode.

In this mode there is no server-held key and no on-chain policy contract in the loop. The user's own connected wallet (${connectedAddress}) signs everything directly, so there are no spending limits or whitelists to enforce here — that safety model only applies to AgentWallet mode.

Personality: friendly, concise, direct.

Behavior rules:
- For pure conversation (greetings/help/explanations), reply naturally and do not call tools.
- When the user asks to send/transfer native tokens, call propose_transfer. You are only proposing — the frontend will show a confirm/cancel step and the user's wallet does the actual signing. Never claim a transfer happened; you only proposed it.
- When the user asks about a balance, call check_balance (omit "address" to check their own connected wallet).
- Always refer to the native currency as "${nativeSymbol}", never "ETH" unless ${nativeSymbol} literally is ETH.
- Network: ${networkName}.
- Never reveal private keys, secrets, or raw credentials.`;
}

const CONVERSATIONAL_ONLY =
  /^(hi|hello|hey|gm|gn|yo|sup|thanks|thank you|who are you|what can you do|help)\b/i;
const ACTION_HINTS = /\b(send|transfer|balance|bal)\b/i;

function shouldStayConversational(input: string): boolean {
  const text = input.trim();
  return CONVERSATIONAL_ONLY.test(text) && !ACTION_HINTS.test(text);
}

function safeParseJson(input: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(input);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // noop
  }
  return {};
}

async function requestWithFallback(
  providers: ProviderConfig[],
  payload: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, 'model'>,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      const response = await provider.client.chat.completions.create({
        ...payload,
        model: provider.model,
      });
      if (provider.name !== 'groq') {
        console.error(`[direct-agent] fallback provider used: ${provider.name}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      console.error(
        `[direct-agent] provider failed (${provider.name}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`All LLM providers failed. Last error: ${message}`);
}

interface DirectToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

async function executeDirectToolCall(
  name: DirectToolName,
  rawArgs: Record<string, unknown>,
  connectedAddress: `0x${string}`,
): Promise<DirectToolResult> {
  const tool = directToolMap.get(name);
  if (!tool) {
    return { ok: false, error: `Unknown tool: ${name}` };
  }

  const parsed = tool.schema.safeParse(rawArgs);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  if (name === 'propose_transfer') {
    const { to, amount } = parsed.data as { to: string; amount: string };
    return { ok: true, data: { to, amount, proposed: true } };
  }

  if (name === 'check_balance') {
    const { address } = parsed.data as { address?: string };
    const target = (address && isAddress(address) ? address : connectedAddress) as `0x${string}`;
    const balance = await publicClient.getBalance({ address: target });
    return { ok: true, data: { address: target, balance: formatEther(balance) } };
  }

  return { ok: false, error: 'Unhandled tool' };
}

export type DirectAgentEvent =
  | { type: 'status'; content: string }
  | { type: 'text'; content: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: unknown }
  | { type: 'propose_tx'; to: string; amount: string }
  | { type: 'error'; message: string }
  | { type: 'done'; content?: string };

export async function runDirectAgent(
  goal: string,
  connectedAddress: `0x${string}`,
  emit?: (event: DirectAgentEvent) => void,
): Promise<void> {
  emit?.({ type: 'status', content: 'Thinking...' });

  try {
    const providers = buildProviders();

    if (shouldStayConversational(goal)) {
      const response = await requestWithFallback(providers, {
        messages: [
          { role: 'system', content: systemPrompt(connectedAddress) },
          { role: 'user', content: goal },
        ],
      });

      const text =
        response.choices[0]?.message?.content?.trim() ||
        `Hey! I can help with direct BOT sends and balance checks on ${networkName}.`;

      emit?.({ type: 'text', content: text });
      emit?.({ type: 'done', content: text });
      return;
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt(connectedAddress) },
      { role: 'user', content: goal },
    ];

    for (let i = 0; i < 4; i += 1) {
      const response = await requestWithFallback(providers, {
        messages,
        tools: directAgentTools,
      });

      const choice = response.choices[0];
      const assistantMessage = choice.message;

      messages.push({
        role: 'assistant',
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      });

      if (choice.finish_reason !== 'tool_calls' || !assistantMessage.tool_calls?.length) {
        const text = assistantMessage.content?.trim() || 'Done.';
        emit?.({ type: 'text', content: text });
        emit?.({ type: 'done', content: text });
        return;
      }

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name as DirectToolName;
        const args = safeParseJson(toolCall.function.arguments);

        emit?.({ type: 'tool_call', name: toolName, args });

        const result = await executeDirectToolCall(toolName, args, connectedAddress);
        emit?.({ type: 'tool_result', name: toolName, result });

        if (
          toolName === 'propose_transfer' &&
          result.ok &&
          result.data &&
          typeof result.data === 'object'
        ) {
          const { to, amount } = result.data as { to: string; amount: string };
          emit?.({ type: 'propose_tx', to, amount });
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    const fallback = 'I reached the maximum tool-iteration limit. Please refine the request.';
    emit?.({ type: 'text', content: fallback });
    emit?.({ type: 'done', content: fallback });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    emit?.({ type: 'error', message });
    emit?.({ type: 'done', content: message });
  }
}
