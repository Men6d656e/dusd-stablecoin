SHELL := /bin/bash

# Load contracts/.env for both make and forge. Foundry also auto-loads this file
# when a command runs from contracts/; the include lets the guards below and
# --sender see the same values.
-include contracts/.env
export

CHAIN_ID ?= 84532

# Public, well-known Anvil account #0. Local chain only. Never fund or reuse it.
ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

.PHONY: help test ci fmt lint build deploy-local deploy-sepolia export sync verify-status

help:
	@echo "make test            run the test suite"
	@echo "make ci              run the suite with the CI fuzz budgets"
	@echo "make fmt             format contracts"
	@echo "make lint            lint contracts"
	@echo "make build           build with a size report"
	@echo "make deploy-local    deploy to anvil (31337) and export addresses"
	@echo "make deploy-sepolia  deploy to Base Sepolia (84532), verify, export"
	@echo "make export          rebuild deployments/<CHAIN_ID>.json from the broadcast"
	@echo "make sync            copy ABIs + deployment into web/ (no-op before W1)"
	@echo "make verify-status   ask Etherscan whether every contract is verified"

test:
	cd contracts && forge test -vvv

ci:
	cd contracts && FOUNDRY_PROFILE=ci forge test -vvv

fmt:
	cd contracts && forge fmt

lint:
	cd contracts && forge lint

build:
	cd contracts && forge build --sizes

deploy-local:
	cd contracts && forge script script/DeployAll.s.sol:DeployAll \
		--rpc-url http://127.0.0.1:8545 \
		--private-key $(ANVIL_KEY) \
		--broadcast
	$(MAKE) export CHAIN_ID=31337

deploy-sepolia:
	@test -n "$$BASE_SEPOLIA_RPC_URL" || { echo "BASE_SEPOLIA_RPC_URL is empty; copy contracts/.env.example to contracts/.env"; exit 1; }
	@test -n "$$DEPLOYER_ADDRESS" || { echo "DEPLOYER_ADDRESS is empty; run cast wallet list"; exit 1; }
	@test -n "$$BASESCAN_API_KEY" || { echo "BASESCAN_API_KEY is empty; use an Etherscan V2 key"; exit 1; }
	@cd contracts && forge script script/DeployAll.s.sol:DeployAll \
		--rpc-url "$$BASE_SEPOLIA_RPC_URL" \
		--account deployer --sender "$$DEPLOYER_ADDRESS" \
		--broadcast --verify --slow
	$(MAKE) export CHAIN_ID=84532

export:
	node scripts/export-deployment.mjs --chain-id $(CHAIN_ID)

sync: export
	node scripts/sync-artifacts.mjs --chain-id $(CHAIN_ID)

verify-status:
	node scripts/check-verification.mjs --chain-id $(CHAIN_ID)
