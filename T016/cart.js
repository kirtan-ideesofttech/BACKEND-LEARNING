// cart.js

export const products = [
  { id: 101, name: "Mouse", priceCents: 799 },
  { id: 102, name: "Keyboard", priceCents: 1499 },
  { id: 103, name: "USB Cable", priceCents: 299 }
];

export function calculateCartTotal(
  productId,
  quantity,
  monthlyEligibleSpendCents = 0
) {
  if (!Number.isSafeInteger(productId) || productId <= 0) {
    throw new Error("Product ID must be a positive safe integer.");
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive safe integer.");
  }

  if (
    !Number.isSafeInteger(monthlyEligibleSpendCents) ||
    monthlyEligibleSpendCents < 0
  ) {
    throw new Error(
      "Monthly eligible spend must be a non-negative safe integer in cents."
    );
  }

  const product = products.find((item) => item.id === productId);

  if (!product) {
    throw new Error(`Product not found: ${productId}.`);
  }

  const subtotalCents = product.priceCents * quantity;

  if (!Number.isSafeInteger(subtotalCents)) {
    throw new Error("Subtotal exceeds the safe integer range.");
  }

  let rewardCents = 0;

  if (monthlyEligibleSpendCents >= 100_000) {
    rewardCents = 3_500;
  } else if (monthlyEligibleSpendCents >= 50_000) {
    rewardCents = 2_500;
  } else if (monthlyEligibleSpendCents >= 25_000) {
    rewardCents = 1_000;
  }

  const discountCents = Math.min(rewardCents, subtotalCents);
  const payableTotalCents = subtotalCents - discountCents;

  return {
    productName: product.name,
    quantity,
    subtotalCents,
    discountCents,
    payableTotalCents
  };
}