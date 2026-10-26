
const products = [
    {
        id: 101,
        name: "Wireless Mouse",
        priceCents: 799,
        stock: 20,
        description: "Wireless optical mouse"
    },
    {
        id: 102,
        name: "Keyboard",
        priceCents: 1499,
        stock: 10
    },
    {
        id: 103,
        name: "USB Cable",
        priceCents: 299,
        stock: 50,
        description: "USB charging cable"
    }
];

// Cart stores references by product ID, not full product objects.
let cart = [
    { productId: 101, quantity: 1 },
    { productId: 103, quantity: 2 }
];

// 1. Read properties using dot and bracket notation.
console.log(products[0].name);
console.log(products[1]["priceCents"]);

// 2. Add a new cart item.
function addToCart(cart, productId, quantity = 1) {
    const product = products.find(p => p.id === productId);

    if (!product) {
        throw new Error("Product not found");
    }

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive integer");
    }

    if (quantity > product.stock) {
        throw new Error("Insufficient stock");
    }

    const existingItem = cart.find(
        item => item.productId === productId
    );

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
            throw new Error("Insufficient stock");
        }

        return cart.map(item =>
            item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
        );
    }

    return [...cart, { productId, quantity }];
}

// 3. Update an item's quantity.
function updateCartQuantity(cart, productId, quantity) {
    const product = products.find(p => p.id === productId);

    if (!product) {
        throw new Error("Product not found");
    }

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive integer");
    }

    if (quantity > product.stock) {
        throw new Error("Insufficient stock");
    }

    const exists = cart.some(item => item.productId === productId);

    if (!exists) {
        throw new Error("Product is not in the cart");
    }

    return cart.map(item =>
        item.productId === productId
            ? { ...item, quantity }
            : item
    );
}

// 4. Remove an item without mutating the original array.
function removeFromCart(cart, productId) {
    return cart.filter(item => item.productId !== productId);
}

// 5. Calculate cart total using product data.
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);

        if (!product) {
            throw new Error("Cart contains an unknown product");
        }

        if (
            !Number.isSafeInteger(item.quantity) ||
            item.quantity <= 0 ||
            item.quantity > product.stock
        ) {
            throw new Error("Invalid cart quantity");
        }

        const lineTotal = product.priceCents * item.quantity;
        const nextTotal = total + lineTotal;

        if (!Number.isSafeInteger(nextTotal)) {
            throw new RangeError("Cart total is too large");
        }

        return nextTotal;
    }, 0);
}

// Add an item.
cart = addToCart(cart, 102, 1);

// Update mouse quantity.
cart = updateCartQuantity(cart, 101, 3);

// Remove the USB cable.
cart = removeFromCart(cart, 103);

// Destructure product fields.
const { name, priceCents } = products[0];
console.log({ name, priceCents });

// Copy a product and update only the copy.
const originalProduct = products[0];
const copiedProduct = { ...originalProduct, priceCents: 999 };

console.log(originalProduct.priceCents); // 799
console.log(copiedProduct.priceCents);  // 999
console.log(originalProduct === copiedProduct); // false

// Handle a missing description.
const keyboard = products.find(p => p.id === 102);
const description = keyboard.description ?? "No description available";

console.log(description);

// Display the final cart.
console.log("Final cart:", cart);
console.log("Total cents:", calculateCartTotal(cart));
console.log(
    `Total: $${(calculateCartTotal(cart) / 100).toFixed(2)}`
);
