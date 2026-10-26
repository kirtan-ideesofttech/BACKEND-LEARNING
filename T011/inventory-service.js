// inventory-service.js

export class InventoryService {
  constructor(products = []) {
    if (!Array.isArray(products)) {
      throw new Error("Products must be an array.");
    }

    this.products = new Map();

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

      if (this.products.has(id)) {
        throw new Error(`Duplicate product ID: ${id}.`);
      }

      // Keep a separate internal record.
      this.products.set(id, {
        id,
        name,
        priceCents,
        stock
      });
    }
  }

  getStock(productId) {
    const product = this.#findProduct(productId);
    return product.stock;
  }

  reserve(productId, quantity) {
    const product = this.#findProduct(productId);
    this.#validateQuantity(quantity);

    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock for product ${productId}. ` +
        `Available: ${product.stock}, requested: ${quantity}.`
      );
    }

    product.stock -= quantity;
    return product.stock;
  }

  release(productId, quantity) {
    const product = this.#findProduct(productId);
    this.#validateQuantity(quantity);

    const newStock = product.stock + quantity;

    if (!Number.isSafeInteger(newStock)) {
      throw new Error("Stock exceeds the safe integer range.");
    }

    product.stock = newStock;
    return product.stock;
  }

  #findProduct(productId) {
    if (!Number.isSafeInteger(productId) || productId <= 0) {
      throw new Error("Product ID must be a positive safe integer.");
    }

    const product = this.products.get(productId);

    if (!product) {
      throw new Error(`Product not found: ${productId}.`);
    }

    return product;
  }

  #validateQuantity(quantity) {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive safe integer.");
    }
  }
}