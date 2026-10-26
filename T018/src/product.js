
import http from "node:http";
import {
  addProduct,
  loadProducts,
  dataFile,
  CorruptDataError
} from "./product-store.js";

const DEFAULT_MAX_BODY_BYTES = 1024 * 1024;

class HttpError extends Error {
  constructor(status, title, message) {
    super(message);
    this.status = status;
    this.title = title;
  }
}

function sendJson(res, status, body, extraHeaders = {}) {
  if (res.writableEnded || res.destroyed) {
    return;
  }

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });

  res.end(JSON.stringify(body));
}

function sendError(res, status, title, message, extraHeaders = {}) {
  sendJson(
    res,
    status,
    { error: { title, message } },
    extraHeaders
  );
}

async function readJsonBody(req, maxBodyBytes) {
  const contentType = req.headers["content-type"] ?? "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    req.resume();

    throw new HttpError(
      415,
      "Unsupported Media Type",
      "Content-Type must be application/json."
    );
  }

  const rawLength = req.headers["content-length"];

  if (rawLength !== undefined) {
    const contentLength = Number(rawLength);

    if (
      !Number.isSafeInteger(contentLength) ||
      contentLength < 0
    ) {
      req.resume();

      throw new HttpError(
        400,
        "Bad Request",
        "Invalid Content-Length header."
      );
    }

    if (contentLength > maxBodyBytes) {
      req.resume();

      throw new HttpError(
        413,
        "Content Too Large",
        `Request body cannot exceed ${maxBodyBytes} bytes.`
      );
    }
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let settled = false;

    function fail(error) {
      if (settled) return;
      settled = true;
      chunks.length = 0;
      reject(error);
    }

    req.on("data", (chunk) => {
      if (settled) return;

      totalBytes += chunk.length;

      if (totalBytes > maxBodyBytes) {
        fail(
          new HttpError(
            413,
            "Content Too Large",
            `Request body cannot exceed ${maxBodyBytes} bytes.`
          )
        );

        // Drain remaining request bytes without storing them.
        req.resume();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      if (settled) return;

      settled = true;

      const text = Buffer.concat(chunks).toString("utf8");

      if (!text.trim()) {
        reject(
          new HttpError(
            400,
            "Bad Request",
            "Request body must contain valid JSON."
          )
        );
        return;
      }

      try {
        resolve(JSON.parse(text));
      } catch {
        reject(
          new HttpError(
            400,
            "Bad Request",
            "Request body contains malformed JSON."
          )
        );
      }
    });

    req.on("error", (error) => {
      fail(error);
    });

    req.on("aborted", () => {
      fail(
        new HttpError(
          400,
          "Bad Request",
          "Request body was aborted."
        )
      );
    });
  });
}

function validateNewProduct(body) {
  if (
    body === null ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    throw new HttpError(
      400,
      "Bad Request",
      "Product body must be a JSON object."
    );
  }

  const { id, name, priceCents } = body;

  if (
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    throw new HttpError(
      400,
      "Bad Request",
      "id must be a positive safe integer."
    );
  }

  if (
    typeof name !== "string" ||
    name.trim() === ""
  ) {
    throw new HttpError(
      400,
      "Bad Request",
      "name must be a non-empty string."
    );
  }

  if (
    !Number.isSafeInteger(priceCents) ||
    priceCents < 0
  ) {
    throw new HttpError(
      400,
      "Bad Request",
      "priceCents must be a non-negative safe integer."
    );
  }

  return {
    id,
    name: name.trim(),
    priceCents
  };
}

export function createApiServer({
  filePath = dataFile,
  maxBodyBytes = DEFAULT_MAX_BODY_BYTES
} = {}) {
  if (
    !Number.isSafeInteger(maxBodyBytes) ||
    maxBodyBytes < 1
  ) {
    throw new TypeError(
      "maxBodyBytes must be a positive safe integer."
    );
  }

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(
        req.url ?? "/",
        "http://localhost"
      );

      const pathname = url.pathname;
      const method = req.method ?? "GET";

      if (pathname === "/health") {
        if (method !== "GET") {
          sendError(
            res,
            405,
            "Method Not Allowed",
            "Use GET for this endpoint.",
            { Allow: "GET" }
          );
          return;
        }

        sendJson(res, 200, {
          status: "ok"
        });
        return;
      }

      if (pathname === "/products") {
        if (method === "GET") {
          const products = await loadProducts(filePath);
          const nameFilter = url.searchParams.get("name");

          const filteredProducts = nameFilter
            ? products.filter((product) =>
                product.name
                  .toLowerCase()
                  .includes(nameFilter.toLowerCase())
              )
            : products;

          sendJson(res, 200, {
            count: filteredProducts.length,
            products: filteredProducts
          });
          return;
        }

        if (method === "POST") {
          const body = await readJsonBody(
            req,
            maxBodyBytes
          );

          const product = validateNewProduct(body);

          try {
            await addProduct(product, filePath);
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes("already exists")
            ) {
              throw new HttpError(
                409,
                "Conflict",
                error.message
              );
            }

            throw error;
          }

          sendJson(
            res,
            201,
            {
              message: "Product created successfully.",
              product
            },
            { Location: `/products/${product.id}` }
          );
          return;
        }

        sendError(
          res,
          405,
          "Method Not Allowed",
          "Use GET or POST for this endpoint.",
          { Allow: "GET, POST" }
        );
        return;
      }

      // No other routes are implemented.
      sendError(
        res,
        404,
        "Not Found",
        "The requested endpoint does not exist."
      );
    } catch (error) {
      if (res.writableEnded || res.destroyed) {
        return;
      }

      if (error instanceof HttpError) {
        sendError(
          res,
          error.status,
          error.title,
          error.message
        );
        return;
      }

      if (error instanceof CorruptDataError) {
        console.error("Product storage is corrupt:", error.message);

        sendError(
          res,
          500,
          "Storage Error",
          "Product data could not be read. Check the server's data file."
        );
        return;
      }

      console.error("HTTP request failed:", error);

      sendError(
        res,
        500,
        "Internal Server Error",
        "The server could not complete the request."
      );
    }
  });
}

if (process.argv[1] &&
    process.argv[1] === new URL(import.meta.url).pathname) {
  const server = createApiServer();

  server.listen(3000, () => {
    console.log("API running at http://localhost:3000");
  });

  server.on("error", (error) => {
    console.error("Server failed:", error.message);
    process.exitCode = 1;
  });
}
