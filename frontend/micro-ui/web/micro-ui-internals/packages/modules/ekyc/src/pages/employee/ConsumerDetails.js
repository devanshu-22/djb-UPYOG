// import React, { useState, Fragment, useEffect, useRef } from "react";
// import {
//   Card,
//   CardLabel,
//   TextInput,
//   SubmitBar,
//   CardHeader,
//   RadioButtons,
//   ActionBar,
//   Loader,
//   FormStep,
// } from "@djb25/digit-ui-react-components";
// import { useTranslation } from "react-i18next";
// import { useLocation, useHistory } from "react-router-dom";
// import { getSavedData } from "../../utils";
// import AddressDetails from "./AddressDetails";

// const AadhaarVerification = ({ config, onSelect, formData, t: tProps }) => {
//   const { t } = useTranslation();
//   const location = useLocation();
//   const history = useHistory();
//   const addressSectionRef = useRef(null);

//   const flowState = location.state || {};
//   const { isEditing, kNumber } = flowState;

//   // Robust data extraction from formData
//   const activeEdits = formData || {};
//   const rawReviewData = formData?.reviewData || formData?.connectionDetails || {};
//   const reviewWrapper = rawReviewData?.applicationReview || rawReviewData;
//   const applicationData = (Array.isArray(reviewWrapper) ? reviewWrapper[0] : reviewWrapper) || {};
//   const apiData = applicationData?.newData || applicationData;
//   const apiConn = apiData?.connectionDetails || apiData || {};

//   const initialData = {
//     userName: apiConn.consumerName || "",
//     mobileNumber: apiConn.phoneNumber || apiConn.mobileNo || "",
//     whatsappNumber: apiConn.phoneNumber || apiConn.mobileNo || "",
//     email: apiConn.email || "",
//     noOfPersons: apiConn.noOfPerson || apiConn.noOfPersons || "",
//   };

//   const aadhaarData = activeEdits?.aadhaarData || {};

//   const [aadhaarNumber, setAadhaarNumber] = useState(aadhaarData.aadhaarNumber || "");
//   const [isAadhaarVerified, setIsAadhaarVerified] = useState(aadhaarData.isAadhaarVerified === true || isEditing); // Auto-verify if editing
//   const [showOtpField, setShowOtpField] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [otpError, setOtpError] = useState(false);
//   const [nameCorrect, setNameCorrect] = useState(aadhaarData.nameCorrect || { code: "YES", name: "CORE_COMMON_YES" });
//   const [userName, setUserName] = useState(aadhaarData.name || initialData.userName);
//   const [mobileChange, setMobileChange] = useState(aadhaarData.mobileChange || { code: "YES", name: "CORE_COMMON_YES" });
//   const [mobileNumber, setMobileNumber] = useState(aadhaarData.mobileNumber || initialData.mobileNumber);
//   const [whatsappNumber, setWhatsappNumber] = useState(aadhaarData.whatsappNumber || initialData.whatsappNumber);
//   const [email, setEmail] = useState(aadhaarData.email || initialData.email);
//   const [noOfPersons, setNoOfPersons] = useState(aadhaarData.noOfPersons || initialData.noOfPersons);
//   const [showAddressSection, setShowAddressSection] = useState(false);

//   const getUpdatedData = () => ({
//     aadhaarNumber,
//     isAadhaarVerified,
//     name: userName,
//     nameCorrect,
//     mobileChange,
//     mobileNumber,
//     whatsappNumber,
//     email,
//     noOfPersons,
//     gender: "Male",
//     dob: "01/01/1990",
//   });

//   const handleVerifyAadhaar = () => {
//     if (aadhaarNumber.length === 12) setShowOtpField(true);
//   };

//   const handleVerifyOtp = () => {
//     if (otp === "123456") {
//       setIsAadhaarVerified(true);
//       setShowOtpField(false);
//       setShowAddressSection(true);
//       if (onSelect) {
//         onSelect(config.key, { ...getUpdatedData(), isAadhaarVerified: true });
//       }
//     } else {
//       setOtpError(true);
//     }
//   };

