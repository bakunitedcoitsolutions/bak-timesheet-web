import { useQuery } from "@/lib/zsa/zsa-query";
import { getSiteWiseReportAction } from "./actions";
import { GetSiteWiseReportInput } from "./site-wise.schemas";

export const useGetSiteWiseReport = (input: GetSiteWiseReportInput, enabled: boolean = false) =>
  useQuery(getSiteWiseReportAction, {
    queryKey: ["site-wise-report", input],
    input,
    enabled,
  });
