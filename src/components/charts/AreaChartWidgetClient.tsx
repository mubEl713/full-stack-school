"use client";

import dynamic from "next/dynamic";

const AreaChartWidget = dynamic(() => import("./AreaChartWidget"), {
  ssr: false,
});

export default AreaChartWidget;
export type { AreaDatum } from "./AreaChartWidget";