//   const onStepSelect = () => {
//     const updatedData = getUpdatedData();
//     if (onSelect) {
//       onSelect(config.key, updatedData);
//     } else {
//       if (isEditing) {
//         history.push("/digit-ui/employee/ekyc/review", { ...location.state, edits: { ...edits, aadhaarData: updatedData } });
//       } else {
//         history.push("/digit-ui/employee/ekyc/address-details", {
//           ...location.state,
//           edits: { ...edits, aadhaarData: updatedData }
//         });
//       }
//     }
//   };

//   const handleUpdateAndReturn = () => {
//     history.push("/digit-ui/employee/ekyc/review", { ...location.state, edits: { ...edits, aadhaarData: getUpdatedData() } });
//   };

//   const yesNoOptions = [
//     { code: "YES", name: "CORE_COMMON_YES" },
//     { code: "NO", name: "CORE_COMMON_NO" },
//   ];

//   return (
//     <Fragment>
//       <FormStep
//         t={t}
//         config={config || {}}
//         onSelect={onStepSelect}
//         isDisabled={!isAadhaarVerified || !userName || !mobileNumber}
//         label={t(config?.texts?.submitBarLabel) || (isEditing ? t("EKYC_UPDATE_AND_RETURN") : t("ES_COMMON_CONTINUE"))}
//       >
//         <CardLabel>{t("EKYC_AADHAAR_NUMBER")} <span className="astericColor">*</span></CardLabel>
//         <TextInput
//           id="aadhaarNumber"
//           name="aadhaarNumber"
//           value={aadhaarNumber}
//           onChange={(e) => setAadhaarNumber(e.target.value)}
//           placeholder={t("EKYC_ENTER_AADHAAR_NUMBER")}
//           maxLength={12}
//           disabled={isAadhaarVerified}
//         />
//         {!isAadhaarVerified && !showOtpField && (
//           <SubmitBar label={t("EKYC_VERIFY")} onSubmit={handleVerifyAadhaar} disabled={aadhaarNumber.length !== 12} />
//         )}

//         {showOtpField && (
//           <Fragment>
//             <CardLabel>{t("EKYC_ENTER_OTP")} <span className="astericColor">*</span></CardLabel>
//             <TextInput
//               id="otp"
//               name="otp"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               placeholder="123456"
//               maxLength={6}
//             />
//             {otpError && <div style={{ color: "red", fontSize: "12px" }}>{t("EKYC_INVALID_OTP")}</div>}
//             <SubmitBar label={t("EKYC_VERIFY_OTP")} onSubmit={handleVerifyOtp} disabled={otp.length !== 6} />
//           </Fragment>
//         )}

//         {isAadhaarVerified && (
//           <Fragment>
//             <CardLabel>{t("EKYC_IS_NAME_CORRECT")}</CardLabel>
//             <RadioButtons
//               options={yesNoOptions}
//               optionsKey="name"
//               selectedOption={nameCorrect}
//               onSelect={setNameCorrect}
//             />
//             <CardLabel>{t("EKYC_USER_NAME")} <span className="astericColor">*</span></CardLabel>
//             <TextInput
//               id="userName"
//               name="userName"
//               value={userName}
//               onChange={(e) => setUserName(e.target.value)}
//               disabled={nameCorrect.code === "NO"}
//             />

//             <CardLabel>{t("EKYC_CHANGE_MOBILE")}</CardLabel>
//             <RadioButtons
//               options={yesNoOptions}
//               optionsKey="name"
//               selectedOption={mobileChange}
//               onSelect={setMobileChange}
//             />
//             <CardLabel>{t("EKYC_MOBILE_NUMBER")} <span className="astericColor">*</span></CardLabel>
//             <TextInput
//               id="mobileNumber"
//               name="mobileNumber"
//               value={mobileNumber}
//               onChange={(e) => setMobileNumber(e.target.value)}
//               disabled={mobileChange.code === "NO"}
//             />

