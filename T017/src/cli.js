
import {
  addProduct,
  loadProducts
} from "./product-store.js";

function parsePositiveInteger(value, label) {
  if (!/^[1-9]\d*$/.test(value ?? "")) {
    throw new Error(`${label} must be a positive integer.`);
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} is too large.`);
  }

  return number;
}

function parsePriceCents(value) {
  if (!/^(0|[1-9]\d*)$/.test(value ?? "")) {
    throw new Error(
      "Price must be a non-negative integer in cents."
    );
  }

  const price = Number(value);

  if (!Number.isSafeInteger(price)) {
    throw new Error("Price is too large.");
  }

  return price;
}

function formatUsd(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === "list") {
    if (args.length !== 0) {
      throw new Error("Usage: npm start -- list");
    }

    const products = await loadProducts();

    if (products.length === 0) {
      console.log("No products found.");
      return;
    }

    for (const product of products) {
      console.log(
        `${product.id} | ${product.name} | ${formatUsd(product.priceCents)}`
      );
    }

    return;
  }

  if (command === "add") {
    if (args.length !== 3) {
      throw new Error(
        'Usage: npm start -- add <id> "<name>" <priceCents>'
      );
    }

    const [rawId, name, rawPriceCents] = args;
    const id = parsePositiveInteger(rawId, "Product ID");
    const priceCents = parsePriceCents(rawPriceCents);

    if (!name.trim()) {
      throw new Error("Product name cannot be empty.");
    }

    const product = {
      id,
      name: name.trim(),
      priceCents
    };

    await addProduct(product);

    console.log("Product added successfully.");
    console.log(`ID: ${product.id}`);
    console.log(`Name: ${product.name}`);
    console.log(`Price: ${formatUsd(product.priceCents)}`);
    return;
  }

  throw new Error(
    'Unknown command. Use "list" or "add".'
  );
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
