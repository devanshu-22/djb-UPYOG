import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Icons = {
    Calendar: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    XCircle: ({ size = 18 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
    )
};

const NewsAndEvents = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("documents");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Data organized by tabs
    const tabData = {
        documents: [
            { id: 1, title: "Review Vendor Applications", count: 2, rightText: "Today", color: "#3b82f6" },
            { id: 2, title: "Finance Reports", rightText: "Due: 30 Apr", rightTextDanger: true, color: "#f59e0b" },
            { id: 3, title: "Tax Assessment Forms", count: 12, rightText: "Pending", color: "#8b5cf6" },
            { id: 4, title: "Building Plan Approvals", count: 4, rightText: "Overdue", rightTextDanger: true, color: "#ef4444" }
        ],
        events: [
            { id: 1, title: "Monthly Townhall", rightText: "15 Oct", color: "#10b981" },
            { id: 2, title: "System Maintenance", rightText: "Sunday", color: "#ef4444" },
            { id: 3, title: "Vendor Onboarding Workshop", rightText: "22 Oct", color: "#3b82f6" },
            { id: 4, title: "Q3 Planning Session", rightText: "28 Oct", color: "#8b5cf6" }
        ],
        surveys: [
            { id: 1, title: "Survey Responses Pending", count: 5, rightText: "The West", color: "#0ea5e9" },
            { id: 2, title: "Employee Satisfaction", count: 85, rightText: "Completed", color: "#10b981" },
            { id: 3, title: "Infrastructure Feedback", count: 12, rightText: "Active", color: "#f59e0b" },
            { id: 4, title: "Public Transport Survey", count: 0, rightText: "Draft", color: "#64748b" }
        ]
    };

    const currentData = tabData[activeTab];

    return (
        <React.Fragment>
            <div className="recent-activity-wrapper static-card" style={{ padding: "16px 0 0 0" }}>
                <div className="ra-header" style={{ padding: "0 16px", borderBottom: "none", display:"flex", justifyContent:"space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                        <div className="ra-header-square-icon" style={{ backgroundColor: "#0ea5e9" }}></div>
                        <h3 style={{ fontSize: "16px", margin: 0, color: "#0f172a" }}>{t("Upcoming Events & Latest Updates")}</h3>
                    </div>
                    <div className="ra-footer" style={{ padding: "12px 0" }}>
                    <button className="ra-view-all" onClick={() => setIsModalOpen(true)} style={{ color: "#2563eb" }}>
                        <Icons.Calendar size={16} /> <span style={{ marginLeft: "6px" }}>{t("View All")}</span>
                    </button>   
                </div>
                </div>

                <div className="custom-tabs-header">
                    <button className={`custom-tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
                        {t("Documents")}
                    </button>
                    <button className={`custom-tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                        {t("Events")}
                    </button>
                    <button className={`custom-tab-btn ${activeTab === 'surveys' ? 'active' : ''}`} onClick={() => setActiveTab('surveys')}>
                        {t("Surveys")}
                    </button>
                </div>

                <div className="compact-list">
                    {currentData.slice(0, 3).map((item) => (
                        <div key={item.id} className="compact-list-item">
                            <div className="dot-indicator" style={{ backgroundColor: item.color }}></div>
                            <span className="compact-title">{item.title}</span>
                            {item.count !== undefined && <span className="compact-badge">{item.count}</span>}
                            <span className={`compact-right-text ${item.rightTextDanger ? 'danger' : ''}`}>
                                {item.rightText}
                            </span>
                        </div>
                    ))}
                </div>

                
            </div>

            {isModalOpen && (
                <div className="ra-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="ra-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ra-modal-header">
                            <h3>{t(`All ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}</h3>
                            <button className="ra-modal-close" onClick={() => setIsModalOpen(false)}>
                                <Icons.XCircle size={24} />
                            </button>
                        </div>
                        <div className="custom-modal-body" style={{ padding: 0 }}>
                            {currentData.map((item) => (
                                <div key={item.id} className="compact-list-item" style={{ padding: "16px" }}>
                                    <div className="dot-indicator" style={{ backgroundColor: item.color }}></div>
                                    <span className="compact-title">{item.title}</span>
                                    {item.count !== undefined && <span className="compact-badge">{item.count}</span>}
                                    <span className={`compact-right-text ${item.rightTextDanger ? 'danger' : ''}`}>
                                        {item.rightText}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default NewsAndEvents;