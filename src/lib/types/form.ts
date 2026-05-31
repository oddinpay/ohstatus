import { email, z } from "zod/v4";

export const subscriberCreate = z.object({
  email: email({ message: "Invalid email address" })
    .min(2, { message: "Email must be at least 2 characters" })
    .max(50, { message: "Email cannot exceed 50 characters" }),
});
