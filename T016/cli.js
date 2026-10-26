// cli.js

import { calculateCartTotal, products } from "./cart.js";

function parsePositiveInteger(value, label) {
  if (!/^[1-9]\d*$/.test(value ?? "")) {
    throw new Error(`${label} must be a positive integer.`);
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} must be a safe integer.`);
  }

  return number;
}

function parseNonNegativeInteger(value, label) {
  if (!/^(0|[1-9]\d*)$/.test(value ?? "")) {
    throw new Error(`${label} must be a non-negative integer.`);
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} must be a safe integer.`);
  }

  return number;
}

function formatUsd(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    throw new Error(
      "Usage: npm start -- <productId> <quantity>"
    );
  }

  const productId = parsePositiveInteger(args[0], "Product ID");
  const quantity = parsePositiveInteger(args[1], "Quantity");

  const monthlyEligibleSpendCents = parseNonNegativeInteger(
    process.env.MONTHLY_ELIGIBLE_SPEND_CENTS ?? "0",
    "MONTHLY_ELIGIBLE_SPEND_CENTS"
  );

  const result = calculateCartTotal(
    productId,
    quantity,
    monthlyEligibleSpendCents
  );

  console.log(`Product: ${result.productName}`);
  console.log(`Quantity: ${result.quantity}`);
  console.log(`Subtotal: ${formatUsd(result.subtotalCents)}`);
  console.log(`Discount: ${formatUsd(result.discountCents)}`);
  console.log(`Payable total: ${formatUsd(result.payableTotalCents)}`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error("Run: npm start -- <productId> <quantity>");
  process.exitCode = 1;
}