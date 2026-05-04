// import React, { useState, Fragment, useEffect } from "react";
// import {
//   Card,
//   CardLabel,
//   TextInput,
//   SubmitBar,
//   CardHeader,
//   ActionBar,
//   Dropdown,
//   UploadFile,
//   Toast,
//   FormStep,
// } from "@djb25/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// import { useHistory, useLocation } from "react-router-dom";
// import { getSavedData } from "../../utils";

// const MeterDetails = ({ config, onSelect, formData, t: tProps }) => {
//   const { t } = useTranslation();
//   const history = useHistory();
//   const location = useLocation();

//   const flowState = location.state || {};
//   const { isEditing, kNumber } = flowState;

//   // Robust data extraction from formData
//   const activeEdits = formData || {};
//   const rawReviewData = formData?.reviewData || formData?.connectionDetails || {};
//   const reviewWrapper = rawReviewData?.applicationReview || rawReviewData;
//   const applicationData = (Array.isArray(reviewWrapper) ? reviewWrapper[0] : reviewWrapper) || {};
//   const apiData = applicationData?.newData || applicationData;
//   const apiMeter = apiData?.meterDetails || apiData || {};

//   const tenantId = Digit.ULBService.getCurrentTenantId();

//   const { data: dataV0 } = Digit.Hooks.ekyc.useGetPropertyType(tenantId);
//   const { data: dataConn } = Digit.Hooks.ekyc.useGetConnectionTypeV2(tenantId);

//   const mtrData = activeEdits?.meterDetails || {};

//   const [meterStatus, setMeterStatus] = useState(mtrData.meterStatusData || (apiMeter.metered !== undefined ? { label: apiMeter.metered ? t("EKYC_METER_METERED") : t("EKYC_METER_UNMETERED"), value: apiMeter.metered ? "Metered" : "Unmetered" } : (apiMeter.meterStatus ? { label: t(`EKYC_METER_${apiMeter.meterStatus}`), value: apiMeter.meterStatus } : null)));
//   const [meterPhoto, setMeterStatusPhoto] = useState(mtrData.meterPhoto || null);
//   const [meterPhotoFileStoreId, setMeterStatusPhotoFileStoreId] = useState(mtrData.meterPhotoFileStoreId || apiMeter.meterPhotoFileStoreId || null);
//   const [workingStatus, setWorkingStatus] = useState(mtrData.workingStatusData || (apiMeter.workingStatus !== undefined ? { label: apiMeter.workingStatus ? t("EKYC_METER_WORKING") : t("EKYC_METER_NOT_WORKING"), value: apiMeter.workingStatus ? "Working" : "Not Working" } : (apiMeter.workingStatus ? { label: t(`EKYC_METER_${apiMeter.workingStatus}`), value: apiMeter.workingStatus } : null)));
//   const [meterLocation, setMeterLocation] = useState(mtrData.meterLocation || apiMeter.meterLocationAddress || apiMeter.meterLocation || "");
//   const [lastBillRaised, setLastBillRaised] = useState(mtrData.lastBillRaisedData || (apiMeter.lastBillRaised !== undefined ? { label: apiMeter.lastBillRaised ? t("CORE_COMMON_YES") : t("CORE_COMMON_NO"), value: apiMeter.lastBillRaised ? "Yes" : "No" } : (apiMeter.lastBillRaised ? { label: t(`EKYC_${apiMeter.lastBillRaised}`), value: apiMeter.lastBillRaised } : null)));
//   const [sewerConnection, setSewerConnection] = useState(mtrData.sewerConnectionData || (apiMeter.sewerConnection ? { label: t(`EKYC_${apiMeter.sewerConnection}`), value: apiMeter.sewerConnection } : null));
//   const [connectionCategory, setConnectionCategory] = useState(mtrData.connectionCategoryData || (apiMeter.connectionCategory ? { label: t(apiMeter.connectionCategory), value: apiMeter.connectionCategory } : (apiMeter.typeOfConnection ? { label: t(apiMeter.typeOfConnection), value: apiMeter.typeOfConnection } : null)));
//   const [connectionType, setConnectionType] = useState(mtrData.connectionTypeData || (apiMeter.connectionType ? { label: t(apiMeter.connectionType), value: apiMeter.connectionType } : (apiMeter.connectionCategory ? { label: t(apiMeter.connectionCategory), value: apiMeter.connectionCategory } : null)));

//   const [toast, setToast] = useState(null);

//   const getUpdatedData = () => ({
//     meterStatusData: meterStatus,
//     meterPhoto,
//     meterPhotoFileStoreId,
//     workingStatusData: workingStatus,
//     meterLocation,
//     lastBillRaisedData: lastBillRaised,
//     sewerConnectionData: sewerConnection,
//     connectionCategoryData: connectionCategory,
//     connectionTypeData: connectionType,
//   });

