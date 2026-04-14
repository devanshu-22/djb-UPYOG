import React, { useState, useRef, Fragment } from "react";
import {
  Card,
  LabelFieldPair,
  CardLabel,
  TextInput,
  SubmitBar,
  CardHeader,
  RadioButtons,
  ActionBar,
  HomeIcon,
  ConnectingCheckPoints,
  CheckPoint,
} from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import AddressDetails from "./AddressDetails";

// ─── Icons ───────────────────────────────────────────────────────────────────

const LockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-5.37-5.37 19.79 19.79 0 01-3.07-8.63A2 2 0 014.82 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const WhatsappIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"
      fill="#25D366"
    />
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
      stroke="#25D366" strokeWidth="1.8" strokeLinecap="round"
    />
  </svg>
);

const MailIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const UsersIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckIcon = ({ size = 15, color = "#1D9E75" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Reusable: Icon-prefixed input wrapper ────────────────────────────────────

const IconInput = ({ icon, rightIcon, inputStyle = {}, ...props }) => (
  <div style={{ position: "relative", width: "100%" }}>
    <div style={{
      position: "absolute", left: "10px", top: "50%",
      transform: "translateY(-50%)", zIndex: 1, opacity: 0.45,
      display: "flex", pointerEvents: "none",
    }}>
      {icon}
    </div>
    <TextInput
      textInputStyle={{ paddingLeft: "36px", paddingRight: rightIcon ? "36px" : "12px", ...inputStyle }}
      {...props}
    />
    {rightIcon && (
      <div style={{
        position: "absolute", right: "10px", top: "50%",
        transform: "translateY(-50%)", display: "flex",
      }}>
        {rightIcon}
      </div>
    )}
  </div>
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

// ─── Reusable: Radio toggle row ───────────────────────────────────────────────

const RadioToggleRow = ({ label, selected, onSelect, t, options }) => (
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: "8px",
  }}>
    <CardLabel style={{ fontWeight: "500", marginBottom: 0, fontSize: "13px", color: "#505A5F" }}>
      {label}
    </CardLabel>
    <RadioButtons
      options={options}
      optionsKey="name"
      selectedOption={selected}
      onSelect={onSelect}
      t={t}
      innerStyles={{ display: "flex", gap: "20px", alignItems: "center" }}
      style={{ display: "flex", gap: "20px", marginBottom: 0 }}
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AadhaarVerification = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const addressSectionRef = useRef(null);
  const { kNumber, selectedOption, connectionDetails } = location.state || {
    kNumber: "EKYC-1234567890",
    selectedOption: { code: "SELF", name: "EKYC_SELF" },
    connectionDetails: {
      connectionDetailsInfo: {
        consumerName: "Rajesh Kumar Singh",
        address: "House No. 45, Sector 12, New Delhi - 110001",
        phoneNumber: "9876543210",
        email: "rajesh.singh@example.com",
      },
    },
  };

  // Normalize the nested data shape (API returns .connectionDetails, fallback uses .connectionDetailsInfo)
  const details =
    connectionDetails?.connectionDetails ||
    connectionDetails?.connectionDetailsInfo ||
    {};

  // ── State ──
  const [aadhaarLastFour, setAadhaarLastFour] = useState("");
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nameCorrect, setNameCorrect] = useState({ code: "NO", name: "CORE_COMMON_NO" });
  const [userName, setUserName] = useState(details.consumerName || "");

  const [mobileChange, setMobileChange] = useState({ code: "NO", name: "CORE_COMMON_NO" });
  const [mobileNumber, setMobileNumber] = useState(details.phoneNumber || "");

  const [whatsappNumber, setWhatsappNumber] = useState(details.phoneNumber || "");
  const [email, setEmail] = useState(details.email || "");
  const [noOfPersons, setNoOfPersons] = useState(
    connectionDetails?.addressDetails?.noOfPerson || ""
  );
  const [showAddressSection, setShowAddressSection] = useState(false);
  const [addressData, setAddressData] = useState(null);

  const yesNoOptions = [
    { code: "YES", name: "CORE_COMMON_YES" },
    { code: "NO", name: "CORE_COMMON_NO" },
  ];

  // ── Handlers ──
  const handleVerifyAadhaar = () => {
    if (aadhaarLastFour.length !== 4 || isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsAadhaarVerified(true);
      // Auto-expand address section upon verification
      setShowAddressSection(true);
      setTimeout(() => {
        addressSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1200);
  };

  const handleSaveAndContinue = () => {
    setShowAddressSection(true);
    setTimeout(() => {
      addressSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCompleteAll = (addressDetails) => {
    setAddressData(addressDetails);
    history.push("/digit-ui/employee/ekyc/property-info", {
      kNumber,
      selectedOption,
      connectionDetails,
      aadhaarDetails: {
        aadhaarLastFour,
        isAadhaarVerified,
        userName,
        mobileNumber,
        whatsappNumber,
        email,
        noOfPersons,
      },
      addressDetails,
    });
  };

  // ── Styles ──
  const styles = {
    verifiedInput: {
      borderColor: "#1D9E75",
      backgroundColor: "#E1F5EE",
    },
    verifiedCard: {
      backgroundColor: "#E1F5EE",
      border: "0.5px solid #5DCAA5",
      borderRadius: "8px",
      padding: "16px",
      marginTop: "14px",
      marginBottom: "4px",
      animation: "fadeSlideIn 0.35s ease",
    },
    infoLabel: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#1D9E75",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "3px",
    },
    infoValue: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#04342C",
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "14px",
      marginBottom: "20px",
    },
    optionalTag: {
      display: "inline-block",
      fontSize: "10px",
      background: "#F1EFE8",
      color: "#5F5E5A",
      border: "0.5px solid #D3D1C7",
      borderRadius: "10px",
      padding: "1px 7px",
      marginLeft: "6px",
      fontWeight: "400",
    },
  };

  return (
    <div className="inbox-container">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(29,158,117,0.35); }
          50%       { box-shadow: 0 0 0 6px rgba(29,158,117,0); }
        }
        .ekyc-sidebar-step { display: flex; gap: 10px; align-items: flex-start; position: relative; padding-bottom: 18px; }
        .ekyc-sidebar-step:last-child { padding-bottom: 0; }
        .ekyc-step-line { position: absolute; left: 10px; top: 22px; width: 1px; height: calc(100% - 10px); background: #EAECF0; }
        .ekyc-step-dot { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #D0D5DD; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; color: #98A2B3; background: #fff; flex-shrink: 0; margin-top: 1px; }
        .ekyc-step-dot.active { border-color: #185FA5; color: #185FA5; background: #E6F1FB; }
        .ekyc-step-dot.done { border-color: #0F6E56; background: #0F6E56; color: #fff; }
        .ekyc-step-label { font-size: 12px; color: #667085; padding-top: 2px; }
        .ekyc-step-label.active { color: #0B0C0C; font-weight: 600; }
        .ekyc-step-label.done { color: #0F6E56; }
        .ekyc-field-label { font-size: 11px; font-weight: 600; color: #667085; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
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
            { label: t("EKYC_STEP_AADHAAR") || "Aadhaar", done: showAddressSection, active: !showAddressSection },
            { label: t("EKYC_STEP_ADDRESS") || "Address", done: addressData !== null, active: showAddressSection && addressData === null },
            { label: t("EKYC_STEP_PROPERTY") || "Property", done: false, active: false },
            { label: t("EKYC_STEP_REVIEW") || "Review", done: false, active: false },
          ].map((step, i) => (
            <div className="ekyc-sidebar-step" key={i}>
              <div className={`ekyc-step-dot${step.done ? " done" : step.active ? " active" : ""}`}>
                {step.done
                  ? <CheckIcon size={11} color="#fff" />
                  : i + 1}
              </div>
              {i < 3 && <div className="ekyc-step-line" />}
              <div className={`ekyc-step-label${step.done ? " done" : step.active ? " active" : ""}`}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, marginLeft: "16px" }}>
        <Card>

          {/* K-Number badge */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
            <div style={{
              background: "#F9FAFB", border: "0.5px solid #EAECF0",
              borderRadius: "20px", padding: "4px 14px",
              fontSize: "12px", color: "#667085",
            }}>
              {t("EKYC_K_NUMBER") || "K Number"}:{" "}
              <span style={{ color: "#0B0C0C", fontWeight: "600" }}>{kNumber}</span>
            </div>
          </div>

          {/* ── Section 1: Aadhaar ── */}
          <SectionHead
            icon={<LockIcon size={16} />}
            label={t("EKYC_AADHAAR_NUMBER_HEADER") || "Aadhaar Number"}
          />

          <div className="ekyc-field-label">
            {t("EKYC_LAST_4_DIGIT_AADHAAR") || "Enter 12 digits of Aadhaar"}
          </div>
          <LabelFieldPair>
            <div className="field">
              <IconInput
                icon={<LockIcon size={15} />}
                rightIcon={isAadhaarVerified ? <CheckIcon size={15} /> : null}
                value={aadhaarLastFour}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 12 && /^\d*$/.test(val)) setAadhaarLastFour(val);
                }}
                placeholder={t("EKYC_ENTER_LAST_4_DIGIT") || "Enter 12 digits"}
                maxLength={12}
                disabled={isAadhaarVerified}
                inputStyle={isAadhaarVerified ? styles.verifiedInput : {}}
              />
            </div>
          </LabelFieldPair>

          {!isAadhaarVerified && (
            <SubmitBar
              label={isVerifying
                ? t("EKYC_VERIFYING") || "Verifying..."
                : t("EKYC_VERIFY_AADHAAR_BTN") || "Verify Aadhaar"}
              onSubmit={handleVerifyAadhaar}
              disabled={aadhaarLastFour.length !== 4 || isVerifying}
              style={{ marginTop: "12px" }}
            />
          )}

          {isAadhaarVerified && (
            <div style={styles.verifiedCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: "#9FE1CB", display: "flex", alignItems: "center",
                  justifyContent: "center", animation: "pulseGreen 2s ease infinite",
                  flexShrink: 0,
                }}>
                  <CheckIcon size={13} color="#085041" />
                </div>
                <span style={{ fontWeight: "600", color: "#085041", fontSize: "14px" }}>
                  {t("EKYC_AADHAAR_VERIFIED_SUCCESS") || "Aadhaar Verified Successfully"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={styles.infoLabel}>{t("EKYC_NAME") || "Name"}</div>
                  <div style={styles.infoValue}>{details.consumerName}</div>
                </div>
                <div>
                  <div style={styles.infoLabel}>{t("EKYC_AADHAAR") || "Aadhaar"}</div>
                  <div style={styles.infoValue}>XXXX XXXX {aadhaarLastFour}</div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <div style={styles.infoLabel}>{t("EKYC_ADDRESS") || "Address"}</div>
                  <div style={{ ...styles.infoValue, fontSize: "13px" }}>{details.address}</div>
                </div>
              </div>
            </div>
          )}

          <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

          {/* ── Section 2: Contact Details ── */}
          <SectionHead
            icon={<UserIcon size={16} />}
            label={t("EKYC_CONTACT_DETAILS_HEADER") || "Contact Details"}
          />

          {/* Name */}
          <RadioToggleRow
            label={`${t("EKYC_USER_NAME")} (${t("EKYC_NAME_CORRECT_HINT")})`}
            selected={nameCorrect}
            onSelect={setNameCorrect}
            options={yesNoOptions}
            sty
            t={t}
          />
          <LabelFieldPair>
            <div className="field">
              <IconInput
                icon={<UserIcon size={15} color={nameCorrect.code === "YES" ? "#64748b" : "#94a3b8"} />}
                style={{ marginBottom: "12px" }}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t("EKYC_ENTER_NAME_PLACEHOLDER") || "Enter full name"}
                disabled={nameCorrect.code !== "YES"}
              />
            </div>
          </LabelFieldPair>

          {/* Mobile */}
          <RadioToggleRow
            label={`${t("EKYC_USER_MOBILE_NUMBER")} (${t("EKYC_UPDATE_MOBILE_HINT")})`}
            selected={mobileChange}
            onSelect={setMobileChange}
            options={yesNoOptions}
            t={t}
          />
          <LabelFieldPair>
            <div className="field">
              <IconInput
                icon={<PhoneIcon size={15} color={mobileChange.code === "YES" ? "#64748b" : "#94a3b8"} />}
                style={{ marginBottom: "12px" }}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                disabled={mobileChange.code !== "YES"}
              />
            </div>
          </LabelFieldPair>

          {/* WhatsApp + Email */}
          <div style={styles.twoCol}>
            <div>
              <div className="ekyc-field-label">
                {t("EKYC_WHATSAPP_NUMBER") || "WhatsApp Number"}
              </div>
              <IconInput
                icon={<WhatsappIcon size={15} />}
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <div className="ekyc-field-label">
                {t("EKYC_EMAIL_ADDRESS") || "Email Address"}
                <span style={styles.optionalTag}>{t("EKYC_OPTIONAL") || "Optional"}</span>
              </div>
              <IconInput
                icon={<MailIcon size={15} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("EKYC_EMAIL_ADDRESS_PLACEHOLDER") || "example@email.com"}
              />
            </div>
          </div>

          <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

          {/* ── Section 3: Family Details ── */}
          <SectionHead
            icon={<UsersIcon size={16} />}
            label={t("EKYC_FAMILY_DETAILS_HEADER") || "Family Details"}
          />

          <div className="ekyc-field-label">
            {t("EKYC_NO_OF_PERSONS") || "Number of Family Members"}
          </div>
          <LabelFieldPair>
            <div className="field">
              <IconInput
                icon={<UsersIcon size={15} />}
                value={noOfPersons}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) setNoOfPersons(e.target.value);
                }}
                placeholder={t("EKYC_ENTER_NO_OF_PERSONS") || "Enter total number of persons"}
              />
            </div>
          </LabelFieldPair>

          {/* Save & Continue (Non-sticky, at form end) */}
          {!showAddressSection && (
            <div style={{ marginTop: "24px" }}>
              <SubmitBar
                label={t("ES_COMMON_SAVE_CONTINUE") || "Save & Continue"}
                onSubmit={handleSaveAndContinue}
              />
            </div>
          )}

          {/* Address section (injected inline) */}
          {showAddressSection && (
            <div ref={addressSectionRef}>
              <AddressDetails
                isSection={true}
                onComplete={handleCompleteAll}
                parentState={{ kNumber, selectedOption, connectionDetails }}
              />
            </div>
          )}

          {/* Secure notice */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "5px", marginTop: "20px",
            fontSize: "11px", color: "#98A2B3",
          }}>
            <LockIcon size={11} />
            {t("EKYC_SECURE_DATA_NOTICE") || "Your data is encrypted and secure"}
          </div>

        </Card>
      </div>
    </div>
  );
};

export default AadhaarVerification;