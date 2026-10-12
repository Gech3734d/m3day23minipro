# Addis Eats — Live Delivery Tracking

Next.js App Router demo for an order delivery tracking workflow with a client-only map, courier and destination markers, server-sent events (SSE), shared date/currency formatters, and robust CSV export.

## Requirements

- Node.js 20.9+
- npm

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Visit:
- `http://localhost:3000` — order overview
- `http://localhost:3000/delivery/AE-2048` — live delivery tracking
- `http://localhost:3000/api/orders/AE-2048/stream` — raw SSE stream (inspect in a browser or curl)

## Requirement checklist

1. **Client-only map:** `components/DeliveryMap.tsx` uses `next/dynamic` with `ssr: false` and a 360px sized loading placeholder. The map canvas renders only on the client.
2. **Courier + destination markers:** the map shows both labeled markers and a route line. The adjacent map description repeats both locations with latitude/longitude, making the locations available as text to assistive technology. The schematic automatically keeps both markers in the map frame.
3. **SSE route:** `app/api/orders/[id]/stream/route.ts` returns `text/event-stream`, uses correct `data: ...\\n\\n` event framing, includes heartbeat comments, disables caching/buffering, and closes after delivery.
4. **EventSource client:** `DeliveryTracker` seeds its state from the server-provided order, connects with `EventSource`, merges updates, and calls `source.close()` in the effect cleanup.
5. **Connection indicator + deliberate close:** connection states include connecting, connected, interrupted, and closed. On a `Delivered` event, the client explicitly closes EventSource and shows the closed state.
6. **Shared `lib/format.js`:** exports `etb`, `when`, and `relative`. The dashboard, order table, and tracker use these shared formatters.
7. **CSV export:** the export button downloads UTF-8 CSV with BOM and CRLF rows. The RFC 4180 escape rule wraps values containing commas, quotation marks, or line breaks in quotes and doubles internal quotation marks.
8. **Awkward value tests:** the demo records deliberately contain a customer with a comma and quotation mark and a dish with a comma and quotation mark. Run `npm run test:csv` to test comma, quote, and newline escaping.

## Verify SSE

Start the server and visit `/api/orders/AE-2048/stream`. Each event is framed with an optional `event: status` line, a `data: {JSON}` line, and a blank line. The demo advances the courier position and sends `Delivered` after five update ticks. The client closes the stream when delivery is complete.

## CSV behavior

Click **Export CSV** on the delivery page. Open the file with a text editor to verify:
- `Mekdes Tadesse, "Mimi"` becomes `"Mekdes Tadesse, ""Mimi"""`.
- `Family combo, "special"` becomes `"Family combo, ""special"""`.

This quoting prevents commas or quotes inside a cell from shifting the CSV columns.

## Notes

- The map is an accessible schematic demo, not a live geographic map tile provider. Coordinates are example Addis Ababa locations. Replace the canvas with a map provider if true roads and live GPS are needed.
- Orders are deterministic in-memory demo data. Replace `lib/orders.js` with database-backed records and authorize the SSE route before using real customer information.
- The stream is a demo simulation; in production, connect to real order status updates and use a shared event broker if the app runs on multiple instances.

## Module 3 · Day 48 — accessibility and deployment pre-flight

### Keyboard and touch accessibility

- There are no clickable `div` elements. Navigation uses Next.js links; actions use native buttons; fields use labeled native inputs/selects.
- Keyboard users can reach navigation, form fields, submit, and CSV export with **Tab** and activate links/buttons with **Enter** or **Space** (native button behavior). Visible `:focus-visible` styling and a Skip to main content link are provided.
- No modal, menu, or popover is used, so there is no transient UI that needs an Escape-to-dismiss handler. If you add one later, implement Escape dismissal and restore focus to its trigger.
- Main navigation, links, form controls, and action buttons have at least 44px minimum height. No essential information is hover-only.
- Submit buttons become disabled while the request is pending. A synchronous client guard blocks fast double taps, and the API uses an `Idempotency-Key` to return the same order for a retry using the same key.

### Route table (App Router)

| Route | Type | Purpose |
|---|---|---|
| `/` | Server-rendered page | Order overview, summary, order table, demo order form |
| `/delivery/[id]` | Server-rendered page + client tracker | Delivery details, map, SSE updates, CSV export |
| `/api/orders` | `POST` Route Handler | Validates and idempotently accepts a demo order |
| `/api/orders/[id]/stream` | `GET` Route Handler | Server-Sent Events status stream |

