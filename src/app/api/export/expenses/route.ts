import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const csvEscape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (!role || !["admin", "owner", "accountant"].includes(role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" } });

  const header = ["Category", "Description", "Amount", "Date"];
  const rows = expenses.map((e) => [
    e.category,
    e.description,
    e.amount,
    e.date.toISOString().split("T")[0],
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="expenses.csv"`,
    },
  });
}
