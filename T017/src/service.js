
import { createServer } from "node:http";
import {
  addProduct,
  loadProducts
} from "./product-store.js";

const DEFAULT_PORT = 3000;
const MAX_BODY_BYTES = 16 * 1024;

class HttpError extends Error {
  constructor(statusCode, message, extraHeaders = {}) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.extraHeaders = extraHeaders;
  }
}

function sendJson(res, statusCode, data, extraHeaders = {}) {
  if (res.writableEnded) {
    return;
  }

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });

  res.end(JSON.stringify(data));
}

async function readJsonBody(req, maxBytes) {
  const chunks = [];
  let totalBytes = 0;
  let tooLarge = false;

  for await (const chunk of req) {
    totalBytes += chunk.length;

    if (totalBytes > maxBytes) {
      tooLarge = true;
      // Do not buffer more data after the limit is exceeded.
      continue;
    }

    if (!tooLarge) {
      chunks.push(chunk);
    }
  }

  if (tooLarge) {
    throw new HttpError(
      413,
      `Request body exceeds the ${maxBytes}-byte limit.`
    );
  }

  if (totalBytes === 0) {
    throw new HttpError(400, "Request body is required.");
  }

  const text = Buffer.concat(chunks).toString("utf8");

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Request body contains malformed JSON.");
  }
}

function validateNewProduct(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new HttpError(
      400,
      "Product must be a JSON object."
    );
  }

  const { id, name, priceCents } = value;

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new HttpError(
      400,
      "id must be a positive safe integer."
    );
  }

  if (typeof name !== "string" || name.trim() === "") {
    throw new HttpError(
      400,
      "name must be a non-empty string."
    );
  }

  if (
    !Number.isSafeInteger(priceCents) ||
    priceCents < 0
  ) {
    throw new HttpError(
      400,
      "priceCents must be a non-negative safe integer."
    );
  }

  // Only accept the fields supported by this API.
  const allowedKeys = new Set(["id", "name", "priceCents"]);
  const unexpectedKeys = Object.keys(value).filter(
    (key) => !allowedKeys.has(key)
  );

  if (unexpectedKeys.length > 0) {
    throw new HttpError(
      400,
      `Unexpected product field: ${unexpectedKeys[0]}.`
    );
  }

  return {
    id,
    name: name.trim(),
    priceCents
  };
}

function validateLimit(rawLimit) {
  if (rawLimit === null) {
    return null;
  }

  if (!/^[1-9]\d*$/.test(rawLimit)) {
    throw new HttpError(
      400,
      "limit must be a positive integer."
    );
  }

  const limit = Number(rawLimit);

  if (!Number.isSafeInteger(limit)) {
    throw new HttpError(400, "limit is too large.");
  }

  return limit;
}

export function createAppServer({
  loadProductsFn = loadProducts,
  addProductFn = addProduct,
  maxBodyBytes = MAX_BODY_BYTES
} = {}) {
  const server = createServer(async (req, res) => {
    try {
      if (!req.url) {
        throw new HttpError(400, "Request URL is required.");
      }

      let requestUrl;

      try {
        requestUrl = new URL(
          req.url,
          "http://localhost"
        );
      } catch {
        throw new HttpError(400, "Invalid request URL.");
      }

      const { method } = req;
      const pathname = requestUrl.pathname;

      if (pathname === "/health") {
        if (method !== "GET") {
          throw new HttpError(
            405,
            "Method not allowed for this path.",
            { Allow: "GET" }
          );
        }

        sendJson(res, 200, {
          status: "ok"
        });
        return;
      }

      if (pathname === "/products") {
        if (method === "GET") {
          const nameQuery = requestUrl.searchParams.get("name");
          const limit = validateLimit(
            requestUrl.searchParams.get("limit")
          );

          let products = await loadProductsFn();

          if (nameQuery !== null) {
            const search = nameQuery.toLowerCase();

            products = products.filter((product) =>
              product.name.toLowerCase().includes(search)
            );
          }

          if (limit !== null) {
            products = products.slice(0, limit);
          }

          sendJson(res, 200, {
            count: products.length,
            products
          });
          return;
        }

        if (method === "POST") {
          const contentType = req.headers["content-type"] ?? "";

          if (
            !/^application\/json(?:\s*;|$)/i.test(contentType)
          ) {
            // Drain the request before replying so its body does
            // not remain unread on this connection.
            for await (const _chunk of req) {
              // Intentionally consume without buffering.
            }

            throw new HttpError(
              415,
              "Content-Type must be application/json."
            );
          }

          const body = await readJsonBody(req, maxBodyBytes);
          const product = validateNewProduct(body);

          try {
            await addProductFn(product);
          } catch (error) {
            if (
              typeof error.message === "string" &&
              /already exists/.test(error.message)
            ) {
              throw new HttpError(
                409,
                `Product ID ${product.id} already exists.`
              );
            }

            throw error;
          }

          sendJson(
            res,
            201,
            {
              message: "Product created.",
              product
            },
            {
              Location: `/products/${product.id}`
            }
          );
          return;
        }

        throw new HttpError(
          405,
          "Method not allowed for this path.",
          { Allow: "GET, POST" }
        );
      }

      throw new HttpError(404, "Route not found.");
    } catch (error) {
      if (res.headersSent) {
        // Headers are already committed; a second response
        // cannot safely be sent.
        res.destroy(error);
        return;
      }

      if (error instanceof HttpError) {
        sendJson(
          res,
          error.statusCode,
          {
            error: {
              message: error.message
            }
          },
          error.extraHeaders
        );
        return;
      }

      console.error("Unhandled request error:", error);

      sendJson(res, 500, {
        error: {
          message: "Internal server error."
        }
      });
    }
  });

  return server;
}

const isMainModule =
  process.argv[1] &&
  new URL(import.meta.url).pathname ===
    new URL(`file://${process.argv[1]}`).pathname;

if (isMainModule) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    console.error("PORT must be an integer from 1 to 65535.");
    process.exitCode = 1;
  } else {
    const server = createAppServer();

    server.listen(port, "127.0.0.1", () => {
      console.log(`Server running at http://127.0.0.1:${port}`);
    });
  }
}
