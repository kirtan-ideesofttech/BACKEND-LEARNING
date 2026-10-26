
const products = [
    { id: 101, name: "Mouse", priceCents: 799, stock: 20 },
    { id: 102, name: "Keyboard", priceCents: 1499, stock: 0 },
    { id: 103, name: "USB Cable", priceCents: 299, stock: 50 },
    { id: 104, name: "Monitor", priceCents: 12999, stock: 5 }
];

const cart = [
    { productId: 101, quantity: 2 },
    { productId: 103, quantity: 3 },
    { productId: 104, quantity: 1 }
];

// 1. filter(): select in-stock products.
const availableProducts = products.filter(
    product => product.stock > 0
);

// 2. map(): transform products into display summaries.
const summaries = availableProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: `$${(product.priceCents / 100).toFixed(2)}`
}));

// 3. find(): retrieve one product referenced by the cart.
const cartItem = cart.find(item => item.productId === 103);

const cartProduct = cartItem
    ? products.find(product => product.id === cartItem.productId)
    : undefined;

// 4. some() and every(): answer boolean questions.
const hasOutOfStockProduct = products.some(
    product => product.stock === 0
);

const allProductsInStock = products.every(
    product => product.stock > 0
);

// 5. reduce(): calculate the cart total.
function calculateCartTotal(cart, products) {
    return cart.reduce((totalCents, item) => {
        if (
            !Number.isSafeInteger(item.quantity) ||
            item.quantity <= 0
        ) {
            throw new Error("Quantity must be a positive integer");
        }

        const product = products.find(
            product => product.id === item.productId
        );

        if (!product) {
            throw new Error(`Product ${item.productId} not found`);
        }

        const lineTotal = product.priceCents * item.quantity;
        const nextTotal = totalCents + lineTotal;

        if (!Number.isSafeInteger(nextTotal)) {
            throw new RangeError("Cart total is too large");
        }

        return nextTotal;
    }, 0);
}

const totalCents = calculateCartTotal(cart, products);

// 6. sort(): sort a COPY by numeric price.
const sortedProducts = [...products].sort(
    (a, b) => a.priceCents - b.priceCents
);

// Verify that the original array order is preserved.
const originalOrder = products.map(product => product.id);
const orderAfterSort = products.map(product => product.id);

console.log("Available products:", summaries);
console.log("Cart product:", cartProduct?.name ?? "Not found");
console.log("Has out-of-stock product:", hasOutOfStockProduct);
console.log("All products in stock:", allProductsInStock);
console.log("Cart total in cents:", totalCents);
console.log(`Cart total: $${(totalCents / 100).toFixed(2)}`);
console.log(
    "Sorted prices:",
    sortedProducts.map(product => product.priceCents)
);
console.log("Original order preserved:",
    JSON.stringify(originalOrder) === JSON.stringify(orderAfterSort)
);
console.log("Empty cart total:", calculateCartTotal([], products));
