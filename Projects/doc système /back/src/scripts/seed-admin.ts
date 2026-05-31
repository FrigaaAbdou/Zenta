import "dotenv/config";

import { connectToDatabase, disconnectFromDatabase } from "../config/db.js";
import {
  ADMIN_ROLES,
  type AdminRole,
  AdminUserModel,
} from "../modules/admin-auth/admin-user.model.js";
import { hashAdminPassword } from "../modules/admin-auth/password.js";

const DEFAULT_PASSWORD = "Admin123!";

const adminAccounts: Array<{ email: string; role: AdminRole }> = [
  { email: "super_admin@cts.local", role: "super_admin" },
  { email: "manager@cts.local", role: "manager" },
  { email: "operator@cts.local", role: "operator" },
];

async function seedAdminUsers() {
  await connectToDatabase();

  const passwordHash = await hashAdminPassword(DEFAULT_PASSWORD);

  for (const { email, role } of adminAccounts) {
    if (!ADMIN_ROLES.includes(role)) {
      throw new Error(`Unsupported admin role: ${role}`);
    }

    await AdminUserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          role,
          isActive: true,
        },
        $setOnInsert: {
          passwordHash,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  }

  console.log(
    [
      "Admin seed complete.",
      `Password for seeded accounts: ${DEFAULT_PASSWORD}`,
      `Users: ${adminAccounts.map(({ email, role }) => `${email} (${role})`).join(", ")}`,
    ].join("\n"),
  );
}

seedAdminUsers()
  .catch((error) => {
    console.error("Failed to seed admin users.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectFromDatabase();
  });
