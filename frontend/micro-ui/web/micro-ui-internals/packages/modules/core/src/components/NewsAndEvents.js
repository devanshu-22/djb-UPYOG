import React from "react";
import { useTranslation } from "react-i18next";

// Pure SVG Icons for News & Events
const Icons = {
    Megaphone: ({ size = 18 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
    ),
    CalendarEvent: ({ size = 18 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
    ),
    AlertBell: ({ size = 18 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
    ),
    Info: ({ size = 18 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
    ),
    ArrowRight: ({ size = 14 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
};

const NewsAndEvents = () => {
    const { t } = useTranslation();

    const newsItems = [
        {
            id: 1, title: "System Maintenance Scheduled",
            description: "The core PT application will undergo maintenance this Sunday.",
            date: "Today",
            bgHex: "#fff1f2", iconHex: "#e11d48", Icon: Icons.AlertBell
        },
        {
            id: 2, title: "New Training Materials Available",
            description: "Check the portal for updated guides on processing Trade Licenses.",
            date: "Yesterday",
            bgHex: "#eff6ff", iconHex: "#2563eb", Icon: Icons.Info
        },
        {
            id: 3, title: "Monthly Townhall Meeting",
            description: "Join the virtual meeting to discuss Q2 targets.",
            date: "Oct 15, 2026",
            bgHex: "#f0fdf4", iconHex: "#16a34a", Icon: Icons.CalendarEvent
        },
        {
            id: 4, title: "Policy Update: Vendor Registration",
            description: "New mandatory documents required for vendor onboarding.",
            date: "Oct 12, 2026",
            bgHex: "#fff7ed", iconHex: "#ea580c", Icon: Icons.Megaphone
        }
    ];

    return (
        <div className="recent-activity-wrapper static-card">
            <div className="ra-header">
                <div>
                    <h3>{t("News & Events")}</h3>
                    <p className="ra-subtitle">{t("Latest announcements and updates")}</p>
                </div>
                <button className="ra-view-all">
                    {t("All News")} <Icons.ArrowRight size={14} />
                </button>
            </div>

            <div className="ra-timeline">
                {newsItems.map((item, index) => {
                    const IconComponent = item.Icon;
                    return (
                        <div key={item.id} className="ra-item">
                            <div className="ra-indicator">
                                <div
                                    className="ra-icon-wrapper"
                                    style={{ backgroundColor: item.bgHex, color: item.iconHex }}
                                >
                                    <IconComponent size={18} />
                                </div>
                                {/* Center line */}
                                {index !== newsItems.length - 1 && <div className="ra-line"></div>}
                            </div>

                            <div className="ra-details">
                                <p className="ra-text" style={{ fontWeight: 600 }}>
                                    {item.title}
                                </p>
                                <p className="ra-text" style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                                    {item.description}
                                </p>
                                <div className="ra-meta" style={{ marginTop: "4px" }}>
                                    <span className="ra-time">{item.date}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NewsAndEvents;
