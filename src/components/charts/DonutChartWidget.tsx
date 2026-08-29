"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type DonutDatum = { name: string; value: number };

const COLORS = ["#C3EBFA", "#CFCEFF", "#FAE27C", "#FCA5A5", "#86EFAC", "#FDBA74"];

const DonutChartWidget = ({ data }: { data: DonutDatum[] }) => {
  const nonZero = data.filter((d) => d.value > 0);
  if (nonZero.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
        No payments recorded yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={nonZero}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
        >
          {nonZero.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChartWidget;
