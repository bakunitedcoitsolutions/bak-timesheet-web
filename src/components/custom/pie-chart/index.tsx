"use client";
import { Chart } from "primereact/chart";
import { useState, useEffect } from "react";
import { ChartData, ChartOptions } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

export default function PieChart() {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const data: ChartData<"pie"> = {
      labels: ["Salaried", "Salaried (Deducted)", "Labor"],
      datasets: [
        {
          label: "Employee Distribution",
          data: [45, 45, 10],
          backgroundColor: [
            "#8B1A1A", // Dark red/maroon for Salaried
            "#FFD4C4", // Light peach/pink for Salaried (Deducted)
            "#87CEEB", // Light blue/cyan for Labor
          ],
          borderColor: ["#8B1A1A", "#FFD4C4", "#87CEEB"],
          borderWidth: 1,
          hoverBackgroundColor: [
            "#6B1414", // Darker on hover
            "#FFB8A0",
            "#6BB6D6",
          ],
          hoverBorderColor: ["#6B1414", "#FFB8A0", "#6BB6D6"],
        },
      ],
    };

    const options: ChartOptions<"pie"> = {
      maintainAspectRatio: false,
      responsive: true,
      aspectRatio: 1,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 13,
            },
            color: "#98A4AE",
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0
              );
              const percentage = ((value / total) * 100).toFixed(0);
              return `${label}: ${percentage}%`;
            },
          },
        },
        datalabels: {
          display: true,
          color: (context: any) => {
            // Use white for dark segments, dark color for light segments
            const colors = ["#fff", "#fff", "#fff"];
            return colors[context.dataIndex] || "#fff";
          },
          font: {
            weight: "bold",
            size: 14,
          },
          formatter: (value: number, context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(0);
            return `${percentage}%`;
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  return (
    <div className="w-full h-full min-w-0 overflow-x-auto relative flex items-center justify-center">
      <div className="w-full max-w-md">
        <Chart
          type="pie"
          data={chartData}
          options={chartOptions}
          plugins={[ChartDataLabels]}
        />
      </div>
    </div>
  );
}
