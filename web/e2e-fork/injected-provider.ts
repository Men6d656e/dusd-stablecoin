/**
 * Test-only EIP-1193 provider, injected before any page script runs.
 *
 * It is a thin JSON-RPC proxy to the Anvil fork, so `eth_sendTransaction` is
 * signed by Anvil's unlocked/impersonated account instead of a real wallet and
 * no private key ever reaches the browser or CI. It also announces itself via
 * EIP-6963 so wagmi's `injected()` connector discovers it.
 */
export function installInjectedProvider({
  rpcUrl,
  account,
}: {
  rpcUrl: string;
  account: string;
}) {
  type Listener = (...args: unknown[]) => void;

  const listeners = new Map<string, Listener[]>();
  const emit = (event: string, payload?: unknown) => {
    for (const listener of listeners.get(event) ?? []) listener(payload);
  };

  const provider = {
    isTestFork: true,
    async request({
      method,
      params,
    }: {
      method: string;
      params?: unknown[];
    }): Promise<unknown> {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [account];
        case "eth_chainId":
          return "0x14a34"; // 84532, Base Sepolia
        case "net_version":
          return "84532";
        case "wallet_requestPermissions":
          return [{ parentCapability: "eth_accounts" }];
        case "wallet_switchEthereumChain":
        case "wallet_addEthereumChain":
          return null;
        default: {
          const response = await fetch(rpcUrl, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: Date.now(),
              method,
              params: params ?? [],
            }),
          });
          const body = await response.json();
          if (body.error) {
            const error = new Error(body.error.message) as Error & {
              code?: number;
              data?: unknown;
            };
            error.code = body.error.code;
            error.data = body.error.data;
            throw error;
          }
          return body.result;
        }
      }
    },
    on(event: string, listener: Listener) {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
    },
    removeListener(event: string, listener: Listener) {
      listeners.set(
        event,
        (listeners.get(event) ?? []).filter((entry) => entry !== listener),
      );
    },
  };

  const detail = {
    info: {
      uuid: "6f1c2b0e-2d6b-4a3f-9a1e-fork000000001",
      name: "Fork Wallet",
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
      rdns: "test.dusd.fork",
    },
    provider,
  };

  const announce = () => {
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", { detail }),
    );
  };

  window.addEventListener("eip6963:requestProvider", announce);
  (window as unknown as { ethereum?: unknown }).ethereum = provider;
  announce();
  emit("connect", { chainId: "0x14a34" });
}