After a successful build, use the Next.js route table printed at the end of `npm run build` as the source of truth for the installed Next.js version. Verify these paths appear in that output.

### Local pre-flight checklist

Run in the project root (Node.js 20.9+):

```bash
npm install
npm run lint
npm run test:csv
npm run test:accessibility
npm run build
```

Or run `npm run preflight` after dependencies have been installed. Read the route table emitted by the build and compare it to the table above. Then run `npm run start` and test the production build at `http://localhost:3000`.

- [ ] No lint or TypeScript/build errors.
- [ ] Tab focus is always visible; Skip to main content works.
- [ ] Enter activates links/buttons; native controls can be operated without a mouse.
- [ ] Every visible action is keyboard reachable; no important text appears only on hover.
- [ ] Main interactive targets are at least 44×44 CSS pixels.
- [ ] Rapidly activate Place demo order twice: one order ID should be reported, and the button is disabled while pending.
- [ ] CSV file opens and preserves commas, quotes, and line breaks in fields.
- [ ] Delivery tracker displays courier and destination as both map markers and text.
- [ ] SSE connection state changes and closes when the order is delivered.

### Vercel deployment and environment variables

1. Push this project to a GitHub repository.
2. In Vercel, choose **Add New → Project**, import the repository, and keep the detected Next.js framework settings.
3. Open **Project Settings → Environment Variables**. Add `NEXT_PUBLIC_SITE_URL` separately for **Development**, **Preview**, and **Production**:
   - Development: `http://localhost:3000`
   - Preview: the assigned preview deployment URL (update it when the preview URL changes, if using a fixed URL)
   - Production: your actual production URL, e.g. `https://your-project.vercel.app` or your custom domain
4. Redeploy after changing environment variables; values are captured at build/deployment time. This demo has no required secret keys. Never commit real secrets to `.env.example` or Git.
5. Deploy the production branch and copy the live URL. Deployment requires your own Vercel account and cannot be completed from this source package alone.

#### Optional Vercel CLI deployment

After installing dependencies and signing in to your own Vercel account:

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SITE_URL preview
npx vercel env add NEXT_PUBLIC_SITE_URL production
npx vercel --prod
```

When prompted, enter the URL for the relevant environment. Add a separate Development value if you use Vercel's development environment. Review **Project → Settings → Environment Variables** to confirm each value is assigned only to the intended environment, then redeploy. The CLI commands require interactive account authorization and cannot be completed by running this source package alone.

#### Live deployment record

- **Production URL:** _Not deployed yet — paste the real Vercel production URL here after deployment._
- **Preview URL:** _Paste the actual preview URL here after a preview deployment._
- **Private-window checks:** _Do not mark these as passed until each check below has been performed against the deployed URL._

### Post-deployment checks (use a private/incognito window)

Open the deployed production URL in a private window to avoid cached state and extensions. Complete every check and record the deployment URL, date, browser, and result.

- [ ] `/` loads without console errors; layout works at desktop and mobile widths.
- [ ] `/delivery/AE-2048` loads; map placeholder/map content has explicit dimensions and both locations are also available as text.
- [ ] Tab through the whole page. Focus rings remain visible and the skip link appears when focused.
- [ ] Activate navigation and export with keyboard only; the downloaded CSV includes correctly escaped values.
- [ ] Submit the demo order with valid and invalid values; pending state is visible, and fast repeated activation creates one order for the same request key.
- [ ] Check the Network panel for `/api/orders` returning 201 on first submit and the same order on idempotent retry.
- [ ] Check `/api/orders/AE-2048/stream` responds with `text/event-stream` and messages separated by a blank line (`\n\n`).
- [ ] Observe the connection status and ensure the stream closes on delivery.
- [ ] Check all buttons, links, inputs, and selects are comfortably tappable (minimum 44px target height).
- [ ] Check the browser console and Vercel Function/Build logs for errors.
- [ ] Repeat in a second private session if possible.

### Demo limitations

The order API uses an in-memory idempotency map and sequence counter. It demonstrates double-submit protection but is not a durable order database; serverless instances can restart or handle requests separately. For real commerce, store orders and idempotency keys in a transactional database with a unique constraint. The delivery map and SSE feed are still demo/simulated data. Treat the app as a learning deliverable, not a production payment/order system.
