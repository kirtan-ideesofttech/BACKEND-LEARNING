// cart.js

import { calculateMonthlyReward } from "./rewards.js";

function validateProductId(productId) {
  if (!Number.isSafeInteger(productId) || productId <= 0) {
    throw new Error("Product ID must be a positive safe integer.");
  }
}

function validateQuantity(quantity) {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive safe integer.");
  }
}

function validatePrice(priceCents) {
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) {
    throw new Error(
      "Product price must be a non-negative safe integer in cents."
    );
  }
}

export function calculateCartSubtotalCents(cart, products) {
  if (!Array.isArray(cart)) {
    throw new Error("Cart must be an array.");
  }

  if (!Array.isArray(products)) {
    throw new Error("Products must be an array.");
  }

  // Validate the catalog so duplicate IDs cannot make lookups ambiguous.
  const productMap = new Map();

  for (const product of products) {
    if (!product || typeof product !== "object" || Array.isArray(product)) {
      throw new Error("Each product must be an object.");
    }

    validateProductId(product.id);
    validatePrice(product.priceCents);

    if (productMap.has(product.id)) {
      throw new Error(`Duplicate product ID: ${product.id}.`);
    }

    productMap.set(product.id, product);
  }

  let subtotalCents = 0;

  for (const item of cart) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Each cart item must be an object.");
    }

    validateProductId(item.productId);
    validateQuantity(item.quantity);

    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error(`Unknown product ID: ${item.productId}.`);
    }

    const lineTotalCents = product.priceCents * item.quantity;

    if (!Number.isSafeInteger(lineTotalCents)) {
      throw new Error("Line total exceeds the safe integer range.");
    }

    subtotalCents += lineTotalCents;

    if (!Number.isSafeInteger(subtotalCents)) {
      throw new Error("Cart subtotal exceeds the safe integer range.");
    }
  }

  return subtotalCents;
}

export function calculateCartSummary(
  cart,
  products,
  monthlyEligibleSpendCents = 0
) {
  const subtotalCents = calculateCartSubtotalCents(cart, products);
  const rewardCents = calculateMonthlyReward(monthlyEligibleSpendCents);

  // Do not let the discount make the payable total negative.
  const discountCents = Math.min(rewardCents, subtotalCents);
  const payableTotalCents = subtotalCents - discountCents;

  return {
    subtotalCents,
    discountCents,
    payableTotalCents
  };
}