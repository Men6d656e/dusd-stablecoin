import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://sepolia.base.org";
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  try {
    const blockNumber = await client.getBlockNumber();
    return Response.json({
      status: "ok",
      chainId: 84532,
      blockNumber: blockNumber.toString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "rpc failed",
      },
      { status: 503 },
    );
  }
}
