import { createPublicClient, http } from "viem";
import {
  activeChain,
  activeChainId,
  activeNetwork,
  activeNetworkConfig,
  rpcUrlFor,
} from "@/lib/networks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The truth detector: the app's expected chain id must equal the RPC's actual
 * chain id. A mismatch (wrong NEXT_PUBLIC_RPC_URL, stale env, wallet on another
 * chain) returns 503 instead of silently reading the wrong deployment.
 */
export async function GET() {
  const rpcUrl = rpcUrlFor(activeNetwork);
  const client = createPublicClient({
    chain: activeChain,
    transport: http(rpcUrl),
  });

  try {
    const [actualChainId, blockNumber] = await Promise.all([
      client.getChainId(),
      client.getBlockNumber(),
    ]);

    const matches = actualChainId === activeChainId;

    return Response.json(
      {
        status: matches ? "ok" : "chain-mismatch",
        network: activeNetwork,
        label: activeNetworkConfig.label,
        expectedChainId: activeChainId,
        actualChainId,
        blockNumber: blockNumber.toString(),
        rpcUrl,
        timestamp: new Date().toISOString(),
      },
      { status: matches ? 200 : 503 },
    );
  } catch (error) {
    return Response.json(
      {
        status: "error",
        network: activeNetwork,
        label: activeNetworkConfig.label,
        expectedChainId: activeChainId,
        rpcUrl,
        message: error instanceof Error ? error.message : "rpc failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
