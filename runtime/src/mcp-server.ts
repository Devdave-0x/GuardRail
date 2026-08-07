import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { executeToolCall } from './executor.js';
import { runtimeTools, toolMap, type ToolName } from './tools.js';

/*
 * eth-agent-kit (packages/eth-agent-kit) is a separate, Sepolia-only SDK that throws for
 * any other CHAIN_ID. It used to be silently preferred over the native runtime below
 * whenever AGENT_CONTRACT_ADDRESS/AGENT_PRIVATE_KEY/RPC_URL were all set, with both paths
 * logging the identical "connected over stdio" line, making it impossible to tell from
 * logs alone which implementation was actually serving tool calls. It's now opt-in only,
 * via USE_ETH_AGENT_KIT=true, and failures are logged instead of swallowed.
 */
async function tryStartKitServer(): Promise<boolean> {
  if (process.env.USE_ETH_AGENT_KIT !== 'true') {
    return false;
  }

  try {
    const kit = await import('eth-agent-kit');
    const contractAddress = process.env.AGENT_CONTRACT_ADDRESS as `0x${string}` | undefined;
    const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}` | undefined;
    const rpcUrl = process.env.RPC_URL ?? process.env.ALCHEMY_RPC_URL;

    if (!contractAddress || !privateKey || !rpcUrl) {
      console.error(
        '[mcp-server] USE_ETH_AGENT_KIT=true but AGENT_CONTRACT_ADDRESS/AGENT_PRIVATE_KEY/RPC_URL missing, falling back to native runtime',
      );
      return false;
    }

    const agent = new kit.ETHAgent({
      contractAddress,
      privateKey,
      rpcUrl,
      groqApiKey: process.env.GROQ_API_KEY,
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      chainId: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 11155111,
      guardianAddress: process.env.GUARDIAN_ADDRESS,
    });

    await agent.startMCPServer();
    console.error('[mcp-server] using eth-agent-kit (Sepolia only), connected over stdio');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[mcp-server] eth-agent-kit failed to start, falling back to native runtime: ${message}`,
    );
    return false;
  }
}

function toJsonText(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function successResult(payload: unknown) {
  return {
    content: [{ type: 'text' as const, text: toJsonText(payload) }],
    structuredContent: { result: payload },
  };
}

function errorResult(message: string, details?: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: toJsonText({ success: false, error: message, details }),
      },
    ],
    structuredContent: {
      success: false,
      error: message,
      details,
    },
    isError: true,
  };
}

const server = new Server(
  { name: 'guardrail', version: '1.0.0' },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: runtimeTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name as ToolName;
  const rawArgs = request.params.arguments ?? {};

  try {
    const definition = toolMap.get(toolName);
    if (!definition) {
      return errorResult(`Unknown tool: ${toolName}`);
    }

    const parsed = definition.schema.safeParse(rawArgs);
    if (!parsed.success) {
      return errorResult('Invalid tool arguments', parsed.error.flatten());
    }

    const result = await executeToolCall(toolName, parsed.data);
    return successResult(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[mcp-server] tools/call failed for ${toolName}: ${message}`);
    return errorResult(message);
  }
});

let transport: StdioServerTransport | null = null;

async function main() {
  try {
    transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(
      '[mcp-server] using native runtime (chain-aware, see src/chain.ts), connected over stdio',
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[mcp-server] startup error: ${message}`);
    process.exitCode = 1;
  }
}

async function shutdown(signal: string) {
  console.error(`[mcp-server] received ${signal}, shutting down...`);
  try {
    await server.close();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[mcp-server] close error: ${message}`);
  }
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

void (async () => {
  const started = await tryStartKitServer();
  if (!started) {
    await main();
  }
})();
