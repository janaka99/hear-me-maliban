import { z } from "zod";

export const WelcomeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?\d{7,15}$/, "Invalid phone number"),
  dob: z
    .string({
      message: "Date of Birth is required",
    })
    .refine(
      (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) return false; // invalid date
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        const d = today.getDate() - date.getDate();
        const actualAge = m < 0 || (m === 0 && d < 0) ? age - 1 : age;
        return actualAge >= 12;
      },
      {
        message: "Invalid date or you must be at least 12 years old.",
      }
    ),
});

export type WelcomeFormSchemaType = z.infer<typeof WelcomeFormSchema>;
