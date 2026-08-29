"use client";

import dynamic from "next/dynamic";

const CountChart = dynamic(() => import("./CountChart"), {
  ssr: false,
});

export default CountChart;
