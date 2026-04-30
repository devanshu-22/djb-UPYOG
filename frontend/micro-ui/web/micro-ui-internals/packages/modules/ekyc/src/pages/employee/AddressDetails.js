// import React, { useState, useRef, Fragment, useEffect } from "react";
// import {
//   Card,
//   CardLabel,
//   TextInput,
//   SubmitBar,
//   CardHeader,
//   RadioButtons,
//   ActionBar,
//   Dropdown,
//   Loader,
//   UploadFile,
//   Toast,
//   FormStep,
// } from "@djb25/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// import { useHistory, useLocation } from "react-router-dom";
// import { getSavedData } from "../../utils";

// const AddressDetails = ({ config, onSelect, formData, t: tProps }) => {
//   const { t } = useTranslation();
//   const history = useHistory();
//   const location = useLocation();

//   const flowState = location.state || {};
//   const { isEditing, kNumber } = flowState;
  
//   // Robust data extraction from formData (which includes reviewData and edits from EKYCForm)
//   const activeEdits = formData || {};
//   const rawReviewData = formData?.reviewData || formData?.connectionDetails || {};
//   const reviewWrapper = rawReviewData?.applicationReview || rawReviewData;
//   const applicationData = (Array.isArray(reviewWrapper) ? reviewWrapper[0] : reviewWrapper) || {};
//   const apiData = applicationData?.newData || applicationData;
//   const apiAddr = apiData?.addressDetails || apiData || {};

//   const addrData = activeEdits?.addressDetails || {};

//   const [addressType, setAddressType] = useState(addrData.addressType || { code: "AADHAAR", name: "EKYC_AADHAAR_ADDRESS" });
//   const [correctAddress, setCorrectAddress] = useState(addrData.correctAddress || { code: "NO", name: "CORE_COMMON_NO" });
//   const [fullAddress, setFullAddress] = useState(addrData.fullAddress || apiAddr.addressRaw || apiAddr.fullAddress || "");
//   const [flatHouseNumber, setFlatHouseNumber] = useState(addrData.flatHouseNumber || addrData.flatNo || apiAddr.flatHouseNumber || apiAddr.flatNo || "");
//   const [buildingTower, setBuildingTower] = useState(addrData.buildingTower || addrData.building || apiAddr.buildingTower || apiAddr.building || "");
//   const [landmark, setLandmark] = useState(addrData.landmark || apiAddr.landmark || "");
//   const [pinCode, setPinCode] = useState(addrData.pinCode || addrData.pincode || apiAddr.pinCode || apiAddr.pincode || "");
//   const [doorPhoto, setDoorPhoto] = useState(addrData.doorPhoto || null);
//   const [doorPhotoFileStoreId, setDoorPhotoFileStoreId] = useState(addrData.doorPhotoFilestoreId || addrData.doorPhotoFileStoreId || apiAddr.doorPhotoFilestoreId || null);

//   const [gpsValid, setGpsValid] = useState(addrData.gpsValid !== undefined ? addrData.gpsValid : (apiAddr.gpsValid !== undefined ? apiAddr.gpsValid : true));
//   const [latitude, setLatitude] = useState(addrData.latitude || apiAddr.latitude || "");
//   const [longitude, setLongitude] = useState(addrData.longitude || apiAddr.longitude || "");
//   const [mobileNo, setMobileNo] = useState(addrData.mobileNo || apiAddr.mobileNo || "");
//   const [whatsappNo, setWhatsappNo] = useState(addrData.whatsappNo || apiAddr.whatsappNo || "");
//   const [email, setEmail] = useState(addrData.email || apiAddr.email || "");
//   const [noOfPerson, setNoOfPerson] = useState(addrData.noOfPerson || apiAddr.noOfPerson || apiAddr.noOfPersons || "");
//   const [knumber, setKnumber] = useState(addrData.knumber || apiAddr.knumber || apiAddr.kno || kNumber || "");

//   const [toast, setToast] = useState(null);

//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const { data: mdmsData, isLoading: isMdmsLoading } = Digit.Hooks.useCommonMDMS(tenantId, "egov-location", ["TenantBoundary"]);
//   const assemblies = mdmsData?.MdmsRes?.["egov-location"]?.TenantBoundary?.[0]?.boundary?.children || [];
//   const [assembly, setAssembly] = useState(addrData.assemblyData || (apiAddr.assembly ? { name: apiAddr.assembly } : null));
//   const [ward, setWard] = useState(addrData.wardData || (apiAddr.ward ? { name: apiAddr.ward } : null));

