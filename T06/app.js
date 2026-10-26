
function calculateLineTotal(priceCents, quantity) {
    if (!Number.isSafeInteger(priceCents) || priceCents < 0) {
        throw new TypeError("Invalid price.");
    }

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        throw new TypeError("Invalid quantity.");
    }

    const total = priceCents * quantity;

    if (!Number.isSafeInteger(total)) {
        throw new RangeError("Line total is too large.");
    }

    return total;
}

function calculateCartTotal(cart = []) {
    if (!Array.isArray(cart)) {
        throw new TypeError("Cart must be an array.");
    }

    let totalCents = 0;

    for (const item of cart) {
        if (item === null || typeof item !== "object") {
            throw new TypeError("Each cart item must be an object.");
        }

        const lineTotal = calculateLineTotal(
            item.priceCents,
            item.quantity
        );

        totalCents += lineTotal;

        if (!Number.isSafeInteger(totalCents)) {
            throw new RangeError("Cart total is too large.");
        }
    }

    return totalCents;
}

const cart = [
    { name: "Mouse", priceCents: 799, quantity: 2 },
    { name: "Keyboard", priceCents: 1499, quantity: 1 },
    { name: "USB Cable", priceCents: 299, quantity: 3 }
];

const cartTotalCents = calculateCartTotal(cart);

console.log(`Cart total: $${(cartTotalCents / 100).toFixed(2)}`);
