import React, { useState, useMemo } from "react";
import { Card, Dropdown, Toast, Table } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";

// ─── Icons ────────────────────────────────────────────────────────────────────

const UserIcon = ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const DiaryIcon = ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const TrashIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const EditIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const MapPinIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const PlusIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const SaveIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

const CheckIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ─── Static Mock Data ─────────────────────────────────────────────────────────

const MOCK_SURVEYORS = [
    { name: "Amit Kumar", id: "SVR001", role: "Surveyor" },
    { name: "Sanjay Singh", id: "SVR002", role: "Surveyor" },
    { name: "Rahul Sharma", id: "SVR003", role: "Surveyor" },
    { name: "Priya Verma", id: "SVR004", role: "Surveyor" },
];

const MOCK_MRDS = [
    { name: "MRD - 01 (Central Zone)", code: "MRD01", zone: "Central" },
    { name: "MRD - 02 (North Zone)", code: "MRD02", zone: "North" },
    { name: "MRD - 03 (South Zone)", code: "MRD03", zone: "South" },
    { name: "MRD - 04 (West Zone)", code: "MRD04", zone: "West" },
    { name: "MRD - 05 (East Zone)", code: "MRD05", zone: "East" },
    { name: "MRD - 06 (Rohini)", code: "MRD06", zone: "Rohini" },
    { name: "MRD - 07 (Dwarka)", code: "MRD07", zone: "Dwarka" },
];

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

