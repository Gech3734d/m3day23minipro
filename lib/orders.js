export const initialOrder = {
  id: "AE-2048",
  customer: 'Mekdes Tadesse, "Mimi"',
  dish: 'Family combo, "special"',
  total: 840,
  status: "On the way",
  createdAt: "2026-10-12T07:15:00.000Z",
  courier: "Abel Girma",
  courierPhone: "+251 911 234 567",
  eta: "2026-10-12T08:05:00.000Z",
  courierPosition: { lat: 9.0192, lng: 38.7525 },
  deliveryPosition: { lat: 9.0054, lng: 38.7636 }
};

export const demoOrders = [
  initialOrder,
  { id: "AE-2047", customer: "Sara Mohammed", dish: "Doro Wat", total: 560, status: "Delivered", createdAt: "2026-10-12T06:45:00.000Z", courier: "Liya Tesfaye", courierPhone: "+251 911 000 111", eta: "2026-10-12T07:20:00.000Z", courierPosition: {lat:9.02,lng:38.75}, deliveryPosition:{lat:9.01,lng:38.76} },
  { id: "AE-2046", customer: "Dawit Alemu", dish: "Shiro with Injera", total: 290, status: "Preparing", createdAt: "2026-10-12T06:30:00.000Z", courier: "Not assigned", courierPhone: "", eta: "2026-10-12T08:30:00.000Z", courierPosition: {lat:9.02,lng:38.75}, deliveryPosition:{lat:9.01,lng:38.76} },
  { id: "AE-2045", customer: "Hana Bekele", dish: "Kitfo", total: 620, status: "Delivered", createdAt: "2026-10-11T17:25:00.000Z", courier: "Abel Girma", courierPhone: "+251 911 234 567", eta: "2026-10-11T18:10:00.000Z", courierPosition: {lat:9.02,lng:38.75}, deliveryPosition:{lat:9.01,lng:38.76} }
];

export function csvEscape(value) {
  const text = value == null ? "" : String(value);
  // RFC 4180: quote any field containing a comma, quote, CR, or LF; double internal quotes.
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function ordersToCsv(orders) {
  const columns = [
    ["Order ID", "id"], ["Customer", "customer"], ["Dish", "dish"],
    ["Total (ETB)", "total"], ["Status", "status"], ["Created at", "createdAt"], ["Courier", "courier"]
  ];
  const lines = [
    columns.map(([label]) => csvEscape(label)).join(","),
    ...orders.map(order => columns.map(([, key]) => csvEscape(order[key])).join(","))
  ];
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}