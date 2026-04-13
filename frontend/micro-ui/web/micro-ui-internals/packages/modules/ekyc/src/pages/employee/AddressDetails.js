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
  InfoBannerIcon,
  PropertyHouse,
  LocationIcon,
  HomeIcon,
  ConnectingCheckPoints,
  CheckPoint,
} from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

// ─── Icons ────────────────────────────────────────────────────────────────────

const FlagIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14.4 6L13.6 4H5V21H7V14H12.6L13.4 16H20V6H14.4Z" fill="#0F6E56" />
  </svg>
);

const IdCardIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5H4C2.9 5 2 5.9 2 7ZM12 11H14V13H12V11ZM12 7H14V9H12V7ZM16 11H20V13H16V11ZM16 7H20V9H16V7ZM4 7H10V15H4V7ZM20 17H4V16H20V17Z"
      fill="#185FA5"
    />
  </svg>
);

const CameraIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
      fill="#185FA5"
    />
  </svg>
);

const TargetIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z"
      fill="#185FA5"
    />
  </svg>
);

const PincodeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M13 13V11H15V13H13ZM13 9V7H15V9H13ZM17 13V11H19V13H17ZM17 9V7H19V9H17ZM11 13V11H9V13H11ZM11 9V7H9V9H11ZM7 13V11H5V13H7ZM7 9V7H5V9H7ZM21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM21 19H3V5H21V19Z"
      fill="currentColor"
    />
  </svg>
);

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D92D20" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CheckIcon = ({ size = 11, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Reusable: Icon-prefixed input ────────────────────────────────────────────

