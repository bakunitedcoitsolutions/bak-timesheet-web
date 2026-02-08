import { prisma } from "../prisma";

async function main() {
  const summaries = await prisma.payrollSummary.findMany({
    include: {
      _count: {
        select: { payrollDetails: true },
      },
    },
    orderBy: {
      payrollYear: "desc",
    },
  });

  console.log("Payroll Summaries:");
  summaries.forEach((s) => {
    console.log(
      `ID: ${s.id}, Year: ${s.payrollYear}, Month: ${s.payrollMonth}, Status: ${s.payrollStatusId}, Details Count: ${s._count.payrollDetails}`
    );
  });

  const details = await prisma.payrollDetails.findMany({
    take: 5,
  });
  console.log("\nSample Details:", details.length > 0 ? details[0] : "None");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
