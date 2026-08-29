import FinanceChartContainer from "@/components/FinanceChartContainer";
import prisma from "@/lib/prisma";

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className={`rounded-2xl p-4 flex-1 min-w-[160px] ${color}`}>
    <h2 className="text-sm font-medium text-gray-600">{label}</h2>
    <h1 className="text-2xl font-semibold mt-2">{value}</h1>
  </div>
);

const AccountantPage = async () => {
  const [payments, income, expenses] = await Promise.all([
    prisma.feePayment.aggregate({ _sum: { amount: true } }),
    prisma.income.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);

  const totalIncome = (payments._sum.amount || 0) + (income._sum.amount || 0);
  const totalExpense = expenses._sum.amount || 0;
  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap">
        <StatCard label="Total Income" value={fmt(totalIncome)} color="bg-lamaSkyLight" />
        <StatCard label="Total Expenses" value={fmt(totalExpense)} color="bg-lamaPurpleLight" />
        <StatCard
          label="Net Balance"
          value={fmt(totalIncome - totalExpense)}
          color={totalIncome - totalExpense >= 0 ? "bg-green-100" : "bg-red-100"}
        />
      </div>
      <div className="w-full h-[500px]">
        <FinanceChartContainer />
      </div>
    </div>
  );
};

export default AccountantPage;
