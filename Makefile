SHELL := /bin/bash

# Load contracts/.env for both make and forge. Foundry also auto-loads this file
# when a command runs from contracts/; the include lets the guards below and
# --sender see the same values.
-include contracts/.env
export

# Canonical interface: every chain-touching target takes NETWORK.
#   NETWORK=anvil        local clean-room chain (31337)
#   NETWORK=base-sepolia public testnet (84532)
NETWORK ?=
CONFIRM ?=
FORCE ?=
CHAIN_ID ?=
RPC_URL ?=
E2E ?=

ANVIL_RPC := http://127.0.0.1:8545
ANVIL_CHAIN_ID := $(shell node -p "require('./networks.json').anvil.chainId")
BASE_SEPOLIA_CHAIN_ID := $(shell node -p "require('./networks.json')['base-sepolia'].chainId")

# Public, well-known Anvil account #0. Local chain only. Never fund or reuse it.
ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

.PHONY: help test ci fmt lint build anvil guard-network deploy deploy-local \
	deploy-sepolia export sync verify-status web web-build web-start web-clean \
	e2e e2e-fork reset artifacts-check

help:
	@echo "contracts"
	@echo "  make test                              run the test suite"
	@echo "  make ci                                run the suite with the CI fuzz budgets"
	@echo "  make fmt / lint / build                format, lint, size report"
	@echo ""
	@echo "networks (NETWORK is required; there is no default)"
	@echo "  make anvil                             start a clean Anvil on $(ANVIL_CHAIN_ID)"
	@echo "  make deploy NETWORK=anvil              deploy + export + sync locally"
	@echo "  make deploy NETWORK=base-sepolia CONFIRM=1"
	@echo "                                         deploy + verify + export + sync testnet"
	@echo "  make sync NETWORK=...                  export + copy artifacts into web/"
	@echo "  make verify-status NETWORK=...         ask Etherscan about verification"
	@echo "  make reset NETWORK=anvil               restart Anvil, redeploy, resync, clear cache"
	@echo "  make artifacts-check                   compare manifests, snapshots, ABI hashes"
	@echo ""
	@echo "web (NETWORK selects the manifest the app reads)"
	@echo "  make web NETWORK=anvil                 dev server on the local manifest"
	@echo "  make web-build NETWORK=...             clean production build"
	@echo "  make web-start NETWORK=...             start the production build"
	@echo "  make web-clean                         remove .next and tsbuildinfo"
	@echo "  make e2e NETWORK=...                   mock-connector browser smoke"
	@echo "  make e2e-fork                          real-tx test on a Base Sepolia fork"

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

anvil:
	anvil --chain-id $(ANVIL_CHAIN_ID) --port 8545

guard-network:
	@test -n "$(NETWORK)" || { echo "NETWORK is required: make <target> NETWORK=anvil|base-sepolia"; exit 1; }
	@case "$(NETWORK)" in anvil|base-sepolia) ;; *) echo "Unknown NETWORK=$(NETWORK); use anvil or base-sepolia"; exit 1 ;; esac

deploy: guard-network
	@if [ "$(NETWORK)" = "anvil" ]; then \
		actual=$$(cast chain-id --rpc-url $(ANVIL_RPC) 2>/dev/null || true); \
		if [ "$$actual" != "$(ANVIL_CHAIN_ID)" ]; then \
			echo "No Anvil on $(ANVIL_RPC) with chain $(ANVIL_CHAIN_ID) (got '$$actual')."; \
			echo "Start one first: make anvil"; \
			exit 1; \
		fi; \
		cd contracts && forge script script/DeployAll.s.sol:DeployAll \
			--rpc-url $(ANVIL_RPC) \
			--private-key $(ANVIL_KEY) \
			--broadcast; \
	else \
		test -n "$$BASE_SEPOLIA_RPC_URL" || { echo "BASE_SEPOLIA_RPC_URL is empty; copy contracts/.env.example to contracts/.env"; exit 1; }; \
		test -n "$$DEPLOYER_ADDRESS" || { echo "DEPLOYER_ADDRESS is empty; run cast wallet list"; exit 1; }; \
		test -n "$$BASESCAN_API_KEY" || { echo "BASESCAN_API_KEY is empty; use an Etherscan V2 key"; exit 1; }; \
		if [ "$(CONFIRM)" != "1" ]; then \
			echo "Refusing to deploy to Base Sepolia without CONFIRM=1."; \
			echo "Re-run: make deploy NETWORK=base-sepolia CONFIRM=1"; \
			exit 1; \
		fi; \
		if [ -n "$$(git status --porcelain)" ]; then \
			echo "Working tree is dirty. Commit or stash before a testnet deploy."; \
			exit 1; \
		fi; \
		echo "Deploying to $(NETWORK) ($(BASE_SEPOLIA_CHAIN_ID)) from commit $$(git rev-parse --short HEAD)"; \
		echo "Deployer: $$DEPLOYER_ADDRESS"; \
		cd contracts && forge script script/DeployAll.s.sol:DeployAll \
			--rpc-url "$$BASE_SEPOLIA_RPC_URL" \
			--account deployer --sender "$$DEPLOYER_ADDRESS" \
			--broadcast --verify --slow; \
	fi
	$(MAKE) sync NETWORK=$(NETWORK)

