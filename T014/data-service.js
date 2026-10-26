const customers = [
  { id: 1, name: "Aarav" },
  { id: 2, name: "Mira" }
];

const products = [
  { id: 101, name: "Mouse", priceCents: 799 },
  { id: 102, name: "Keyboard", priceCents: 1499 }
];

const orders = [
  { id: 501, customerId: 1, productIds: [101, 102] },
  { id: 502, customerId: 2, productIds: [102] }
];

function delayedLookup(data, predicate, label, delayMs) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = data.find(predicate);

      if (!result) {
        reject(new Error(`${label} not found.`));
        return;
      }

      resolve({ ...result });
    }, delayMs);
  });
}

export function getCustomer(customerId) {
  return delayedLookup(
    customers,
    (customer) => customer.id === customerId,
    `Customer ${customerId}`,
    200
  );
}

export function getProductCatalog() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products.map((product) => ({ ...product })));
    }, 300);
  });
}

export function getOrdersForCustomer(customerId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        orders
          .filter((order) => order.customerId === customerId)
          .map((order) => ({ ...order, productIds: [...order.productIds] }))
      );
    }, 150);
  });
}

export function getCustomerWithOrders(customerId) {
  return getCustomer(customerId).then(async (customer) => {
    const customerOrders = await getOrdersForCustomer(customer.id);

    return {
      ...customer,
      orders: customerOrders
    };
  });
}