//   const getUpdatedData = () => ({
//     addressType,
//     correctAddress,
//     fullAddress,
//     flatHouseNumber,
//     buildingTower,
//     landmark,
//     pinCode,
//     doorPhoto,
//     doorPhotoFilestoreId: doorPhotoFileStoreId,
//     assembly: assembly?.name,
//     ward: ward?.name,
//     assemblyData: assembly,
//     wardData: ward,
//     gpsValid,
//     latitude,
//     longitude,
//     mobileNo,
//     whatsappNo,
//     email,
//     noOfPerson,
//     knumber
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
//           setDoorPhotoFileStoreId(fileStoreId);
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             setDoorPhoto(reader.result);
//             if (onSelect) {
//               onSelect(config.key, { ...getUpdatedData(), doorPhoto: reader.result, doorPhotoFilestoreId: fileStoreId });
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

//   const removePhoto = () => {
//     setDoorPhoto(null);
//     setDoorPhotoFileStoreId(null);
//     if (onSelect) {
//       onSelect(config.key, { ...getUpdatedData(), doorPhoto: null, doorPhotoFilestoreId: null });
//     }
//   };

//   const onStepSelect = () => {
//     const updatedData = getUpdatedData();
//     if (onSelect) {
//       onSelect(config.key, updatedData);
//     } else {
//       if (isEditing) {
//         history.push("/digit-ui/employee/ekyc/review", { ...location.state, edits: { ...edits, addressDetails: updatedData } });
//       } else {
//         history.push("/digit-ui/employee/ekyc/property-info", {
//           ...location.state,
//           edits: { ...edits, addressDetails: updatedData }
//         });
//       }
//     }
//   };

//   const handleUpdateAndReturn = () => {
//     history.push("/digit-ui/employee/ekyc/review", { ...location.state, edits: { ...edits, addressDetails: getUpdatedData() } });
//   };

//   const addressOptions = [
//     { code: "AADHAAR", name: "EKYC_AADHAAR_ADDRESS" },
//     { code: "CURRENT", name: "EKYC_CURRENT_ADDRESS" },
//   ];

//   const yesNoOptions = [
//     { code: "YES", name: "CORE_COMMON_YES" },
//     { code: "NO", name: "CORE_COMMON_NO" },
//   ];

//   if (isMdmsLoading) return <Loader />;

//   return (
//     <Fragment>
//       <FormStep t={t} onSelect={onStepSelect} config={config || {}} label={t(config?.texts?.submitBarLabel) || (isEditing ? t("EKYC_UPDATE_AND_RETURN") : t("ES_COMMON_CONTINUE"))}>
//         <CardLabel>{t("EKYC_ADDRESS_TYPE")}</CardLabel>
//         <RadioButtons
//           options={addressOptions}
//           optionsKey="name"
//           selectedOption={addressType}
//           onSelect={setAddressType}
//         />

//         <CardLabel>{t("EKYC_IS_ADDRESS_CORRECT")}</CardLabel>
//         <RadioButtons
//           options={yesNoOptions}
//           optionsKey="name"
//           selectedOption={correctAddress}
//           onSelect={setCorrectAddress}
//         />

//         {correctAddress?.code === "NO" && (
//           <Fragment>
//             <CardLabel>{t("EKYC_FULL_ADDRESS")}</CardLabel>
//             <TextInput
//               id="fullAddress"
//               name="fullAddress"
//               value={fullAddress}
//               onChange={(e) => setFullAddress(e.target.value)}
//               placeholder={t("EKYC_ENTER_FULL_ADDRESS")}
//             />

//             <CardLabel>{t("EKYC_FLAT_HOUSE_NO")}</CardLabel>
//             <TextInput
//               id="flatHouseNumber"
//               name="flatHouseNumber"
//               value={flatHouseNumber}
//               onChange={(e) => setFlatHouseNumber(e.target.value)}
//               placeholder={t("EKYC_ENTER_FLAT_HOUSE_NO")}
//             />

//             <CardLabel>{t("EKYC_BUILDING_TOWER")}</CardLabel>
//             <TextInput
//               id="buildingTower"
//               name="buildingTower"
//               value={buildingTower}
//               onChange={(e) => setBuildingTower(e.target.value)}
//               placeholder={t("EKYC_ENTER_BUILDING_TOWER")}
//             />

//             <CardLabel>{t("EKYC_LANDMARK")}</CardLabel>
//             <TextInput
//               id="landmark"
//               name="landmark"
//               value={landmark}
//               onChange={(e) => setLandmark(e.target.value)}
//               placeholder={t("EKYC_ENTER_LANDMARK")}
//             />

//             <CardLabel>{t("EKYC_PINCODE")}</CardLabel>
//             <TextInput
//               id="pinCode"
//               name="pinCode"
//               value={pinCode}
//               onChange={(e) => setPinCode(e.target.value)}
//               placeholder={t("EKYC_ENTER_PINCODE")}
//             />
//           </Fragment>
//         )}