//   const selectphoto = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size >= 2000000) {
//         setToast({ type: "error", message: t("EKYC_MAXIMUM_UPLOAD_SIZE_EXCEEDED") });
//         return;
//       }
//       try {
//         const res = await Digit.UploadServices.Filestorage("EKYC", file, tenantId);
//         if (res?.data?.files?.[0]?.fileStoreId) {
//           const fileStoreId = res.data.files[0].fileStoreId;
//           setMeterStatusPhotoFileStoreId(fileStoreId);
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             setMeterStatusPhoto(reader.result);
//             if (onSelect) {
//               onSelect(config.key, { ...getUpdatedData(), meterPhoto: reader.result, meterPhotoFileStoreId: fileStoreId });
//             }
//           };
//           reader.readAsDataURL(file);
//           setToast({ type: "success", message: t("EKYC_UPLOAD_SUCCESS") });
//         }
//       } catch (err) {
//         setToast({ type: "error", message: t("EKYC_FILE_UPLOAD_ERROR") });
//       }
//     }
//   };

//   const onStepSelect = () => {
//     const updatedData = getUpdatedData();
//     if (onSelect) {
//       onSelect(config.key, updatedData);
//     } else {
//       if (isEditing) {
//         history.push("/digit-ui/employee/ekyc/review", { ...location.state, edits: { ...edits, meterDetails: updatedData } });
//       } else {
//         history.push("/digit-ui/employee/ekyc/review", {
//           ...location.state,
//           edits: { ...edits, meterDetails: updatedData }
//         });
//       }
//     }
//   };

//   const handleUpdateAndReturn = () => {
//     history.push("/digit-ui/employee/ekyc/review", { ...location.state, edits: { ...edits, meterDetails: getUpdatedData() } });
//   };

//   const meterStatusOptions = [
//     { label: t("EKYC_METER_METERED"), value: "Metered" },
//     { label: t("EKYC_METER_UNMETERED"), value: "Unmetered" },
//   ];

//   const workingStatusOptions = [
//     { label: t("EKYC_METER_WORKING"), value: "Working" },
//     { label: t("EKYC_METER_NOT_WORKING"), value: "Not Working" },
//   ];

//   const yesNoOptions = [
//     { label: t("CORE_COMMON_YES"), value: "Yes" },
//     { label: t("CORE_COMMON_NO"), value: "No" },
//   ];

//   const connectionCategoryOptions = dataV0?.["ws-services-calculation"]?.propertyTypeV2?.map((item) => ({
//     label: t(item.code), value: item.code,
//   })) || [];

//   const connectionTypeOptions = dataConn?.["ws-services-calculation"]?.connectionTypeV2?.map((item) => ({
//     label: t(item.code), value: item.code,
//   })) || [];

//   return (
//     <Fragment>
//       <FormStep t={t} onSelect={onStepSelect} config={config || {}} label={t(config?.texts?.submitBarLabel) || (isEditing ? t("EKYC_UPDATE_AND_RETURN") : t("ES_COMMON_CONTINUE"))}>
//         <CardLabel>{t("EKYC_METER_STATUS")}</CardLabel>
//         <Dropdown
//           option={meterStatusOptions}
//           optionKey="label"
//           selected={meterStatus}
//           select={setMeterStatus}
//           t={t}
//         />

//         {meterStatus?.value === "Metered" && (
//           <Fragment>
//             <CardLabel>{t("EKYC_METER_WORKING_STATUS")}</CardLabel>
//             <Dropdown
//               option={workingStatusOptions}
//               optionKey="label"
//               selected={workingStatus}
//               select={setWorkingStatus}
//               t={t}
//             />

//             <CardLabel>{t("EKYC_CAPTURE_METER_IMAGE")}</CardLabel>
//             <UploadFile
//               onUpload={selectphoto}
//               onDelete={() => {
//                 setMeterStatusPhoto(null);
//                 setMeterStatusPhotoFileStoreId(null);
//                 if (onSelect) {
//                   onSelect(config.key, { ...getUpdatedData(), meterPhoto: null, meterPhotoFileStoreId: null });
//                 }
//               }}
//               message={meterPhotoFileStoreId ? t("EKYC_FILE_UPLOADED") : t("EKYC_NO_FILE_SELECTED")}
//             />
//             {meterPhoto && <img src={meterPhoto} style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }} />}

//             <CardLabel>{t("EKYC_METER_LOCATION")}</CardLabel>
//             <TextInput
//               id="meterLocation"
//               name="meterLocation"
//               value={meterLocation}
//               onChange={(e) => setMeterLocation(e.target.value)}
//               placeholder={t("EKYC_ENTER_METER_LOCATION")}
//             />

