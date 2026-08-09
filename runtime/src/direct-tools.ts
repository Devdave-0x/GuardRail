import { z } from 'zod';
import { isAddress } from 'viem';

const addressSchema = z.string().refine((v) => isAddress(v), 'Invalid Ethereum address');

export type DirectToolName = 'propose_transfer' | 'check_balance';

export interface DirectToolDefinition<TInput = unknown> {
  name: DirectToolName;
  description: string;
  inputSchema: Record<string, unknown>;
  schema: z.ZodType<TInput>;
}

/*
 * Direct mode never holds a private key server-side — the connected wallet signs
 * everything. propose_transfer only builds a proposal for the frontend to render and
 * ask the user to confirm/cancel; it does not move funds itself.
 */
export const directRuntimeTools: DirectToolDefinition[] = [
  {
    name: 'propose_transfer',
    description:
      "Propose sending native tokens from the user's connected wallet to a recipient. Does not execute the transfer — the user must confirm it themselves in their wallet. Use this whenever the user asks to send/transfer funds.",
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient address (0x...)' },
        amount: {
          type: 'string',
          description: "Amount in the native token as a decimal string, e.g. '0.01'",
        },
      },
      required: ['to', 'amount'],
    },
    schema: z.object({ to: addressSchema, amount: z.string().min(1) }).strict(),
  },
  {
    name: 'check_balance',
    description:
      "Read the native token balance of an address. Omit 'address' to check the user's own connected wallet.",
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Optional address (0x...) to check' },
      },
      required: [],
    },
    schema: z.object({ address: addressSchema.optional() }).strict(),
  },
];

export const directToolMap = new Map(directRuntimeTools.map((tool) => [tool.name, tool]));

export const directAgentTools = directRuntimeTools.map((tool) => ({
  type: 'function' as const,
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  },
}));
