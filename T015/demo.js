import {
  fetchJson,
  fetchJsonWithRetry
} from "./fetch-client.js";

const BASE_URL = "http://127.0.0.1:3000";

async function showResult(label, operation) {
  try {
    const result = await operation();
    console.log(`${label}: SUCCESS`, result);
  } catch (error) {
    console.log(`${label}: ERROR`, error.name, "-", error.message);
  }
}

await showResult("Products", () =>
  fetchJson(`${BASE_URL}/products`)
);

await showResult("Invalid JSON", () =>
  fetchJson(`${BASE_URL}/invalid-json`)
);

await showResult("Unavailable service", () =>
  fetchJson(`${BASE_URL}/unavailable`)
);

await showResult("Slow request", () =>
  fetchJson(`${BASE_URL}/slow`, { timeoutMs: 100 })
);

await showResult("Retry demonstration", () =>
  fetchJsonWithRetry(
    `${BASE_URL}/flaky?scenario=demo`,
    { timeoutMs: 1000, maxAttempts: 3, baseDelayMs: 20 }
  )
);