//             <CardLabel>{t("EKYC_LAST_BILL_RAISED")}</CardLabel>
//             <Dropdown
//               option={yesNoOptions}
//               optionKey="label"
//               selected={lastBillRaised}
//               select={setLastBillRaised}
//               t={t}
//             />
//           </Fragment>
//         )}

//         <CardLabel>{t("EKYC_SEWER_CONNECTION")}</CardLabel>
//         <Dropdown
//           option={yesNoOptions}
//           optionKey="label"
//           selected={sewerConnection}
//           select={setSewerConnection}
//           t={t}
//         />

//         <CardLabel>{t("EKYC_TYPE_OF_CONNECTION")}</CardLabel>
//         <Dropdown
//           option={connectionCategoryOptions}
//           optionKey="label"
//           selected={connectionCategory}
//           select={setConnectionCategory}
//           t={t}
//         />

//         <CardLabel>{t("EKYC_CONNECTION_CATEGORY")}</CardLabel>
//         <Dropdown
//           option={connectionTypeOptions}
//           optionKey="label"
//           selected={connectionType}
//           select={setConnectionType}
//           t={t}
//         />

//         {toast && <Toast label={toast.message} error={toast.type === "error"} onClose={() => setToast(null)} />}
//       </FormStep>
//       {isEditing && !onSelect && (
//         <ActionBar style={{ position: "static", marginTop: "20px" }}>
//           <SubmitBar label={t("EKYC_UPDATE_AND_RETURN")} onSubmit={handleUpdateAndReturn} />
//         </ActionBar>
//       )}
//     </Fragment>
//   );
// };

// export default MeterDetails;




import React, { useState, Fragment } from "react";
import {
  CardLabel,
  TextInput,
  Dropdown,
  UploadFile,
  Toast,
  FormStep,
} from "@djb25/digit-ui-react-components";

