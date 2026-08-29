"use client";

import { generateInvoices } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const GenerateInvoicesButton = ({ feeStructureId }: { feeStructureId: number }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    const result = await generateInvoices(
      { success: false, error: false },
      { feeStructureId }
    );
    setLoading(false);
    if (result.success) {
      toast(`Generated ${result.created ?? 0} new invoice(s).`);
      router.refresh();
    } else {
      toast.error("Failed to generate invoices.");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs bg-lamaSky px-2 py-1 rounded-md disabled:opacity-50"
      title="Generate invoices for every student in this grade"
    >
      {loading ? "Generating..." : "Generate Invoices"}
    </button>
  );
};

export default GenerateInvoicesButton;
