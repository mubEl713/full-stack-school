"use client";

import { sendOverdueReminders } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const SendRemindersButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    const result = await sendOverdueReminders();
    setLoading(false);
    if (result.success) {
      toast(`Sent ${result.remindersSent ?? 0} overdue reminder(s).`);
      router.refresh();
    } else {
      toast.error("Failed to send reminders.");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs bg-lamaYellow px-3 py-2 rounded-md disabled:opacity-50 font-medium"
    >
      {loading ? "Sending..." : "Send Reminders Now"}
    </button>
  );
};

export default SendRemindersButton;
