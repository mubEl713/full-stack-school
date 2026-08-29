"use client";

import dynamic from "next/dynamic";

const AttendanceChart = dynamic(() => import("./AttendanceChart"), {
  ssr: false,
});

export default AttendanceChart;
