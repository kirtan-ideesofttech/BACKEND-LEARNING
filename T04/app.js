const customerName = "Kirtan";
const productName = "Wireless Mouse";
const priceCents = 79900;
const isAvailable = true;

function parseQuantity(input) {
    if (input.trim() === "") {
        return null;
    }

    const quantity = Number(input);

    if (!Number.isFinite(quantity)) {
        return null;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return null;
    }

    return quantity;
}

const input = "2";
const quantity = parseQuantity(input);

if (quantity === null) {
    console.log("Invalid quantity");
} else if (!isAvailable) {
    console.log("Product is not available");
} else {
    const lineTotalCents = priceCents * quantity;

    console.log(
        `${customerName} bought ${quantity} ${productName}(s). ` +
        `Total: ₹${lineTotalCents / 100}`
    );
}