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
//   RadioButtons,
// } from "@djb25/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// import { useHistory, useLocation } from "react-router-dom";
// import { getSavedData } from "../../utils";

// const PropertyInfo = ({ config, onSelect, formData, t: tProps }) => {
//   const { t } = useTranslation();
//   const history = useHistory();
//   const location = useLocation();

//   const flowState = location.state || {};
//   const { isEditing } = flowState;

//   // Robust data extraction from formData
//   const activeEdits = formData || {};
//   const rawReviewData = formData?.reviewData || formData?.connectionDetails || {};
//   const reviewWrapper = rawReviewData?.applicationReview || rawReviewData;
//   const applicationData = (Array.isArray(reviewWrapper) ? reviewWrapper[0] : reviewWrapper) || {};
//   const apiData = applicationData?.newData || applicationData;
//   const apiProp = apiData?.propertyInfo || apiData || {};

//   const tenantId = Digit.ULBService.getCurrentTenantId();

//   const { data: dataV1 } = Digit.Hooks.ekyc.useGetUserType(tenantId);
//   const { data: dataV2 } = Digit.Hooks.ekyc.useGetFloorCount(tenantId);
//   const { data: dataV3 } = Digit.Hooks.ekyc.useGetPropertyType(tenantId);
//   const { data: dataConn } = Digit.Hooks.ekyc.useGetConnectionTypeV2(tenantId);

//   const userTypeOptions = dataV1?.["ws-services-calculation"]?.userTypeV2?.map((item) => ({
//     label: t(item.code), value: item.code,
//   })) || [];

//   const floorOptions = dataV2?.["ws-services-calculation"]?.floorCount?.map((item) => ({
//     label: t(item.code), value: item.code,
//   })) || [];

//   const connectionCategoryOptions = dataV3?.["ws-services-calculation"]?.propertyTypeV2?.map((item) => ({
//     label: t(item.code), value: item.code,
//   })) || [];

//   const connectionTypeOptions = dataConn?.["ws-services-calculation"]?.connectionTypeV2?.map((item) => ({
//     label: t(item.code), value: item.code,
//   })) || [];

//   const propData = activeEdits?.propertyDetails || {};

//   const [ownerType, setOwnerType] = useState(propData.ownerType || (apiProp.tenantName ? "TENANT" : "OWNER"));
//   const [pidNumber, setPidNumber] = useState(propData.pidNumber || apiProp.pidNumber || "");
//   const [userType, setUserType] = useState(propData.userTypeData || null);
//   const [noOfFloors, setNoOfFloors] = useState(propData.noOfFloorsData || null);
//   const [connectionCategory, setConnectionCategory] = useState(propData.connectionCategoryData || null);
//   const [typeOfConnection, setTypeOfConnection] = useState(propData.typeOfConnectionData || null);

//   const [propertyDocument, setPropertyDocument] = useState(propData.propertyDocument || null);
//   const [propertyDocumentFileStoreId, setPropertyDocumentFileStoreId] = useState(propData.propertyDocumentFileStoreId || apiProp.propertyDocumentFileStoreId || null);

//   const [toast, setToast] = useState(null);

//   // Pre-fill dropdowns from API
//   useEffect(() => {
//     if (!userType && userTypeOptions.length > 0) {
//       const val = apiProp.userType;
//       const found = userTypeOptions.find(o => o.value === val || o.label === val);
//       if (found) setUserType(found);
//     }
//   }, [userTypeOptions, apiProp.userType]);

//   useEffect(() => {
//     if (!noOfFloors && floorOptions.length > 0) {
//       const val = apiProp.numberOfFloors || apiProp.noOfFloor;
//       const found = floorOptions.find(o => o.value === String(val) || o.label === String(val));
//       if (found) setNoOfFloors(found);
//     }
//   }, [floorOptions, apiProp.numberOfFloors]);

//   useEffect(() => {
//     if (!connectionCategory && connectionCategoryOptions.length > 0) {
//       const val = apiProp.connectionCategory;
//       const found = connectionCategoryOptions.find(o => o.value === val || o.label === val);
//       if (found) setConnectionCategory(found);
//     }
//   }, [connectionCategoryOptions, apiProp.connectionCategory]);

//   useEffect(() => {
//     if (!typeOfConnection && connectionTypeOptions.length > 0) {
//       const val = apiProp.typeOfConnection;
//       const found = connectionTypeOptions.find(o => o.value === val || o.label === val);
//       if (found) setTypeOfConnection(found);
//     }
//   }, [connectionTypeOptions, apiProp.typeOfConnection]);

//   const getUpdatedData = () => ({
//     ownerType,
//     pidNumber,
//     userTypeData: userType,
//     noOfFloorsData: noOfFloors,
//     connectionCategoryData: connectionCategory,
//     typeOfConnectionData: typeOfConnection,
//     propertyDocument,
//     propertyDocumentFileStoreId,
//     kno: apiProp.kno || flowState.kno
//   });

