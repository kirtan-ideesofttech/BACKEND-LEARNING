// demo.js

import {
  findProductById,
  findCustomerById
} from "./data-service.js";

async function main() {
  console.log("Loading product...");

  try {
    const product = await findProductById(101);

    console.log("Product:", product.name);
    console.log("Price in cents:", product.priceCents);
  } catch (error) {
    console.error("Product lookup failed:", error.message);
  } finally {
    console.log("Product lookup finished.");
  }

  console.log("Loading customer...");

  try {
    const customer = await findCustomerById(1);

    console.log("Customer:", customer.name);
    console.log("Email:", customer.email);
  } catch (error) {
    console.error("Customer lookup failed:", error.message);
  } finally {
    console.log("Customer lookup finished.");
  }
}

main().catch((error) => {
  console.error("Unexpected application error:", error.message);
  process.exitCode = 1;
});