//             <CardLabel>{t("EKYC_WHATSAPP_NUMBER")}</CardLabel>
//             <TextInput
//               id="whatsappNumber"
//               name="whatsappNumber"
//               value={whatsappNumber}
//               onChange={(e) => setWhatsappNumber(e.target.value)}
//             />

//             <CardLabel>{t("EKYC_EMAIL_ID")}</CardLabel>
//             <TextInput
//               id="email"
//               name="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />

//             <CardLabel>{t("EKYC_NO_OF_PERSONS")}</CardLabel>
//             <TextInput
//               id="noOfPersons"
//               name="noOfPersons"
//               value={noOfPersons}
//               onChange={(e) => setNoOfPersons(e.target.value)}
//             />
//           </Fragment>
//         )}
//       </FormStep>
//       {isEditing && !onSelect && (
//         <ActionBar style={{ position: "static", marginTop: "20px" }}>
//           <SubmitBar label={t("EKYC_UPDATE_AND_RETURN")} onSubmit={handleUpdateAndReturn} />
//         </ActionBar>
//       )}
//     </Fragment>
//   );
// };

// export default AadhaarVerification;



import React, { useState, Fragment } from "react";
import {
  CardLabel,
  TextInput,
  Dropdown,
  UploadFile,
  RadioButtons,
  Toast,
  FormStep,
} from "@djb25/digit-ui-react-components";