//   const selectpdf = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size >= 5000000) {
//         setToast({ type: "error", message: t("EKYC_MAXIMUM_UPLOAD_SIZE_EXCEEDED") });
//         return;
//       }
//       try {
//         const res = await Digit.UploadServices.Filestorage("EKYC", file, tenantId);
//         if (res?.data?.files?.[0]?.fileStoreId) {
//           const fileStoreId = res.data.files[0].fileStoreId;
//           setPropertyDocumentFileStoreId(fileStoreId);
//           setPropertyDocument(file.name);
//           if (onSelect) {
//             onSelect(config.key, { ...getUpdatedData(), propertyDocument: file.name, propertyDocumentFileStoreId: fileStoreId });
//           }
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
//         history.push("/digit-ui/employee/ekyc/review", { ...location.state, edits: { ...edits, propertyDetails: updatedData } });
//       } else {
//         history.push("/digit-ui/employee/ekyc/meter-details", {
//           ...location.state,
//           edits: { ...edits, propertyDetails: updatedData }
//         });
//       }
//     }
//   };

//   const handleUpdateAndReturn = () => {
//     history.push("/digit-ui/employee/ekyc/review", { ...location.state, edits: { ...edits, propertyDetails: getUpdatedData() } });
//   };

//   const ownerOptions = [
//     { code: "OWNER", name: "EKYC_OWNER" },
//     { code: "TENANT", name: "EKYC_TENANT" },
//   ];

//   return (
//     <Fragment>
//       <FormStep t={t} onSelect={onStepSelect} config={config || {}} label={t(config?.texts?.submitBarLabel) || (isEditing ? t("EKYC_UPDATE_AND_RETURN") : t("ES_COMMON_CONTINUE"))}>
//         <CardLabel>{t("EKYC_OWNER_TENANT")}</CardLabel>
//         <RadioButtons
//           options={ownerOptions}
//           optionsKey="name"
//           selectedOption={ownerOptions.find(o => o.code === ownerType)}
//           onSelect={(val) => setOwnerType(val.code)}
//         />

//         <CardLabel>{t("EKYC_PID_NUMBER")}</CardLabel>
//         <TextInput
//           id="pidNumber"
//           name="pidNumber"
//           value={pidNumber}
//           onChange={(e) => setPidNumber(e.target.value)}
//           placeholder={t("EKYC_ENTER_PID_NUMBER")}
//         />

//         <CardLabel>{t("EKYC_USER_TYPE")}</CardLabel>
//         <Dropdown
//           option={userTypeOptions}
//           optionKey="label"
//           selected={userType}
//           select={setUserType}
//           t={t}
//         />

//         <CardLabel>{t("EKYC_NO_OF_FLOORS")}</CardLabel>
//         <Dropdown
//           option={floorOptions}
//           optionKey="label"
//           selected={noOfFloors}
//           select={setNoOfFloors}
//           t={t}
//         />

//         <CardLabel>{t("EKYC_TYPE_OF_CONNECTION")}</CardLabel>
//         <Dropdown
//           option={connectionTypeOptions}
//           optionKey="label"
//           selected={typeOfConnection}
//           select={setTypeOfConnection}
//           t={t}
//         />

//         <CardLabel>{t("EKYC_CONNECTION_CATEGORY")}</CardLabel>
//         <Dropdown
//           option={connectionCategoryOptions}
//           optionKey="label"
//           selected={connectionCategory}
//           select={setConnectionCategory}
//           t={t}
//         />

//         <CardLabel>{t("EKYC_UPLOAD_PROPERTY_DOC")}</CardLabel>
//         <UploadFile
//           onUpload={selectpdf}
//           onDelete={() => {
//             setPropertyDocument(null);
//             setPropertyDocumentFileStoreId(null);
//             if (onSelect) {
//               onSelect(config.key, { ...getUpdatedData(), propertyDocument: null, propertyDocumentFileStoreId: null });
//             }
//           }}
//           message={propertyDocumentFileStoreId ? t("EKYC_FILE_UPLOADED") : t("EKYC_NO_FILE_SELECTED")}
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

// export default PropertyInfo;



