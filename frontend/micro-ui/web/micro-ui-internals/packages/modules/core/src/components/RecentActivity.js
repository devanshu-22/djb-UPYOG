import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Icons = {
    UserPlus: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
    ),
    Check: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    FileUp: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="12" y2="12" /><line x1="15" y1="15" x2="12" y2="12" /></svg>
    ),
    Send: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
    ),
    XCircle: ({ size = 18 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
    ),
    ArrowRight: ({ size = 14 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
};

const RecentActivity = () => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Extended mock data to show "Complete Data" in the modal
    const activities = [
        { id: 1, action: "New Employee Added", time: "2 hrs ago", bgHex: "#eff6ff", iconHex: "#2563eb", Icon: Icons.UserPlus },
        { id: 2, action: "Water Connection Approved", time: "5 hrs ago", bgHex: "#dcfce7", iconHex: "#16a34a", Icon: Icons.Check },
        { id: 3, action: "Document Uploaded", time: "1 day ago", bgHex: "#fef3c7", iconHex: "#d97706", Icon: Icons.FileUp },
        { id: 4, action: "Survey Published", time: "2 days ago", bgHex: "#f3e8ff", iconHex: "#9333ea", Icon: Icons.Send },
        { id: 5, action: "Trade License Renewed", time: "3 days ago", bgHex: "#dcfce7", iconHex: "#16a34a", Icon: Icons.Check },
        { id: 6, action: "Property Tax Paid", time: "4 days ago", bgHex: "#eff6ff", iconHex: "#2563eb", Icon: Icons.FileUp },
        { id: 7, action: "Grievance Resolved", time: "1 week ago", bgHex: "#dcfce7", iconHex: "#16a34a", Icon: Icons.Check }
    ];

    return (
        <React.Fragment>
            <div className="recent-activity-wrapper static-card" style={{ padding: "16px 0 0 0" }}>
                <div className="ra-header" style={{ padding: "0 16px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div className="ra-header-square-icon" style={{ backgroundColor: "#2563eb" }}></div>
                        <h3 style={{ fontSize: "16px", margin: 0, color: "#0f172a" }}>{t("Recent Activity")}</h3>
                    </div>
                    <div className="ra-footer" style={{ padding: "12px 0", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "center" }}>
                    <button className="ra-view-all" onClick={() => setIsModalOpen(true)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                        {t("View All")} <Icons.ArrowRight size={14} />
                    </button>
                </div>
                </div>

                <div className="compact-list" style={{ padding: 0 }}>
                    {/* Shows only the first 3 items on the card */}
                    {activities.slice(0, 3).map((activity) => {
                        const IconComponent = activity.Icon;
                        return (
                            <div key={activity.id} className="ra-compact-item" style={{ cursor: "pointer" }} onClick={() => setIsModalOpen(true)}>
                                <div className="ra-icon-circle" style={{ backgroundColor: activity.bgHex, color: activity.iconHex }}>
                                    <IconComponent size={16} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>{activity.action}</span>
                                    <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{activity.time}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View All Footer */}
                
            </div>

            {/* Modal for Complete Data */}
            {isModalOpen && (
                <div className="ra-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="ra-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ra-modal-header">
                            <h3>{t("All Recent Activity")}</h3>
                            <button className="ra-modal-close" onClick={() => setIsModalOpen(false)}>
                                <Icons.XCircle size={24} />
                            </button>
                        </div>
                        <div className="custom-modal-body" style={{ padding: 0 }}>
                            {/* Shows all items inside the modal */}
                            {activities.map((activity) => {
                                const IconComponent = activity.Icon;
                                return (
                                    <div key={activity.id} className="ra-compact-item" style={{ padding: "16px" }}>
                                        <div className="ra-icon-circle" style={{ backgroundColor: activity.bgHex, color: activity.iconHex }}>
                                            <IconComponent size={18} />
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>{activity.action}</span>
                                            <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{activity.time}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default RecentActivity;