const IconInput = ({ icon, topAligned = false, inputStyle = {}, ...props }) => (
  <div style={{ position: "relative", width: "100%" }}>
    <div style={{
      position: "absolute",
      left: "10px",
      ...(topAligned ? { top: "14px" } : { top: "50%", transform: "translateY(-50%)" }),
      zIndex: 1,
      opacity: 0.45,
      display: "flex",
      pointerEvents: "none",
    }}>
      {icon}
    </div>
    <TextInput
      textInputStyle={{ paddingLeft: "36px", paddingRight: "12px", ...inputStyle }}
      {...props}
    />
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

// ─── Reusable: Admin info card ────────────────────────────────────────────────

const AdminCard = ({ bgColor, iconBg, icon, labelColor, label, value }) => (
  <div style={{
    backgroundColor: bgColor,
    padding: "14px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "0.5px solid #EAECF0",
  }}>
    <div style={{ backgroundColor: iconBg, padding: "8px", borderRadius: "8px", display: "flex", flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ color: labelColor, fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: "#101828" }}>{value}</div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AddressDetails = ({ isSection = false, onComplete, parentState }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  const flowState = parentState || location.state || {
    kNumber: "EKYC-1234567890",
    selectedOption: { code: "SELF", name: "EKYC_SELF" },
    connectionDetails: null,
  };

  const addrDetails = flowState.connectionDetails?.addressDetails || {};

  const [addressType, setAddressType] = useState({ code: "AADHAAR", name: "EKYC_AADHAAR_ADDRESS" });
  const [correctAddress, setCorrectAddress] = useState({ code: "NO", name: "CORE_COMMON_NO" });
  const [fullAddress, setFullAddress] = useState(addrDetails.fullAddress || "");
  const [flatNo, setFlatNo] = useState(addrDetails.flatHouseNumber || "");
  const [building, setBuilding] = useState(addrDetails.buildingTower || "");
  const [landmark, setLandmark] = useState(addrDetails.landmark || "");
  const [pincode, setPincode] = useState(addrDetails.pinCode || "");
  const [doorPhoto, setDoorPhoto] = useState(null);
  const [isLocationFetching, setIsLocationFetching] = useState(false);
  const fileInputRef = useRef(null);

  const addressOptions = [
    { code: "AADHAAR", name: "EKYC_AADHAAR_ADDRESS" },
    { code: "OLD", name: "EKYC_OLD_ADDRESS" },
  ];

  const yesNoOptions = [
    { code: "YES", name: "CORE_COMMON_YES" },
    { code: "NO", name: "CORE_COMMON_NO" },
  ];

  const handleCompleteVerification = () => {
    const payload = { addressType, fullAddress, flatNo, building, landmark, pincode, doorPhoto };
    if (onComplete) {
      onComplete(payload);
    } else {
      const { kNumber, selectedOption, connectionDetails } = flowState;
      history.push("/digit-ui/employee/ekyc/property-info", {
        kNumber, selectedOption, connectionDetails, addressDetails: payload,
      });
    }
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setDoorPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setDoorPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      alert(t("GEOLOCATION_NOT_SUPPORTED") || "Geolocation is not supported by your browser");
      return;
    }
    setIsLocationFetching(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (!res.ok) throw new Error("Geocode failed");
          const data = await res.json();
          if (data?.address) {
            const a = data.address;
            setFullAddress([a.amenity, a.road, a.neighbourhood, a.suburb, a.city, a.state, a.postcode].filter(Boolean).join(", "));
            setPincode(a.postcode || "");
            setLandmark(a.suburb || a.neighbourhood || "");
            setFlatNo(a.amenity || "");
          }
        } catch (err) {
          console.error("Reverse geocode error:", err);
        } finally {
          setIsLocationFetching(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocationFetching(false);
        alert(t("LOCATION_FETCH_FAILED") || "Failed to fetch location. Please grant location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const renderContent = () => (
    <div style={{ animation: "fadeSlideIn 0.3s ease" }}>

      {/* ── Address Type Toggle ── */}
      <SectionHead
        icon={<LocationIcon className="icon" styles={{ fill: "#0B0C0C", width: "16px", height: "16px" }} />}
        label={t("EKYC_ADDRESS_DETAILS_HEADER") || "Address Details"}
      />

      <div style={{ marginBottom: "20px" }}>
        <RadioButtons
          options={addressOptions}
          optionsKey="name"
          selectedOption={addressType}
          onSelect={setAddressType}
          t={t}
          innerStyles={{ display: "flex", alignItems: "center" }}
          style={{ display: "flex", gap: "40px" }}
        />
      </div>

      {/* ── Aadhaar Address display ── */}
      {addressType.code === "AADHAAR" && (
        <div style={{
          backgroundColor: "#E1F5EE",
          border: "0.5px solid #5DCAA5",
          borderRadius: "8px",
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "20px",
          animation: "fadeSlideIn 0.3s ease",
        }}>
          <div style={{ backgroundColor: "#9FE1CB", padding: "6px", borderRadius: "6px", display: "flex", flexShrink: 0 }}>
            <LocationIcon className="icon" styles={{ fill: "#085041", width: "16px", height: "16px" }} />
          </div>
          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#04342C", fontWeight: "500" }}>
            {addrDetails.fullAddress || "H.No. 123, Sector 15, Rohini, Delhi – 110085"}
          </div>
        </div>
      )}

      {/* ── Old / Custom Address ── */}
      {addressType.code === "OLD" && (
        <div style={{ animation: "fadeSlideIn 0.3s ease" }}>

          {/* Correction toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <CardLabel style={{ fontWeight: "500", marginBottom: 0, fontSize: "13px", color: "#505A5F" }}>
              {t("EKYC_ADDRESS_CORRECTION_PROMPT") || "Correct the address?"}
            </CardLabel>
            <RadioButtons
              options={yesNoOptions}
              optionsKey="name"
              selectedOption={correctAddress}
              onSelect={setCorrectAddress}
              t={t}
              innerStyles={{ display: "flex", gap: "20px" }}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Use Current Location */}
          <div
            onClick={!isLocationFetching ? handleUseCurrentLocation : undefined}
            style={{
              border: "0.5px solid #D0D5DD",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              cursor: isLocationFetching ? "not-allowed" : "pointer",
              backgroundColor: isLocationFetching ? "#F9FAFB" : "#fff",
              transition: "background 0.15s",
              opacity: isLocationFetching ? 0.7 : 1,
            }}
            onMouseOver={(e) => { if (!isLocationFetching) e.currentTarget.style.background = "#F9FAFB"; }}
            onMouseOut={(e) => { if (!isLocationFetching) e.currentTarget.style.background = "#fff"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ backgroundColor: "#E6F1FB", padding: "7px", borderRadius: "7px", display: "flex" }}>
                {isLocationFetching ? (
                  <div style={{
                    width: "18px", height: "18px", border: "2px solid #185FA5",
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }} />
                ) : (
                  <TargetIcon size={18} />
                )}
              </div>
              <span style={{ fontWeight: "500", fontSize: "14px", color: "#344054" }}>
                {isLocationFetching
                  ? t("EKYC_FETCHING_LOCATION") || "Fetching location..."
                  : t("EKYC_USE_CURRENT_LOCATION") || "Use current location"}
              </span>
            </div>
            {!isLocationFetching && (
              <span style={{ fontSize: "18px", color: "#98A2B3", lineHeight: 1 }}>›</span>
            )}
          </div>

          {/* Full Address (textarea-style) */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              {t("EKYC_FULL_ADDRESS") || "Full address"}
            </div>
            <IconInput
              icon={<PropertyHouse styles={{ fill: "#0068fa", width: "15px", height: "15px" }} />}
              topAligned
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder={t("EKYC_ENTER_FULL_ADDRESS") || "Enter full address"}
              inputStyle={{ minHeight: "72px" }}
            />
          </div>

          {/* Flat + Building */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                {t("EKYC_FLAT_HOUSE_NUMBER") || "Flat / House no."}
              </div>
              <IconInput
                icon={<PropertyHouse styles={{ fill: "#0068fa", width: "15px", height: "15px" }} />}
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                placeholder={t("EKYC_ENTER_FLAT_NO") || "e.g. 45-B"}
              />
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                {t("EKYC_BUILDING_TOWER") || "Building / Tower"}
              </div>
              <IconInput
                icon={<PropertyHouse styles={{ fill: "#0068fa", width: "15px", height: "15px" }} />}
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder={t("EKYC_ENTER_BUILDING") || "e.g. Tower 4"}
              />
            </div>
          </div>

          {/* Landmark + Pincode */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "4px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                {t("EKYC_LANDMARK") || "Landmark"}
              </div>
              <IconInput
                icon={<LocationIcon className="icon" styles={{ fill: "#0068fa", width: "15px", height: "15px" }} />}
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={t("EKYC_ENTER_LANDMARK") || "Near Central Park"}
              />
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                {t("EKYC_PINCODE") || "Pincode"}
              </div>
              <IconInput
                icon={<PincodeIcon size={15} />}
                value={pincode}
                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setPincode(e.target.value); }}
                placeholder={t("EKYC_ENTER_PINCODE") || "6-digit pincode"}
                maxLength={6}
              />
            </div>
          </div>
        </div>
      )}

      <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

      {/* ── Administrative Division ── */}
      <SectionHead
        icon={<PropertyHouse styles={{ fill: "#0B0C0C", width: "16px", height: "16px" }} />}
        label={t("EKYC_ADMINISTRATIVE_DIVISION") || "Administrative Division"}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
        <AdminCard
          bgColor="#E1F5EE"
          iconBg="#9FE1CB"
          icon={<FlagIcon size={18} />}
          labelColor="#0F6E56"
          label={t("EKYC_ASSEMBLY") || "Assembly"}
          value={addrDetails.assembly || "AC-12 Chandni Chowk"}
        />
        <AdminCard
          bgColor="#E6F1FB"
          iconBg="#B5D4F4"
          icon={<IdCardIcon size={18} />}
          labelColor="#185FA5"
          label={t("EKYC_WARD") || "Ward"}
          value={addrDetails.ward || "WARD-45 Civil Lines"}
        />
      </div>

      <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #EAECF0" }} />

      {/* ── Door Photo ── */}
      <SectionHead
        icon={<CameraIcon size={16} />}
        label={t("EKYC_DOOR_PHOTO_HEADER") || "Door photo with GPS stamp"}
      />

      <div style={{ fontSize: "12px", color: "#667085", marginBottom: "12px" }}>
        {t("EKYC_REQUIRED_FOR_VERIFICATION") || "Required for verification"}
      </div>

      {/* Warning banner */}
      <div style={{
        backgroundColor: "#FFFAEB",
        border: "0.5px solid #FEDF89",
        borderRadius: "8px",
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        marginBottom: "16px",
      }}>
        <div style={{ flexShrink: 0, marginTop: "1px" }}>
          <InfoBannerIcon fill="#B54708" />
        </div>
        <div>
          <div style={{ fontWeight: "600", color: "#B54708", fontSize: "13px", marginBottom: "2px" }}>
            {t("EKYC_IMPORTANT") || "Important"}
          </div>
          <div style={{ fontSize: "12px", color: "#92400E" }}>
            {t("EKYC_CAPTURE_LIVE_CAMERA") || "Capture with live camera for GPS metadata"}
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCapture}
        accept="image/*"
        style={{ display: "none" }}
      />
      <div
        onClick={!doorPhoto ? () => fileInputRef.current.click() : undefined}
        onMouseOver={(e) => { if (!doorPhoto) e.currentTarget.style.borderColor = "#185FA5"; }}
        onMouseOut={(e) => { if (!doorPhoto) e.currentTarget.style.borderColor = "#D0D5DD"; }}
        style={{
          border: "1.5px dashed #D0D5DD",
          borderRadius: "10px",
          minHeight: "160px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F9FAFB",
          cursor: doorPhoto ? "default" : "pointer",
          overflow: "hidden",
          transition: "border-color 0.15s",
          position: "relative",
          padding: doorPhoto ? "0" : "32px 24px",
        }}
      >
        {!doorPhoto ? (
          <>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "#E6F1FB", display: "flex",
              alignItems: "center", justifyContent: "center", marginBottom: "12px",
            }}>
              <CameraIcon size={26} />
            </div>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#101828", marginBottom: "4px" }}>
              {t("EKYC_TAP_TO_CAPTURE") || "Tap to capture"}
            </div>
            <div style={{ fontSize: "12px", color: "#667085" }}>
              {t("EKYC_CAPTURE_DOOR_IMAGE") || "Capture door image"}
            </div>
          </>
        ) : (
          <>
            <img
              src={doorPhoto}
              alt="Door"
              style={{ width: "100%", maxHeight: "280px", objectFit: "cover", display: "block" }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); removePhoto(); }}
              style={{
                position: "absolute", top: "10px", right: "10px",
                background: "#fff", border: "0.5px solid #EAECF0",
                borderRadius: "7px", padding: "6px 10px",
                display: "flex", alignItems: "center", gap: "5px",
                cursor: "pointer", fontSize: "12px", color: "#D92D20", fontWeight: "500",
              }}
            >
              <TrashIcon size={13} /> {t("EKYC_REMOVE") || "Remove"}
            </button>
          </>
        )}
      </div>

      {/* Submit */}
      {isSection ? (
        <div style={{ marginTop: "24px" }}>
          <SubmitBar
            label={t("EKYC_COMPLETE_VERIFICATION_AND_PROCEED") || "Complete & Proceed"}
            onSubmit={handleCompleteVerification}
          />
        </div>
      ) : (
        <ActionBar>
          <SubmitBar
            label={t("EKYC_COMPLETE_VERIFICATION") || "Complete Verification"}
            onSubmit={handleCompleteVerification}
          />
        </ActionBar>
      )}

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
    </div>
  );

  // ── When rendered as inline section inside AadhaarVerification ──
  if (isSection) {
    return (
      <Fragment>
        <hr style={{ margin: "32px 0", border: 0, borderTop: "2px solid #EAECF0" }} />
        {renderContent()}
      </Fragment>
    );
  }

  // ── When rendered as a standalone page ──
  return (
    <div className="inbox-container">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Sidebar */}
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
            { label: t("EKYC_STEP_ADDRESS") || "Address", done: false, active: true },
            { label: t("EKYC_STEP_PROPERTY") || "Property", done: false, active: false },
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

      {/* Main */}
      <div style={{ flex: 1, marginLeft: "16px" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <CardHeader style={{ margin: 0, fontSize: "18px" }}>
              {t("EKYC_ADDRESS_DETAILS_HEADER") || "Address Details"}
            </CardHeader>
            <div style={{
              background: "#F9FAFB", border: "0.5px solid #EAECF0",
              borderRadius: "20px", padding: "4px 14px",
              fontSize: "12px", color: "#667085",
            }}>
              {t("EKYC_K_NUMBER") || "K Number"}:{" "}
              <span style={{ color: "#0B0C0C", fontWeight: "600" }}>{flowState?.kNumber}</span>
            </div>
          </div>
          {renderContent()}
        </Card>
      </div>
    </div>
  );
};

export default AddressDetails;