import React, { useState, Fragment } from "react";
import {
  CardLabel,
  TextInput,
  Dropdown,
  UploadFile,
  Toast,
  FormStep,
} from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const PropertyInfo = ({ config, onSelect }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  // 🔹 STATES
  const [pidNumber, setPidNumber] = useState("");
  const [propertyType, setPropertyType] = useState(null);
  const [subPropertyCategory, setSubPropertyCategory] = useState(null);

  const [noOfFloors, setNoOfFloors] = useState("");
  const [floorNo, setFloorNo] = useState("");

  const [noOfRooms, setNoOfRooms] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("");
  const [dwellingUnits, setDwellingUnits] = useState("");

  const [buildingImage, setBuildingImage] = useState(null);
  const [buildingImageId, setBuildingImageId] = useState(null);

  const [toast, setToast] = useState(null);

  // 🔹 PROPERTY TYPE OPTIONS (you can replace with MDMS)
  const propertyTypeOptions = [
    { name: "Residential" },
    { name: "Commercial" },
    { name: "Hotel" },
    { name: "Hospital" },
    { name: "Nursing Home" },
  ];

  // 🔹 FILE UPLOAD
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2000000) {
      setToast({ type: "error", message: "Max size 2MB exceeded" });
      return;
    }

    try {
      const res = await Digit.UploadServices.Filestorage(
        "EKYC",
        file,
        tenantId
      );

      const fileStoreId = res?.data?.files?.[0]?.fileStoreId;

      if (fileStoreId) {
        setBuildingImageId(fileStoreId);

        const reader = new FileReader();
        reader.onloadend = () => setBuildingImage(reader.result);
        reader.readAsDataURL(file);

        setToast({ type: "success", message: "Upload successful" });
      }
    } catch {
      setToast({ type: "error", message: "Upload failed" });
    }
  };

  // 🔹 VALIDATION
  const isValid = () => {
    if (!noOfFloors || Number(noOfFloors) < 1) return false;
    if (!buildingImageId) return false;

    if (propertyType?.name === "Hotel" && !noOfRooms) return false;
    if (
      (propertyType?.name === "Hospital" ||
        propertyType?.name === "Nursing Home") &&
      !noOfBeds
    )
      return false;

    return true;
  };

  // 🔹 SUBMIT
  const onStepSelect = () => {
    if (!isValid()) {
      setToast({ type: "error", message: "Fill all required fields" });
      return;
    }

    const data = {
      pidNumber,
      propertyType: propertyType?.name,
      subPropertyCategory: subPropertyCategory?.name,
      noOfFloors,
      floorNo,
      noOfRooms,
      noOfBeds,
      dwellingUnits,
      buildingImageId,
    };

    onSelect(config.key, data);
  };

  return (
    <Fragment>
      <FormStep
        t={t}
        onSelect={onStepSelect}
        config={config}
        label={t("ES_COMMON_CONTINUE")}
      >
        <div>
          <CardLabel>PID Number</CardLabel>
          <TextInput value={pidNumber} onChange={(e) => setPidNumber(e.target.value)} />
        </div>

        <div>
          <CardLabel>Property Type</CardLabel>
          <Dropdown
            option={propertyTypeOptions}
            selected={propertyType}
            select={setPropertyType}
          />
        </div>

        <div>
          <CardLabel>Sub Property Category</CardLabel>
          <Dropdown option={[]} selected={subPropertyCategory} select={setSubPropertyCategory} />
        </div>

        <div>
          <CardLabel>No. of Floors *</CardLabel>
          <TextInput
            type="number"
            value={noOfFloors}
            onChange={(e) => setNoOfFloors(e.target.value)}
          />
        </div>

        <div>
          <CardLabel>Floor No. of this KNO</CardLabel>
          <TextInput value={floorNo} onChange={(e) => setFloorNo(e.target.value)} />
        </div>

        <div>
          <CardLabel>No of Beds</CardLabel>
          <TextInput
            type="number"
            value={noOfBeds}
            onChange={(e) => setNoOfBeds(e.target.value)}
          />
        </div>

        <div>
          <CardLabel>No. of Rooms</CardLabel>
          <TextInput
            type="number"
            value={noOfRooms}
            onChange={(e) => setNoOfRooms(e.target.value)}
          />
        </div>

        {/* HOTEL CONDITION */}
        {propertyType?.name === "Hotel" && (
          <div>
            <CardLabel>No. of Rooms *</CardLabel>
            <TextInput
              type="number"
              value={noOfRooms}
              onChange={(e) => setNoOfRooms(e.target.value)}
            />
          </div>
        )}

        {/* HOSPITAL CONDITION */}
        {(propertyType?.name === "Hospital" ||
          propertyType?.name === "Nursing Home") && (
            <div>
              <CardLabel>No. of Beds *</CardLabel>
              <TextInput
                type="number"
                value={noOfBeds}
                onChange={(e) => setNoOfBeds(e.target.value)}
              />
            </div>
          )}

        <div>
          <CardLabel>Number of Dwelling Units</CardLabel>
          <TextInput
            type="number"
            value={dwellingUnits}
            onChange={(e) => setDwellingUnits(e.target.value)}
          />
        </div>

        <div>
          <CardLabel>Building Image *</CardLabel>
          <UploadFile
            onUpload={handleUpload}
            onDelete={() => {
              setBuildingImage(null);
              setBuildingImageId(null);
            }}
            message={buildingImageId ? "Uploaded" : "No file selected"}
          />
        </div>

        {buildingImage && (
          <div style={{ gridColumn: "span 2" }}>
            <img
              src={buildingImage}
              alt="preview"
              style={{ width: "100%", marginTop: "10px" }}
            />
          </div>
        )}

        {toast && (
          <Toast
            label={toast.message}
            error={toast.type === "error"}
            onClose={() => setToast(null)}
          />
        )}
      </FormStep>
    </Fragment>
  );
};

export default PropertyInfo;