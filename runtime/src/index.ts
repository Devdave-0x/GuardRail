import { runAgent } from './agent.js';
import { initT3NIdentity } from './t3n-identity.js';

async function main() {
  const goal = process.argv.slice(2).join(' ') || 'Check my ETH balance';
  await initT3NIdentity();
  await runAgent(goal);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