//         <CardLabel>{t("EKYC_ASSEMBLY_WARD")}</CardLabel>
//         <Dropdown
//           option={assemblies}
//           optionKey="name"
//           selected={assembly}
//           select={setAssembly}
//           t={t}
//         />

//         {assembly && (
//           <Fragment>
//             <CardLabel>{t("EKYC_WARD")}</CardLabel>
//             <Dropdown
//               option={assembly.children || []}
//               optionKey="name"
//               selected={ward}
//               select={setWard}
//               t={t}
//             />
//           </Fragment>
//         )}

//         <CardLabel>{t("EKYC_GPS_VALID")}</CardLabel>
//         <RadioButtons
//           options={[
//             { code: true, name: "CORE_COMMON_YES" },
//             { code: false, name: "CORE_COMMON_NO" },
//           ]}
//           optionsKey="name"
//           selectedOption={gpsValid ? { code: true, name: "CORE_COMMON_YES" } : { code: false, name: "CORE_COMMON_NO" }}
//           onSelect={(val) => setGpsValid(val.code)}
//         />

//         <CardLabel>{t("EKYC_LATITUDE")}</CardLabel>
//         <TextInput
//           id="latitude"
//           name="latitude"
//           value={latitude}
//           onChange={(e) => setLatitude(e.target.value)}
//           placeholder={t("EKYC_ENTER_LATITUDE")}
//         />

//         <CardLabel>{t("EKYC_LONGITUDE")}</CardLabel>
//         <TextInput
//           id="longitude"
//           name="longitude"
//           value={longitude}
//           onChange={(e) => setLongitude(e.target.value)}
//           placeholder={t("EKYC_ENTER_LONGITUDE")}
//         />

//         <CardLabel>{t("EKYC_MOBILE_NO")}</CardLabel>
//         <TextInput
//           id="mobileNo"
//           name="mobileNo"
//           value={mobileNo}
//           onChange={(e) => setMobileNo(e.target.value)}
//           placeholder={t("EKYC_ENTER_MOBILE_NO")}
//         />

//         <CardLabel>{t("EKYC_WHATSAPP_NO")}</CardLabel>
//         <TextInput
//           id="whatsappNo"
//           name="whatsappNo"
//           value={whatsappNo}
//           onChange={(e) => setWhatsappNo(e.target.value)}
//           placeholder={t("EKYC_ENTER_WHATSAPP_NO")}
//         />

//         <CardLabel>{t("EKYC_EMAIL")}</CardLabel>
//         <TextInput
//           id="email"
//           name="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder={t("EKYC_ENTER_EMAIL")}
//         />

//         <CardLabel>{t("EKYC_NO_OF_PERSONS")}</CardLabel>
//         <TextInput
//           id="noOfPerson"
//           name="noOfPerson"
//           value={noOfPerson}
//           onChange={(e) => setNoOfPerson(e.target.value)}
//           placeholder={t("EKYC_ENTER_NO_OF_PERSONS")}
//         />

//         <CardLabel>{t("EKYC_K_NUMBER")}</CardLabel>
//         <TextInput
//           id="knumber"
//           name="knumber"
//           value={knumber}
//           onChange={(e) => setKnumber(e.target.value)}
//           placeholder={t("EKYC_ENTER_K_NUMBER")}
//         />

//         <CardLabel>{t("EKYC_DOOR_PHOTO")}</CardLabel>
//         <UploadFile
//           onUpload={selectphoto}
//           onDelete={removePhoto}
//           message={doorPhotoFileStoreId ? t("EKYC_FILE_UPLOADED") : t("EKYC_NO_FILE_SELECTED")}
//         />
//         {doorPhoto && <img src={doorPhoto} style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }} />}

//         {toast && <Toast label={toast.message} error={toast.type === "error"} onClose={() => setToast(null)} />}
//       </FormStep>
//       {isEditing && !onSelect && (
//         // <ActionBar style={{ position: "static", marginTop: "20px" }}>
//         <SubmitBar label={t("EKYC_UPDATE_AND_RETURN")} onSubmit={handleUpdateAndReturn} />
//         // </ActionBar>
//       )}
//     </Fragment>
//   );
// };

// export default AddressDetails;


