import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { prisma } from "@/lib/prisma";

const OWNER_ID = Number(process.env.TELEGRAM_OWNER_ID);
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const OWNER_EMAIL = process.env.TELEGRAM_OWNER_EMAIL!;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeVoice(fileId: string): Promise<string> {
  console.log("[telegram] downloading voice file_id:", fileId);
  const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
  const info = await infoRes.json() as { result: { file_path: string } };
  const filePath = info.result.file_path;

  const audioRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
  const audioBuffer = await audioRes.arrayBuffer();
  console.log("[telegram] voice downloaded, size:", audioBuffer.byteLength);

  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: await toFile(Buffer.from(audioBuffer), "voice.ogg", { type: "audio/ogg" }),
    language: "ru",
  });
  console.log("[telegram] transcription:", transcription.text);
  return transcription.text;
}

async function sendMessage(chatId: number, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await res.json();
  console.log("[telegram] sendMessage result:", JSON.stringify(data));
}

interface AddExpenseCmd {
  action: "add_expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}
interface DailySummaryCmd {
  action: "daily_summary";
  date: string;
}
interface MonthlySummaryCmd {
  action: "monthly_summary";
  year: number;
  month: number;
}
interface UnknownCmd {
  action: "unknown";
}
type ParsedCmd = AddExpenseCmd | DailySummaryCmd | MonthlySummaryCmd | UnknownCmd;

async function parseCommand(text: string): Promise<ParsedCmd> {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Сегодня ${today}. Текущий месяц: ${currentYear}-${String(currentMonth).padStart(2, "0")}.
Ты парсишь сообщения для трекера расходов на русском языке. Все суммы — в евро. Верни JSON одной из структур:
1. {"action":"add_expense","amount":число,"category":"строка","description":"строка","date":"YYYY-MM-DD"}
2. {"action":"daily_summary","date":"YYYY-MM-DD"}
3. {"action":"monthly_summary","year":число,"month":число}
4. {"action":"unknown"}

Известные категории: Продукты, Кафе и рестораны, Транспорт, Развлечения, Одежда, Здоровье, Коммунальные услуги, Другое.
Если категория не ясна — используй "Другое".
Для daily_summary по умолчанию используй сегодняшнюю дату.
Для monthly_summary по умолчанию используй текущий месяц.
В description кратко опиши что куплено (пусто если не указано).`,
      },
      { role: "user", content: text },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content!) as ParsedCmd;
  console.log("[telegram] parseCommand result:", JSON.stringify(parsed));
  return parsed;
}

export async function GET() {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
  );
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  console.log("[telegram] POST received");

  const secret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  console.log("[telegram] secret header:", secret ? "present" : "absent", "| expected:", WEBHOOK_SECRET ? "set" : "not set");

  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    console.log("[telegram] secret mismatch, rejecting");
    return new NextResponse("Forbidden", { status: 403 });
  }

  const update = await req.json() as {
    message?: {
      text?: string;
      voice?: { file_id: string; duration: number };
      from?: { id: number };
      chat: { id: number };
    };
  };

  console.log("[telegram] update:", JSON.stringify(update));

  const message = update?.message;
  if (!message?.text && !message?.voice) {
    console.log("[telegram] no text or voice, ignoring");
    return NextResponse.json({ ok: true });
  }

  console.log("[telegram] from.id:", message.from?.id, "| OWNER_ID:", OWNER_ID);
  if (message.from?.id !== OWNER_ID) {
    console.log("[telegram] not owner, ignoring");
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;

  let inputText: string;
  if (message.voice) {
    inputText = await transcribeVoice(message.voice.file_id);
    console.log("[telegram] voice transcribed to:", inputText);
  } else {
    inputText = message.text!;
  }
  console.log("[telegram] processing message:", inputText);

  try {
    const cmd = await parseCommand(inputText);

    if (cmd.action === "add_expense") {
      const user = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
      if (!user) throw new Error("User not found");

      const descParts = ["Telegram", cmd.description].filter(Boolean);
      await prisma.expense.create({
        data: {
          amount: cmd.amount,
          category: cmd.category,
          source: "Банковские карты",
          date: cmd.date,
          description: descParts.join(": "),
          userId: user.id,
        },
      });

      const categoryNote =
        cmd.category === "Другое" ? "\n⚠️ Категория не распознана, использована «Другое»" : "";
      const descLine = cmd.description ? `\n📝 ${cmd.description}` : "";
      await sendMessage(
        chatId,
        `✅ Расход добавлен:\n💰 ${cmd.amount} € — ${cmd.category}${descLine}\n📅 ${cmd.date}${categoryNote}`
      );
    } else if (cmd.action === "daily_summary") {
      const user = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
      if (!user) throw new Error("User not found");

      const expenses = await prisma.expense.findMany({
        where: { userId: user.id, date: cmd.date },
        orderBy: { createdAt: "asc" },
      });

      if (expenses.length === 0) {
        await sendMessage(chatId, `📊 За ${cmd.date} расходов нет.`);
      } else {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        const lines = expenses
          .map((e) => `• ${e.category}: ${e.amount} €${e.description ? ` (${e.description})` : ""}`)
          .join("\n");
        await sendMessage(chatId, `📊 Расходы за ${cmd.date}:\n${lines}\n\nИтого: ${total} €`);
      }
    } else if (cmd.action === "monthly_summary") {
      const user = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
      if (!user) throw new Error("User not found");

      const prefix = `${cmd.year}-${String(cmd.month).padStart(2, "0")}`;
      const expenses = await prisma.expense.findMany({
        where: { userId: user.id, date: { startsWith: prefix } },
      });

      const monthName = new Date(cmd.year, cmd.month - 1).toLocaleString("ru-RU", {
        month: "long",
        year: "numeric",
      });

      if (expenses.length === 0) {
        await sendMessage(chatId, `📊 За ${monthName} расходов нет.`);
      } else {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        const byCategory: Record<string, number> = {};
        for (const e of expenses) {
          byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        }
        const lines = Object.entries(byCategory)
          .sort(([, a], [, b]) => b - a)
          .map(([cat, amt]) => `• ${cat}: ${amt} €`)
          .join("\n");
        await sendMessage(chatId, `📊 Расходы за ${monthName}:\n${lines}\n\nИтого: ${total} €`);
      }
    } else {
      await sendMessage(
        chatId,
        `❓ Не понял команду. Примеры:\n• «Купил продукты на 500 рублей»\n• «Потратил 200 на кофе в Старбаксе»\n• «Итоги за сегодня»\n• «Сводка за октябрь»`
      );
    }
  } catch (e) {
    console.error("[telegram] error:", e);
    await sendMessage(chatId, "❌ Произошла ошибка. Попробуйте ещё раз.");
  }

  return NextResponse.json({ ok: true });
}
