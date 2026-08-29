"use client";

import dynamic from "next/dynamic";

const BarChartWidget = dynamic(() => import("./BarChartWidget"), {
  ssr: false,
});

export default BarChartWidget;
export type { BarDatum } from "./BarChartWidget";
