
"use strict";

function createCart() {
    // Private state: inaccessible directly outside this factory.
    const items = [];

    function validateItem(item) {
        if (item === null || typeof item !== "object" || Array.isArray(item)) {
            throw new TypeError("Cart item must be a plain object.");
        }

        if (!Number.isSafeInteger(item.productId) || item.productId <= 0) {
            throw new TypeError("productId must be a positive safe integer.");
        }

        if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
            throw new TypeError("quantity must be a positive safe integer.");
        }
    }

    function clone(value) {
        return structuredClone(value);
    }

    return {
        addItem(item) {
            validateItem(item);

            // Copy incoming data to prevent external mutations.
            items.push(clone(item));
        },

        removeItem(productId) {
            const index = items.findIndex(
                item => item.productId === productId
            );

            if (index === -1) {
                return false;
            }

            items.splice(index, 1);
            return true;
        },

        getItems() {
            // Never expose the private array or its nested objects.
            return clone(items);
        }
    };
}

// Create two independent carts.
const cartA = createCart();
const cartB = createCart();

// Add different items.
cartA.addItem({
    productId: 101,
    quantity: 2,
    details: {
        color: "Black"
    }
});

cartB.addItem({
    productId: 102,
    quantity: 1,
    details: {
        color: "White"
    }
});

// Read both carts.
console.log("Cart A:", cartA.getItems());
console.log("Cart B:", cartB.getItems());

// Remove an item from Cart A only.
console.log("Removed from A:", cartA.removeItem(101));

console.log("Cart A after removal:", cartA.getItems());
console.log("Cart B remains:", cartB.getItems());

// Mutating returned data must not mutate private state.
const externalItems = cartB.getItems();

externalItems[0].quantity = 999;
externalItems[0].details.color = "Red";
externalItems.push({ productId: 103, quantity: 1 });

console.log("Cart B after external mutations:", cartB.getItems());

// Mutating the original input must not affect stored data.
const inputItem = {
    productId: 104,
    quantity: 3,
    details: {
        color: "Green"
    }
};

cartA.addItem(inputItem);

inputItem.details.color = "Purple";
inputItem.quantity = 100;

console.log("Cart A after input mutation:", cartA.getItems());

// Test removal when an item doesn't exist.
console.log("Remove missing item:", cartA.removeItem(999));
