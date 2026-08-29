"use client";

import dynamic from "next/dynamic";

const DonutChartWidget = dynamic(() => import("./DonutChartWidget"), {
  ssr: false,
});

export default DonutChartWidget;
export type { DonutDatum } from "./DonutChartWidget";
