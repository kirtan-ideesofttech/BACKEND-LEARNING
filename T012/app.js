console.log("A");

async function run() {
  console.log("B");

  await Promise.resolve();

  console.log("C");
}

run();

Promise.resolve().then(() => {
  console.log("D");
});

console.log("E");