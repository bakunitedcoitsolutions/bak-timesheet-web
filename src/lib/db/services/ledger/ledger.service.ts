/**
 * Ledger Service
 * Business logic for ledger operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  GetLedgerByEmployeeCodeParams,
  GetLedgerByEmployeeCodeResponse,
  LedgerEntryInterface,
} from "./ledger.dto";

/**
 * Get ledger entries by employee code
 * Genrates the ledger dynamically from PayrollDetails, Loan, and TrafficChallan
 */
export const getLedgerByEmployeeCode = async (
  params: GetLedgerByEmployeeCodeParams
): Promise<GetLedgerByEmployeeCodeResponse> => {
  // First, find the employee by employeeCode
  const employee = await prisma.employee.findUnique({
    where: { employeeCode: params.employeeCode },
    select: {
      id: true,
      employeeCode: true,
      nameEn: true,
      nameAr: true,
      designationId: true,
      idCardNo: true,
    },
  });

  if (!employee) {
    return {
      employee: null,
      ledgerEntries: [],
    };
  }

  const targetYear = 2026;
  const startDate = new Date(targetYear, 0, 1); // Jan 1st, 2026

  // 1. Get Opening Balance from Jan 2026 Payroll
  const janPayroll = await prisma.payrollDetails.findFirst({
    where: {
      employeeId: employee.id,
      payrollMonth: 1,
      payrollYear: targetYear,
    },
    select: {
      previousLoan: true,
      previousChallan: true,
    },
  });

  let currentBalance = 0;
  if (janPayroll) {
    currentBalance = janPayroll.previousLoan + janPayroll.previousChallan;
  }

  // Generate Ledger Entries Array
  const ledgerEntries: LedgerEntryInterface[] = [];
  let idCounter = 1;

  // Add Opening Balance Entry
  ledgerEntries.push({
    id: idCounter++,
    employeeId: employee.id,
    date: startDate,
    type: "SALARY",
    amountType: "DEBIT", // Prevents mapping to table columns
    amount: 0,
    balance: currentBalance,
    description: "Opening Balance",
    reference: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    payrollDetailId: null,
    loanId: null,
    trafficChallanId: null,
  });

  // 2. Fetch all loans from Jan 1st
  const loans = await prisma.loan.findMany({
    where: {
      employeeId: employee.id,
      date: { gte: startDate },
    },
  });

  // 3. Fetch all challans from Jan 1st
  const challans = await prisma.trafficChallan.findMany({
    where: {
      employeeId: employee.id,
      date: { gte: startDate },
    },
  });

  // 4. Fetch all posted payrolls from Jan 1st
  // Excluding the Jan payroll? No, we include Jan payroll because we need netSalary and deductions of Jan.
  // Wait, the Opening Balance brings previous month's dues.
  // We still need to process Jan's salary and deductions.
  const payrolls = await prisma.payrollDetails.findMany({
    where: {
      employeeId: employee.id,
      payrollSummary: {
        payrollStatusId: 3, // Posted
      },
      // Ensure we only get from Jan 1st 2026 onwards by checking month/year
      payrollYear: { gte: targetYear },
    },
    include: {
      payrollSummary: true,
    },
  });

  // 5. Unify records
  interface UnifiedRecord {
    sortDate: Date;
    sortOrder: number; // Secondary sort key for items on the exact same date
    description: string;
    type: "SALARY" | "LOAN" | "CHALLAN";
    amountType: "CREDIT" | "DEBIT";
    amount: number;
    sourceId: number;
    sourceType: "PAYROLL" | "LOAN" | "CHALLAN";
  }

  const unifiedRecords: UnifiedRecord[] = [];

  for (const loan of loans) {
    const isLoanTaken = loan.type === "LOAN";
    unifiedRecords.push({
      sortDate: loan.date,
      sortOrder: 0,
      description: loan.remarks ? `Loan (${loan.remarks})` : "Loan",
      type: "LOAN",
      amountType: isLoanTaken ? "DEBIT" : "CREDIT",
      amount: loan.amount,
      sourceId: loan.id,
      sourceType: "LOAN",
    });
  }

  for (const challan of challans) {
    const isChallanGiven = challan.type === "CHALLAN";
    unifiedRecords.push({
      sortDate: challan.date,
      sortOrder: 0,
      description: challan.description
        ? `Violation (${challan.description})`
        : "Traffic Violation",
      type: "CHALLAN",
      amountType: isChallanGiven ? "CREDIT" : "DEBIT",
      amount: challan.amount,
      sourceId: challan.id,
      sourceType: "CHALLAN",
    });
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (const payroll of payrolls) {
    // Determine the end of the payroll month for sorting
    const payrollDate = new Date(payroll.payrollYear, payroll.payrollMonth, 0);
    const monthStr = monthNames[payroll.payrollMonth - 1];
    const yearStr = payroll.payrollYear.toString().substring(2);

    // 1st Component: Salary
    unifiedRecords.push({
      sortDate: payrollDate,
      sortOrder: 1, // Salary appears first on that date
      description: `Salary (${monthStr}-${yearStr})`,
      type: "SALARY",
      amountType: "CREDIT",
      amount: payroll.netSalaryPayable || 0, // Using netSalaryPayable based on the requirement for netSalary
      sourceId: payroll.id,
      sourceType: "PAYROLL",
    });

    // 2nd Component: Loan Deduction
    if (payroll.loanDeduction > 0) {
      unifiedRecords.push({
        sortDate: payrollDate,
        sortOrder: 2, // Loan deduction appears second on that exact date
        description: `Deduction From Salary (${monthStr}-${yearStr}) (Loan)`,
        type: "LOAN",
        amountType: "CREDIT", // Deduction serves as loan return
        amount: payroll.loanDeduction,
        sourceId: payroll.id,
        sourceType: "PAYROLL",
      });
    }

    // 3rd Component: Challan Deduction
    if (payroll.challanDeduction > 0) {
      unifiedRecords.push({
        sortDate: payrollDate,
        sortOrder: 3, // Challan deduction appears third on that exact date
        description: `Deduction From Salary (${monthStr}-${yearStr}) (Violation)`,
        type: "CHALLAN",
        amountType: "DEBIT", // Deduction serves as challan return
        amount: payroll.challanDeduction,
        sourceId: payroll.id,
        sourceType: "PAYROLL",
      });
    }
  }

  // 6. Sort by date and then by sortOrder
  unifiedRecords.sort((a, b) => {
    const timeDiff = a.sortDate.getTime() - b.sortDate.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.sortOrder - b.sortOrder;
  });

  // 7. Calculate Running Balance
  for (const record of unifiedRecords) {
    if (record.type === "LOAN") {
      if (record.amountType === "DEBIT") {
        currentBalance += record.amount;
      } else {
        currentBalance -= record.amount;
      }
    } else if (record.type === "CHALLAN") {
      if (record.amountType === "CREDIT") {
        currentBalance += record.amount;
      } else {
        currentBalance -= record.amount;
      }
    } else if (record.type === "SALARY") {
      // Balance remains as it is when printing net salary
      // currentBalance is unmodified
    }

    ledgerEntries.push({
      id: idCounter++,
      employeeId: employee.id,
      date: record.sortDate,
      type: record.type,
      amountType: record.amountType,
      amount: record.amount,
      balance: currentBalance,
      description: record.description,
      reference: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      payrollDetailId: record.sourceType === "PAYROLL" ? record.sourceId : null,
      loanId: record.sourceType === "LOAN" ? record.sourceId : null,
      trafficChallanId:
        record.sourceType === "CHALLAN" ? record.sourceId : null,
    });
  }

  return {
    employee: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      nameEn: employee.nameEn,
      nameAr: employee.nameAr,
      designationId: employee.designationId,
      idCardNo: employee.idCardNo,
    },
    ledgerEntries,
  };
};
