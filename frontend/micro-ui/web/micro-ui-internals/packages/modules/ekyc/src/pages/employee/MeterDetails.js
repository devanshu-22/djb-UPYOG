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

const MeterIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
);

const ConnectionIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
);

const CameraIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L13 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
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

const MeterDetails = () => {
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
    
    // MDMS Hooks for Connection Details
    const { data: dataV0 } = Digit.Hooks.ekyc.useGetPropertyType(tenantId);
    const { data: dataConn } = Digit.Hooks.ekyc.useGetConnectionTypeV2(tenantId);

    // ── Meter State ──
    const [meterStatus, setMeterStatus] = useState(() => 
        getSavedData("EKYC_METER_STATUS_DATA", initialData.meterStatus ? { label: t(`EKYC_METER_${initialData.meterStatus}`), value: initialData.meterStatus } : null)
    );
    const [meterPhoto, setMeterStatusPhoto] = useState(() => sessionStorage.getItem("EKYC_METER_PHOTO") || null);
    const [meterPhotoFileStoreId, setMeterStatusPhotoFileStoreId] = useState(() => sessionStorage.getItem("EKYC_METER_PHOTO_FILESTORE_ID") || null);
    const [workingStatus, setWorkingStatus] = useState(() =>
        getSavedData("EKYC_METER_WORKING_STATUS_DATA", initialData.workingStatus ? { label: t(`EKYC_METER_${initialData.workingStatus}`), value: initialData.workingStatus } : null)
    );
    const [meterLocation, setMeterLocation] = useState(() => sessionStorage.getItem("EKYC_METER_LOCATION") || initialData.meterLocation || "");
    const [lastBillRaised, setLastBillRaised] = useState(() =>
        getSavedData("EKYC_LAST_BILL_RAISED_DATA", initialData.lastBillRaised ? { label: t(`EKYC_${initialData.lastBillRaised}`), value: initialData.lastBillRaised } : null)
    );
    const [noBillReason, setNoBillReason] = useState(() => sessionStorage.getItem("EKYC_REASON_FOR_NO_BILL") || initialData.noBillReason || "");
    const [sewerConnection, setSewerConnection] = useState(() =>
        getSavedData("EKYC_SEWER_CONNECTION_DATA", initialData.sewerConnection ? { label: t(`EKYC_${initialData.sewerConnection}`), value: initialData.sewerConnection } : null)
    );

    // ── Connection State (Moved from PropertyInfo) ──
    const [connectionCategory, setConnectionCategory] = useState(() =>
        getSavedData("EKYC_TYPE_OF_CONNECTION_DATA", initialData.typeOfConnection ? { label: t(initialData.typeOfConnection), value: initialData.typeOfConnection } : null)
    );
    const [connectionType, setConnectionType] = useState(() =>
        getSavedData("EKYC_CONNECTION_CATEGORY_DATA", initialData.connectionCategory ? { label: t(initialData.connectionCategory), value: initialData.connectionCategory } : null)
    );

    const [filephoto, setFilephoto] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // Sync state to sessionStorage
    useEffect(() => {
        sessionStorage.setItem("EKYC_METER_STATUS_DATA", JSON.stringify(meterStatus));
        sessionStorage.setItem("EKYC_METER_WORKING_STATUS_DATA", JSON.stringify(workingStatus));
        sessionStorage.setItem("EKYC_METER_LOCATION", meterLocation);
        sessionStorage.setItem("EKYC_LAST_BILL_RAISED_DATA", JSON.stringify(lastBillRaised));
        sessionStorage.setItem("EKYC_REASON_FOR_NO_BILL", noBillReason);
        sessionStorage.setItem("EKYC_SEWER_CONNECTION_DATA", JSON.stringify(sewerConnection));
        sessionStorage.setItem("EKYC_TYPE_OF_CONNECTION_DATA", JSON.stringify(connectionCategory));
        sessionStorage.setItem("EKYC_CONNECTION_CATEGORY_DATA", JSON.stringify(connectionType));
        if (meterPhoto) sessionStorage.setItem("EKYC_METER_PHOTO", meterPhoto);
        if (meterPhotoFileStoreId) sessionStorage.setItem("EKYC_METER_PHOTO_FILESTORE_ID", meterPhotoFileStoreId);
        sessionStorage.setItem("EKYC_CURRENT_STEP", "METER");
    }, [meterStatus, workingStatus, meterLocation, lastBillRaised, noBillReason, sewerConnection, connectionCategory, connectionType, meterPhoto, meterPhotoFileStoreId]);

    const uploadFile = async (file, tenantId) => {
        if (!file) return null;
        const res = await Digit.UploadServices.Filestorage("EKYC", file, tenantId);
        return res?.data?.files?.[0]?.fileStoreId || null;
    };

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
                            setMeterStatusPhotoFileStoreId(fileStoreId);
                            const reader = new FileReader();
                            reader.onloadend = () => setMeterStatusPhoto(reader.result);
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

    const handleSaveAndContinue = () => {
        history.push("/digit-ui/employee/ekyc/review", {
            ...location.state,
            meterDetails: {
                meterStatus, meterPhoto, meterPhotoFileStoreId,
                workingStatus, meterLocation, lastBillRaised,
                noBillReason, sewerConnection,
                connectionType, connectionCategory
            }
        });
    };

    function selectphoto(e) {
        setMeterStatusPhotoFileStoreId(null);
        setFilephoto(e.target.files[0]);
    }

    const meterStatusOptions = [
        { label: t("EKYC_METERED"), value: "Metered" },
        { label: t("EKYC_UNMETERED"), value: "Unmetered" },
    ];

    const workingStatusOptions = [
        { label: t("EKYC_WORKING"), value: "Working" },
        { label: t("EKYC_NOT_WORKING"), value: "Not Working" },
    ];

    const yesNoOptions = [
        { label: t("CORE_COMMON_YES"), value: "Yes" },
        { label: t("CORE_COMMON_NO"), value: "No" },
    ];

    const connectionCategoryOptions =
        dataV0?.["ws-services-calculation"]?.propertyTypeV2?.map((item) => ({
            label: t(item.code), value: item.code,
        })) || [];

    const connectionTypeOptions =
        dataConn?.["ws-services-calculation"]?.connectionTypeV2?.map((item) => ({
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
                            { label: t("EKYC_STEP_PROPERTY") || "Property", done: true, active: false },
                            { label: t("EKYC_STEP_METER") || "Meter", done: false, active: true },
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
                                {t("EKYC_METER_DETAILS_HEADER") || "Meter Details"}
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

                            {/* ── Meter Details Section ── */}
                            <SectionHead
                                icon={<MeterIcon size={16} />}
                                label={t("EKYC_METER_DETAILS") || "Meter details"}
                            />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                                <div>
                                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                        {t("EKYC_METER_STATUS") || "Meter status"}
                                    </div>
                                    <Dropdown
                                        selected={meterStatus}
                                        select={setMeterStatus}
                                        option={meterStatusOptions}
                                        optionKey="label"
                                        t={t}
                                        placeholder={t("EKYC_SELECT") || "Select"}
                                    />
                                </div>
                                {meterStatus?.value === "Metered" && (
                                    <div>
                                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                            {t("EKYC_METER_WORKING_STATUS") || "Meter working status"}
                                        </div>
                                        <Dropdown
                                            selected={workingStatus}
                                            select={setWorkingStatus}
                                            option={workingStatusOptions}
                                            optionKey="label"
                                            t={t}
                                            placeholder={t("EKYC_SELECT") || "Select"}
                                        />
                                    </div>
                                )}
                            </div>

                            {meterStatus?.value === "Metered" && (
                                <Fragment>
                                    <div style={{ marginBottom: "20px" }}>
                                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                                            {t("EKYC_CAPTURE_METER_IMAGE") || "Capture meter image"}
                                        </div>
                                        <UploadFile
                                            id={"ekyc-meter-photo"}
                                            extraStyleName={"propertyCreate"}
                                            accept=".jpg,.png,.jpeg"
                                            onUpload={selectphoto}
                                            onDelete={() => {
                                                setMeterStatusPhotoFileStoreId(null);
                                                setMeterStatusPhoto(null);
                                                setFilephoto(null);
                                            }}
                                            message={meterPhotoFileStoreId ? `1 ${t(`EKYC_ACTION_FILEUPLOADED`)}` : t(`EKYC_ACTION_NO_FILEUPLOADED`)}
                                            error={error}
                                        />
                                        {meterPhoto && (
                                            <div style={{ marginTop: "10px", borderRadius: "8px", overflow: "hidden", border: "1px solid #EAECF0" }}>
                                                <img src={meterPhoto} alt="Meter Preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover" }} />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                                        <div>
                                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                                {t("EKYC_METER_LOCATION") || "Meter location"}
                                            </div>
                                            <TextInput
                                                value={meterLocation}
                                                onChange={(e) => setMeterLocation(e.target.value)}
                                                placeholder={t("EKYC_ENTER_METER_LOCATION") || "Enter location"}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                                {t("EKYC_LAST_BILL_RAISED") || "Last bill raised"}
                                            </div>
                                            <Dropdown
                                                selected={lastBillRaised}
                                                select={setLastBillRaised}
                                                option={yesNoOptions}
                                                optionKey="label"
                                                t={t}
                                                placeholder={t("EKYC_SELECT") || "Select"}
                                            />
                                        </div>
                                    </div>

                                    {lastBillRaised?.value === "No" && (
                                        <div style={{ marginBottom: "20px" }}>
                                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                                {t("EKYC_REASON_FOR_NO_BILL") || "Reason for no bill"}
                                            </div>
                                            <TextInput
                                                value={noBillReason}
                                                onChange={(e) => setNoBillReason(e.target.value)}
                                                placeholder={t("EKYC_ENTER_REASON") || "Enter reason"}
                                            />
                                        </div>
                                    )}
                                </Fragment>
                            )}

                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                    {t("EKYC_SEWER_CONNECTION") || "Sewer connection"}
                                </div>
                                <div style={{ width: "calc(50% - 7px)" }}>
                                    <Dropdown
                                        selected={sewerConnection}
                                        select={setSewerConnection}
                                        option={yesNoOptions}
                                        optionKey="label"
                                        t={t}
                                        placeholder={t("EKYC_SELECT") || "Select"}
                                    />
                                </div>
                            </div>

                            <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

                            {/* ── Property/Connection Details Section ── */}
                            <SectionHead
                                icon={<ConnectionIcon size={16} />}
                                label={t("EKYC_PROPERTY_CONNECTION_DETAILS") || "Property Connection Details"}
                            />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
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

                        </div>

                        {/* Submit */}
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
            {toast && (
                <Toast
                    label={toast.message}
                    error={toast.type === "error"}
                    info={toast.type === "info"}
                    success={toast.type === "success"}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default MeterDetails;
