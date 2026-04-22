import React, { Fragment, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  SubmitBar,
  HomeIcon,
  ActionBar,
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

const PersonIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

const LocationIcon2 = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const BuildingIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z" />
  </svg>
);

const EditIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

// ─── Reusable: Review section card ───────────────────────────────────────────

const ReviewCard = ({ icon, title, onEdit, editLabel, rows, t }) => (
  <div style={{
    border: "0.5px solid #EAECF0",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "16px",
    animation: "fadeSlideIn 0.3s ease",
  }}>
    {/* Card header */}
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 16px",
      background: "#F9FAFB",
      borderBottom: "0.5px solid #EAECF0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ opacity: 0.5, display: "flex" }}>{icon}</div>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#0B0C0C" }}>{title}</span>
      </div>
      <button
        onClick={onEdit}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "none", border: "0.5px solid #D0D5DD",
          borderRadius: "6px", padding: "5px 12px",
          fontSize: "12px", fontWeight: "600", color: "#185FA5",
          cursor: "pointer",
        }}
      >
        <EditIcon size={12} />
        {editLabel}
      </button>
    </div>

    {/* Rows */}
    <div style={{ padding: "4px 0" }}>
      {rows.map((row, i) => (
        row.value ? (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start",
            padding: "10px 16px",
            borderBottom: i < rows.length - 1 ? "0.5px solid #F2F4F7" : "none",
          }}>
            <div style={{
              flex: "0 0 180px", fontSize: "12px", fontWeight: "600",
              color: "#667085", textTransform: "uppercase",
              letterSpacing: "0.04em", paddingTop: "1px",
            }}>
              {row.label}
            </div>
            <div style={{ flex: 1, fontSize: "14px", color: "#101828", fontWeight: "500", wordBreak: "break-word", display: "flex", alignItems: "center", gap: "8px" }}>
              {row.value}
              {row.isModified && (
                <span style={{
                  fontSize: "10px",
                  background: "#FFF4ED",
                  color: "#B45309",
                  border: "0.5px solid #FDE68A",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontWeight: "600",
                  textTransform: "uppercase"
                }}>
                  {t("EKYC_MODIFIED") || "Modified"}
                </span>
              )}
            </div>
          </div>
        ) : null
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Review = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  // ── Restore State Logic ──
  const state = location.state || {};
  const initialData = state.initialData || getSavedData("EKYC_INITIAL_DATA", {});
  const kNumber = state.kNumber || sessionStorage.getItem("EKYC_K_NUMBER") || "EKYC-1234567890";

  // Reconstruct nested objects if state is lost on refresh
  const aadhaarDetails = state.aadhaarDetails || {
    userName: sessionStorage.getItem("EKYC_USER_NAME"),
    mobileNumber: sessionStorage.getItem("EKYC_MOBILE_NUMBER"),
    whatsappNumber: sessionStorage.getItem("EKYC_WHATSAPP_NUMBER"),
    email: sessionStorage.getItem("EKYC_EMAIL"),
    noOfPersons: sessionStorage.getItem("EKYC_NO_OF_PERSONS"),
  };

  const addressDetails = state.addressDetails || {
    fullAddress: sessionStorage.getItem("EKYC_FULL_ADDRESS"),
    flatNo: sessionStorage.getItem("EKYC_FLAT_NO"),
    building: sessionStorage.getItem("EKYC_BUILDING"),
    landmark: sessionStorage.getItem("EKYC_LANDMARK"),
    pincode: sessionStorage.getItem("EKYC_PINCODE"),
    assembly: getSavedData("EKYC_ASSEMBLY_DATA")?.name,
    ward: getSavedData("EKYC_WARD_DATA")?.name,
    doorPhoto: sessionStorage.getItem("EKYC_DOOR_PHOTO"),
    doorPhotoFileStoreId: sessionStorage.getItem("EKYC_DOOR_PHOTO_FILESTORE_ID"),
  };

  const propertyDetails = state.propertyDetails || {
    ownerType: sessionStorage.getItem("EKYC_OWNER_TYPE"),
    pidNumber: sessionStorage.getItem("EKYC_PID_NUMBER"),
    userType: getSavedData("EKYC_USER_TYPE_DATA"),
    noOfFloors: getSavedData("EKYC_NO_OF_FLOORS_DATA"),
    propertyDocument: sessionStorage.getItem("EKYC_PROPERTY_DOC"),
    propertyDocumentFileStoreId: sessionStorage.getItem("EKYC_PROPERTY_DOC_FILESTORE_ID"),
    buildingPhoto: sessionStorage.getItem("EKYC_BUILDING_PHOTO"),
    buildingPhotoFileStoreId: sessionStorage.getItem("EKYC_BUILDING_PHOTO_FILESTORE_ID"),
  };

  const meterDetails = state.meterDetails || {
    meterStatus: getSavedData("EKYC_METER_STATUS_DATA"),
    workingStatus: getSavedData("EKYC_METER_WORKING_STATUS_DATA"),
    meterLocation: sessionStorage.getItem("EKYC_METER_LOCATION"),
    lastBillRaised: getSavedData("EKYC_LAST_BILL_RAISED_DATA"),
    noBillReason: sessionStorage.getItem("EKYC_REASON_FOR_NO_BILL"),
    sewerConnection: getSavedData("EKYC_SEWER_CONNECTION_DATA"),
    connectionCategory: getSavedData("EKYC_TYPE_OF_CONNECTION_DATA"),
    connectionType: getSavedData("EKYC_CONNECTION_CATEGORY_DATA"),
    meterPhoto: sessionStorage.getItem("EKYC_METER_PHOTO"),
    meterPhotoFileStoreId: sessionStorage.getItem("EKYC_METER_PHOTO_FILESTORE_ID"),
  };

  useEffect(() => {
    sessionStorage.setItem("EKYC_CURRENT_STEP", "REVIEW");
  }, []);

  // Helper to check if a field is modified
  const isFieldModified = (key, currentVal) => {
    const initialVal = initialData[key];
    if (initialVal === undefined) return false;
    return JSON.stringify(initialVal) !== JSON.stringify(currentVal);
  };

  const [toast, setToast] = useState(null);
  const tenantId = Digit.ULBService.getCurrentTenantId() || "dl";
  const { mutate, isLoading: isMutationLoading } = Digit.Hooks.ekyc.useEkycApplicationUpdate(tenantId);
  const isSubmitting = isMutationLoading;

  // ── Helper: upload a File object to Filestore ──────────────────────────────
  const uploadFile = async (file, tenantId) => {
    if (!file) return null;
    const res = await Digit.UploadServices.Filestorage("EKYC", file, tenantId);
    return res?.data?.files?.[0]?.fileStoreId || null;
  };

  // ── Helper: convert a data-URL (base64 string) to a File blob ─────────────
  const dataUrlToFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async () => {
    setToast(null);
    try {
      const userInfo = Digit.UserService.getUser()?.info || {};

      // ── 1. Upload property document ──────────────────────────────────────
      let propertyDocFileStoreId = propertyDetails.propertyDocumentFileStoreId || null;
      if (!propertyDocFileStoreId && propertyDetails.propertyDocument instanceof File) {
        propertyDocFileStoreId = await uploadFile(propertyDetails.propertyDocument, tenantId);
      }

      // ── 2. Upload building photo ──────────────────────────────────────────
      let buildingImageFileStoreId = propertyDetails.buildingPhotoFileStoreId || null;
      if (!buildingImageFileStoreId && propertyDetails.buildingPhoto) {
        // Fallback if we only have the dataURL
        const photoFile = dataUrlToFile(propertyDetails.buildingPhoto, "building_photo.jpg");
        buildingImageFileStoreId = await uploadFile(photoFile, tenantId);
      }

      // ── 3. Upload door photo ──────────────────────────────────────────────
      let doorPhotoFileStoreId = addressDetails.doorPhotoFileStoreId || null;
      if (!doorPhotoFileStoreId && addressDetails.doorPhoto) {
        const doorFile = dataUrlToFile(addressDetails.doorPhoto, "door_photo.jpg");
        doorPhotoFileStoreId = await uploadFile(doorFile, tenantId);
      }

      // ── 4. Upload meter photo ──────────────────────────────────────────────
      let meterImageFileStoreId = meterDetails.meterPhotoFileStoreId || null;
      if (!meterImageFileStoreId && meterDetails.meterPhoto) {
        const meterFile = dataUrlToFile(meterDetails.meterPhoto, "meter_photo.jpg");
        meterImageFileStoreId = await uploadFile(meterFile, tenantId);
      }

      // ── 4. Build optimized request payload ────────────────────────────────
      // Note: RequestInfo is added automatically by the Digit Request utility
      const requestBody = {
        updateType: "PROPERTY",
        kno: kNumber,
        pidNumber: propertyDetails.pidNumber || null,
        propertyDocumentFileStoreId: propertyDocFileStoreId,
        buildingImageFileStoreId: buildingImageFileStoreId,
        userType: propertyDetails.userType?.value || null,
        noOfFloor: propertyDetails.noOfFloors?.value ? parseInt(propertyDetails.noOfFloors.value, 10) : null,
        typeOfConnection: propertyDetails.connectionCategory?.value || null,
        connectionCategory: propertyDetails.connectionType?.value || null,
        modifiedBy: userInfo.name || userInfo.userName || null,
        mobileNumber: aadhaarDetails.mobileNumber || null,
        email: aadhaarDetails.email || null,
        userName: aadhaarDetails.userName || null,
        noOfPersons: aadhaarDetails.noOfPersons || null,
        doorPhotoFileStoreId: doorPhotoFileStoreId,
        fullAddress: addressDetails.fullAddress || null,
        flatNo: addressDetails.flatNo || null,
        building: addressDetails.building || null,
        landmark: addressDetails.landmark || null,
        pincode: addressDetails.pincode || null,
        assembly: addressDetails.assembly || null,
        ward: addressDetails.ward || null,
        // Meter Details
        meterStatus: meterDetails.meterStatus?.value || null,
        meterWorkingStatus: meterDetails.workingStatus?.value || null,
        meterLocation: meterDetails.meterLocation || null,
        lastBillRaised: meterDetails.lastBillRaised?.value || null,
        noBillReason: meterDetails.noBillReason || null,
        sewerConnection: meterDetails.sewerConnection?.value || null,
        typeOfConnection: meterDetails.connectionCategory?.value || null,
        connectionCategory: meterDetails.connectionType?.value || null,
        meterImageFileStoreId: meterImageFileStoreId,
      };

      // ── 4. Call the update API using the new Hook ──────────────────────────
      mutate(requestBody, {
        onSuccess: (res) => {
          setToast({ type: "success", message: t("EKYC_SUBMIT_SUCCESS") || "Application submitted successfully!" });

          // Cleanup sessionStorage on success
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith("EKYC_")) sessionStorage.removeItem(key);
          });

          setTimeout(() => {
            history.push("/digit-ui/employee/ekyc/dashboard");
          }, 1800);
        },
        onError: (err) => {
          console.error("eKYC Submit Error:", err);
          setToast({
            type: "error",
            message: err?.response?.data?.Errors?.[0]?.message ||
              t("EKYC_SUBMIT_ERROR") || "Submission failed. Please try again.",
          });
        }
      });

    } catch (err) {
      console.error("eKYC Frontend Error:", err);
      setToast({
        type: "error",
        message: t("EKYC_SUBMIT_ERROR") || "An error occurred during submission.",
      });
    }
  };

  const handleEditAadhaar = () => {
    history.push("/digit-ui/employee/ekyc/aadhaar-verification", location.state);
  };

  const handleEditAddress = () => {
    history.push("/digit-ui/employee/ekyc/address-details", location.state);
  };

  const handleEditProperty = () => {
    history.push("/digit-ui/employee/ekyc/property-info", location.state);
  };

  const handleEditMeter = () => {
    history.push("/digit-ui/employee/ekyc/meter-details", location.state);
  };

  return (
      <Fragment>
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
                { label: t("EKYC_STEP_METER") || "Meter", done: true, active: false },
                { label: t("EKYC_STEP_REVIEW") || "Review", done: false, active: true },
              ].map((step, i) => (
                <div key={i} style={{
                  display: "flex", gap: "10px", alignItems: "flex-start",
                  position: "relative", paddingBottom: i < 4 ? "18px" : 0,
                }}>
                  {i < 4 && (
                    <div style={{
                      position: "absolute", left: "10px", top: "22px",
                      width: "1px", height: "calc(100% - 10px)", background: "#EAECF0",
                    }} />
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

              {/* Page header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <CardHeader style={{ margin: 0, fontSize: "18px" }}>
                  {t("EKYC_REVIEW_DETAILS") || "Review Details"}
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

              {/* Confirmation banner */}
              <div style={{
                backgroundColor: "#E1F5EE", border: "0.5px solid #5DCAA5",
                borderRadius: "8px", padding: "12px 16px",
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "24px",
              }}>
                <div style={{ backgroundColor: "#9FE1CB", padding: "5px", borderRadius: "6px", display: "flex", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#085041" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ fontSize: "13px", color: "#04342C", fontWeight: "500" }}>
                  {t("EKYC_REVIEW_NOTICE") || "Please review all details carefully before submitting. You can edit any section by clicking Edit."}
                </div>
              </div>

              <div style={{ animation: "fadeSlideIn 0.3s ease" }}>

                {/* ── Aadhaar section head ── */}
                <SectionHead
                  icon={<PersonIcon size={16} />}
                  label={t("EKYC_AADHAAR_VERIFICATION_HEADER") || "Aadhaar details"}
                />

                <ReviewCard
                  icon={<PersonIcon size={16} />}
                  title={t("EKYC_AADHAAR_VERIFICATION_HEADER") || "Aadhaar details"}
                  onEdit={handleEditAadhaar}
                  editLabel={t("CS_COMMON_EDIT") || "Edit"}
                  t={t}
                  rows={[
                    { label: t("EKYC_NAME") || "Name", value: aadhaarDetails.userName || "Rajesh Kumar Singh", isModified: isFieldModified("userName", aadhaarDetails.userName) },
                    { label: t("EKYC_AADHAAR") || "Aadhaar no.", value: aadhaarDetails.aadhaarLastFour ? `${aadhaarDetails.aadhaarLastFour}` : "XXXX XXXX 1234" },
                    { label: t("EKYC_MOBILE_NO") || "Mobile no.", value: aadhaarDetails.mobileNumber || "XXXXXXXXXX", isModified: isFieldModified("mobileNumber", aadhaarDetails.mobileNumber) },
                    { label: t("EKYC_EMAIL_ADDRESS") || "Email", value: aadhaarDetails.email || null, isModified: isFieldModified("email", aadhaarDetails.email) },
                  ]}
                />

                <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

                {/* ── Address section head ── */}
                <SectionHead
                  icon={<LocationIcon2 size={16} />}
                  label={t("EKYC_ADDRESS_DETAILS_HEADER") || "Address details"}
                />

                <ReviewCard
                  icon={<LocationIcon2 size={16} />}
                  title={t("EKYC_ADDRESS_DETAILS_HEADER") || "Address details"}
                  onEdit={handleEditAddress}
                  editLabel={t("CS_COMMON_EDIT") || "Edit"}
                  t={t}
                  rows={[
                    { label: t("EKYC_FULL_ADDRESS") || "Full address", value: addressDetails.fullAddress || "H.No. 123, Sector 15, Rohini, Delhi – 110085", isModified: isFieldModified("fullAddress", addressDetails.fullAddress) },
                    { label: t("EKYC_FLAT_HOUSE_NUMBER") || "Flat / House no.", value: addressDetails.flatNo || null, isModified: isFieldModified("flatNo", addressDetails.flatNo) },
                    { label: t("EKYC_BUILDING_TOWER") || "Building", value: addressDetails.building || null, isModified: isFieldModified("building", addressDetails.building) },
                    { label: t("EKYC_LANDMARK") || "Landmark", value: addressDetails.landmark || null, isModified: isFieldModified("landmark", addressDetails.landmark) },
                    { label: t("EKYC_PINCODE") || "Pincode", value: addressDetails.pincode || "110085", isModified: isFieldModified("pincode", addressDetails.pincode) },
                    { label: t("EKYC_ASSEMBLY") || "Assembly", value: addressDetails.assembly || "AC-12 Chandni Chowk", isModified: isFieldModified("assembly", addressDetails.assembly) },
                    { label: t("EKYC_WARD") || "Ward", value: addressDetails.ward || "WARD-45 Civil Lines", isModified: isFieldModified("ward", addressDetails.ward) },
                  ]}
                />

                <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

                {/* ── Property section head ── */}
                <SectionHead
                  icon={<BuildingIcon size={16} />}
                  label={t("EKYC_PROPERTY_INFO") || "Property details"}
                />

                <ReviewCard
                  icon={<BuildingIcon size={16} />}
                  title={t("EKYC_PROPERTY_INFO") || "Property details"}
                  onEdit={handleEditProperty}
                  editLabel={t("CS_COMMON_EDIT") || "Edit"}
                  t={t}
                  rows={[
                    { label: t("EKYC_PROPERTY_OWNER") || "Property owner", value: propertyDetails.ownerType || "Owner" },
                    { label: t("EKYC_PID_NUMBER") || "PID number", value: propertyDetails.pidNumber || null, isModified: isFieldModified("pidNumber", propertyDetails.pidNumber) },
                    { label: t("EKYC_TYPE_OF_CONNECTION") || "Type of connection", value: propertyDetails.connectionCategory?.label || null, isModified: isFieldModified("typeOfConnection", propertyDetails.connectionCategory?.value) },
                    { label: t("EKYC_CONNECTION_CATEGORY") || "Connection category", value: propertyDetails.connectionType?.label || null, isModified: isFieldModified("connectionCategory", propertyDetails.connectionType?.value) },
                    { label: t("EKYC_USER_TYPE") || "User type", value: propertyDetails.userType?.label || null, isModified: isFieldModified("userType", propertyDetails.userType?.value) },
                    { label: t("EKYC_NO_OF_FLOORS") || "No. of floors", value: propertyDetails.noOfFloors?.label || null, isModified: isFieldModified("noOfFloor", propertyDetails.noOfFloors?.value) },
                  ]}
                />

                <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

                {/* ── Meter section head ── */}
                <SectionHead
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" /></svg>}
                  label={t("EKYC_METER_DETAILS_HEADER") || "Meter details"}
                />

                <ReviewCard
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" /></svg>}
                  title={t("EKYC_METER_DETAILS_HEADER") || "Meter details"}
                  onEdit={handleEditMeter}
                  editLabel={t("CS_COMMON_EDIT") || "Edit"}
                  t={t}
                  rows={[
                    { label: t("EKYC_METER_STATUS") || "Meter status", value: meterDetails.meterStatus?.label || null, isModified: isFieldModified("meterStatus", meterDetails.meterStatus?.value) },
                    { label: t("EKYC_METER_WORKING_STATUS") || "Meter working status", value: meterDetails.workingStatus?.label || null, isModified: isFieldModified("meterWorkingStatus", meterDetails.workingStatus?.value) },
                    { label: t("EKYC_METER_LOCATION") || "Meter location", value: meterDetails.meterLocation || null, isModified: isFieldModified("meterLocation", meterDetails.meterLocation) },
                    { label: t("EKYC_LAST_BILL_RAISED") || "Last bill raised", value: meterDetails.lastBillRaised?.label || null, isModified: isFieldModified("lastBillRaised", meterDetails.lastBillRaised?.value) },
                    { label: t("EKYC_REASON_FOR_NO_BILL") || "Reason for no bill", value: meterDetails.noBillReason || null, isModified: isFieldModified("noBillReason", meterDetails.noBillReason) },
                    { label: t("EKYC_SEWER_CONNECTION") || "Sewer connection", value: meterDetails.sewerConnection?.label || null, isModified: isFieldModified("sewerConnection", meterDetails.sewerConnection?.value) },
                    { label: t("EKYC_TYPE_OF_CONNECTION") || "Type of connection", value: meterDetails.connectionCategory?.label || null, isModified: isFieldModified("typeOfConnection", meterDetails.connectionCategory?.value) },
                    { label: t("EKYC_CONNECTION_CATEGORY") || "Connection category", value: meterDetails.connectionType?.label || null, isModified: isFieldModified("connectionCategory", meterDetails.connectionType?.value) },
                  ]}
                />

              </div>

              {/* Submit (Non-sticky, at form end) */}
              <div style={{ marginTop: "24px" }}>
                <SubmitBar
                  label={isSubmitting
                    ? (t("EKYC_SUBMITTING") || "Submitting...")
                    : (t("ES_COMMON_SUBMIT") || "Submit")
                  }
                  onSubmit={handleSubmit}
                  disabled={isSubmitting}
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

        {/* Toast notification */}
        {toast && (
          <Toast
            label={toast.message}
            error={toast.type === "error"}
            success={toast.type === "success"}
            onClose={() => setToast(null)}
          />
        )}
      </Fragment>
  );
};

export default Review;