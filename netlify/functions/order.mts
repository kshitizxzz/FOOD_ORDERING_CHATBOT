import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const MENU: Record<string, number> = {
  "Pav Bhaji": 6.0,
  "Chole Bhature": 7.0,
  "Pizza": 8.0,
  "Mango Lassi": 5.0,
  "Masala Dosa": 6.0,
  "Vegetable Biryani": 9.0,
  "Vada Pav": 4.0,
  "Rava Dosa": 7.0,
  "Samosa": 5.0,
};

type FoodDict = Record<string, number>;

function store() {
  return getStore({ name: "pandeyji-eatery", consistency: "strong" });
}

async function seedIfNeeded() {
  const s = store();
  const seeded = await s.get("meta/seeded", { type: "text" });
  if (seeded === "1") return;
  await s.set("tracking/40", "delivered");
  await s.set("tracking/41", "in transit");
  const existingNext = await s.get("meta/next_order_id", { type: "text" });
  if (!existingNext) {
    await s.set("meta/next_order_id", "42");
  }
  await s.set("meta/seeded", "1");
}

async function nextOrderId(): Promise<number> {
  const s = store();
  const current = await s.get("meta/next_order_id", { type: "text" });
  const id = current ? parseInt(current, 10) : 42;
  await s.set("meta/next_order_id", String(id + 1));
  return id;
}

function foodDictToString(dict: FoodDict): string {
  return Object.entries(dict)
    .map(([name, qty]) => `${Math.trunc(qty)} ${name}`)
    .join(", ");
}

function findMenuItem(name: string): string | null {
  const lower = name.toLowerCase();
  for (const key of Object.keys(MENU)) {
    if (key.toLowerCase() === lower) return key;
  }
  return null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleAdd(payload: any): Promise<Response> {
  const session_id = String(payload.session_id || "");
  const food_items: string[] = Array.isArray(payload.food_items) ? payload.food_items : [];
  const quantities: number[] = Array.isArray(payload.quantities) ? payload.quantities.map(Number) : [];

  if (!session_id) {
    return json({ fulfillmentText: "Missing session id." }, 400);
  }
  if (food_items.length !== quantities.length || food_items.length === 0) {
    return json({
      fulfillmentText: "Sorry I didn't understand. Can you please specify food items and quantities clearly?",
    });
  }

  const s = store();
  const key = `inprogress/${session_id}`;
  const current = ((await s.get(key, { type: "json" })) as FoodDict | null) || {};

  const unknownItems: string[] = [];
  for (let i = 0; i < food_items.length; i++) {
    const canonical = findMenuItem(food_items[i]);
    if (!canonical) {
      unknownItems.push(food_items[i]);
      continue;
    }
    current[canonical] = quantities[i];
  }

  await s.setJSON(key, current);

  let fulfillmentText = `So far you have: ${foodDictToString(current)}. Do you need anything else?`;
  if (unknownItems.length > 0) {
    fulfillmentText = `Sorry, we don't have: ${unknownItems.join(", ")}. ${fulfillmentText}`;
  }

  return json({ fulfillmentText });
}

async function handleRemove(payload: any): Promise<Response> {
  const session_id = String(payload.session_id || "");
  const food_items: string[] = Array.isArray(payload.food_items) ? payload.food_items : [];

  if (!session_id) {
    return json({ fulfillmentText: "Missing session id." }, 400);
  }

  const s = store();
  const key = `inprogress/${session_id}`;
  const current = (await s.get(key, { type: "json" })) as FoodDict | null;

  if (!current) {
    return json({
      fulfillmentText: "I'm having a trouble finding your order. Sorry! Can you place a new order please?",
    });
  }

  const removed: string[] = [];
  const missing: string[] = [];
  for (const item of food_items) {
    const canonical = findMenuItem(item) || item;
    if (!(canonical in current)) {
      missing.push(item);
    } else {
      delete current[canonical];
      removed.push(canonical);
    }
  }

  let fulfillmentText = "";
  if (removed.length > 0) {
    fulfillmentText = `Removed ${removed.join(",")} from your order!`;
  }
  if (missing.length > 0) {
    fulfillmentText += ` Your current order does not have ${missing.join(",")}`;
  }

  if (Object.keys(current).length === 0) {
    await s.delete(key);
    fulfillmentText += " Your order is empty!";
  } else {
    await s.setJSON(key, current);
    fulfillmentText += ` Here is what is left in your order: ${foodDictToString(current)}`;
  }

  return json({ fulfillmentText });
}

async function handleComplete(payload: any): Promise<Response> {
  const session_id = String(payload.session_id || "");
  if (!session_id) {
    return json({ fulfillmentText: "Missing session id." }, 400);
  }

  const s = store();
  const key = `inprogress/${session_id}`;
  const order = (await s.get(key, { type: "json" })) as FoodDict | null;

  if (!order || Object.keys(order).length === 0) {
    return json({
      fulfillmentText: "I'm having a trouble finding your order. Sorry! Can you place a new order please?",
    });
  }

  const order_id = await nextOrderId();

  let total = 0;
  const items = Object.entries(order).map(([name, qty]) => {
    const price = MENU[name] ?? 0;
    const line = price * qty;
    total += line;
    return { name, quantity: qty, price, total_price: line };
  });

  await s.setJSON(`orders/${order_id}`, { order_id, items, total });
  await s.set(`tracking/${order_id}`, "in progress");
  await s.delete(key);

  const fulfillmentText =
    `Awesome. We have placed your order. Here is your order id # ${order_id}. ` +
    `Your order total is ${total.toFixed(2)} which you can pay at the time of delivery!`;

  return json({ fulfillmentText });
}

async function handleTrack(payload: any): Promise<Response> {
  const order_id = Number(payload.order_id);
  if (!order_id) {
    return json({ fulfillmentText: "Please provide a valid order id." }, 400);
  }
  const s = store();
  const status = await s.get(`tracking/${order_id}`, { type: "text" });
  const fulfillmentText = status
    ? `The order status for order id: ${order_id} is: ${status}`
    : `No order found with order id: ${order_id}`;
  return json({ fulfillmentText });
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ fulfillmentText: "Method not allowed." }, 405);
  }

  await seedIfNeeded();

  const url = new URL(req.url);
  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  if (url.pathname.endsWith("/order/add")) return handleAdd(payload);
  if (url.pathname.endsWith("/order/remove")) return handleRemove(payload);
  if (url.pathname.endsWith("/order/complete")) return handleComplete(payload);
  if (url.pathname.endsWith("/order/track")) return handleTrack(payload);

  return json({ fulfillmentText: "Unknown route." }, 404);
};

export const config: Config = {
  path: [
    "/api/order/add",
    "/api/order/remove",
    "/api/order/complete",
    "/api/order/track",
  ],
};
