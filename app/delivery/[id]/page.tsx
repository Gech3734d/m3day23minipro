import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DeliveryTracker from "@/components/DeliveryTracker";
import { demoOrders, initialOrder } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Live Delivery Tracking",
  description: "Track an Addis Eats delivery with courier and destination markers, live order status updates, estimated arrival, and CSV export."
};

export function generateStaticParams() {
  return [{ id: "AE-2048" }, { id: "AE-2047" }, { id: "AE-2046" }, { id: "AE-2045" }];
}

export default async function DeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = demoOrders.find(item => item.id === id);
  if (!order) notFound();
  return <main className="container"><DeliveryTracker initialOrder={order} orders={demoOrders}/></main>;
}