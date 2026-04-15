import React, { useState, useRef, Fragment } from "react";
import {
    Card,
    CardLabel,
    TextInput,
    SubmitBar,
    CardHeader,
    ActionBar,
    Dropdown,
    InfoBannerIcon,
    HomeIcon,
} from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 11, color = "#fff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const BuildingIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z" />
    </svg>
);

const BriefcaseIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6H16V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6-2v2h-4V4h4z" />
    </svg>
);

const DocumentIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
    </svg>
);

const CameraIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L13 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
);

const TrashIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D92D20" strokeWidth="2" strokeLinecap="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const PidIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h5M7 12h8M7 16h4" />
    </svg>
);

// ─── Reusable: Section heading with inline rule ───────────────────────────────

const SectionHead = ({ icon, label }) => (
    <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "16px", marginTop: "4px",
    }}>
        <div style={{ opacity: 0.5, display: "flex" }}>{icon}</div>
        <span style={{ fontSize: "15px", fontWeight: "600", color: "#0B0C0C", whiteSpace: "nowrap" }}>
            {label}
        </span>
        <div style={{ flex: 1, height: "1px", background: "#EAECF0" }} />
    </div>
);

// ─── Reusable: Icon-prefixed input ────────────────────────────────────────────

const IconInput = ({ icon, ...props }) => (
    <div style={{ position: "relative", width: "100%" }}>
        <div style={{
            position: "absolute", left: "10px",
            top: "50%", transform: "translateY(-50%)",
            zIndex: 1, opacity: 0.45, display: "flex", pointerEvents: "none",
        }}>
            {icon}
        </div>
        <TextInput textInputStyle={{ paddingLeft: "36px", paddingRight: "12px" }} {...props} />
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PropertyInfo = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();

    const flowState = location.state || { kNumber: "EKYC-1234567890" };
    const { kNumber } = flowState;

    const tenantId = Digit.ULBService.getCurrentTenantId();
    const { data: dataV0 } = Digit.Hooks.ekyc.useGetPropertyType(tenantId);
    const { data: dataConn } = Digit.Hooks.ekyc.useGetConnectionTypeV2(tenantId);
    const { data: dataV1 } = Digit.Hooks.ekyc.useGetUserType(tenantId);
    const { data: dataV2 } = Digit.Hooks.ekyc.useGetFloorCount(tenantId);

    const [ownerType, setOwnerType] = useState("OWNER");
    const [pidNumber, setPidNumber] = useState("");
    const [connectionCategory, setConnectionCategory] = useState(null);
    const [connectionType, setConnectionType] = useState(null);
    const [userType, setUserType] = useState(null);
    const [noOfFloors, setNoOfFloors] = useState(null);
    const [propertyDocument, setPropertyDocument] = useState(null);
    const [buildingPhoto, setBuildingPhoto] = useState(null);

    const fileRef = useRef(null);
    const cameraRef = useRef(null);

    const handleSaveAndContinue = () => {
        history.push("/digit-ui/employee/ekyc/review", {
            ...flowState,
            propertyDetails: {
                ownerType, pidNumber, connectionType,
                connectionCategory, userType, noOfFloors,
                propertyDocument, buildingPhoto,
            },
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPropertyDocument(file);
    };

    const handlePhotoCapture = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setBuildingPhoto(reader.result);
        reader.readAsDataURL(file);
    };

    const connectionCategoryOptions =
        dataV0?.["ws-services-calculation"]?.propertyTypeV2?.map((item) => ({
            label: t(item.code), value: item.code,
        })) || [];

    const connectionTypeOptions =
        dataConn?.["ws-services-calculation"]?.connectionTypeV2?.map((item) => ({
            label: t(item.code), value: item.code,
        })) || [];

    const userTypeOptions =
        dataV1?.["ws-services-calculation"]?.userTypeV2?.map((item) => ({
            label: t(item.code), value: item.code,
        })) || [];

    const floorOptions =
        dataV2?.["ws-services-calculation"]?.floorCount?.map((item) => ({
            label: t(item.code), value: item.code,
        })) || [];

    return (
        <div className="inbox-container">
            <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* ── Sidebar ── */}
            <div className="filters-container">
                <Card style={{ display: "flex", alignItems: "center", padding: "12px 16px", marginBottom: "12px", borderRadius: "8px" }}>
                    <div style={{ color: "#185FA5", marginRight: "10px", display: "flex" }}>
                        <HomeIcon style={{ width: "20px", height: "20px" }} />
                    </div>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#0B0C0C" }}>
                        {t("EKYC_PROCESS") || "eKYC Process"}
                    </div>
                </Card>

                <div style={{ background: "#fff", padding: "16px 14px", borderRadius: "8px", border: "1px solid #EAECF0" }}>
                    {[
                        { label: t("EKYC_STEP_AADHAAR") || "Aadhaar", done: true, active: false },
                        { label: t("EKYC_STEP_ADDRESS") || "Address", done: true, active: false },
                        { label: t("EKYC_STEP_PROPERTY") || "Property", done: false, active: true },
                        { label: t("EKYC_STEP_REVIEW") || "Review", done: false, active: false },
                    ].map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", position: "relative", paddingBottom: i < 3 ? "18px" : 0 }}>
                            {i < 3 && (
                                <div style={{ position: "absolute", left: "10px", top: "22px", width: "1px", height: "calc(100% - 10px)", background: "#EAECF0" }} />
                            )}
                            <div style={{
                                width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                                border: step.done ? "none" : step.active ? "1.5px solid #185FA5" : "1.5px solid #D0D5DD",
                                background: step.done ? "#0F6E56" : step.active ? "#E6F1FB" : "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "10px", fontWeight: "500",
                                color: step.done ? "#fff" : step.active ? "#185FA5" : "#98A2B3",
                            }}>
                                {step.done ? <CheckIcon size={11} color="#fff" /> : i + 1}
                            </div>
                            <div style={{
                                fontSize: "12px", paddingTop: "2px",
                                color: step.done ? "#0F6E56" : step.active ? "#0B0C0C" : "#667085",
                                fontWeight: step.done || step.active ? "600" : "400",
                            }}>
                                {step.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Main Content ── */}
            <div style={{ flex: 1, marginLeft: "16px" }}>
                <Card>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <CardHeader style={{ margin: 0, fontSize: "18px" }}>
                            {t("EKYC_PROPERTY_DETAILS_HEADER") || "Property Details"}
                        </CardHeader>
                        <div style={{
                            background: "#F9FAFB", border: "0.5px solid #EAECF0",
                            borderRadius: "20px", padding: "4px 14px",
                            fontSize: "12px", color: "#667085",
                        }}>
                            {t("EKYC_K_NUMBER") || "K Number"}:{" "}
                            <span style={{ color: "#0B0C0C", fontWeight: "600" }}>{kNumber}</span>
                        </div>
                    </div>

                    <div style={{ animation: "fadeSlideIn 0.3s ease" }}>

                        {/* ── Property Details Section ── */}
                        <SectionHead
                            icon={<BriefcaseIcon size={16} />}
                            label={t("EKYC_PROPERTY_DETAILS") || "Property details"}
                        />

                        {/* Owner / Tenant Toggle */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                                {t("EKYC_PROPERTY_OWNER") || "Property owner"}
                            </div>
                            <div style={{ display: "flex", backgroundColor: "#F2F4F7", padding: "4px", borderRadius: "10px", gap: "4px" }}>
                                {["OWNER", "TENANT"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setOwnerType(type)}
                                        style={{
                                            flex: 1, padding: "9px 12px", borderRadius: "7px", border: "none", cursor: "pointer",
                                            fontSize: "13px", fontWeight: "600", transition: "all 0.15s",
                                            background: ownerType === type ? "#185FA5" : "transparent",
                                            color: ownerType === type ? "#fff" : "#667085",
                                        }}
                                    >
                                        {t(`EKYC_${type}`) || (type === "OWNER" ? "Owner" : "Tenant")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PID Number */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                {t("EKYC_PID_NUMBER") || "PID number"}{" "}
                                <span style={{ fontStyle: "italic", fontWeight: "400", textTransform: "none", color: "#98A2B3" }}>
                                    — {t("EKYC_OPTIONAL") || "optional"}
                                </span>
                            </div>
                            <IconInput
                                icon={<PidIcon size={15} />}
                                value={pidNumber}
                                onChange={(e) => setPidNumber(e.target.value)}
                                placeholder={t("EKYC_ENTER_PID_NUMBER") || "Enter PID number"}
                            />
                        </div>

                        <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

                        {/* ── Building Info Section ── */}
                        <SectionHead
                            icon={<BuildingIcon size={16} />}
                            label={t("EKYC_BUILDING_INFO") || "Building info"}
                        />

                        {/* Dropdowns grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                    {t("EKYC_TYPE_OF_CONNECTION") || "Type of connection"}
                                </div>
                                <Dropdown
                                    selected={connectionCategory}
                                    select={setConnectionCategory}
                                    option={connectionCategoryOptions}
                                    optionKey="label"
                                    t={t}
                                    placeholder={t("EKYC_SELECT") || "Select"}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                    {t("EKYC_CONNECTION_CATEGORY") || "Connection category"}
                                </div>
                                <Dropdown
                                    selected={connectionType}
                                    select={setConnectionType}
                                    option={connectionTypeOptions}
                                    optionKey="label"
                                    t={t}
                                    placeholder={t("EKYC_SELECT") || "Select"}
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                    {t("EKYC_USER_TYPE") || "User type"}
                                </div>
                                <Dropdown
                                    selected={userType}
                                    select={setUserType}
                                    option={userTypeOptions}
                                    optionKey="label"
                                    t={t}
                                    placeholder={t("EKYC_SELECT") || "Select"}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                    {t("EKYC_NO_OF_FLOORS") || "No. of floors"}
                                </div>
                                <Dropdown
                                    selected={noOfFloors}
                                    select={setNoOfFloors}
                                    option={floorOptions}
                                    optionKey="label"
                                    t={t}
                                    placeholder={t("EKYC_SELECT") || "Select"}
                                />
                            </div>
                        </div>

                        <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

                        {/* ── Documents & Photo Section ── */}
                        <SectionHead
                            icon={<DocumentIcon size={16} />}
                            label={t("EKYC_DOCUMENTS_PHOTO") || "Documents & photo"}
                        />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>

                            {/* PDF Upload */}
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                                    {t("EKYC_UPLOAD_PROPERTY_DOC") || "Upload property document"}
                                </div>
                                <input type="file" ref={fileRef} accept=".pdf" style={{ display: "none" }} onChange={handleFileUpload} />
                                <div
                                    onClick={() => pidNumber && fileRef.current.click()}
                                    onMouseOver={(e) => { if (pidNumber) e.currentTarget.style.borderColor = "#185FA5"; }}
                                    onMouseOut={(e) => { if (pidNumber) e.currentTarget.style.borderColor = "#B5D4F4"; }}
                                    style={{
                                        border: pidNumber ? "1.5px dashed #B5D4F4" : "1.5px dashed #D0D5DD",
                                        borderRadius: "10px",
                                        padding: "28px 20px",
                                        textAlign: "center",
                                        cursor: pidNumber ? "pointer" : "not-allowed",
                                        backgroundColor: pidNumber ? "#E6F1FB" : "#F9FAFB",
                                        minHeight: "160px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        transition: "all 0.15s",
                                        opacity: pidNumber ? 1 : 0.6,
                                    }}
                                >
                                    <div style={{
                                        background: pidNumber ? "#fff" : "#EAECF0",
                                        padding: "10px",
                                        borderRadius: "10px",
                                        display: "flex",
                                        filter: pidNumber ? "none" : "grayscale(100%)"
                                    }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill={pidNumber ? "#185FA5" : "#98A2B3"}>
                                            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                                            <path d="M12 18v-4M12 14l-2 2M12 14l2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    {propertyDocument ? (
                                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F6E56" }}>
                                            ✓ {propertyDocument.name}
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: "13px", fontWeight: "600", color: pidNumber ? "#185FA5" : "#98A2B3" }}>
                                                {pidNumber ? (t("EKYC_UPLOAD_PROPERTY_DOC_CTA") || "Tap to upload") : (t("EKYC_ENTER_PID_FIRST_CTA") || "Enter PID to upload")}
                                            </div>
                                            <div style={{ fontSize: "12px", color: pidNumber ? "#378ADD" : "#98A2B3" }}>{pidNumber ? "PDF | Max 5MB" : "Requires PID"}</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Camera Capture */}
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                                    {t("EKYC_CAPTURE_BUILDING_IMAGE") || "Capture building image"}
                                </div>
                                <input type="file" ref={cameraRef} accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoCapture} />
                                <div
                                    onClick={!buildingPhoto ? () => cameraRef.current.click() : undefined}
                                    onMouseOver={(e) => { if (!buildingPhoto) e.currentTarget.style.borderColor = "#185FA5"; }}
                                    onMouseOut={(e) => { if (!buildingPhoto) e.currentTarget.style.borderColor = "#D0D5DD"; }}
                                    style={{
                                        border: "1.5px dashed #D0D5DD", borderRadius: "10px",
                                        minHeight: "160px", display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center",
                                        backgroundColor: "#F9FAFB",
                                        cursor: buildingPhoto ? "default" : "pointer",
                                        overflow: "hidden", transition: "border-color 0.15s",
                                        position: "relative",
                                        padding: buildingPhoto ? "0" : "28px 20px",
                                    }}
                                >
                                    {!buildingPhoto ? (
                                        <>
                                            <div style={{ background: "#E6F1FB", width: "52px", height: "52px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                                                <CameraIcon size={26} />
                                            </div>
                                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#101828" }}>
                                                {t("EKYC_TAP_TO_CAPTURE") || "Tap to capture"}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#667085", marginTop: "2px" }}>
                                                {t("EKYC_BUILDING_PHOTO") || "Building photo with GPS"}
                                            </div>
                                            <div style={{ fontSize: "11px", color: "#98A2B3", marginTop: "2px" }}>
                                                JPG, PNG | Max 2MB
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <img src={buildingPhoto} alt="Building" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setBuildingPhoto(null); if (cameraRef.current) cameraRef.current.value = ""; }}
                                                style={{
                                                    position: "absolute", top: "8px", right: "8px",
                                                    background: "#fff", border: "0.5px solid #EAECF0",
                                                    borderRadius: "7px", padding: "5px 10px",
                                                    display: "flex", alignItems: "center", gap: "5px",
                                                    cursor: "pointer", fontSize: "12px", color: "#D92D20", fontWeight: "500",
                                                }}
                                            >
                                                <TrashIcon size={13} /> {t("EKYC_REMOVE") || "Remove"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div style={{
                            backgroundColor: "#E6F1FB", border: "0.5px solid #B5D4F4",
                            borderRadius: "8px", padding: "12px 14px",
                            display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "4px",
                        }}>
                            <div style={{ flexShrink: 0, marginTop: "1px" }}>
                                <InfoBannerIcon fill="#185FA5" />
                            </div>
                            <div style={{ fontSize: "13px", color: "#185FA5", lineHeight: "1.5" }}>
                                {t("EKYC_TENANT_INFO_NOTICE") || "This section is enabled only if the user is not the owner. Tenant details will be required if tenant is selected."}
                            </div>
                        </div>

                    </div>

                    {/* Submit (Non-sticky, at form end) */}
                    <div style={{ marginTop: "24px" }}>
                        <SubmitBar
                            label={t("EKYC_SAVE_AND_CONTINUE") || "Save & Continue"}
                            onSubmit={handleSaveAndContinue}
                        />
                    </div>

                    {/* Secure notice */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: "5px", marginTop: "16px",
                        fontSize: "11px", color: "#98A2B3",
                    }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        {t("EKYC_SECURE_DATA_NOTICE") || "Your data is encrypted and secure"}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PropertyInfo;