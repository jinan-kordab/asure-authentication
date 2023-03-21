import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import Chart from "chart.js/auto";

function BiorhythmChart({ birthDate, startDate, endDate }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const chartWidth = 800; 
  const goldenRatio = 1.618;
  const chartHeight = chartWidth / goldenRatio;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Check if a chart instance already exists and destroy it
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Get the number of days between the start date and end date
    const days = moment(endDate).diff(moment(startDate), "days");

    // Calculate the biorhythm values for each day in the range
    const biorhythmData = [];
    for (let i = 0; i <= days; i++) {
      const date = moment(startDate).add(i, "days");
      const physical = Math.sin(
        (2 * Math.PI * date.diff(moment(birthDate), "days")) / 23
      );
      const emotional = Math.sin(
        (2 * Math.PI * date.diff(moment(birthDate), "days")) / 28
      );
      const intellectual = Math.sin(
        (2 * Math.PI * date.diff(moment(birthDate), "days")) / 33
      );
      biorhythmData.push({
        date,
        physical,
        emotional,
        intellectual,
      });
    }

    // Create the chart
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: biorhythmData.map((item) => item.date.format("MMM DD")),
        datasets: [
          {
            label: "Physical",
            data: biorhythmData.map((item) => item.physical),
            borderColor: "red",
            borderWidth: 1,
            fill: false,
          },
          {
            label: "Emotional",
            data: biorhythmData.map((item) => item.emotional),
            borderColor: "green",
            borderWidth: 1,
            fill: false,
          },
          {
            label: "Intellectual",
            data: biorhythmData.map((item) => item.intellectual),
            borderColor: "blue",
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              maxRotation: 60, // Set maxRotation to 0
              autoSkip: true, // Set autoSkip to false
            },
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            title: {
              display: true,
              text: "Biorhythm Value",
            },
            ticks: {
              suggestedMin: -1,
              suggestedMax: 1,
            },
          },
        },
      },
    });
    // Store the chart instance in the ref
    chartRef.current = newChart;

    return () => {
      // Clean up the chart instance on unmount
      chartRef.current.destroy();
    };
  }, [birthDate, startDate, endDate]);

  return (
    // <div style={{ height: '400px', width:'100%' }}>
    <div style={{ height: `${chartHeight}px` }}>
      <canvas ref={canvasRef} style={{ height: "300px", width: "700px" }} />
    </div>
  );
}

export default BiorhythmChart;
