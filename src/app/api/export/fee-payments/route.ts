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

  const payments = await prisma.feePayment.findMany({
    include: {
      student: { select: { name: true, surname: true } },
      feeStructure: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  const header = ["Student", "Fee", "Amount", "Method", "Date", "Notes"];
  const rows = payments.map((p) => [
    `${p.student.name} ${p.student.surname}`,
    p.feeStructure.name,
    p.amount,
    p.method,
    p.date.toISOString().split("T")[0],
    p.notes || "",
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="fee-payments.csv"`,
    },
  });
}
