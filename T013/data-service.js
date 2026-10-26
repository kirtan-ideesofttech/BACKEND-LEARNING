// data-service.js

const products = [
  { id: 101, name: "Mouse", priceCents: 799, stock: 20 },
  { id: 102, name: "Keyboard", priceCents: 1499, stock: 10 },
  { id: 103, name: "USB Cable", priceCents: 299, stock: 50 }
];

const customers = [
  { id: 1, name: "Aarav", email: "aarav@example.com" },
  { id: 2, name: "Mira", email: "mira@example.com" }
];

export function findProductById(productId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isSafeInteger(productId) || productId <= 0) {
        reject(new Error("Product ID must be a positive safe integer."));
        return;
      }

      const product = products.find((item) => item.id === productId);

      if (!product) {
        reject(new Error(`Product not found: ${productId}.`));
        return;
      }

      resolve({ ...product });
    }, 100);
  });
}

export function findCustomerById(customerId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isSafeInteger(customerId) || customerId <= 0) {
        reject(new Error("Customer ID must be a positive safe integer."));
        return;
      }

      const customer = customers.find((item) => item.id === customerId);

      if (!customer) {
        reject(new Error(`Customer not found: ${customerId}.`));
        return;
      }

      resolve({ ...customer });
    }, 100);
  });
}