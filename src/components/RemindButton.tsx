"use client";

import { sendSingleReminder } from "@/lib/actions";
import { useState } from "react";
import { toast } from "react-toastify";

const RemindButton = ({ invoiceId }: { invoiceId: number }) => {
  const [sent, setSent] = useState(false);

  const handleClick = async () => {
    const result = await sendSingleReminder(invoiceId);
    if (result.success) {
      setSent(true);
      toast("Reminder sent.");
    } else {
      toast.error("Failed to send reminder.");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={sent}
      className="text-xs bg-lamaYellow px-2 py-1 rounded-md disabled:opacity-50"
    >
      {sent ? "Sent" : "Remind"}
    </button>
  );
};

export default RemindButton;