const ConfirmDeleteModal = ({ mapping, onConfirm, onCancel }) => (
    <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
        <div style={{
            background: "#fff", borderRadius: "12px", padding: "28px 28px 24px",
            width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "#FEF3F2", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <TrashIcon size={18} />
                </div>
                <div>
                    <div style={{ fontWeight: "700", fontSize: "16px", color: "#0D1B2A" }}>Remove Mapping</div>
                    <div style={{ fontSize: "12px", color: "#6B7B8E" }}>This action cannot be undone</div>
                </div>
            </div>
            <p style={{ fontSize: "13px", color: "#344054", marginBottom: "24px", lineHeight: "1.6" }}>
                Are you sure you want to remove the mapping between{" "}
                <strong>{mapping?.surveyorName}</strong> and <strong>{mapping?.mrdName}</strong>?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button onClick={onCancel} style={{
                    background: "none", border: "1px solid #D0D5DD", borderRadius: "8px",
                    padding: "8px 20px", fontWeight: "600", fontSize: "13px",
                    color: "#344054", cursor: "pointer",
                }}>Cancel</button>
                <button onClick={onConfirm} style={{
                    background: "#B42318", border: "none", borderRadius: "8px",
                    padding: "8px 20px", fontWeight: "600", fontSize: "13px",
                    color: "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                }}>
                    <TrashIcon size={13} /> Remove
                </button>
            </div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Mapping = () => {
    const { t } = useTranslation();

    // Form state
    const [selectedSurveyor, setSelectedSurveyor] = useState(null);
    const [selectedMRD, setSelectedMRD] = useState(null);

    // Mappings list
    const [mappings, setMappings] = useState([]);

    // Edit state: stores the id of the row being edited + its draft values
    const [editingId, setEditingId] = useState(null);
    const [editSurveyor, setEditSurveyor] = useState(null);
    const [editMRD, setEditMRD] = useState(null);

    // Delete confirm modal
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [toast, setToast] = useState(null);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAddMapping = () => {
        if (!selectedSurveyor || !selectedMRD) {
            setToast({ type: "error", message: t("EKYC_SELECT_BOTH_ERROR") || "Please select both Surveyor and MRD" });
            return;
        }
        const exists = mappings.some(
            m => m.surveyorId === selectedSurveyor.id && m.mrdCode === selectedMRD.code
        );
        if (exists) {
            setToast({ type: "warning", message: t("EKYC_MAPPING_EXISTS") || "This mapping already exists" });
            return;
        }
        setMappings(prev => [...prev, {
            id: Date.now(),
            surveyorName: selectedSurveyor.name,
            surveyorId: selectedSurveyor.id,
            mrdName: selectedMRD.name,
            mrdCode: selectedMRD.code,
            zone: selectedMRD.zone,
        }]);
        setSelectedMRD(null);
        setToast({ type: "success", message: t("EKYC_MAPPING_ADDED") || "Mapping added successfully" });
    };

    const handleEditStart = (row) => {
        setEditingId(row.id);
        setEditSurveyor(MOCK_SURVEYORS.find(s => s.id === row.surveyorId) || null);
        setEditMRD(MOCK_MRDS.find(m => m.code === row.mrdCode) || null);
    };

    const handleEditSave = (id) => {
        if (!editSurveyor || !editMRD) {
            setToast({ type: "error", message: "Please select both Surveyor and MRD to save" });
            return;
        }
        // Check duplicate (excluding self)
        const duplicate = mappings.some(
            m => m.id !== id && m.surveyorId === editSurveyor.id && m.mrdCode === editMRD.code
        );
        if (duplicate) {
            setToast({ type: "warning", message: "This mapping already exists" });
            return;
        }
        setMappings(prev => prev.map(m => m.id !== id ? m : {
            ...m,
            surveyorName: editSurveyor.name,
            surveyorId: editSurveyor.id,
            mrdName: editMRD.name,
            mrdCode: editMRD.code,
            zone: editMRD.zone,
        }));
        setEditingId(null);
        setToast({ type: "success", message: "Mapping updated successfully" });
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditSurveyor(null);
        setEditMRD(null);
    };

    const handleDeleteConfirm = () => {
        setMappings(prev => prev.filter(m => m.id !== deleteTarget.id));
        setDeleteTarget(null);
        setToast({ type: "info", message: t("EKYC_MAPPING_REMOVED") || "Mapping removed" });
    };

    const handleSaveMappings = () => {
        if (mappings.length === 0) {
            setToast({ type: "error", message: t("EKYC_NO_MAPPINGS_TO_SAVE") || "No mappings to save" });
            return;
        }
        // TODO: replace with real API call
        setToast({ type: "success", message: t("EKYC_MAPPINGS_SAVED_SUCCESS") || "Surveyor mappings saved successfully!" });
    };

    // ── Table columns ─────────────────────────────────────────────────────────

    const columns = useMemo(() => [
        {
            Header: t("EKYC_SURVEYOR_NAME") || "Surveyor",
            accessor: "surveyorName",
            Cell: ({ row }) => {
                const isEditing = editingId === row.original.id;
                if (isEditing) {
                    return (
                        <div style={{ minWidth: "180px" }}>
                            <Dropdown
                                selected={editSurveyor}
                                select={setEditSurveyor}
                                option={MOCK_SURVEYORS}
                                optionKey="name"
                                t={t}
                                placeholder="Choose surveyor..."
                            />
                        </div>
                    );
                }
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: "#EEF4FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <UserIcon size={15} color="#3A7BD5" />
                        </div>
                        <div>
                            <div style={{ fontWeight: "600", fontSize: "13px", color: "#0D1B2A" }}>{row.original.surveyorName}</div>
                            <div style={{ fontSize: "11px", color: "#6B7B8E" }}>ID: {row.original.surveyorId}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: t("EKYC_MRD_ASSIGNED") || "MRD Assigned",
            accessor: "mrdName",
            Cell: ({ row }) => {
                const isEditing = editingId === row.original.id;
                if (isEditing) {
                    return (
                        <div style={{ minWidth: "200px" }}>
                            <Dropdown
                                selected={editMRD}
                                select={setEditMRD}
                                option={MOCK_MRDS}
                                optionKey="name"
                                t={t}
                                placeholder="Choose MRD..."
                            />
                        </div>
                    );
                }
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: "#EEF4FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <DiaryIcon size={15} color="#3A7BD5" />
                        </div>
                        <div>
                            <div style={{ fontWeight: "600", fontSize: "13px", color: "#0D1B2A" }}>{row.original.mrdName}</div>
                            <div style={{ fontSize: "11px", color: "#3A7BD5", display: "flex", alignItems: "center", gap: "3px" }}>
                                <MapPinIcon size={10} /> {row.original.zone}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: t("ES_COMMON_ACTION") || "Actions",
            Cell: ({ row }) => {
                const isEditing = editingId === row.original.id;
                if (isEditing) {
                    return (
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={() => handleEditSave(row.original.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    background: "#3A7BD5", color: "#fff",
                                    border: "none", borderRadius: "6px",
                                    padding: "6px 12px", fontWeight: "600",
                                    fontSize: "12px", cursor: "pointer",
                                }}
                            >
                                <CheckIcon size={13} /> Save
                            </button>
                            <button
                                onClick={handleEditCancel}
                                style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    background: "none", border: "1px solid #D0D5DD",
                                    borderRadius: "6px", padding: "6px 12px",
                                    fontWeight: "600", fontSize: "12px",
                                    color: "#344054", cursor: "pointer",
                                }}
                            >
                                <XIcon size={13} /> Cancel
                            </button>
                        </div>
                    );
                }
                return (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            onClick={() => handleEditStart(row.original)}
                            style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                background: "none", border: "1px solid #D0D5DD",
                                borderRadius: "6px", padding: "6px 12px",
                                color: "#344054", fontSize: "12px",
                                fontWeight: "600", cursor: "pointer",
                            }}
                        >
                            <EditIcon size={13} /> Edit
                        </button>
                        <button
                            onClick={() => setDeleteTarget(row.original)}
                            style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                background: "none", border: "1px solid #FECDCA",
                                borderRadius: "6px", padding: "6px 12px",
                                color: "#B42318", fontSize: "12px",
                                fontWeight: "600", cursor: "pointer",
                            }}
                        >
                            <TrashIcon size={13} /> Remove
                        </button>
                    </div>
                );
            },
        },
    ], [editingId, editSurveyor, editMRD, mappings, t]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{ background: "#F5F7FA", minHeight: "100vh", padding: "0" }}>

            {/* Page Header Bar */}
            <Card style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px", marginBottom: "0", borderRadius: "4px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ color: "#3A8DCC" }}>
                        <DiaryIcon size={24} />
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "18px", color: "#0B0C0C" }}>
                        {t("EKYC_SURVEYOR_MAPPING") || "Surveyor Mapping"}
                    </div>
                </div>
                <button
                    onClick={handleSaveMappings}
                    disabled={mappings.length === 0}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: mappings.length === 0 ? "#D0D5DD" : "#0F3460",
                        color: "#fff", border: "none", borderRadius: "8px",
                        padding: "10px 20px", fontWeight: "600", fontSize: "14px",
                        cursor: mappings.length === 0 ? "not-allowed" : "pointer",
                        transition: "background 0.2s",
                    }}
                >
                    <SaveIcon size={15} />
                    {t("EKYC_SAVE_MAPPINGS") || "Save Mappings"}
                </button>
            </Card>

            {/* Content */}
            <div style={{ padding: "24px 32px" }}>
                <p style={{ fontSize: "13px", color: "#6B7B8E", marginBottom: "24px", marginTop: "0" }}>
                    {t("EKYC_MAPPING_SUBHEADER") || "Assign Meter Reading Dairies to surveyors to manage their data access."}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "20px", alignItems: "start" }}>

                    {/* ── Left: New Mapping Panel ── */}
                    <div style={{
                        background: "#fff", borderRadius: "12px",
                        border: "1px solid #E5E9EF", overflow: "hidden",
                    }}>
                        {/* Header */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "16px 20px", borderBottom: "1px solid #F0F2F5", background: "#FAFBFC",
                        }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                background: "#EEF4FB", display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <DiaryIcon size={16} color="#3A7BD5" />
                            </div>
                            <span style={{ fontWeight: "700", fontSize: "15px", color: "#0D1B2A" }}>
                                {t("EKYC_NEW_MAPPING") || "New Mapping"}
                            </span>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "20px" }}>
                            {/* Surveyor */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em",
                                    color: "#3A7BD5", textTransform: "uppercase", marginBottom: "8px",
                                }}>
                                    <UserIcon size={12} color="#3A7BD5" />
                                    {t("EKYC_SELECT_SURVEYOR") || "Select Surveyor"}
                                </label>
                                <Dropdown
                                    selected={selectedSurveyor}
                                    select={setSelectedSurveyor}
                                    option={MOCK_SURVEYORS}
                                    optionKey="name"
                                    t={t}
                                    placeholder={t("EKYC_SELECT_SURVEYOR_PLACEHOLDER") || "Choose a surveyor..."}
                                />
                            </div>

                            {/* MRD */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em",
                                    color: "#3A7BD5", textTransform: "uppercase", marginBottom: "8px",
                                }}>
                                    <DiaryIcon size={12} color="#3A7BD5" />
                                    {t("EKYC_SELECT_MRD") || "Select MRD"}
                                </label>
                                <Dropdown
                                    selected={selectedMRD}
                                    select={setSelectedMRD}
                                    option={MOCK_MRDS}
                                    optionKey="name"
                                    t={t}
                                    placeholder={t("EKYC_SELECT_MRD_PLACEHOLDER") || "Choose an MRD..."}
                                />
                            </div>

                            {/* MRD Info Preview */}
                            {selectedMRD && (
                                <div style={{
                                    background: "#EEF4FB", borderLeft: "3px solid #3A7BD5",
                                    borderRadius: "6px", padding: "10px 14px",
                                    fontSize: "12px", color: "#0D1B2A", marginBottom: "16px",
                                    display: "flex", alignItems: "center", gap: "8px",
                                }}>
                                    <MapPinIcon size={13} />
                                    <span><strong>{selectedMRD.name}</strong> — {selectedMRD.zone} Zone</span>
                                </div>
                            )}

                            {/* Surveyor Preview */}
                            {selectedSurveyor && (
                                <div style={{
                                    background: "#F5F7FA", borderLeft: "3px solid #6B7B8E",
                                    borderRadius: "6px", padding: "10px 14px",
                                    fontSize: "12px", color: "#0D1B2A", marginBottom: "16px",
                                    display: "flex", alignItems: "center", gap: "8px",
                                }}>
                                    <UserIcon size={13} color="#6B7B8E" />
                                    <span><strong>{selectedSurveyor.name}</strong> — {selectedSurveyor.id}</span>
                                </div>
                            )}

                            {/* Add Button */}
                            <button
                                onClick={handleAddMapping}
                                disabled={!selectedSurveyor || !selectedMRD}
                                style={{
                                    width: "100%",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    background: (!selectedSurveyor || !selectedMRD) ? "#D0D5DD" : "#3A7BD5",
                                    color: "#fff", border: "none", borderRadius: "8px",
                                    padding: "12px", fontWeight: "600", fontSize: "14px",
                                    cursor: (!selectedSurveyor || !selectedMRD) ? "not-allowed" : "pointer",
                                    marginTop: "4px", transition: "background 0.2s",
                                }}
                            >
                                <PlusIcon size={16} />
                                {t("EKYC_ADD_TO_LIST") || "Add to Mapping List"}
                            </button>
                        </div>

                        {/* Stats Footer */}
                        {mappings.length > 0 && (
                            <div style={{
                                padding: "12px 20px", borderTop: "1px solid #F0F2F5",
                                background: "#FAFBFC", display: "flex", gap: "16px",
                            }}>
                                <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#0F3460" }}>
                                        {mappings.length}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#6B7B8E" }}>Total Mappings</div>
                                </div>
                                <div style={{ width: "1px", background: "#E5E9EF" }} />
                                <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#0F3460" }}>
                                        {[...new Set(mappings.map(m => m.surveyorId))].length}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#6B7B8E" }}>Surveyors</div>
                                </div>
                                <div style={{ width: "1px", background: "#E5E9EF" }} />
                                <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#0F3460" }}>
                                        {[...new Set(mappings.map(m => m.mrdCode))].length}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#6B7B8E" }}>MRDs</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Summary Table Panel ── */}
                    <div style={{
                        background: "#fff", borderRadius: "12px",
                        border: "1px solid #E5E9EF", overflow: "hidden", minHeight: "420px",
                    }}>
                        {/* Header */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "16px 20px", borderBottom: "1px solid #F0F2F5", background: "#FAFBFC",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "32px", height: "32px", borderRadius: "8px",
                                    background: "#EEF4FB", display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <UserIcon size={16} color="#3A7BD5" />
                                </div>
                                <span style={{ fontWeight: "700", fontSize: "15px", color: "#0D1B2A" }}>
                                    {t("EKYC_MAPPING_SUMMARY") || "Mapping Summary"}
                                </span>
                            </div>
                            <span style={{
                                background: mappings.length > 0 ? "#0F3460" : "#E5E9EF",
                                color: mappings.length > 0 ? "#fff" : "#6B7B8E",
                                fontSize: "12px", fontWeight: "700",
                                padding: "3px 10px", borderRadius: "20px",
                            }}>
                                {mappings.length} {t("EKYC_ITEMS") || "items"}
                            </span>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "20px" }}>
                            {mappings.length > 0 ? (
                                <div style={{ border: "1px solid #E5E9EF", borderRadius: "8px", overflow: "hidden" }}>
                                    <Table
                                        t={t}
                                        data={mappings}
                                        columns={columns}
                                        getCellProps={() => ({})}
                                        tableClassName="digit-table"
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    minHeight: "320px", textAlign: "center",
                                }}>
                                    <div style={{ marginBottom: "16px", opacity: 0.2 }}>
                                        <DiaryIcon size={56} color="#0F3460" />
                                    </div>
                                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0D1B2A", marginBottom: "6px" }}>
                                        {t("EKYC_NO_MAPPINGS") || "No Mappings Created Yet"}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#6B7B8E" }}>
                                        {t("EKYC_NO_MAPPINGS_HINT") || "Select a surveyor and MRD on the left to get started."}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    mapping={deleteTarget}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast
                    label={toast.message}
                    error={toast.type === "error"}
                    warning={toast.type === "warning"}
                    isDsc={true}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Mapping;