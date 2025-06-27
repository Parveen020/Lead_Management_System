import React, { useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminContext } from "../../Context/AdminContext";

const getLast8Days = () => {
  const days = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString("en-IN", { weekday: "short" }));
  }
  return days;
};

const Charts = () => {
  const { salesAnalytics } = useContext(AdminContext);
  const days = getLast8Days();
  const chartData = salesAnalytics.map((val, i) => ({
    name: days[i],
    value: val,
  }));

  return (
    <div style={{ width: "100%", height: "110%" }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(val) => `${val} leads`} />

          <Bar
            dataKey="value"
            fill="#D9D9D9"
            radius={[10, 10, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
