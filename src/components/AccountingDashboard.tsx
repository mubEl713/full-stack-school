import prisma from "@/lib/prisma";
import { FEE_CATEGORY_LABEL, formatGradeName, formatNaira } from "@/lib/utils";
import Link from "next/link";
import AreaChartWidget from "./charts/AreaChartWidgetClient";
import BarChartWidget from "./charts/BarChartWidgetClient";
import DonutChartWidget from "./charts/DonutChartWidgetClient";
import RemindButton from "./RemindButton";
import SendRemindersButton from "./SendRemindersButton";

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className={`rounded-2xl p-4 flex-1 min-w-[150px] ${color}`}>
    <h2 className="text-xs font-medium text-gray-600">{label}</h2>
    <h1 className="text-xl font-semibold mt-2">{value}</h1>
  </div>
);

const Card = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-xl p-4 ${className}`}>
    <h3 className="text-sm font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

const LOW_COLLECTION_THRESHOLD = 0.5;

const AccountingDashboard = async () => {
  const [invoices, expensesAgg, incomeAgg, students] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        student: { select: { id: true, name: true, surname: true, classId: true } },
        feeStructure: { select: { name: true, category: true, gradeId: true, term: true, session: true } },
        payments: { select: { amount: true, method: true, date: true } },
      },
    }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.income.aggregate({ _sum: { amount: true } }),
    prisma.student.count(),
  ]);

  const now = new Date();
  const totalDue = invoices.reduce((s, i) => s + i.amountDue, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const totalIncome = totalPaid + (incomeAgg._sum.amount || 0);
  const totalExpense = expensesAgg._sum.amount || 0;
  const netBalance = totalIncome - totalExpense;
  const outstanding = Math.max(totalDue - totalPaid, 0);
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 100;

  const defaulterStudentIds = new Set(
    invoices
      .filter((i) => i.status !== "PAID" && i.status !== "WAIVED" && i.dueDate < now)
      .map((i) => i.studentId)
  );

  // Collection trend: last 14 days of payments
  const allPayments = invoices.flatMap((i) =>
    i.payments.map((p) => ({ ...p }))
  );
  const trendDays = 14;
  const trendData = Array.from({ length: trendDays }).map((_, idx) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (trendDays - 1 - idx));
    const dayKey = day.toISOString().split("T")[0];
    const total = allPayments
      .filter((p) => p.date.toISOString().split("T")[0] === dayKey)
      .reduce((s, p) => s + p.amount, 0);
    return {
      name: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: total,
    };
  });

  // Revenue by grade
  const gradeIds = Array.from(new Set(invoices.map((i) => i.feeStructure.gradeId)));
  const grades = await prisma.grade.findMany({ where: { id: { in: gradeIds } } });
  const revenueByGrade = grades.map((g) => ({
    name: formatGradeName(g.section, g.level),
    value: invoices
      .filter((i) => i.feeStructure.gradeId === g.id)
      .reduce((s, i) => s + i.amountPaid, 0),
  }));

  // Revenue by category
  const categorySet = Array.from(new Set(invoices.map((i) => i.feeStructure.category)));
  const revenueByCategory = categorySet.map((cat) => ({
    name: FEE_CATEGORY_LABEL[cat],
    value: invoices
      .filter((i) => i.feeStructure.category === cat)
      .reduce((s, i) => s + i.amountPaid, 0),
  }));

  // Payment method split
  const methodTotals: Record<string, number> = {};
  allPayments.forEach((p) => {
    methodTotals[p.method] = (methodTotals[p.method] || 0) + p.amount;
  });
  const methodData = Object.entries(methodTotals).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }));

  // Term/session comparison
  const termKey = (i: (typeof invoices)[number]) =>
    `${i.feeStructure.term} ${i.feeStructure.session}`;
  const termSet = Array.from(new Set(invoices.map(termKey)));
  const termData = termSet.map((key) => ({
    name: key,
    value: invoices.filter((i) => termKey(i) === key).reduce((s, i) => s + i.amountPaid, 0),
  }));

  // Top defaulters (by outstanding, per student)
  const outstandingByStudent = new Map<
    string,
    { name: string; amount: number; invoiceId: number }
  >();
  invoices.forEach((i) => {
    const out = i.amountDue - i.amountPaid;
    if (out <= 0) return;
    const existing = outstandingByStudent.get(i.studentId);
    if (!existing || out > existing.amount) {
      outstandingByStudent.set(i.studentId, {
        name: `${i.student.name} ${i.student.surname}`,
        amount: out,
        invoiceId: i.id,
      });
    }
  });
  const topDefaulters = Array.from(outstandingByStudent.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Due-date list: fee structures with upcoming due dates
  const feeStructures = await prisma.feeStructure.findMany({
    where: { dueDate: { gte: now } },
    orderBy: { dueDate: "asc" },
    take: 5,
    include: { grade: true },
  });

  // Alerts: overdue count + low-collection grades
  const overdueCount = invoices.filter(
    (i) => i.status !== "PAID" && i.status !== "WAIVED" && i.dueDate < now
  ).length;
  const lowCollectionGrades = grades
    .map((g) => {
      const gradeInvoices = invoices.filter((i) => i.feeStructure.gradeId === g.id);
      const due = gradeInvoices.reduce((s, i) => s + i.amountDue, 0);
      const paid = gradeInvoices.reduce((s, i) => s + i.amountPaid, 0);
      const rate = due > 0 ? paid / due : 1;
      return { name: formatGradeName(g.section, g.level), rate };
    })
    .filter((g) => g.rate < LOW_COLLECTION_THRESHOLD);

  const fmt = formatNaira;

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* METRIC CARDS */}
      <div className="flex gap-4 flex-wrap">
        <StatCard label="Revenue Collected" value={fmt(totalIncome)} color="bg-lamaSkyLight" />
        <StatCard label="Outstanding Balance" value={fmt(outstanding)} color="bg-lamaYellowLight" />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} color="bg-lamaPurpleLight" />
        <StatCard label="Active Students" value={String(students)} color="bg-green-100" />
        <StatCard label="Defaulters" value={String(defaulterStudentIds.size)} color="bg-red-100" />
        <StatCard
          label="Net Balance"
          value={fmt(netBalance)}
          color={netBalance >= 0 ? "bg-green-100" : "bg-red-100"}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-xl p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold mr-2">Quick actions:</span>
        <Link href="/list/fee-structures" className="text-xs bg-lamaSky px-3 py-2 rounded-md">
          Generate Invoices
        </Link>
        <Link href="/list/invoices" className="text-xs bg-lamaSky px-3 py-2 rounded-md">
          Record Payment
        </Link>
        <SendRemindersButton />
        <a href="/api/export/invoices" className="text-xs bg-lamaPurple px-3 py-2 rounded-md">
          Export Invoices (CSV)
        </a>
        <a href="/api/export/fee-payments" className="text-xs bg-lamaPurple px-3 py-2 rounded-md">
          Export Payments (CSV)
        </a>
        <a href="/api/export/expenses" className="text-xs bg-lamaPurple px-3 py-2 rounded-md">
          Export Expenses (CSV)
        </a>
      </div>

      {/* ALERTS */}
      {(overdueCount > 0 || lowCollectionGrades.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <h3 className="font-semibold text-red-700 mb-1">Alerts</h3>
          {overdueCount > 0 && (
            <p className="text-red-600">
              {overdueCount} invoice(s) are overdue.{" "}
              <Link href="/list/invoices?status=OVERDUE" className="underline">
                View
              </Link>
            </p>
          )}
          {lowCollectionGrades.map((g) => (
            <p key={g.name} className="text-red-600">
              {g.name} collection rate is only {Math.round(g.rate * 100)}%.
            </p>
          ))}
        </div>
      )}

      {/* CHARTS ROW 1 */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <Card title="Collection Trend (last 14 days)" className="w-full lg:w-2/3 h-[320px]">
          <div className="h-[260px]">
            <AreaChartWidget data={trendData} color="#C3EBFA" />
          </div>
        </Card>
        <Card title="Payment Method Split" className="w-full lg:w-1/3 h-[320px]">
          <div className="h-[260px]">
            <DonutChartWidget data={methodData} />
          </div>
        </Card>
      </div>

      {/* CHARTS ROW 2: REVENUE BREAKDOWN */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <Card title="Revenue by Grade" className="w-full lg:w-1/3 h-[300px]">
          <div className="h-[240px]">
            <BarChartWidget data={revenueByGrade} color="#CFCEFF" />
          </div>
        </Card>
        <Card title="Revenue by Fee Category" className="w-full lg:w-1/3 h-[300px]">
          <div className="h-[240px]">
            <BarChartWidget data={revenueByCategory} color="#FAE27C" />
          </div>
        </Card>
        <Card title="Term / Session Comparison" className="w-full lg:w-1/3 h-[300px]">
          <div className="h-[240px]">
            <BarChartWidget data={termData} color="#86EFAC" />
          </div>
        </Card>
      </div>

      {/* WIDGETS ROW */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <Card title="Top Defaulters" className="w-full lg:w-1/2">
          {topDefaulters.length === 0 ? (
            <p className="text-xs text-gray-400">No outstanding balances 🎉</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {topDefaulters.map((d) => (
                  <tr key={d.invoiceId} className="border-b border-gray-100">
                    <td className="py-2">{d.name}</td>
                    <td className="py-2 text-right font-medium">{fmt(d.amount)}</td>
                    <td className="py-2 text-right">
                      <RemindButton invoiceId={d.invoiceId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Upcoming Due Dates" className="w-full lg:w-1/2">
          {feeStructures.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming due dates.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {feeStructures.map((fs) => (
                  <tr key={fs.id} className="border-b border-gray-100">
                    <td className="py-2">
                      {fs.name} ({formatGradeName(fs.grade.section, fs.grade.level)})
                    </td>
                    <td className="py-2 text-right">
                      {new Intl.DateTimeFormat("en-US").format(fs.dueDate!)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;
