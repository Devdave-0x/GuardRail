# Deploy Your Own AgentWallet (Foundry)

This project deploys `AgentWallet` using Foundry script:

- `script/Deploy.s.sol`

---

## 1) Prepare env

```bash
cd contracts
cp .env.example .env
```

Edit `.env`:

```env
AGENT_ADDRESS=0x...         # agent role address
GUARDIAN_ADDRESS=0x...      # guardian role address
PRIVATE_KEY=0x...           # deployer private key (funded on Sepolia)
RPC_URL=https://sepolia.drpc.org
```

---

## 2) Load env into shell

```bash
set -a
source .env
set +a
```

Verify values are present:

```bash
echo "RPC_URL=[$RPC_URL]"
echo "PRIVATE_KEY set? [$([ -n "$PRIVATE_KEY" ] && echo yes || echo no)]"
echo "AGENT_ADDRESS=[$AGENT_ADDRESS]"
echo "GUARDIAN_ADDRESS=[$GUARDIAN_ADDRESS]"
```

Optional RPC check:

```bash
cast block-number --rpc-url "$RPC_URL"
```

---

## 3) Deploy

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --private-key "$PRIVATE_KEY"
```

On success, copy from output:

```text
Contract Address: 0x...
```

Use that address in `runtime/.env` as:

```env
AGENT_CONTRACT_ADDRESS=0x...
```

---

## 4) After deploy

In `runtime/.env`, `AGENT_PRIVATE_KEY` must match the same agent address used in `AGENT_ADDRESS` during deployment.

Then from `runtime/`:

```bash
npm run build
npm run setup
```

---

## Common errors

### Invalid private key

- Key must be `0x` + 64 hex chars.
- Don’t pass literal `PRIVATE_KEY`; pass `$PRIVATE_KEY` after sourcing `.env`.

### --rpc-url missing

- `$RPC_URL` is empty because `.env` was not sourced.

### Provider/RPC rejected request

- Switch RPC to `https://sepolia.drpc.org` or your own Alchemy endpoint.

---

## Also deployed on BOT Chain testnet

This is the same audited `AgentWallet` contract already live on Sepolia
(`0x4fbE2CeFEC5ef766634C83CFAd0338fEfBB65b35`). This is a migration/multi-chain
deployment, not a new project.

**One intentional difference on this deployment:** `TIMELOCK` is set to `1 minutes`
instead of the standard `10 minutes`, for faster demo/testnet iteration. It's a
compile-time constant, so this only affects this specific BOT Chain build. The
Sepolia deployment above is unaffected.

- **Chain:** BOT Chain testnet (chain ID `968`)
- **Contract address:** `0x2e86509caAdFbEbbe223E51ee7d70Fcb7ba60B01`
- **Explorer:** https://scan.bohr.life/address/0x2e86509caAdFbEbbe223E51ee7d70Fcb7ba60B01 (source verified)
- **Deployment tx:** `0x37bbf9f5a0f69854f98535cb448817a2d3205f63103514accce515c6b1605713`
