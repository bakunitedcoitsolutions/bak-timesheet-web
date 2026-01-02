"use client";
import { Chart } from "primereact/chart";
import { useState, useEffect } from "react";
import { ChartData, ChartOptions } from "chart.js";

export default function BarChart() {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const fullMonthName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const shortMonthName = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthNames: Record<"full" | "short", string[]> = {
    full: fullMonthName,
    short: shortMonthName,
  };

  useEffect(() => {
    const data: ChartData<"bar"> = {
      labels: [
        monthNames.short[0],
        monthNames.short[1],
        monthNames.short[2],
        monthNames.short[3],
        monthNames.short[4],
        monthNames.short[5],
        monthNames.short[6],
        monthNames.short[7],
        monthNames.short[8],
        monthNames.short[9],
        monthNames.short[10],
        monthNames.short[11],
      ],
      datasets: [
        {
          label: "Salary Expenses",
          data: [65, 59, 80, 81, 56, 55, 40, 30, 20, 59, 15, 81],
          borderColor: "#FAE7E9",
          backgroundColor: "#FAE7E9",
          borderRadius: 6,
          hoverBackgroundColor: "#af1e2e",
          hoverBorderColor: "#af1e2e",
        },
      ],
    };
    const options: ChartOptions<"bar"> = {
      maintainAspectRatio: false,
      responsive: true,
      aspectRatio: 0.64,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return ` ${context.dataset.label}: SAR ${context.raw}`;
            },
            title: (context) => {
              return `${monthNames.full[context[0].dataIndex]}`;
            },
          },
        },
      },

      scales: {
        x: {
          ticks: {
            color: "#98A4AE",
            font: {
              size: 13,
            },
          },
          grid: {
            color: "transparent",
          },
          border: {
            color: "#F6F7F9",
          },
        },
        y: {
          ticks: {
            color: "#98A4AE",
          },
          grid: {
            color: "#F6F7F9",
          },
          border: {
            color: "#F6F7F9",
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  return (
    <div className="w-full h-full min-w-0 overflow-x-auto relative">
      <Chart type="bar" data={chartData} options={chartOptions} />
    </div>
  );
}
