"use client";

import { createInstallmentPlan } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const InstallmentPlanButton = ({ invoiceId }: { invoiceId: number }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    const partsStr = window.prompt("Split outstanding balance into how many parts?", "3");
    if (!partsStr) return;
    const parts = parseInt(partsStr);
    if (!parts || parts < 2 || parts > 12) {
      toast.error("Enter a number between 2 and 12.");
      return;
    }
    setLoading(true);
    const result = await createInstallmentPlan(
      { success: false, error: false },
      { invoiceId, parts }
    );
    setLoading(false);
    if (result.success) {
      toast("Installment plan created.");
      router.refresh();
    } else {
      toast.error("Failed to create installment plan.");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs bg-lamaPurple px-2 py-1 rounded-md disabled:opacity-50"
    >
      {loading ? "Splitting..." : "Split into Installments"}
    </button>
  );
};

export default InstallmentPlanButton;
