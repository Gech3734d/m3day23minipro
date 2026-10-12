"use client";

import { FormEvent, useRef, useState } from "react";

type Result = { orderId: string; message: string };

export default function PlaceOrderForm() {
  const [customer, setCustomer] = useState("");
  const [dish, setDish] = useState("Doro Wat");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const requestId = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // A synchronous guard blocks a second click before React has rendered disabled state.
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    setResult(null);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": requestId.current },
        body: JSON.stringify({ customer, dish })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not place order.");
      setResult({ orderId: data.order.id, message: data.message });
      // Keep the key for unchanged form values so even a late duplicate tap reuses this order.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error. Please try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return <section className="card card-pad order-form-card" aria-labelledby="place-order-title">
    <h2 id="place-order-title">Place a demo order</h2>
    <p className="card-sub">Test accessible form controls and duplicate-submit protection. This demo keeps orders in memory only.</p>
    <form className="place-order-form" onSubmit={submit}>
      <label htmlFor="customer-name">Customer name</label>
      <input id="customer-name" name="customer" autoComplete="name" value={customer} onChange={e => { setCustomer(e.target.value); requestId.current = null; }} required maxLength={80} placeholder="Enter customer name" />
      <label htmlFor="dish-choice">Dish</label>
      <select id="dish-choice" name="dish" value={dish} onChange={e => { setDish(e.target.value); requestId.current = null; }}>
        <option>Doro Wat</option><option>Shiro with Injera</option><option>Kitfo</option><option>Family Combo</option>
      </select>
      <button className="btn primary submit-order" type="submit" disabled={pending}>
        {pending ? "Placing order…" : "Place demo order"}
      </button>
      <p className="form-note" role="status" aria-live="polite">{pending ? "Your request is processing. Please wait." : result ? `${result.message} Order ID: ${result.orderId}.` : "One submission creates one order, even if the button is tapped twice."}</p>
      {error && <p className="error-message" role="alert">{error}</p>}
    </form>
  </section>;
}