const ConsumerDetails = ({ config, onSelect }) => {

  // 🔹 STATES
  const [kno, setKno] = useState("");
  const [consumerType, setConsumerType] = useState(null);
  const [occupantType, setOccupantType] = useState(null);
  const [categoryType, setCategoryType] = useState(null);

  const [consumerName, setConsumerName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [gender, setGender] = useState(null);
  const [relation, setRelation] = useState("");

  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [residents, setResidents] = useState("");

  // Tenant
  const [documentProof, setDocumentProof] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [ownerMobile, setOwnerMobile] = useState("");
  const [tenantVerification, setTenantVerification] = useState("");

  // Govt
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [landline, setLandline] = useState("");

  // Other Entity
  const [entityRelation, setEntityRelation] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [entityName, setEntityName] = useState("");

  // Identity
  const [idProof, setIdProof] = useState(null);
  const [idNumber, setIdNumber] = useState("");
  const [idFile, setIdFile] = useState(null);


  const [toast, setToast] = useState(null);

  // 🔹 OPTIONS
  const consumerTypeOptions = [
    { name: "Individual" },
    { name: "Govt" },
    { name: "Company_Society_Org" },
  ];

  const occupantOptions = [
    { name: "Self" },
    { name: "Tenanted" },
  ];

  const genderOptions = [
    { name: "Male" },
    { name: "Female" },
    { name: "Others" },
    { name: "Not prefer to say" },
  ];

  const yesNo = [{ name: "Yes" }, { name: "No" }];

  // 🔹 FILE UPLOAD
  const uploadFile = async (e, setter, idSetter) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await Digit.UploadServices.Filestorage("EKYC", file);
      const id = res?.data?.files?.[0]?.fileStoreId;
      if (id) {
        setter(file.name);
        idSetter(id);
      }
    } catch {
      setToast({ type: "error", message: "Upload failed" });
    }
  };

  // 🔹 VALIDATION
  const isValid = () => {
    if (!kno) return false;
    if (!consumerType) return false;
    if (!occupantType) return false;
    if (!categoryType) return false;
    if (!firstName) return false;
    if (!mobile) return false;
    if (!residents || Number(residents) <= 0) return false;

    if (occupantType?.name === "Tenanted" && !documentId && !ownerMobile)
      return false;

    return consent;
  };

  // 🔹 SUBMIT
  const onStepSelect = () => {
    if (!isValid()) {
      setToast({ type: "error", message: "Fill required fields" });
      return;
    }

    const data = {
      kno,
      consumerType: consumerType?.name,
      occupantType: occupantType?.name,
      categoryType: categoryType?.name,
      consumerName,
      firstName,
      middleName,
      lastName,
      gender: gender?.name,
      relation,
      mobile,
      whatsapp,
      email,
      residents,
      documentId,
      ownerMobile,
      tenantVerification,
      designation,
      department,
      employeeId,
      landline,
      entityRelation,
      contactPerson,
      entityName,
      idProof: idProof?.name,
      idNumber,
      consent,
      informantIsConsumer,
      informantName,
      informantRelation,
    };

    onSelect(config.key, data);
  };

  return (
    <Fragment>
      <FormStep onSelect={onStepSelect} config={config}>
        <div>
          <CardLabel>K Number *</CardLabel>
          <TextInput value={kno} onChange={(e) => setKno(e.target.value)} />
        </div>

        <div>
          <CardLabel>Consumer Type *</CardLabel>
          <Dropdown option={consumerTypeOptions} selected={consumerType} select={setConsumerType} />
        </div>

        <div>
          <CardLabel>Occupant Type *</CardLabel>
          <Dropdown option={occupantOptions} selected={occupantType} select={setOccupantType} />
        </div>

        <div>
          <CardLabel>Category Type *</CardLabel>
          <Dropdown option={[]} selected={categoryType} select={setCategoryType} />
        </div>

        <div>
          <CardLabel>First Name *</CardLabel>
          <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div>
          <CardLabel>Middle Name</CardLabel>
          <TextInput value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
        </div>

        <div>
          <CardLabel>Last Name</CardLabel>
          <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div>
          <CardLabel>Gender</CardLabel>
          <Dropdown option={genderOptions} selected={gender} select={setGender} />
        </div>

        <div>
          <CardLabel>Mobile *</CardLabel>
          <TextInput value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>

        <div>
          <CardLabel>WhatsApp</CardLabel>
          <TextInput value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>

        <div>
          <CardLabel>Email</CardLabel>
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <CardLabel>No. of Residents *</CardLabel>
          <TextInput value={residents} onChange={(e) => setResidents(e.target.value)} />
        </div>

        {/* TENANT LOGIC */}
        {occupantType?.name === "Tenanted" && (
          <Fragment>
            <div>
              <CardLabel>Document Proof</CardLabel>
              <UploadFile onUpload={(e) => uploadFile(e, setDocumentProof, setDocumentId)} />
            </div>

            {!documentId && (
              <Fragment>
                <div>
                  <CardLabel>Owner Mobile *</CardLabel>
                  <TextInput value={ownerMobile} onChange={(e) => setOwnerMobile(e.target.value)} />
                </div>

                <div>
                  <CardLabel>Tenant Verification</CardLabel>
                  <TextInput value={tenantVerification} onChange={(e) => setTenantVerification(e.target.value)} />
                </div>
              </Fragment>
            )}
          </Fragment>
        )}

        {/* GOVT */}
        {consumerType?.name === "Govt" && (
          <Fragment>
            <div>
              <CardLabel>Designation</CardLabel>
              <TextInput value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>

            <div>
              <CardLabel>Department</CardLabel>
              <TextInput value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>

            <div>
              <CardLabel>Employee ID</CardLabel>
              <TextInput value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
            </div>
          </Fragment>
        )}

        {/* OTHER ENTITY */}
        {consumerType?.name === "Company_Society_Org" && (
          <Fragment>
            <div>
              <CardLabel>Entity Name</CardLabel>
              <TextInput value={entityName} onChange={(e) => setEntityName(e.target.value)} />
            </div>

            <div>
              <CardLabel>Contact Person</CardLabel>
              <TextInput value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
          </Fragment>
        )}

        

        {toast && <Toast label={toast.message} error={toast.type === "error"} onClose={() => setToast(null)} />}

      </FormStep>
    </Fragment>
  );
};

export default ConsumerDetails;