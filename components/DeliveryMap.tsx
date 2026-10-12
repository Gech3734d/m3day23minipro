 "use client";
import dynamic from "next/dynamic";
type Position = { lat: number; lng: number };
const DeliveryMapCanvas = dynamic(() => import("./DeliveryMapCanvas"), {
  ssr: false,
  loading: () => <div className="map-placeholder" aria-label="Loading delivery map">Loading delivery map…</div>
});
export default function DeliveryMap({ courier, delivery }: { courier: Position; delivery: Position }) {
  return <div className="map-shell"><DeliveryMapCanvas courier={courier} delivery={delivery}/></div>;
}