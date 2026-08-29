"use client";

import dynamic from "next/dynamic";

const FinanceChart = dynamic(() => import("./FinanceChart"), {
  ssr: false,
});

export default FinanceChart;
