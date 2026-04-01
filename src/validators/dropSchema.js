import { z } from "zod";

export const dropSchema = z
  .object({
    projectName: z.string().min(1, "This field is required"),
    walletAddress: z.string(),
    notes: z.string(),
    repeat: z.preprocess((val) => Number(val), z.number()),
    category: z.string().min(1, "This field is required"),
    startDate: z.coerce.date({
      required_error: "Start date is required",
      invalid_type_error: "Start date must be a valid date",
    }),
    endDate: z.coerce.date().optional().nullable(),
    startAlarm: z.coerce.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate && data.startDate >= data.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "Start date must be earlier than end date",
        path: ["startDate"],
      });
    }
  });
