import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const StatusCards = ({ countData }) => {
  const { t } = useTranslation();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const total = countData?.total || 0;
  const pending = countData?.pending || 0;
  const completed = countData?.completed || 0;

  const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: [t("EKYC_COMPLETED"), t("EKYC_PENDING")],
          datasets: [
            {
              data: [completed, pending],
              backgroundColor: ["#1a3a6b", "#add8f7"],
              borderColor: ["#ffffff", "#ffffff"],
              borderWidth: 2,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          cutout: "72%",
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.label || "";
                  if (label) label += ": ";
                  if (context.parsed !== null) label += context.parsed;
                  return label;
                },
              },
            },
          },
          maintainAspectRatio: true,
          responsive: true,
          aspectRatio: 1,
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [pending, completed, t]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num || 0);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", width: "100%" }}>

      {/* Title */}
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "1px", marginBottom: "16px", textTransform: "uppercase" }}>
        {t("EKYC_TOTAL_SUBMISSIONS") || "TOTAL SUBMISSIONS"}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* LEFT — Legend + Total */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          {/* Completed */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#1a3a6b", flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: "14px", color: "#333" }}>
              {t("EKYC_COMPLETED")}:{" "}
              <strong style={{ color: "#1a3a6b" }}>{formatNumber(completed)}</strong>
            </span>
          </div>

          {/* Pending */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#add8f7", flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: "14px", color: "#333" }}>
              {t("EKYC_PENDING")}:{" "}
              <strong style={{ color: "#1a3a6b" }}>{formatNumber(pending)}</strong>
            </span>
          </div>

          {/* Total Lifetime */}
          <div style={{ marginTop: "12px" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#1a3a6b", lineHeight: 1 }}>
              {formatNumber(total)}
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
              {t("EKYC_TOTAL_LIFETIME") || "Total Lifetime Applications"}
            </div>
          </div>
        </div>

        {/* RIGHT — Doughnut Chart */}
        <div style={{ width: "130px", height: "130px", position: "relative", flexShrink: 0, marginLeft: "auto" }}>
          <canvas ref={chartRef} style={{ maxWidth: "100%", maxHeight: "100%" }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center", pointerEvents: "none"
          }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a3a6b", lineHeight: 1 }}>
              {efficiency}%
            </div>
            {/* <div style={{ fontSize: "10px", color: "#888", letterSpacing: "0.5px", marginTop: "2px", textTransform: "uppercase" }}>
              {t("EKYC_EFFICIENCY") || "EFFICIENCY"}
            </div> */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatusCards;