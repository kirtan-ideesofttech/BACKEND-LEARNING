import { createServer } from "node:http";

const PORT = 3000;

const products = [
  { id: 101, name: "Mouse", priceCents: 799 },
  { id: 102, name: "Keyboard", priceCents: 1499 }
];

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && url.pathname === "/products") {
    res.writeHead(200);
    res.end(JSON.stringify(products));
    return;
  }

  if (req.method === "GET" && url.pathname === "/invalid-json") {
    res.writeHead(200);
    res.end("{ invalid JSON");
    return;
  }

  if (req.method === "GET" && url.pathname === "/slow") {
    setTimeout(() => {
      if (res.destroyed || res.writableEnded) return;

      res.writeHead(200);
      res.end(JSON.stringify({ message: "Slow response completed" }));
    }, 1500);
    return;
  }

  if (req.method === "GET" && url.pathname === "/unavailable") {
    res.writeHead(503);
    res.end(JSON.stringify({ message: "Service temporarily unavailable" }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/flaky") {
    const attempt = Number(url.searchParams.get("attempt") || "1");

    if (attempt < 3) {
      res.writeHead(503);
      res.end(JSON.stringify({ message: "Try again later" }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({ message: "Recovered", attempt }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mock server running at http://127.0.0.1:${PORT}`);
});