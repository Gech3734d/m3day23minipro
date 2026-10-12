"use client";
import { useEffect, useState } from "react";
import DeliveryMap from "./DeliveryMap";
import { etb, when, relative } from "@/lib/format.js";
import { ordersToCsv } from "@/lib/orders.js";

type Order = {
  id: string; customer: string; dish: string; total: number; status: string;
  createdAt: string; courier: string; courierPhone: string; eta: string;
  courierPosition: { lat: number; lng: number }; deliveryPosition: { lat: number; lng: number };
};
type Connection = "connecting" | "live" | "closed" | "error";

export default function DeliveryTracker({ initialOrder, orders }: { initialOrder: Order; orders: Order[] }) {
  const [order, setOrder] = useState(initialOrder);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [lastUpdate, setLastUpdate] = useState(initialOrder.createdAt);

  useEffect(() => {
    const source = new EventSource(`/api/orders/${initialOrder.id}/stream`);
    source.onopen = () => setConnection("live");
    const handleStatus = (event: MessageEvent<string>) => {
      try {
        const update = JSON.parse(event.data) as Partial<Order> & { updatedAt?: string };
        setOrder(current => ({ ...current, ...update }));
        setLastUpdate(update.updatedAt || new Date().toISOString());
        if (update.status === "Delivered") {
          source.close();
          setConnection("closed");
        }
      } catch {
        // Ignore malformed event payloads; the next valid event can still update the UI.
      }
    };
    // The server labels its events "status", so listen for that event type explicitly.
    source.addEventListener("status", handleStatus as EventListener);
    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) setConnection("error");
      else setConnection(current => current === "closed" ? "closed" : "connecting");
    };
    return () => {
      source.removeEventListener("status", handleStatus as EventListener);
      source.close();
    };
  }, [initialOrder.id]);

  const connectionLabel = connection === "live" ? "Live updates connected" : connection === "connecting" ? "Connecting to live updates…" : connection === "closed" ? "Stream closed · delivered" : "Connection interrupted";
  const delivered = order.status === "Delivered";
  return <>
    <div className="heading"><div><div className="eyebrow">Order tracking</div><h1>Your food is on its way.</h1><p className="sub">Follow the courier and delivery destination. This page receives live status updates.</p></div>
      <span className={`connection ${connection === "error" ? "offline" : ""}`} aria-live="polite"><i/>{connectionLabel}</span>
    </div>
    <div className="layout">
      <section className="card" aria-labelledby="map-title">
        <div className="card-pad"><h2 id="map-title">Live delivery map</h2><p className="card-sub">Courier and destination are both shown in the map and described below.</p></div>
        <DeliveryMap courier={order.courierPosition} delivery={order.deliveryPosition}/>
        <div className="legend"><span><i style={{background:"#216342"}}/> Courier location</span><span><i style={{background:"#c66e2e"}}/> Delivery destination</span></div>
        <div className="card-pad">
          <div className="delivery-summary"><div className="courier-avatar" aria-hidden="true">🚴</div><div><b>{order.courier}</b><small>{order.courierPhone || "Courier contact not available"}</small></div></div>
          <div className="detail-row"><span>Courier position</span><b>{order.courierPosition.lat.toFixed(4)}, {order.courierPosition.lng.toFixed(4)}</b></div>
          <div className="detail-row"><span>Delivery destination</span><b>{order.deliveryPosition.lat.toFixed(4)}, {order.deliveryPosition.lng.toFixed(4)}</b></div>
          <div className="detail-row"><span>Estimated arrival</span><b>{when(order.eta)}</b></div>
          <div className="detail-row"><span>Last update</span><b>{relative(lastUpdate)}</b></div>
        </div>
      </section>
      <aside className="card">
        <div className="card-pad">
          <div className="order-head"><div><h2>Order summary</h2><div className="order-number">{order.id} · placed {when(order.createdAt)}</div></div><div className="price">{etb(order.total)}</div></div>
          <p style={{margin:"18px 0 12px"}}><span className={`status ${delivered ? "delivered" : order.status === "Preparing" ? "preparing" : ""}`}>{order.status}</span></p>
          <div className="detail-row"><span>Customer</span><b>{order.customer}</b></div>
          <div className="detail-row"><span>Order</span><b>{order.dish}</b></div>
          <div className="detail-row"><span>Courier</span><b>{order.courier}</b></div>
          <div className="status-step"><div className="step-dot">✓</div><div><b>Order confirmed</b><p>Your order has been received by Addis Eats.</p></div></div>
          <div className="status-step"><div className="step-dot">{order.status === "Preparing" ? "2" : "✓"}</div><div><b>Preparing your meal</b><p>Freshly prepared with care.</p></div></div>
          <div className="status-step"><div className="step-dot">{delivered ? "✓" : "3"}</div><div><b>{delivered ? "Delivered successfully" : "Courier on the way"}</b><p>{delivered ? "The order is complete. Live updates have been deliberately closed." : "The courier is travelling to the delivery destination."}</p></div></div>
          {delivered && <p className="sub" role="status">Delivery completed at {when(lastUpdate)}. EventSource is closed.</p>}
        </div>
      </aside>
    </div>
    <section className="card table-card">
      <div className="table-head"><div><h2>Recent orders</h2><p className="card-sub" style={{marginBottom:0}}>Export includes CSV-safe handling for commas and quotation marks.</p></div><button className="btn primary" onClick={() => exportOrders(orders)}>↓ Export CSV</button></div>
      <div className="table-wrap"><table><caption>Recent Addis Eats orders, totals in Ethiopian birr</caption><thead><tr><th>Order</th><th>Customer</th><th>Dish</th><th>Status</th><th className="right">Total</th><th>Placed</th></tr></thead><tbody>
        {orders.map(row => <tr key={row.id}><td><b>{row.id}</b></td><td>{row.customer}</td><td>{row.dish}</td><td><span className={`status ${row.status.toLowerCase()}`}>{row.status}</span></td><td className="right">{etb(row.total)}</td><td>{when(row.createdAt)}</td></tr>)}
      </tbody></table></div>
    </section>
  </>;
}

function exportOrders(orders: Order[]) {
  const csv = ordersToCsv(orders);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "addis-eats-orders.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
