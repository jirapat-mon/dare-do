import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const isSimulateMode =
  !STRIPE_KEY || STRIPE_KEY.includes("REPLACE") || STRIPE_KEY.length < 20;

const stripe = isSimulateMode ? null : new Stripe(STRIPE_KEY);

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.subscriptionTier === "free") {
      return NextResponse.json(
        { error: "No active subscription to cancel" },
        { status: 400 }
      );
    }

    if (isSimulateMode) {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          subscriptionTier: "free",
          subscriptionStatus: "cancelled",
          stripeSubscriptionId: null,
        },
      });

      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Subscription cancelled (simulate mode)",
      });
    }

    // Real Stripe cancellation
    if (!user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No Stripe subscription found" },
        { status: 400 }
      );
    }

    await stripe!.subscriptions.cancel(user.stripeSubscriptionId);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        subscriptionStatus: "cancelled",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled. Access continues until period end.",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
