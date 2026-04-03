"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import { getServerAccessContext } from "@/lib/auth/helpers";
import { GetSiteWiseReportSchema } from "./site-wise.schemas";
import { getSiteWiseReport } from "./site-wise.service";

export const getSiteWiseReportAction = serverAction
  .input(GetSiteWiseReportSchema)
  .handler(async ({ input }) => {
    const { isBranchScoped, userBranchId } = await getServerAccessContext();
    const branchId = isBranchScoped ? userBranchId : null;

    return await getSiteWiseReport(input, branchId);
  });
