// inventory-functions.js

export function createInventory(products = []) {
  if (!Array.isArray(products)) {
    throw new Error("Products must be an array.");
  }

  const stockById = new Map();
  const priceById = new Map();

  for (const product of products) {
    if (!product || typeof product !== "object" || Array.isArray(product)) {
      throw new Error("Each product must be an object.");
    }

    const { id, name, priceCents, stock } = product;

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Product ID must be a positive safe integer.");
    }

    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Product name must be a non-empty string.");
    }

    if (!Number.isSafeInteger(priceCents) || priceCents < 0) {
      throw new Error("Price must be a non-negative safe integer in cents.");
    }

    if (!Number.isSafeInteger(stock) || stock < 0) {
      throw new Error("Stock must be a non-negative safe integer.");
    }

    if (stockById.has(id)) {
      throw new Error(`Duplicate product ID: ${id}.`);
    }

    stockById.set(id, stock);
    priceById.set(id, priceCents);
  }

  function validateId(id) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Product ID must be a positive safe integer.");
    }

    if (!stockById.has(id)) {
      throw new Error(`Product not found: ${id}.`);
    }
  }

  function validateQuantity(quantity) {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive safe integer.");
    }
  }

  function getStock(productId) {
    validateId(productId);
    return stockById.get(productId);
  }

  function reserve(productId, quantity) {
    validateId(productId);
    validateQuantity(quantity);

    const stock = stockById.get(productId);

    if (stock < quantity) {
      throw new Error(
        `Insufficient stock for product ${productId}. ` +
        `Available: ${stock}, requested: ${quantity}.`
      );
    }

    const newStock = stock - quantity;
    stockById.set(productId, newStock);

    return newStock;
  }

  function release(productId, quantity) {
    validateId(productId);
    validateQuantity(quantity);

    const newStock = stockById.get(productId) + quantity;

    if (!Number.isSafeInteger(newStock)) {
      throw new Error("Stock exceeds the safe integer range.");
    }

    stockById.set(productId, newStock);
    return newStock;
  }

  return { getStock, reserve, release };
}