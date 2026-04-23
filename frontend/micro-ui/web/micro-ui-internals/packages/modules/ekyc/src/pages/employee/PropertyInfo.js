import React, { useState, useRef, Fragment, useEffect } from "react";
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
    UploadFile,
    Toast,
} from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { getPayloadDiff, getSavedData } from "../../utils";

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

    const flowState = location.state || {
        kNumber: sessionStorage.getItem("EKYC_K_NUMBER") || "EKYC-1234567890",
        initialData: getSavedData("EKYC_INITIAL_DATA", {})
    };
    const { kNumber } = flowState;
    const initialData = flowState.initialData || getSavedData("EKYC_INITIAL_DATA", {});

    const tenantId = Digit.ULBService.getCurrentTenantId();
    const { data: dataV0 } = Digit.Hooks.ekyc.useGetPropertyType(tenantId);
    const { data: dataConn } = Digit.Hooks.ekyc.useGetConnectionTypeV2(tenantId);
    const { data: dataV1 } = Digit.Hooks.ekyc.useGetUserType(tenantId);
    const { data: dataV2 } = Digit.Hooks.ekyc.useGetFloorCount(tenantId);

    const [ownerType, setOwnerType] = useState(() => sessionStorage.getItem("EKYC_OWNER_TYPE") || initialData.ownerType || "OWNER");
    const [pidNumber, setPidNumber] = useState(() => sessionStorage.getItem("EKYC_PID_NUMBER") || initialData.pidNumber || "");
    const [connectionCategory, setConnectionCategory] = useState(() =>
        getSavedData("EKYC_TYPE_OF_CONNECTION_DATA", initialData.typeOfConnection ? { label: t(initialData.typeOfConnection), value: initialData.typeOfConnection } : null)
    );
    const [connectionType, setConnectionType] = useState(() =>
        getSavedData("EKYC_CONNECTION_CATEGORY_DATA", initialData.connectionCategory ? { label: t(initialData.connectionCategory), value: initialData.connectionCategory } : null)
    );
    const [userType, setUserType] = useState(() =>
        getSavedData("EKYC_USER_TYPE_DATA", initialData.userType ? { label: t(initialData.userType), value: initialData.userType } : null)
    );
    const [noOfFloors, setNoOfFloors] = useState(() =>
        getSavedData("EKYC_NO_OF_FLOORS_DATA", initialData.noOfFloor ? { label: t(initialData.noOfFloor), value: initialData.noOfFloor } : null)
    );
    const [propertyDocument, setPropertyDocument] = useState(() => sessionStorage.getItem("EKYC_PROPERTY_DOC") || null);
    const [propertyDocumentFileStoreId, setPropertyDocumentFileStoreId] = useState(() => sessionStorage.getItem("EKYC_PROPERTY_DOC_FILESTORE_ID") || null);
    const [buildingPhoto, setBuildingPhoto] = useState(() => sessionStorage.getItem("EKYC_BUILDING_PHOTO") || null);
    const [buildingPhotoFileStoreId, setBuildingPhotoFileStoreId] = useState(() => sessionStorage.getItem("EKYC_BUILDING_PHOTO_FILESTORE_ID") || null);

    const [filepdf, setFilepdf] = useState(null);
    const [filephoto, setFilephoto] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // Sync property state to sessionStorage
    useEffect(() => {
        sessionStorage.setItem("EKYC_OWNER_TYPE", ownerType);
        sessionStorage.setItem("EKYC_PID_NUMBER", pidNumber);
        sessionStorage.setItem("EKYC_TYPE_OF_CONNECTION_DATA", JSON.stringify(connectionCategory));
        sessionStorage.setItem("EKYC_CONNECTION_CATEGORY_DATA", JSON.stringify(connectionType));
        sessionStorage.setItem("EKYC_USER_TYPE_DATA", JSON.stringify(userType));
        sessionStorage.setItem("EKYC_NO_OF_FLOORS_DATA", JSON.stringify(noOfFloors));
        if (propertyDocument) sessionStorage.setItem("EKYC_PROPERTY_DOC", propertyDocument);
        if (propertyDocumentFileStoreId) sessionStorage.setItem("EKYC_PROPERTY_DOC_FILESTORE_ID", propertyDocumentFileStoreId);
        if (buildingPhoto) sessionStorage.setItem("EKYC_BUILDING_PHOTO", buildingPhoto);
        if (buildingPhotoFileStoreId) sessionStorage.setItem("EKYC_BUILDING_PHOTO_FILESTORE_ID", buildingPhotoFileStoreId);
        sessionStorage.setItem("EKYC_CURRENT_STEP", "PROPERTY");
    }, [ownerType, pidNumber, connectionCategory, connectionType, userType, noOfFloors, propertyDocument, propertyDocumentFileStoreId, buildingPhoto, buildingPhotoFileStoreId]);

    const uploadFile = async (file, tenantId) => {
        if (!file) return null;
        const res = await Digit.UploadServices.Filestorage("EKYC", file, tenantId);
        return res?.data?.files?.[0]?.fileStoreId || null;
    };

    const dataUrlToFile = (dataUrl, filename) => {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    };

    // useEffect hooks for automatic upload (WT-style)
    useEffect(() => {
        (async () => {
            setError(null);
            if (filepdf) {
                if (filepdf.size >= 5000000) {
                    setError(t("EKYC_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
                    setToast({ type: "error", message: t("EKYC_MAXIMUM_UPLOAD_SIZE_EXCEEDED") });
                } else {
                    try {
                        setToast({ type: "info", message: t("EKYC_UPLOADING") });
                        const fileStoreId = await uploadFile(filepdf, tenantId);
                        if (fileStoreId) {
                            setPropertyDocumentFileStoreId(fileStoreId);
                            setPropertyDocument(filepdf.name);
                            setToast({ type: "success", message: t("EKYC_UPLOAD_SUCCESS") });
                        } else {
                            setError(t("EKYC_FILE_UPLOAD_ERROR"));
                            setToast({ type: "error", message: t("EKYC_FILE_UPLOAD_ERROR") });
                        }
                    } catch (err) {
                        setError(t("EKYC_FILE_UPLOAD_ERROR"));
                        setToast({ type: "error", message: t("EKYC_FILE_UPLOAD_ERROR") });
                    }
                }
            }
        })();
    }, [filepdf]);

    useEffect(() => {
        (async () => {
            setError(null);
            if (filephoto) {
                if (filephoto.size >= 2000000) {
                    setError(t("EKYC_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
                    setToast({ type: "error", message: t("EKYC_MAXIMUM_UPLOAD_SIZE_EXCEEDED") });
                } else {
                    try {
                        setToast({ type: "info", message: t("EKYC_UPLOADING") });
                        const fileStoreId = await uploadFile(filephoto, tenantId);
                        if (fileStoreId) {
                            setBuildingPhotoFileStoreId(fileStoreId);
                            // Also store as dataURL for preview if needed, but for WT style we just need the fileStoreId
                            const reader = new FileReader();
                            reader.onloadend = () => setBuildingPhoto(reader.result);
                            reader.readAsDataURL(filephoto);
                            setToast({ type: "success", message: t("EKYC_UPLOAD_SUCCESS") });
                        } else {
                            setError(t("EKYC_FILE_UPLOAD_ERROR"));
                            setToast({ type: "error", message: t("EKYC_FILE_UPLOAD_ERROR") });
                        }
                    } catch (err) {
                        setError(t("EKYC_FILE_UPLOAD_ERROR"));
                        setToast({ type: "error", message: t("EKYC_FILE_UPLOAD_ERROR") });
                    }
                }
            }
        })();
    }, [filephoto]);

    const fileRef = useRef(null);
    const cameraRef = useRef(null);

    const handleSaveAndContinue = () => {
        history.push("/digit-ui/employee/ekyc/meter-details", {
            ...flowState,
            propertyDetails: {
                ownerType, pidNumber, connectionType,
                connectionCategory, userType, noOfFloors,
                propertyDocument, propertyDocumentFileStoreId,
                buildingPhoto, buildingPhotoFileStoreId,
            },
            initialData,
        });
    };

    function selectpdf(e) {
        setPropertyDocumentFileStoreId(null);
        setFilepdf(e.target.files[0]);
    }

    function selectphoto(e) {
        setBuildingPhotoFileStoreId(null);
        setFilephoto(e.target.files[0]);
    }

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
        <>
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
                            { label: t("EKYC_STEP_METER") || "Meter", done: false, active: false },
                            { label: t("EKYC_STEP_REVIEW") || "Review", done: false, active: false },
                        ].map((step, i) => (
                            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", position: "relative", paddingBottom: i < 4 ? "18px" : 0 }}>
                                {i < 4 && (
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
                                {/* <div>
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
                                </div> */}
                                {/* <div>
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
                                </div> */}
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
                                    <UploadFile
                                        id={"ekyc-property-doc"}
                                        extraStyleName={"propertyCreate"}
                                        accept=".pdf"
                                        onUpload={selectpdf}
                                        onDelete={() => {
                                            setPropertyDocumentFileStoreId(null);
                                            setPropertyDocument(null);
                                            setFilepdf(null);
                                        }}
                                        message={propertyDocumentFileStoreId ? `1 ${t(`EKYC_ACTION_FILEUPLOADED`)}` : t(`EKYC_ACTION_NO_FILEUPLOADED`)}
                                        error={error}
                                        disabled={!pidNumber}
                                    />
                                    {!pidNumber && (
                                        <div style={{ fontSize: "11px", color: "#D92D20", marginTop: "4px" }}>
                                            {t("EKYC_ENTER_PID_FIRST_CTA") || "Enter PID to upload"}
                                        </div>
                                    )}
                                </div>

                                {/* Building Photo Upload */}
                                <div>
                                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                                        {t("EKYC_CAPTURE_BUILDING_IMAGE") || "Capture building image"}
                                    </div>
                                    <UploadFile
                                        id={"ekyc-building-photo"}
                                        extraStyleName={"propertyCreate"}
                                        accept=".jpg,.png,.jpeg"
                                        onUpload={selectphoto}
                                        onDelete={() => {
                                            setBuildingPhotoFileStoreId(null);
                                            setBuildingPhoto(null);
                                            setFilephoto(null);
                                        }}
                                        message={buildingPhotoFileStoreId ? `1 ${t(`EKYC_ACTION_FILEUPLOADED`)}` : t(`EKYC_ACTION_NO_FILEUPLOADED`)}
                                        error={error}
                                    />
                                    {buildingPhoto && (
                                        <div style={{ marginTop: "10px", borderRadius: "8px", overflow: "hidden", border: "1px solid #EAECF0" }}>
                                            <img src={buildingPhoto} alt="Building Preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover" }} />
                                        </div>
                                    )}
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
            {toast && (
                <Toast
                    label={toast.message}
                    error={toast.type === "error"}
                    info={toast.type === "info"}
                    success={toast.type === "success"}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default PropertyInfo;