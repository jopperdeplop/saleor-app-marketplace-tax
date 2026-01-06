const bcrypt = require("bcryptjs");

async function main() {
  const password = "Admin123!";
  const hash = await bcrypt.hash(password, 10);
  console.log("=".repeat(50));
  console.log("ADMIN USER CREDENTIALS");
  console.log("=".repeat(50));
  console.log("Email: admin@salp.shop");
  console.log("Password: Admin123!");
  console.log("");
  console.log("Password Hash (for Prisma Studio):");
  console.log(hash);
  console.log("=".repeat(50));
}

main();
