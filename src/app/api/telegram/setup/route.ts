import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const appUrl = process.env.NEXTAUTH_URL!.replace(/\/$/, "");
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `${appUrl}/api/telegram`,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ["message"],
      }),
    }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