deploy-local:
	$(MAKE) deploy NETWORK=anvil

deploy-sepolia:
	$(MAKE) deploy NETWORK=base-sepolia CONFIRM=1

export:
	@[ -n "$(NETWORK)" ] || [ -n "$(CHAIN_ID)" ] || { echo "export needs NETWORK=anvil|base-sepolia (or CHAIN_ID=<id>)"; exit 1; }
	node scripts/export-deployment.mjs $(if $(NETWORK),--network $(NETWORK),--chain-id $(CHAIN_ID)) $(if $(filter 1,$(FORCE)),--force,)

sync: export
	node scripts/sync-artifacts.mjs $(if $(NETWORK),--network $(NETWORK),--chain-id $(CHAIN_ID)) $(if $(filter 1,$(FORCE)),--force,)

verify-status:
	node scripts/check-verification.mjs $(if $(NETWORK),--network $(NETWORK),--chain-id $(CHAIN_ID))

web: guard-network
	@node scripts/check-artifacts.mjs --network $(NETWORK) >/dev/null
	@if [ -f web/.next/active-network ] && [ "$$(cat web/.next/active-network)" != "$(NETWORK)" ]; then \
		echo "Network changed ($$(cat web/.next/active-network) -> $(NETWORK)); clearing web cache"; \
		rm -rf web/.next web/tsconfig.tsbuildinfo; \
	fi
	@mkdir -p web/.next && echo "$(NETWORK)" > web/.next/active-network
	cd web && NEXT_PUBLIC_NETWORK=$(NETWORK) NEXT_PUBLIC_RPC_URL=$(RPC_URL) pnpm dev

web-build: guard-network
	@node scripts/check-artifacts.mjs --network $(NETWORK) >/dev/null
	rm -rf web/.next web/tsconfig.tsbuildinfo
	cd web && NEXT_PUBLIC_E2E=$(E2E) NEXT_PUBLIC_NETWORK=$(NETWORK) NEXT_PUBLIC_RPC_URL=$(RPC_URL) pnpm build
	@mkdir -p web/.next && echo "$(NETWORK)" > web/.next/active-network

web-start: guard-network
	@if [ ! -d web/.next ]; then echo "web/.next is missing; run: make web-build NETWORK=$(NETWORK)"; exit 1; fi
	@if [ -f web/.next/active-network ] && [ "$$(cat web/.next/active-network)" != "$(NETWORK)" ]; then \
		echo "Build was made for $$(cat web/.next/active-network), not $(NETWORK)."; \
		echo "Rebuild: make web-build NETWORK=$(NETWORK)"; \
		exit 1; \
	fi
	cd web && NEXT_PUBLIC_NETWORK=$(NETWORK) NEXT_PUBLIC_RPC_URL=$(RPC_URL) pnpm start

web-clean:
	rm -rf web/.next web/tsconfig.tsbuildinfo
	@echo "cleared web/.next and web/tsconfig.tsbuildinfo"

e2e: guard-network
	$(MAKE) web-build NETWORK=$(NETWORK) E2E=1
	cd web && CI=1 NEXT_PUBLIC_E2E=1 NEXT_PUBLIC_NETWORK=$(NETWORK) NEXT_PUBLIC_RPC_URL=$(RPC_URL) pnpm test:e2e

e2e-fork:
	cd web && NEXT_PUBLIC_NETWORK=base-sepolia NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545 pnpm build
	cd web && NEXT_PUBLIC_NETWORK=base-sepolia NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545 pnpm test:e2e:fork

reset: guard-network
	@test "$(NETWORK)" = "anvil" || { echo "reset is local-only: make reset NETWORK=anvil"; exit 1; }
	-@pkill -x anvil 2>/dev/null || true
	@sleep 1
	@nohup anvil --chain-id $(ANVIL_CHAIN_ID) --port 8545 > /tmp/dusd-anvil.log 2>&1 & echo $$! > .anvil.pid
	@for attempt in $$(seq 1 30); do cast chain-id --rpc-url $(ANVIL_RPC) >/dev/null 2>&1 && break; sleep 1; done
	$(MAKE) deploy NETWORK=anvil
	$(MAKE) web-clean
	@echo "Anvil restarted, deployed, synced, and web cache cleared."

artifacts-check:
	node scripts/generate-web-networks.mjs --check
	node scripts/check-artifacts.mjs $(if $(NETWORK),--network $(NETWORK),)
