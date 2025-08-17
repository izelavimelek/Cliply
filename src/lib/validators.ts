import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const campaignCreateSchema = z.object({
  brand_id: z.string().min(1),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  platform: z.enum(["youtube", "tiktok", "instagram"]).default("youtube"),
  rate_per_thousand: z.number().nonnegative(),
  total_budget: z.number().nonnegative(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  rules: z.string().max(5000).optional(),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

export const submissionCreateSchema = z.object({
  campaign_id: z.string().min(1),
  post_url: z.string().url(),
  note: z.string().max(2000).optional(),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
export type SubmissionCreateInput = z.infer<typeof submissionCreateSchema>;
