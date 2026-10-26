import {
  getCustomer,
  getProductCatalog
} from "./data-service.js";

async function inspectAllResults() {
  const results = await Promise.allSettled([
    getCustomer(1),
    getCustomer(999),
    getProductCatalog()
  ]);

  console.log(
    results.map((result) => ({
      status: result.status,
      value: result.status === "fulfilled"
        ? result.value
        : undefined,
      error: result.status === "rejected"
        ? result.reason.message
        : undefined
    }))
  );
}

inspectAllResults();