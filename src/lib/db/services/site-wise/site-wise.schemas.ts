import { z } from "zod";

export interface SiteWiseReportRow {
  id?: string | number;
  month: string;
  projectId: number;
  projectName: string;
  projectHours: number;
  projectOT: number;
  breakfastAllowance: number;
  empCode?: number;
  employeeName?: string;
  hourlyRate?: number;
  totalSalary: number;
}

export const GetSiteWiseReportSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  employeeCodes: z.array(z.number()).optional().nullable(),
  projectIds: z.array(z.number()).optional().nullable(),
  summarize: z.boolean().default(false),
});

export type GetSiteWiseReportInput = z.infer<typeof GetSiteWiseReportSchema>;