import React, { useState, useEffect, Fragment } from "react";
import {
  CardLabel,
  TextInput,
  Dropdown,
  UploadFile,
  Toast,
  FormStep,
  Loader,
} from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const AddressDetails = ({ config, onSelect }) => {
  const { t } = useTranslation();

  const tenantId = Digit.ULBService.getCurrentTenantId();

  // 🔹 STATES
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [locality, setLocality] = useState("");
  const [landmark, setLandmark] = useState("");
  const [subLocality, setSubLocality] = useState(null);

  const [pinCode, setPinCode] = useState("");
  const [assembly, setAssembly] = useState(null);
  const [ward, setWard] = useState(null);
  const [zone, setZone] = useState(null);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [addressType, setAddressType] = useState(null);

  const [doorPhoto, setDoorPhoto] = useState(null);
  const [doorPhotoFileStoreId, setDoorPhotoFileStoreId] = useState(null);

  const [toast, setToast] = useState(null);

  // 🔹 MDMS DATA
  const { data: mdmsData, isLoading } = Digit.Hooks.useCommonMDMS(
    tenantId,
    "egov-location",
    ["TenantBoundary"]
  );

  const assemblies =
    mdmsData?.MdmsRes?.["egov-location"]?.TenantBoundary?.[0]?.boundary
      ?.children || [];

  // 🔹 AUTO GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          setToast({ type: "error", message: "GPS access denied" });
        }
      );
    }
  }, []);

  // 🔹 PIN CODE HANDLER
  const handlePincodeChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setPinCode(value);

      if (value.length === 6) {
        fetchLocationByPincode(value);
      }
    }
  };

  // 🔹 MOCK PIN API (Replace with real API)
  const fetchLocationByPincode = (pin) => {
    // 🔥 Replace this with backend API
    console.log("Fetching location for PIN:", pin);
  };

  // 🔹 FILE UPLOAD
  const selectphoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size >= 2000000) {
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
        setDoorPhotoFileStoreId(fileStoreId);

        const reader = new FileReader();
        reader.onloadend = () => {
          setDoorPhoto(reader.result);
        };
        reader.readAsDataURL(file);

        setToast({ type: "success", message: "Upload successful" });
      }
    } catch {
      setToast({ type: "error", message: "Upload failed" });
    }
  };

  const removePhoto = () => {
    setDoorPhoto(null);
    setDoorPhotoFileStoreId(null);
  };

  // 🔹 VALIDATION
  const isValid = () => {
    return (
      houseNo &&
      street &&
      pinCode.length === 6 &&
      assembly &&
      ward &&
      zone &&
      latitude &&
      longitude &&
      doorPhotoFileStoreId
    );
  };

  // 🔹 SUBMIT
  const onStepSelect = () => {
    if (!isValid()) {
      setToast({ type: "error", message: "Please fill all mandatory fields" });
      return;
    }

    const data = {
      houseNo,
      street,
      locality,
      landmark,
      subLocality,
      pinCode,
      assembly: assembly?.name,
      ward: ward?.name,
      zone: zone?.name,
      latitude,
      longitude,
      addressType: addressType?.name,
      doorPhotoFilestoreId: doorPhotoFileStoreId,
    };

    onSelect(config.key, data);
  };

  if (isLoading) return <Loader />;

  return (
    <Fragment>
      <FormStep
        t={t}
        onSelect={onStepSelect}
        config={config}
        label={t("ES_COMMON_CONTINUE")}
      >
        <CardLabel>House No / Flat No *</CardLabel>
        <TextInput value={houseNo} onChange={(e) => setHouseNo(e.target.value)} />

        <CardLabel>Street / Address Line *</CardLabel>
        <TextInput value={street} onChange={(e) => setStreet(e.target.value)} />

        <CardLabel>Locality</CardLabel>
        <TextInput value={locality} onChange={(e) => setLocality(e.target.value)} />

        <CardLabel>Landmark</CardLabel>
        <TextInput value={landmark} onChange={(e) => setLandmark(e.target.value)} />

        <CardLabel>Sub Locality</CardLabel>
        <Dropdown option={[]} selected={subLocality} select={setSubLocality} />

        <CardLabel>PIN Code *</CardLabel>
        <TextInput value={pinCode} onChange={handlePincodeChange} maxLength={6} />

        <CardLabel>Assembly *</CardLabel>
        <Dropdown option={assemblies} selected={assembly} select={setAssembly} />

        <CardLabel>Ward *</CardLabel>
        <Dropdown
          option={assembly?.children || []}
          selected={ward}
          select={setWard}
        />

        <CardLabel>Zone *</CardLabel>
        <Dropdown
          option={ward?.children || []}
          selected={zone}
          select={setZone}
        />

        <CardLabel>Latitude</CardLabel>
        <TextInput value={latitude} disabled />

        <CardLabel>Longitude</CardLabel>
        <TextInput value={longitude} disabled />

        <CardLabel>Address Type</CardLabel>
        <Dropdown
          option={[
            { name: "Permanent" },
            { name: "Correspondence" },
            { name: "Other" },
          ]}
          selected={addressType}
          select={setAddressType}
        />

        <CardLabel>Door Image *</CardLabel>
        <UploadFile
          onUpload={selectphoto}
          onDelete={removePhoto}
          message={doorPhotoFileStoreId ? "Uploaded" : "No file selected"}
        />

        {doorPhoto && (
          <img
            src={doorPhoto}
            alt="preview"
            style={{ width: "100%", marginTop: "10px" }}
          />
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

export default AddressDetails;