import React, { Fragment } from "react";
import {
  Card,
  CardHeader,
  SubmitBar,
  HomeIcon,
  ActionBar,
} from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

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

const ReviewCard = ({ icon, title, onEdit, editLabel, rows }) => (
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
            <div style={{ flex: 1, fontSize: "14px", color: "#101828", fontWeight: "500", wordBreak: "break-word" }}>
              {row.value}
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

  const {
    kNumber = "EKYC-1234567890",
    aadhaarDetails = {},
    addressDetails = {},
    propertyDetails = {},
  } = location.state || {};

  const handleSubmit = () => {
    history.push("/digit-ui/employee/ekyc/dashboard");
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
            { label: t("EKYC_STEP_REVIEW") || "Review", done: false, active: true },
          ].map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: "10px", alignItems: "flex-start",
              position: "relative", paddingBottom: i < 3 ? "18px" : 0,
            }}>
              {i < 3 && (
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
              rows={[
                { label: t("EKYC_NAME") || "Name", value: aadhaarDetails.userName || "Rajesh Kumar Singh" },
                { label: t("EKYC_AADHAAR") || "Aadhaar no.", value: aadhaarDetails.aadhaarLastFour ? `XXXX XXXX ${aadhaarDetails.aadhaarLastFour}` : "XXXX XXXX 1234" },
                { label: t("EKYC_MOBILE_NO") || "Mobile no.", value: aadhaarDetails.mobileNumber || "XXXXXXXXXX" },
                { label: t("EKYC_EMAIL_ADDRESS") || "Email", value: aadhaarDetails.email || null },
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
              rows={[
                { label: t("EKYC_FULL_ADDRESS") || "Full address", value: addressDetails.fullAddress || "H.No. 123, Sector 15, Rohini, Delhi – 110085" },
                { label: t("EKYC_FLAT_HOUSE_NUMBER") || "Flat / House no.", value: addressDetails.flatNo || null },
                { label: t("EKYC_BUILDING_TOWER") || "Building", value: addressDetails.building || null },
                { label: t("EKYC_LANDMARK") || "Landmark", value: addressDetails.landmark || null },
                { label: t("EKYC_PINCODE") || "Pincode", value: addressDetails.pincode || "110085" },
                { label: t("EKYC_ASSEMBLY") || "Assembly", value: addressDetails.assembly || "AC-12 Chandni Chowk" },
                { label: t("EKYC_WARD") || "Ward", value: addressDetails.ward || "WARD-45 Civil Lines" },
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
              rows={[
                { label: t("EKYC_PROPERTY_OWNER") || "Property owner", value: propertyDetails.ownerType || "Owner" },
                { label: t("EKYC_PID_NUMBER") || "PID number", value: propertyDetails.pidNumber || null },
                { label: t("EKYC_TYPE_OF_CONNECTION") || "Type of connection", value: propertyDetails.connectionCategory?.label || null },
                { label: t("EKYC_CONNECTION_CATEGORY") || "Connection category", value: propertyDetails.connectionType?.label || null },
                { label: t("EKYC_USER_TYPE") || "User type", value: propertyDetails.userType?.label || null },
                { label: t("EKYC_NO_OF_FLOORS") || "No. of floors", value: propertyDetails.noOfFloors?.label || null },
              ]}
            />

          </div>

          {/* Submit (Non-sticky, at form end) */}
          <div style={{ marginTop: "24px" }}>
            <SubmitBar
              label={t("ES_COMMON_SUBMIT") || "Submit"}
              onSubmit={handleSubmit}
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

export default Review;