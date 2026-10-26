
import {
  mkdir,
  readFile,
  rename,
  writeFile,
  unlink
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const dataDirectory = path.resolve(currentDirectory, "../data");
const dataFile = path.join(dataDirectory, "products.json");

export class CorruptDataError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "CorruptDataError";
  }
}

function validateProducts(products) {
  if (!Array.isArray(products)) {
    throw new CorruptDataError(
      "Product data must be a JSON array."
    );
  }

  for (const product of products) {
    if (
      product === null ||
      typeof product !== "object" ||
      !Number.isSafeInteger(product.id) ||
      product.id <= 0 ||
      typeof product.name !== "string" ||
      product.name.trim() === "" ||
      !Number.isSafeInteger(product.priceCents) ||
      product.priceCents < 0
    ) {
      throw new CorruptDataError(
        "Product data contains an invalid product."
      );
    }
  }

  const ids = products.map((product) => product.id);

  if (new Set(ids).size !== ids.length) {
    throw new CorruptDataError(
      "Product data contains duplicate IDs."
    );
  }

  return products;
}

async function ensureDataDirectory(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function saveProducts(products, filePath) {
  validateProducts(products);
  await ensureDataDirectory(filePath);

  // One temporary file per Node.js process.
  // This is intended for a single writer, not concurrent writers.
  const tempFile = `${filePath}.${process.pid}.tmp`;
  const text = JSON.stringify(products, null, 2) + "\n";

  try {
    await writeFile(tempFile, text, "utf8");
    await rename(tempFile, filePath);
  } catch (error) {
    try {
      await unlink(tempFile);
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") {
        // Preserve the original write/rename error.
      }
    }

    throw error;
  }
}

export async function loadProducts(filePath = dataFile) {
  let text;

  try {
    text = await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    // Explicit initialization: create the missing file as [].
    await saveProducts([], filePath);
    return [];
  }

  let products;

  try {
    products = JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new CorruptDataError(
        `Invalid JSON in ${filePath}. The file was not changed.`,
        { cause: error }
      );
    }

    throw error;
  }

  return validateProducts(products);
}

export async function addProduct(
  product,
  filePath = dataFile
) {
  validateProducts([product]);

  const products = await loadProducts(filePath);

  if (products.some((item) => item.id === product.id)) {
    throw new Error(`Product ID ${product.id} already exists.`);
  }

  const updatedProducts = [...products, product];

  await saveProducts(updatedProducts, filePath);

  return product;
}

export { dataDirectory, dataFile };