const MeterDetails = ({ config, onSelect }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();

  // 🔹 STATES
  const [connectionCategory, setConnectionCategory] = useState("");
  const [saType, setSaType] = useState("");
  const [status, setStatus] = useState("");

  const [mrCode, setMrCode] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [mrKey, setMrKey] = useState("");

  const [meterNumber, setMeterNumber] = useState("");
  const [meterMaker, setMeterMaker] = useState("");

  const [meterStatus, setMeterStatus] = useState(null);
  const [meterCondition, setMeterCondition] = useState(null);
  const [meterLocation, setMeterLocation] = useState(null);

  const [lastBillReceived, setLastBillReceived] = useState(null);
  const [billMonthYear, setBillMonthYear] = useState(null);
  const [reason, setReason] = useState("");

  const [accessToMeter, setAccessToMeter] = useState(null);
  const [sewerConnection, setSewerConnection] = useState(null);
  const [septicTank, setSepticTank] = useState(null);

  const [meterPhoto, setMeterPhoto] = useState(null);
  const [meterPhotoId, setMeterPhotoId] = useState(null);

  const [toast, setToast] = useState(null);

  // 🔹 OPTIONS
  const yesNo = [{ name: "Yes" }, { name: "No" }];

  const meterStatusOptions = [
    { name: "Metered" },
    { name: "Unmetered" },
    { name: "Can not be identified" },
  ];

  const meterConditionOptions = [
    { name: "Damaged" },
    { name: "Not-Damaged" },
  ];

  const meterLocationOptions = [
    { name: "Inside" },
    { name: "Outside" },
  ];

  // 🔹 MONTH-YEAR OPTIONS (1998–2026)
  const monthYearOptions = [];
  for (let y = 1998; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      monthYearOptions.push({ name: `${m}/${y}` });
    }
  }

  // 🔹 FREEZE LOGIC
  const isFrozen = meterStatus?.name === "Can not be identified";

  // 🔹 FILE UPLOAD
  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await Digit.UploadServices.Filestorage("EKYC", file, tenantId);
      const id = res?.data?.files?.[0]?.fileStoreId;

      if (id) {
        setMeterPhotoId(id);

        const reader = new FileReader();
        reader.onloadend = () => setMeterPhoto(reader.result);
        reader.readAsDataURL(file);
      }
    } catch {
      setToast({ type: "error", message: "Upload failed" });
    }
  };

  // 🔹 VALIDATION
  const isValid = () => {
    if (!connectionCategory) return false;
    if (!meterStatus) return false;
    if (!meterLocation) return false;
    if (!lastBillReceived) return false;
    if (!sewerConnection) return false;

    if (meterStatus?.name === "Metered" && !meterPhotoId) return false;

    if (lastBillReceived?.name === "No" && !reason) return false;

    if (sewerConnection?.name === "No" && !septicTank) return false;

    return true;
  };

  // 🔹 SUBMIT
  const onStepSelect = () => {
    if (!isValid()) {
      setToast({ type: "error", message: "Fill all mandatory fields" });
      return;
    }

    const data = {
      connectionCategory,
      saType,
      status,
      mrCode,
      areaCode,
      mrKey,
      meterNumber,
      meterMaker,
      meterStatus: meterStatus?.name,
      meterCondition: meterCondition?.name,
      meterLocation: meterLocation?.name,
      lastBillReceived: lastBillReceived?.name,
      billMonthYear: billMonthYear?.name,
      reason,
      accessToMeter: accessToMeter?.name,
      sewerConnection: sewerConnection?.name,
      septicTank: septicTank?.name,
      meterPhotoId,
    };

    onSelect(config.key, data);
  };

  return (
    <Fragment>
      <FormStep onSelect={onStepSelect} config={config}>
        <div>
          <CardLabel>Connection Category *</CardLabel>
          <TextInput value={connectionCategory} onChange={(e) => setConnectionCategory(e.target.value)} />
        </div>

        <div>
          <CardLabel>SA Type</CardLabel>
          <TextInput value={saType} onChange={(e) => setSaType(e.target.value)} />
        </div>

        <div>
          <CardLabel>Status</CardLabel>
          <TextInput value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>

        <div>
          <CardLabel>MR Code</CardLabel>
          <TextInput value={mrCode} onChange={(e) => setMrCode(e.target.value)} />
        </div>

        <div>
          <CardLabel>Area Code</CardLabel>
          <TextInput value={areaCode} onChange={(e) => setAreaCode(e.target.value)} />
        </div>

        <div>
          <CardLabel>MR Key</CardLabel>
          <TextInput value={mrKey} onChange={(e) => setMrKey(e.target.value)} />
        </div>

        {!isFrozen && (
          <Fragment>
            <div>
              <CardLabel>Meter Number</CardLabel>
              <TextInput value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} />
            </div>

            <div>
              <CardLabel>Meter Maker</CardLabel>
              <TextInput value={meterMaker} onChange={(e) => setMeterMaker(e.target.value)} />
            </div>

            <div>
              <CardLabel>Meter Condition</CardLabel>
              <Dropdown option={meterConditionOptions} selected={meterCondition} select={setMeterCondition} />
            </div>

            {meterStatus?.name === "Metered" && (
              <Fragment>
                <div>
                  <CardLabel>Meter Photo *</CardLabel>
                  <UploadFile onUpload={uploadPhoto} message={meterPhotoId ? "Uploaded" : "No file"} />
                </div>
                {meterPhoto && (
                  <div style={{ gridColumn: "span 2" }}>
                    <img src={meterPhoto} style={{ width: "100%" }} />
                  </div>
                )}
              </Fragment>
            )}
          </Fragment>
        )}

        <div>
          <CardLabel>Meter Status *</CardLabel>
          <Dropdown option={meterStatusOptions} selected={meterStatus} select={setMeterStatus} />
        </div>

        <div>
          <CardLabel>Meter Location *</CardLabel>
          <Dropdown option={meterLocationOptions} selected={meterLocation} select={setMeterLocation} />
        </div>

        <div>
          <CardLabel>Last Bill Received *</CardLabel>
          <Dropdown option={yesNo} selected={lastBillReceived} select={setLastBillReceived} />
        </div>

        {lastBillReceived?.name === "Yes" && (
          <div>
            <CardLabel>When was the last bill received *</CardLabel>
            <Dropdown option={monthYearOptions} selected={billMonthYear} select={setBillMonthYear} />
          </div>
        )}

        {lastBillReceived?.name === "No" && (
          <div>
            <CardLabel>Reason *</CardLabel>
            <TextInput value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}

        <div>
          <CardLabel>Access to Meter</CardLabel>
          <Dropdown option={yesNo} selected={accessToMeter} select={setAccessToMeter} />
        </div>

        <div>
          <CardLabel>Sewer Connection *</CardLabel>
          <Dropdown option={yesNo} selected={sewerConnection} select={setSewerConnection} />
        </div>

        {sewerConnection?.name === "No" && (
          <div>
            <CardLabel>Septic Tank *</CardLabel>
            <Dropdown option={yesNo} selected={septicTank} select={setSepticTank} />
          </div>
        )}

        {toast && <Toast label={toast.message} error={toast.type === "error"} onClose={() => setToast(null)} />}

      </FormStep>
    </Fragment>
  );
};

export default MeterDetails;