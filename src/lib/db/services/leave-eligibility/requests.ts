import { useQuery } from "@tanstack/react-query";
import { getLeaveEligibilityReportAction } from "./actions";

export const useGetLeaveEligibilityReport = (employeeCode: number) => {
  return useQuery({
    queryKey: ["leave-eligibility-report", employeeCode],
    queryFn: async () => {
      const response = await getLeaveEligibilityReportAction(employeeCode);
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!employeeCode,
  });
};
