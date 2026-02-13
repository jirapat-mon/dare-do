import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured. Use /api/payment/simulate instead." },
        { status: 503 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: { name: "DareDo Wallet Top Up" },
            unit_amount: Math.round(amount * 100), // Stripe uses smallest currency unit (satang)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/wallet?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/payment?payment=cancelled`,
      metadata: {
        userId: session.userId,
        amount: String(amount),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
