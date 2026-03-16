"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import { GetSiteWiseReportSchema } from "./site-wise.schemas";
import { getSiteWiseReport } from "./site-wise.service";

export const getSiteWiseReportAction = serverAction
  .input(GetSiteWiseReportSchema)
  .handler(async ({ input }) => {
    return await getSiteWiseReport(input);
  });
