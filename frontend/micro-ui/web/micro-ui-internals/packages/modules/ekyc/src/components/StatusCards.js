import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const StatusCards = ({ countData }) => {
  const { t } = useTranslation();
  const chartRef1 = useRef(null);
  const chartInstance1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartInstance2 = useRef(null);

  const total = countData?.total || 0;
  const pending = countData?.pending || 0;
  const active = countData?.completed || 0; // Showing completed data as active
  const completed = 0; // Forced to 0
  const rejected = countData?.rejected || 0;

  const actualCompleted = countData?.completed || 0;
  const applied = total;
  const approved = actualCompleted;

  const efficiency = total > 0 ? Math.round((actualCompleted / total) * 100) : 0;

  useEffect(() => {
    // Chart 1: Status Breakdown
    if (chartRef1.current) {
      if (chartInstance1.current) chartInstance1.current.destroy();
      const ctx1 = chartRef1.current.getContext("2d");
      chartInstance1.current = new Chart(ctx1, {
        type: "doughnut",
        data: {
          labels: [t("EKYC_ACTIVE"), t("EKYC_COMPLETED"), t("EKYC_PENDING")],
          datasets: [{
            data: [active, completed, pending],
            backgroundColor: ["#1a3a6b", "#77B6EA", "#3d84ed"],
            borderColor: ["#ffffff", "#ffffff", "#ffffff"],
            borderWidth: 2,
            hoverOffset: 4,
          }],
        },
        options: {
          cutout: "75%",
          plugins: { legend: { display: false } },
          maintainAspectRatio: true,
          responsive: true,
          aspectRatio: 1,
        },
      });
    }

    // Chart 2: Applied vs Approved
    if (chartRef2.current) {
      if (chartInstance2.current) chartInstance2.current.destroy();
      const ctx2 = chartRef2.current.getContext("2d");
      chartInstance2.current = new Chart(ctx2, {
        type: "doughnut",
        data: {
          labels: [t("EKYC_APPROVED"), t("EKYC_OTHERS")],
          datasets: [{
            data: [approved, Math.max(0, applied - approved)],
            backgroundColor: ["#219653", "#E0E0E0"],
            borderColor: ["#ffffff", "#ffffff"],
            borderWidth: 2,
            hoverOffset: 4,
          }],
        },
        options: {
          cutout: "75%",
          plugins: { legend: { display: false } },
          maintainAspectRatio: true,
          responsive: true,
          aspectRatio: 1,
        },
      });
    }

    return () => {
      if (chartInstance1.current) chartInstance1.current.destroy();
      if (chartInstance2.current) chartInstance2.current.destroy();
    };
  }, [pending, completed, active, applied, approved, t]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num || 0);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>

        {/* Statistics Section */}
        <div style={{ flex: "1", minWidth: "250px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "1px", marginBottom: "16px", textTransform: "uppercase" }}>
            {t("EKYC_DASHBOARD_METRICS") || "DASHBOARD METRICS"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Active */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#1a3a6b", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "#333" }}>
                {t("EKYC_ACTIVE")}: <strong style={{ color: "#1a3a6b" }}>{formatNumber(active)}</strong>
              </span>
            </div>

            {/* Pending */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#3d84ed", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "#333" }}>
                {t("EKYC_PENDING")}: <strong style={{ color: "#1a3a6b" }}>{formatNumber(pending)}</strong>
              </span>
            </div>

            {/* Completed */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#77B6EA", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "#333" }}>
                {t("EKYC_COMPLETED")}: <strong style={{ color: "#1a3a6b" }}>{formatNumber(completed)}</strong>
              </span>
            </div>

            {/* Total Section */}
            <div style={{ marginTop: "20px", padding: "16px", background: "#f8faff", borderRadius: "8px", border: "1px solid #eef2f6" }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: "#1a3a6b", lineHeight: 1 }}>
                {formatNumber(total)}
              </div>
              <div style={{ fontSize: "12px", color: "#667085", marginTop: "4px", fontWeight: "600" }}>
                {t("EKYC_TOTAL_APPLICATIONS") || "Total Applications Applied"}
              </div>
            </div>
          </div>
        </div>

        {/* Visualizations Section */}
        <div style={{ display: "flex", gap: "32px", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>

          {/* Chart 1: Status Breakdown */}
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "140px", height: "140px", position: "relative" }}>
              <canvas ref={chartRef1} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none", width: "100%" }}>
                {/* <div style={{ fontSize: "16px", fontWeight: "800", color: "#1a3a6b", lineHeight: 1.2 }}>
                  {formatNumber(active)} / {formatNumber(total)}
                </div> */}
                <div style={{ fontSize: "9px", color: "#667085", fontWeight: "700", marginTop: "4px" }}>
                  {efficiency}%
                </div>
              </div>
            </div>
            <div style={{ marginTop: "8px", fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>{t("EKYC_STATUS_BREAKDOWN")}</div>
          </div>

          {/* Chart 2: Applied vs Approved */}
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "140px", height: "140px", position: "relative" }}>
              <canvas ref={chartRef2} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none", width: "100%" }}>
                {/* <div style={{ fontSize: "16px", fontWeight: "800", color: "#219653", lineHeight: 1.2 }}>
                  {formatNumber(approved)} / {formatNumber(applied)}
                </div> */}
                <div style={{ fontSize: "9px", color: "#667085", fontWeight: "700", marginTop: "4px" }}>
                  {total > 0 ? Math.round((approved / total) * 100) : 0}%
                </div>
              </div>
            </div>
            <div style={{ marginTop: "8px", fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>{t("EKYC_SUBMISSION_HEALTH")}</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatusCards;