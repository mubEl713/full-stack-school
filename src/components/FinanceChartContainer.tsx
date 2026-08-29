import prisma from "@/lib/prisma";
import FinanceChart from "./FinanceChartClient";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FinanceChartContainer = async () => {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const [payments, income, expenses] = await Promise.all([
    prisma.feePayment.findMany({
      where: { date: { gte: start, lt: end } },
      select: { amount: true, date: true },
    }),
    prisma.income.findMany({
      where: { date: { gte: start, lt: end } },
      select: { amount: true, date: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lt: end } },
      select: { amount: true, date: true },
    }),
  ]);

  const data = MONTHS.map((name, i) => {
    const monthIncome =
      payments
        .filter((p) => p.date.getMonth() === i)
        .reduce((sum, p) => sum + p.amount, 0) +
      income
        .filter((inc) => inc.date.getMonth() === i)
        .reduce((sum, inc) => sum + inc.amount, 0);

    const monthExpense = expenses
      .filter((e) => e.date.getMonth() === i)
      .reduce((sum, e) => sum + e.amount, 0);

    return { name, income: monthIncome, expense: monthExpense };
  });

  return <FinanceChart data={data} />;
};

export default FinanceChartContainer;
