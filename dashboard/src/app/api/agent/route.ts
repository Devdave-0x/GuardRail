import { NextRequest } from 'next/server';
import { isAddress } from 'viem';
import { runAgent, runDirectAgent } from '../../../../.agent-runtime/bridge.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/*
  Calls the agent's tool-calling loop in-process instead of spawning
  `runtime/dist/dashboard-agent.js` as a child process. The subprocess approach worked
  locally because the compiled sibling package sat right there on disk, but it can't
  survive a serverless deploy:

  1. Vercel's build only bundles files a route imports. A `spawn()` call with a path
     built at runtime (`path.join(runtimePath, 'dist', ...)`) is invisible to that
     analysis, so the target file never shipped with the function.
  2. Launching a second full Node process inside an already-sandboxed serverless function
     is fragile even when the file is present.

  The import above must be static, not `await import(...)`, and it has to be the compiled
  dist (via dashboard/.agent-runtime, a gitignored copy `prebuild` produces from
  ../runtime/dist, see package.json), not the TS source. Both facts matter for the same
  reason: Next's file-tracer only shallowly includes a *dynamically* imported external
  file itself, not that file's own further imports. bridge.js's `openai` dependency
  (three hops down, via agent.js) silently went missing from the deployed function even
  though bridge.js itself was present. A static import lets webpack bundle the whole
  transitive graph normally, the same way it does for every other import in this app, so
  openai/zod/dotenv end up compiled directly into the output instead of needing runtime
  node_modules resolution at all. The TS source doesn't work as the static-import target
  because its nodenext-style `.js`-suffixed imports (pointing at .ts files) don't resolve
  through Next's webpack config; the compiled dist's imports are real .js files.

  One tradeoff: agent.ts/account.ts read required env vars as top-level consts, so a
  missing one now throws at module load (function cold start) rather than being caught
  per-request inside the try/catch below. That's an acceptable trade for a working
  deploy: the required vars are set as Vercel project env vars, not optional.
*/

export async function POST(req: NextRequest) {
  try {
    const { goal, mode, connectedAddress } = await req.json();
    if (!goal || typeof goal !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing goal' }), { status: 400 });
    }

    const isDirect = mode === 'direct';
    if (isDirect && (typeof connectedAddress !== 'string' || !isAddress(connectedAddress))) {
      return new Response(JSON.stringify({ error: 'Missing or invalid connectedAddress' }), {
        status: 400,
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;

        const closeStream = () => {
          if (!closed) {
            closed = true;
            controller.close();
          }
        };

        const sendChunk = (data: object) => {
          if (!closed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }
        };

        try {
          if (isDirect) {
            await runDirectAgent(goal, connectedAddress as `0x${string}`, (chunk: object) =>
              sendChunk(chunk),
            );
          } else {
            await runAgent(goal, (chunk: object) => sendChunk(chunk));
          }
        } catch (error) {
          const content = error instanceof Error ? error.message : String(error);
          sendChunk({ type: 'error', content });
        } finally {
          closeStream();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}
