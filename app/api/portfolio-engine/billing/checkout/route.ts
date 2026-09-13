import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const body = await request.json().catch(() => null);
  const draftId =
    body && typeof body === "object" && typeof body.draftId === "string" ? body.draftId : "";
  const configuredCheckoutUrl = process.env.STRIPE_PRO_CHECKOUT_URL;

  if (!draftId) return errorResponse("Draft ID is required.", 400);

  if (!configuredCheckoutUrl) {
    return NextResponse.json({
      mode: "test",
      checkoutUrl: null,
      message:
        "Set STRIPE_PRO_CHECKOUT_URL to enable hosted Pro checkout. The draft can still preview Pro-only features.",
    });
  }

  const checkoutUrl = new URL(configuredCheckoutUrl);
  checkoutUrl.searchParams.set("client_reference_id", draftId);
  checkoutUrl.searchParams.set("prefilled_email", auth.user.email ?? "");

  return NextResponse.json({
    mode: "stripe",
    checkoutUrl: checkoutUrl.toString(),
  });
}
