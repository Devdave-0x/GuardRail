# GuardRail — Demo Script (BOT Chain mainnet)

Live app: https://guardrail-app.vercel.app
Contract: [`0x3D157F7Df3551b1423CB804F818792A978a9635C`](https://scan.botchain.ai/address/0x3D157F7Df3551b1423CB804F818792A978a9635C) — BOT Chain mainnet, chain ID 677
Demo video: https://youtu.be/BPsXDzNuyow

## Test data

| Item                                                          | Value                                                                 |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| Guardian address (connect this wallet for the guardian panel) | `0xd9100b701e21fC578BFD937AC2DbDfb5bbD42572`                          |
| Guardian private key                                          | `runtime/.env` → `GUARDIAN_PRIVATE_KEY` (never share/commit this)     |
| Whitelisted recipient #1                                      | `0xd9100b701e21fC578BFD937AC2DbDfb5bbD42572` (guardian's own address) |
| Whitelisted recipient #2                                      | `0x3bF16591b7FAd920e34b2bF8B0b788AFF8Ae05e7`                          |
| Per-tx limit                                                  | 0.05 BOT                                                              |
| Daily limit                                                   | 0.1 BOT (shared across all demo traffic — see risk note below)        |
| Vault balance                                                 | 0.1 BOT                                                               |

## Script (4 min, word-for-word)

Plain text = say this out loud. `[bracketed]` = what you do on screen, not spoken.

---

**0:00–0:30 — Hook & landing page**

`[Open https://guardrail-app.vercel.app, let the landing page load]`

"This is GuardRail. It lets an AI agent hold and spend crypto on its own — but only inside limits that are enforced on-chain, by a smart contract, not by a prompt telling it to behave.

`[Scroll down to the live stats strip]`

Everything you're seeing here — the balance, the limits — isn't a mockup. It's read live from the contract on BOT Chain mainnet, right now.

`[Scroll to the guard list, then click the 'verified contract' link — new tab, don't linger]`

And the contract itself is verified on-chain, so anyone can read the exact rules the agent is bound by."

---

**0:30–1:15 — Launch the dashboard**

`[Click "Launch the dashboard"]`

"Let's open the dashboard.

`[Point at the network / role indicators]`

This is BOT Chain mainnet. This is the contract address. There are two roles here: the agent, which can propose and execute transfers, and the guardian, which sets the rules and can shut everything down.

`[Point at balance / limits / guardian badge]`

Right now the vault holds 0.1 BOT. Per transaction, the agent can move at most 0.05 BOT. Per day, 0.1 BOT total. And the guardian is armed — meaning it can pause this instantly if anything looks wrong.

This is one shared contract — everyone testing this demo is hitting the same live wallet, not a personal sandbox."

---

**1:15–2:15 — Agent chat: a transfer that succeeds**

`[Switch to AgentWallet chat mode]`

"Now let's talk to the agent directly.

`[Type: "send 0.01 BOT to 0x3bF16591b7FAd920e34b2bF8B0b788AFF8Ae05e7"]`

I'll ask it to send 0.01 BOT to a whitelisted address.

`[Wait for it to execute, then point at the returned tx hash]`

It executed. Here's the transaction hash.

`[Click through to BOTScan]`

And here it is on BOTScan — a real transaction, on mainnet, right now. The agent didn't just say it did this. The contract enforced that the amount was under the per-transaction limit and that the address was whitelisted, before it let the transfer through."

---

**2:15–2:50 — Agent chat: a guard blocking the agent**

`[Type a request that violates a rule — e.g. "send 0.2 BOT to 0x3bF16591b7FAd920e34b2bF8B0b788AFF8Ae05e7"]`

"Now let's try to break it. I'll ask it to send 0.2 BOT — well over the 0.05 limit.

`[Wait for the failure/revert to show]`

It's rejected. And this isn't the AI politely declining — this is the smart contract itself refusing the transaction. Even if the agent's logic were compromised or the prompt were manipulated, the money still can't move outside these bounds, because the check lives on-chain, not in the model."

---

**2:50–3:30 — Guardian panel**

`[Switch connected wallet to the guardian address: 0xd9100b701e21fC578BFD937AC2DbDfb5bbD42572]`

"Now I'll switch to the guardian wallet — the human side of this system.

`[Open the Guardian panel]`

From here the guardian can pause the entire wallet instantly.

`[Click pause]`

`[Switch back to the agent chat, attempt any action, show it's now blocked]`

And now the agent can't move funds at all, even for a valid request — the kill switch is absolute.

`[Unpause, return to Guardian panel, point at the timelock/queue section]`

The guardian can also change limits or whitelist new addresses — but not instantly. Every change like that has to sit in a 10-minute timelocked queue before it takes effect. So even the guardian can't quietly change the rules on the agent mid-flight."

---

**3:30–4:00 — Close**

`[Return to the landing page or GitHub link]`

"Every guard here is enforced on-chain. Every executed transfer emits a permanent, public event. And the contract is verified and fully open source — you don't have to trust what I'm telling you, you can read it yourself.

This is GuardRail — agent autonomy, with limits it physically cannot cross — live on BOT Chain mainnet."

`[End]`

## Risk note

The shared daily limit is 0.1 BOT and rehearsal spends from the same pool as the live take. Do one full dry run, note what's left, and don't exhaust it before the real recording/demo.

**Guardian gas:** the guardian wallet (`0xd9100b701e21fC578BFD937AC2DbDfb5bbD42572`) needs its own BOT for gas to sign `pause()`/`unpause()`/queue transactions — separate from the vault balance. Check its balance before recording and top it up (e.g. 0.01 BOT) if low; a `pause()` call costs roughly 0.001 BOT at current gas prices.
