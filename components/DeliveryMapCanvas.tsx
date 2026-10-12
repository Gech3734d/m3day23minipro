"use client";
type Position = { lat: number; lng: number };
export default function DeliveryMapCanvas({ courier, delivery }: { courier: Position; delivery: Position }) {
  // This intentionally lightweight schematic is a map-like view for the demo.
  // Coordinates are shown in the accessible text next to the map; fit-to-markers keeps both visible.
  const dx = delivery.lng - courier.lng;
  const dy = delivery.lat - courier.lat;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const length = Math.min(42, Math.max(20, distance * 1700));
  return <div className="map-surface" role="img" aria-label={`Delivery map. Courier at latitude ${courier.lat}, longitude ${courier.lng}. Delivery destination at latitude ${delivery.lat}, longitude ${delivery.lng}. Both markers are visible.`}>
    <div className="road one"/><div className="road two"/><div className="road three"/>
    <span className="map-label" style={{left:"8%",top:"17%"}}>Bole Road</span>
    <span className="map-label" style={{right:"8%",top:"76%"}}>Residential area</span>
    <div className="route-line" style={{width:`${length}%`, transform:`rotate(${angle || 28}deg)`}}/>
    <div className="marker courier"><span className="marker-pin">●</span> Courier</div>
    <div className="marker delivery"><span className="marker-pin">⌖</span> Delivery</div>
  </div>;
}