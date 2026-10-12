import { initialOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== initialOrder.id) {
    return new Response(JSON.stringify({ error: "Stream not found" }), {
      status: 404, headers: { "Content-Type": "application/json" }
    });
  }

  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let closed = false;
  let step = 0;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (data: unknown, event?: string) => {
        if (closed) return;
        // SSE framing: each field ends in LF and each event ends with a blank line.
        const frame = `${event ? `event: ${event}\n` : ""}data: ${JSON.stringify(data)}\n\n`;
        try { controller.enqueue(encoder.encode(frame)); } catch { cleanup(); }
      };
      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (timer) clearInterval(timer);
        if (heartbeat) clearInterval(heartbeat);
        try { controller.close(); } catch {}
      };

      send({ ...initialOrder, updatedAt: new Date().toISOString() }, "status");
      timer = setInterval(() => {
        if (closed) return;
        step += 1;
        if (step >= 5) {
          send({ status: "Delivered", updatedAt: new Date().toISOString() }, "status");
          cleanup();
          return;
        }
        const progress = step / 5;
        send({
          status: "On the way",
          updatedAt: new Date().toISOString(),
          courierPosition: {
            lat: Number((initialOrder.courierPosition.lat + (initialOrder.deliveryPosition.lat - initialOrder.courierPosition.lat) * progress).toFixed(5)),
            lng: Number((initialOrder.courierPosition.lng + (initialOrder.deliveryPosition.lng - initialOrder.courierPosition.lng) * progress).toFixed(5))
          }
        }, "status");
      }, 5000);
      heartbeat = setInterval(() => {
        if (!closed) {
          try { controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`)); } catch { cleanup(); }
        }
      }, 15000);
      // Attach cleanup to request cancellation below through the stream's cancel callback.
      (controller as ReadableStreamDefaultController<Uint8Array> & { __cleanup?: () => void }).__cleanup = cleanup;
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
      if (heartbeat) clearInterval(heartbeat);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}