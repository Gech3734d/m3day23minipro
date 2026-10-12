import assert from "node:assert/strict";
import { csvEscape, ordersToCsv } from "../lib/orders.js";

assert.equal(csvEscape("Mekdes Tadesse, Mimi"), '"Mekdes Tadesse, Mimi"');
assert.equal(csvEscape('Dish named "Special"'), '"Dish named ""Special"""');
assert.equal(csvEscape("line one\nline two"), '"line one\nline two"');

const csv = ordersToCsv([{
  id: "AE-TEST",
  customer: 'Customer, "Nickname"',
  dish: 'Stew, called "Special"',
  total: 123,
  status: "On the way",
  createdAt: "2026-10-12T07:15:00.000Z",
  courier: "Abel"
}]);
assert.match(csv, /"Customer, ""Nickname"""/);
assert.match(csv, /"Stew, called ""Special"""/);
console.log("CSV export tests passed: comma, quotation mark, and newline fields are escaped.");
