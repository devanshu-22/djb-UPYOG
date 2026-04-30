import React, { useState, Fragment, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardSubHeader,
  StatusTable,
  Row,
  SubmitBar,
  Loader,
  ActionBar,
  CheckBox,
  LinkButton,
  EditIcon,
  GenericFileIcon,
} from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

// ─── Constants ───────────────────────────────────────────────────────────────

const ActionButton = ({ jumpTo, state }) => {
  const { t } = useTranslation();
  const history = useHistory();
  function routeTo() {
    history.push(jumpTo, { ...state, isEditing: true });
  }
  return (
    <LinkButton
      label={<EditIcon style={{ marginTop: "-30px", float: "right", position: "relative", bottom: "32px" }} />}
      className="check-page-link-button"
      onClick={routeTo}
    />
  );
};

const checkForNA = (value) => (value !== null && value !== undefined && value !== "") ? value : "N/A";

const boolToYesNo = (value, t) => {
  if (value === true || value === "true" || String(value).toLowerCase() === "yes") return t("CORE_COMMON_YES");
  if (value === false || value === "false" || String(value).toLowerCase() === "no") return t("CORE_COMMON_NO");
  return "N/A";
};

/**
 * Robust data extraction based on the screenshot provided.
 * The API returns { applicationReview: { newData: { ...flatFields } } }
 */
const extractActiveData = (searchData, flowState) => {
  const rawData = (searchData && Object.keys(searchData).length > 0) ? searchData : flowState?.reviewData || {};

  // Navigate through applicationReview -> newData
  const reviewWrapper = rawData?.applicationReview || rawData;
  const applicationData = (Array.isArray(reviewWrapper) ? reviewWrapper[0] : reviewWrapper) || {};
  return applicationData?.newData || applicationData;
};

