async function main() {
  console.log("This is sandbox!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
