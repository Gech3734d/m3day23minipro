import { NextRequest, NextResponse } from "next/server";

type CreatedOrder = { id: string; customer: string; dish: string; status: string; total: number; createdAt: string };
const idempotentOrders = new Map<string, CreatedOrder>();
let sequence = 3000;

export async function POST(request: NextRequest) {
  const key = request.headers.get("idempotency-key")?.trim();
  if (!key || key.length > 120) return NextResponse.json({ error: "A valid Idempotency-Key header is required." }, { status: 400 });
  let body: { customer?: unknown; dish?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  // Check after the only await. The lookup and insertion below are synchronous, avoiding a
  // race where two same-key requests both pass the lookup before either inserts an order.
  const existing = idempotentOrders.get(key);
  if (existing) return NextResponse.json({ order: existing, message: "Order already accepted; duplicate request safely reused the original order." });
  const customer = typeof body.customer === "string" ? body.customer.trim() : "";
  const dish = typeof body.dish === "string" ? body.dish.trim() : "";
  const allowedDishes = new Set(["Doro Wat", "Shiro with Injera", "Kitfo", "Family Combo"]);
  if (!customer || customer.length > 80 || !allowedDishes.has(dish)) return NextResponse.json({ error: "Enter a customer name (up to 80 characters) and choose a listed dish." }, { status: 400 });
  const totals: Record<string, number> = { "Doro Wat": 560, "Shiro with Injera": 290, Kitfo: 620, "Family Combo": 840 };
  const order: CreatedOrder = { id: `AE-${++sequence}`, customer, dish, status: "Preparing", total: totals[dish], createdAt: new Date().toISOString() };
  idempotentOrders.set(key, order);
  return NextResponse.json({ order, message: "Demo order placed successfully." }, { status: 201 });
}
