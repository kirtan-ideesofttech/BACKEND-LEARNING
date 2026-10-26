import { InventoryService } from "./inventory-service.js";

const inventory = new InventoryService([
  { id: 101, name: "Mouse", priceCents: 799, stock: 10 },
  { id: 102, name: "Keyboard", priceCents: 1499, stock: 5 }
]);

console.log("Initial mouse stock:", inventory.getStock(101));

inventory.reserve(101, 3);
console.log("After reserving 3:", inventory.getStock(101));

inventory.release(101, 2);
console.log("After releasing 2:", inventory.getStock(101));

console.log("Keyboard stock:", inventory.getStock(102));