const Review = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const flowState = location.state || {};
  const { kNumber, kno, edits = {} } = flowState;
  const activeKno = kNumber || kno;

  const { aadhaarData = {}, addressDetails: editedAddress = {}, propertyDetails: editedProperty = {}, meterDetails: editedMeter = {} } = edits;

  const tenantId = Digit.ULBService.getCurrentTenantId();

  const { data: searchData, isLoading: isSearchLoading } = Digit.Hooks.ekyc.useEkycSearchReview(
    { kno: activeKno, fetchType: "REVIEW" },
    tenantId,
    { enabled: !!activeKno }
  );

  // ── Data Consolidation ──────────────────────────────────────────────────
  const activeData = extractActiveData(searchData, flowState);

  // Support both structured (connectionDetails.x) and flat (x) formats
  const apiConn = activeData?.connectionDetails || activeData || {};
  const apiAddr = activeData?.addressDetails || activeData || {};
  const apiProp = activeData?.propertyInfo || activeData || {};
  const apiMeter = activeData?.meterDetails || activeData || {};

  const connectionData = {
    consumerName: aadhaarData?.name || apiConn?.consumerName,
    address: apiConn?.address || apiConn?.addressRaw,
    connectionType: apiConn?.connectionType || apiConn?.connectionCategory,
    meterNumber: apiConn?.meterNumber || apiConn?.meterNo,
    phoneNumber: aadhaarData?.mobileNumber || apiConn?.phoneNumber || apiConn?.mobileNo,
    email: apiConn?.email,
    statusflag: apiConn?.statusflag || apiConn?.statusFlag,
    ekycStatus: apiConn?.ekycStatus,
    knumber: apiConn?.knumber || apiConn?.kno || activeKno,
  };

  const addressData = {
    fullAddress: editedAddress?.fullAddress || apiAddr?.fullAddress || apiAddr?.addressRaw,
    flatHouseNumber: editedAddress?.flatHouseNumber || editedAddress?.flatNo || apiAddr?.flatHouseNumber,
    buildingTower: editedAddress?.buildingTower || editedAddress?.building || apiAddr?.buildingTower,
    landmark: editedAddress?.landmark || apiAddr?.landmark,
    pinCode: editedAddress?.pinCode || editedAddress?.pincode || apiAddr?.pinCode || apiAddr?.pincode,
    ward: editedAddress?.ward || apiAddr?.ward || apiAddr?.locality,
    assembly: editedAddress?.assembly || apiAddr?.assembly,
    gpsValid: editedAddress?.gpsValid !== undefined ? editedAddress.gpsValid : apiAddr?.gpsValid,
    latitude: editedAddress?.latitude || apiAddr?.latitude,
    longitude: editedAddress?.longitude || apiAddr?.longitude,
    mobileNo: editedAddress?.mobileNo || aadhaarData?.mobileNumber || apiAddr?.mobileNo,
    whatsappNo: editedAddress?.whatsappNo || aadhaarData?.whatsappNumber || apiAddr?.whatsappNo,
    email: editedAddress?.email || apiAddr?.email,
    noOfPerson: editedAddress?.noOfPerson || aadhaarData?.noOfPersons || apiAddr?.noOfPerson,
    knumber: editedAddress?.knumber || apiAddr?.knumber || apiAddr?.kno || activeKno,
    doorPhotoFilestoreId: editedAddress?.doorPhotoFileStoreId || apiAddr?.doorPhotoFilestoreId,
  };

  const propertyData = {
    kno: apiProp?.kno || activeKno,
    pidNumber: editedProperty?.pidNumber || apiProp?.pidNumber,
    typeOfConnection: editedProperty?.connectionTypeData?.label || apiProp?.typeOfConnection,
    connectionCategory: editedProperty?.connectionCategoryData?.label || apiProp?.connectionCategory,
    userType: editedProperty?.userTypeData?.label || apiProp?.userType,
    numberOfFloors: editedProperty?.noOfFloorsData?.label || apiProp?.numberOfFloors,
    tenantName: apiProp?.tenantName,
    tenantMobile: apiProp?.tenantMobile,
    ekycStatus: apiProp?.ekycStatus,
    propertyDocumentFileStoreId: editedProperty?.propertyDocumentFileStoreId || apiProp?.propertyDocumentFileStoreId,
    buildingImageFileStoreId: apiProp?.buildingImageFileStoreId,
  };

  const meterData = {
    kno: editedMeter?.kno || apiMeter?.kno || activeKno,
    metered: editedMeter?.meterStatusData?.value === "Metered" || apiMeter?.metered,
    meterNumber: apiMeter?.meterNumber || apiMeter?.meterNo,
    meterMake: editedMeter?.meterMake || apiMeter?.meterMake,
    meterLocationAddress: editedMeter?.meterLocation || apiMeter?.meterLocationAddress,
    meterLatitude: apiMeter?.meterLatitude,
    meterLongitude: apiMeter?.meterLongitude,
    workingStatus: editedMeter?.workingStatusData?.value === "Working" || apiMeter?.workingStatus,
    lastBillRaised: editedMeter?.lastBillRaisedData?.value === "Yes" || apiMeter?.lastBillRaised,
    systemMeterId: apiMeter?.systemMeterId,
    meterPhotoFileStoreId: editedMeter?.meterPhotoFileStoreId || apiMeter?.meterPhotoFileStoreId,
  };

  const handleDeclaration = () => setAgree(!agree);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        kno: activeKno,
        tenantId: tenantId,
        newData: {
          connectionDetails: connectionData,
          addressDetails: addressData,
          propertyInfo: propertyData,
          meterDetails: meterData,
        },
      };

      const result = await Digit.EkycService.application_update(payload, tenantId);
      if (result) {
        history.push("/digit-ui/employee/ekyc/response", { success: true, result });
      }
    } catch (err) {
      console.error("Submit Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSearchLoading || isSubmitting) return <Loader />;

  const baseUrl = "/digit-ui/employee/ekyc";

  return (
    <div className="review-container">
      <Card>
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <CardHeader style={{ margin: 0 }}>{t("EKYC_REVIEW_APPLICATION")}</CardHeader>
          <div style={{
            background: "#F9FAFB", border: "0.5px solid #EAECF0",
            borderRadius: "20px", padding: "4px 14px",
            fontSize: "12px", color: "#667085",
          }}>
            {t("EKYC_K_NUMBER")}: <span style={{ color: "#0B0C0C", fontWeight: "600" }}>{activeKno}</span>
          </div>
        </div>

        {/* ── 1. Connection Details ────────────────────────────────────── */}
        <CardSubHeader>{t("EKYC_CONNECTION_DETAILS")}</CardSubHeader>
        <StatusTable style={{ marginTop: "20px", marginBottom: "30px" }}>
          <Row label={t("EKYC_K_NUMBER")} text={checkForNA(connectionData.knumber)} />
          <Row label={t("EKYC_CONSUMER_NAME")} text={checkForNA(connectionData.consumerName)} />
          <Row label={t("EKYC_ADDRESS")} text={checkForNA(connectionData.address)} />
          <Row label={t("EKYC_CONNECTION_TYPE")} text={checkForNA(connectionData.connectionType)} />
          <Row label={t("EKYC_METER_NO")} text={checkForNA(connectionData.meterNumber)} />
          <Row label={t("EKYC_MOBILE_NO")} text={checkForNA(connectionData.phoneNumber)} />
          <Row label={t("EKYC_EMAIL")} text={checkForNA(connectionData.email)} />
          <Row label={t("EKYC_STATUS_FLAG")} text={checkForNA(connectionData.statusflag)} />
          <Row label={t("EKYC_STATUS")} text={checkForNA(connectionData.ekycStatus)} />
        </StatusTable>

        {/* ── 2. Address Details ──────────────────────────────────────── */}
        <CardSubHeader>{t("EKYC_ADDRESS_DETAILS")}</CardSubHeader>
        <StatusTable style={{ marginTop: "20px", marginBottom: "30px" }}>
          <Row
            label={t("EKYC_FULL_ADDRESS")}
            text={checkForNA(addressData.fullAddress)}
            actionButton={<ActionButton jumpTo={`${baseUrl}/address-details`} state={{ ...flowState, reviewData: searchData, edits }} />}
          />
          <Row label={t("EKYC_FLAT_HOUSE_NO")} text={checkForNA(addressData.flatHouseNumber)} />
          <Row label={t("EKYC_BUILDING_TOWER")} text={checkForNA(addressData.buildingTower)} />
          <Row label={t("EKYC_LANDMARK")} text={checkForNA(addressData.landmark)} />
          <Row label={t("EKYC_PINCODE")} text={checkForNA(addressData.pinCode)} />
          <Row label={t("EKYC_LOCALITY")} text={checkForNA(addressData.ward)} />
          <Row label={t("EKYC_ASSEMBLY")} text={checkForNA(addressData.assembly)} />
          <Row label={t("EKYC_GPS_VALID")} text={boolToYesNo(addressData.gpsValid, t)} />
          <Row label={t("EKYC_LATITUDE")} text={checkForNA(addressData.latitude)} />
          <Row label={t("EKYC_LONGITUDE")} text={checkForNA(addressData.longitude)} />
          <Row label={t("EKYC_MOBILE_NO")} text={checkForNA(addressData.mobileNo)} />
          <Row label={t("EKYC_WHATSAPP_NO")} text={checkForNA(addressData.whatsappNo)} />
          <Row label={t("EKYC_EMAIL")} text={checkForNA(addressData.email)} />
          <Row label={t("EKYC_NO_OF_PERSONS")} text={checkForNA(addressData.noOfPerson)} />
          <Row label={t("EKYC_K_NUMBER")} text={checkForNA(addressData.knumber)} />
        </StatusTable>

        {/* ── 3. Property Info ────────────────────────────────────────── */}
        <CardSubHeader>{t("EKYC_PROPERTY_INFO")}</CardSubHeader>
        <StatusTable style={{ marginTop: "20px", marginBottom: "30px" }}>
          <Row
            label={t("EKYC_CONNECTION_CATEGORY")}
            text={checkForNA(propertyData.connectionCategory)}
            actionButton={<ActionButton jumpTo={`${baseUrl}/property-info`} state={{ ...flowState, reviewData: searchData, edits }} />}
          />
          {/* <Row label={t("EKYC_KNO")} text={checkForNA(propertyData.kno)} /> */}
          <Row label={t("EKYC_PID_NUMBER")} text={checkForNA(propertyData.pidNumber)} />
          <Row label={t("EKYC_TYPE_OF_CONNECTION")} text={checkForNA(propertyData.typeOfConnection)} />
          <Row label={t("EKYC_USER_TYPE")} text={checkForNA(propertyData.userType)} />
          <Row label={t("EKYC_FLOOR_COUNT")} text={checkForNA(propertyData.numberOfFloors)} />
          <Row label={t("EKYC_TENANT_NAME")} text={checkForNA(propertyData.tenantName)} />
          <Row label={t("EKYC_TENANT_MOBILE")} text={checkForNA(propertyData.tenantMobile)} />
          <Row label={t("EKYC_STATUS")} text={checkForNA(propertyData.ekycStatus)} />
        </StatusTable>

        {/* ── 4. Meter Details ────────────────────────────────────────── */}
        <CardSubHeader>{t("EKYC_METER_DETAILS")}</CardSubHeader>
        <StatusTable style={{ marginTop: "20px", marginBottom: "30px" }}>
          <Row
            label={t("EKYC_METERED")}
            text={boolToYesNo(meterData.metered, t)}
            actionButton={<ActionButton jumpTo={`${baseUrl}/meter-details`} state={{ ...flowState, reviewData: searchData, edits }} />}
          />
          {/* <Row label={t("EKYC_KNO")} text={checkForNA(meterData.kno)} /> */}
          <Row label={t("EKYC_METER_NO")} text={checkForNA(meterData.meterNumber)} />
          <Row label={t("EKYC_METER_MAKE")} text={checkForNA(meterData.meterMake)} />
          <Row label={t("EKYC_METER_LOCATION_ADDRESS")} text={checkForNA(meterData.meterLocationAddress)} />
          <Row label={t("EKYC_METER_LATITUDE")} text={checkForNA(meterData.meterLatitude)} />
          <Row label={t("EKYC_METER_LONGITUDE")} text={checkForNA(meterData.meterLongitude)} />
          <Row label={t("EKYC_WORKING_STATUS")} text={boolToYesNo(meterData.workingStatus, t)} />
          <Row label={t("EKYC_LAST_BILL_RAISED")} text={boolToYesNo(meterData.lastBillRaised, t)} />
          <Row label={t("EKYC_SYSTEM_METER_ID")} text={checkForNA(meterData.systemMeterId)} />
        </StatusTable>

        {/* ── 5. Documents ────────────────────────────────────────────── */}
        <CardSubHeader>{t("EKYC_DOCUMENTS")}</CardSubHeader>
        <StatusTable style={{ marginTop: "20px", marginBottom: "30px" }}>
          <Row
            label={t("EKYC_DOOR_PHOTO")}
            text={addressData.doorPhotoFilestoreId ? t("EKYC_PHOTO_AVAILABLE") : t("CS_NA")}
            actionButton={addressData.doorPhotoFilestoreId && <GenericFileIcon style={{ cursor: "pointer" }} />}
          />
          <Row
            label={t("EKYC_METER_PHOTO")}
            text={meterData.meterPhotoFileStoreId ? t("EKYC_PHOTO_AVAILABLE") : t("CS_NA")}
            actionButton={meterData.meterPhotoFileStoreId && <GenericFileIcon style={{ cursor: "pointer" }} />}
          />
          <Row
            label={t("EKYC_BUILDING_IMAGE")}
            text={propertyData.buildingImageFileStoreId ? t("EKYC_PHOTO_AVAILABLE") : t("CS_NA")}
            actionButton={propertyData.buildingImageFileStoreId && <GenericFileIcon style={{ cursor: "pointer" }} />}
          />
          <Row
            label={t("EKYC_PROPERTY_DOCUMENTS")}
            text={propertyData.propertyDocumentFileStoreId ? t("EKYC_DOCS_AVAILABLE") : t("CS_NA")}
            actionButton={propertyData.propertyDocumentFileStoreId && <GenericFileIcon style={{ cursor: "pointer" }} />}
          />
        </StatusTable>

        <CheckBox
          id="agreeDeclaration"
          name="agreeDeclaration"
          label={t("EKYC_FINAL_DECLARATION")}
          onChange={handleDeclaration}
          checked={agree}
          style={{ marginTop: "20px" }}
        />
      </Card>

      <ActionBar style={{ position: "static", marginTop: "24px" }}>
        <SubmitBar
          label={t("EKYC_SUBMIT_APPLICATION")}
          onSubmit={handleFinalSubmit}
          disabled={!agree}
        />
      </ActionBar>
    </div>
  );
};

export default Review;