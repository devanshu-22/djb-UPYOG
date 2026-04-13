import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  ActionBar,
  Card,
  CardLabel,
  CardLabelError,
  CardSectionSubText,
  CardSubHeader,
  CardText,
  CheckBox,
  CollapsibleCardPage,
  DatePicker,
  Dropdown,
  Header,
  RadioButtons,
  SubmitBar,
  TextArea,
  TextInput,
  Toast,
  UploadFile,
  Loader,
} from "@djb25/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { createPayloadOfWS, updatePayloadOfWS } from "../../../utils";

const FORM_STORAGE_KEY = "WS_EMPLOYEE_NEW_APPLICATION_FORM";
const MAX_FILE_SIZE = 5242880;
const SUPPORTED_FILE_TYPES = /(\.pdf|\.png|\.jpe?g)$/i;

const NAME_PATTERN = /^[a-zA-Z\s.'-]{1,50}$/;
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;
const OFFICE_PATTERN = /^[0-9]{6,12}$/;
const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;
const NUMBER_PATTERN = /^\d+$/;
const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_PATTERN = /^[0-9]{9,18}$/;
const COLLAPSIBLE_CONTENT_TAB = "__WS_SECTION_CONTENT__";

const createOption = (code, name) => ({ code, name });

const TYPE_OF_REQUEST_OPTIONS = [
  createOption("NEW_CONNECTION", "New Connection"),
  createOption("TEMPORARY_CONNECTION", "Temporary Connection"),
  createOption("CHANGE_REQUEST", "Change Request"),
];

const CONNECTION_TYPE_OPTIONS = [createOption("METERED", "Metered"), createOption("NON_METERED", "Non Metered")];

const LOCALITY_OPTIONS = [createOption("DWARKA", "Dwarka"), createOption("ROHINI", "Rohini"), createOption("KAROL_BAGH", "Karol Bagh")];

const SUB_LOCALITY_OPTIONS = {
  DWARKA: [createOption("SECTOR_6", "Sector 6"), createOption("SECTOR_10", "Sector 10"), createOption("SECTOR_12", "Sector 12")],
  ROHINI: [createOption("SECTOR_3", "Sector 3"), createOption("SECTOR_8", "Sector 8"), createOption("SECTOR_16", "Sector 16")],
  KAROL_BAGH: [createOption("DEV_NAGAR", "Dev Nagar"), createOption("PAHAR_GANJ", "Pahar Ganj"), createOption("PATEL_NAGAR", "Patel Nagar")],
};

const ASSEMBLY_OPTIONS = [
  createOption("DWARKA_ASSEMBLY", "Dwarka Assembly"),
  createOption("ROHINI_ASSEMBLY", "Rohini Assembly"),
  createOption("KAROL_BAGH_ASSEMBLY", "Karol Bagh Assembly"),
];

const WARD_OPTIONS = [createOption("WARD_101", "Ward 101"), createOption("WARD_102", "Ward 102"), createOption("WARD_103", "Ward 103")];

const PROPERTY_TYPE_OPTIONS = [
  createOption("RESIDENTIAL", "Residential"),
  createOption("COMMERCIAL", "Commercial"),
  createOption("INDUSTRIAL", "Industrial"),
  createOption("INSTITUTIONAL", "Institutional"),
  createOption("HOSPITAL_NURSING_HOME", "Hospital / Nursing Home"),
];

const WATER_CONNECTION_CATEGORY_OPTIONS = [
  createOption("DOMESTIC", "Domestic"),
  createOption("NON_DOMESTIC", "Non-Domestic"),
  createOption("MIXED_USE", "Mixed Use"),
];

const WATER_CONNECTION_USED_BY_OPTIONS = [
  createOption("OWNER", "Owner"),
  createOption("TENANT", "Tenant"),
  createOption("AUTHORIZED_OCCUPIER", "Authorized Occupier"),
];

const PROOF_OF_IDENTITY_OPTIONS = [
  createOption("AADHAAR", "Aadhaar"),
  createOption("PAN", "PAN"),
  createOption("VOTER_ID", "Voter ID"),
  createOption("PASSPORT", "Passport"),
  createOption("DRIVING_LICENSE", "Driving License"),
];

const OWNERSHIP_STATUS_OPTIONS = [
  createOption("SELF_OWNED", "Self Owned"),
  createOption("LEASED", "Leased"),
  createOption("RENTED", "Rented"),
  createOption("GOVERNMENT_ALLOTTED", "Government Allotted"),
];

const SUBMITTED_BY_OPTIONS = [
  createOption("APPLICANT", "Applicant"),
  createOption("AUTHORIZED_SIGNATORY", "Authorized Signatory"),
  createOption("DJB_COUNTER", "DJB Counter"),
];

const DEFAULT_SECTION_STATE = {
  application: true,
  applicant: true,
  contact: true,
  employee: true,
  address: true,
  usage: true,
  bank: true,
  rainWaterHarvesting: true,
  documents: true,
  declaration: true,
};

const DEFAULT_FORM_VALUES = {
  typeOfRequest: null,
  connectionType: null,
  applicant: {
    firstName: "",
    middleName: "",
    lastName: "",
    fatherOrHusbandName: "",
    isGovernmentOrganization: false,
    applicantIdProofFile: null,
    governmentOrganizationName: "",
  },
  contact: {
    emailId: "",
    mobileNumber: "",
    officeNumber: "",
  },
  djbEmployee: {
    isDjbEmployee: false,
    employeeId: "",
    retirementDate: "",
    officeNameAndAddress: "",
  },
  propertyAddress: {
    address: "",
    landmark: "",
    pinCode: "",
    locality: null,
    subLocality: null,
    assembly: null,
    ward: null,
  },
  useDetails: {
    propertyType: null,
    noOfFloors: "",
    hospitalBeds: "",
    plotArea: "",
    builtUpArea: "",
    waterConnectionCategory: null,
    waterConnectionUsedBy: null,
  },
  bankDetails: {
    bankName: "",
    branchName: "",
    ifscCode: "",
    bankAccountNumber: "",
  },
  rainWaterHarvesting: {
    applyForAdequacyCertificate: false,
  },
  documents: {
    proofOfIdentity: null,
    identityProofFile: null,
    ownershipStatus: null,
    ownershipDocumentFile: null,
    otherDocumentFile: null,
  },
  declaration: {
    submittedBy: null,
    signatureFile: null,
    captcha: "",
    agree: false,
  },
  cpt: { id: "", details: null },
};

const fieldWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: 0,
};

const secondaryButtonStyle = {
  background: "#FFFFFF",
  border: "1px solid #0B4B66",
  boxShadow: "none",
  color: "#0B4B66",
};

const actionBarStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const captchaBoxStyle = {
  background: "#F3F7F9",
  border: "1px dashed #0B4B66",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "20px",
  fontWeight: "700",
  letterSpacing: "4px",
  padding: "12px 16px",
};

const linkButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#0B4B66",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  padding: 0,
  textDecoration: "underline",
};

const getStoredFormData = () => {
  if (typeof window === "undefined") return {};
  try {
    const savedData = window.sessionStorage.getItem(FORM_STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : {};
  } catch (error) {
    return {};
  }
};

const buildDefaultValues = (savedFormData = {}) => ({
  typeOfRequest: savedFormData?.typeOfRequest || DEFAULT_FORM_VALUES.typeOfRequest,
  connectionType: savedFormData?.connectionType || DEFAULT_FORM_VALUES.connectionType,
  applicant: { ...DEFAULT_FORM_VALUES.applicant, ...(savedFormData?.applicant || {}) },
  contact: { ...DEFAULT_FORM_VALUES.contact, ...(savedFormData?.contact || {}) },
  djbEmployee: { ...DEFAULT_FORM_VALUES.djbEmployee, ...(savedFormData?.djbEmployee || {}) },
  propertyAddress: { ...DEFAULT_FORM_VALUES.propertyAddress, ...(savedFormData?.propertyAddress || {}) },
  useDetails: { ...DEFAULT_FORM_VALUES.useDetails, ...(savedFormData?.useDetails || {}) },
  bankDetails: { ...DEFAULT_FORM_VALUES.bankDetails, ...(savedFormData?.bankDetails || {}) },
  rainWaterHarvesting: { ...DEFAULT_FORM_VALUES.rainWaterHarvesting, ...(savedFormData?.rainWaterHarvesting || {}) },
  documents: { ...DEFAULT_FORM_VALUES.documents, ...(savedFormData?.documents || {}) },
  declaration: { ...DEFAULT_FORM_VALUES.declaration, ...(savedFormData?.declaration || {}) },
  cpt: savedFormData?.cpt || { id: "", details: null },
});

const resolveNestedValue = (value, path) =>
  path.split(".").reduce((accumulator, currentKey) => {
    if (accumulator === null || accumulator === undefined) return undefined;
    return accumulator[currentKey];
  }, value);

const getDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    if (value?.fileName) return value.fileName;
    if (value?.name) return value.name;
    if (value?.code) return value.code;
  }
  return String(value);
};

const generateCaptcha = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captcha = "";
  for (let index = 0; index < 6; index += 1) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
};

const FieldBlock = ({ label, required, error, children, hint, isFullWidth }) => {
  return (
    <div style={{ ...fieldWrapperStyle, ...(isFullWidth ? { gridColumn: "1 / -1" } : {}) }}>
      <CardLabel style={{ fontWeight: "600", marginBottom: "0px" }}>{required ? `${label} *` : label}</CardLabel>
      {children}
      {hint ? <CardText style={{ color: "#505A5F", fontSize: "14px", marginBottom: "0px", marginTop: "0px" }}>{hint}</CardText> : null}
      {error ? <CardLabelError>{error?.message || error}</CardLabelError> : null}
    </div>
  );
};

const SectionCard = ({ title, description, isOpen = true, children }) => {
  return (
    <div className="ws-new-application-collapsible" style={{ marginBottom: "16px" }}>
      <CollapsibleCardPage defaultOpen={isOpen} defaultTab={COLLAPSIBLE_CONTENT_TAB} tabs={[COLLAPSIBLE_CONTENT_TAB]} title={title}>
        {() => (
          <React.Fragment>
            {description ? <CardSectionSubText style={{ marginBottom: "16px" }}>{description}</CardSectionSubText> : null}
            <div className="formcomposer-section-grid">{children}</div>
          </React.Fragment>
        )}
      </CollapsibleCardPage>
    </div>
  );
};

const PreviewItem = ({ label, value, isFullWidth }) => {
  return (
    <div style={{ ...fieldWrapperStyle, ...(isFullWidth ? { gridColumn: "1 / -1" } : {}) }}>
      <CardLabel style={{ fontWeight: "600", marginBottom: "0px" }}>{label}</CardLabel>
      <CardText style={{ marginBottom: "0px", marginTop: "0px" }}>{getDisplayValue(value)}</CardText>
    </div>
  );
};

const FileUploadField = ({ id, label, value, onUpload, onDelete, error, isUploading, helperText, required }) => {
  return (
    <FieldBlock label={label} required={required} error={error} hint={helperText}>
      <UploadFile
        accept="image/*,.pdf,.png,.jpeg,.jpg"
        buttonType="button"
        error={!!error}
        id={id}
        message={value?.fileStoreId ? "1 file uploaded" : "No file uploaded"}
        onDelete={onDelete}
        onUpload={onUpload}
      />
      <CardText style={{ marginBottom: "0px", marginTop: "0px" }}>
        {isUploading ? "Uploading file..." : value?.fileName || "No file selected"}
      </CardText>
    </FieldBlock>
  );
};

const NewApplication = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  const stateId = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId() || Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code;

  const [previewMode, setPreviewMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState(DEFAULT_SECTION_STATE);
  const [showToast, setShowToast] = useState(null);
  const [generatedCaptcha, setGeneratedCaptcha] = useState(generateCaptcha());
  const [uploadingFields, setUploadingFields] = useState({});
  
  // API Integration States
  const [isEnableLoader, setIsEnableLoader] = useState(false);
  const [appDetails, setAppDetails] = useState({});
  const [waterAndSewerageBoth, setWaterAndSewerageBoth] = useState(null);
  const [propertyId, setPropertyId] = useState(new URLSearchParams(location.search).get("propertyId"));
  console.log(propertyId, 'property idddddd');

  const initialFormValues = buildDefaultValues(getStoredFormData());

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialFormValues,
    shouldUnregister: false, // Ensures values persist during preview mode
  });

  const formValues = watch();
  const isGovernmentOrganization = watch("applicant.isGovernmentOrganization");
  const isDjbEmployee = watch("djbEmployee.isDjbEmployee");
  const selectedPropertyType = watch("useDetails.propertyType");
  const selectedLocality = watch("propertyAddress.locality");
  const selectedSubLocality = watch("propertyAddress.subLocality");
  const subLocalityOptions = selectedLocality ? SUB_LOCALITY_OPTIONS[selectedLocality.code] || [] : [];
  const hasPendingUpload = Object.values(uploadingFields).some(Boolean);
  const isHospitalProperty = selectedPropertyType?.code === "HOSPITAL_NURSING_HOME";

  // --- API HOOKS ---
  const { data: propertyDetails, isLoading: isPropertyLoading } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: propertyId }, tenantId: tenantId },
    { filters: { propertyIds: propertyId }, tenantId: tenantId, enabled: !!propertyId }
  );

  const { mutate: waterMutation } = Digit.Hooks.ws.useWaterCreateAPI("WATER");
  const { mutate: waterUpdateMutation } = Digit.Hooks.ws.useWSApplicationActions("WATER");
  const { mutate: sewerageMutation } = Digit.Hooks.ws.useWaterCreateAPI("SEWERAGE");
  const { mutate: sewerageUpdateMutation } = Digit.Hooks.ws.useWSApplicationActions("SEWERAGE");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formValues));
  }, [formValues]);

  useEffect(() => {
    if (!isGovernmentOrganization) {
      setValue("applicant.governmentOrganizationName", "");
      clearErrors("applicant.governmentOrganizationName");
    }
  }, [isGovernmentOrganization, setValue, clearErrors]);

  useEffect(() => {
    if (!isDjbEmployee) {
      setValue("djbEmployee.employeeId", "");
      setValue("djbEmployee.retirementDate", "");
      setValue("djbEmployee.officeNameAndAddress", "");
      clearErrors("djbEmployee.employeeId");
      clearErrors("djbEmployee.retirementDate");
      clearErrors("djbEmployee.officeNameAndAddress");
    }
  }, [isDjbEmployee, setValue, clearErrors]);

  useEffect(() => {
    if (!isHospitalProperty) {
      setValue("useDetails.hospitalBeds", "");
      clearErrors("useDetails.hospitalBeds");
    }
  }, [isHospitalProperty, setValue, clearErrors]);

  useEffect(() => {
    const isValidSubLocality = selectedSubLocality ? subLocalityOptions.some((option) => option.code === selectedSubLocality.code) : true;
    if (!isValidSubLocality) {
      setValue("propertyAddress.subLocality", null);
    }
  }, [selectedLocality?.code, selectedSubLocality?.code, setValue]);

  const closeToast = () => setShowToast(null);
  const closeToastOfError = () => setShowToast(null);

  const toggleSection = (sectionKey) => {
    setCollapsedSections((previousState) => ({
      ...previousState,
      [sectionKey]: !previousState[sectionKey],
    }));
  };

  const getFieldError = (fieldName) => resolveNestedValue(errors, fieldName);

  const refreshCaptcha = () => {
    setGeneratedCaptcha(generateCaptcha());
    setValue("declaration.captcha", "");
    clearErrors("declaration.captcha");
  };

  const uploadFile = async (event, fieldName, onChange) => {
    const file = event?.target?.files?.[0];
    if (!file) {
      onChange(null);
      return;
    }
    setUploadingFields((previousState) => ({ ...previousState, [fieldName]: true }));
    clearErrors(fieldName);

    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size should be 5 MB or less.");
      }
      if (!SUPPORTED_FILE_TYPES.test(file.name)) {
        throw new Error("Only PDF, PNG, JPG and JPEG files are supported.");
      }
      const response = await Digit.UploadServices.Filestorage("WS", file, stateId);
      const fileStoreId = response?.data?.files?.[0]?.fileStoreId;

      if (!fileStoreId) {
        throw new Error("File upload failed. Please try again.");
      }

      onChange({
        fileName: file.name,
        fileSize: file.size,
        fileStoreId,
        fileType: file.type,
      });
      clearErrors(fieldName);
    } catch (error) {
      onChange(null);
      setError(fieldName, { type: "manual", message: error?.message || "File upload failed. Please try again." });
      setShowToast({ key: "error", message: error?.message || "File upload failed. Please try again." });
    } finally {
      setUploadingFields((previousState) => ({ ...previousState, [fieldName]: false }));
    }
  };

  const clearUploadedFile = (fieldName, onChange) => {
    onChange(null);
    clearErrors(fieldName);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const validateCaptcha = (data) => {
    if (data?.declaration?.captcha?.trim()?.toUpperCase() !== generatedCaptcha) {
      setError("declaration.captcha", { type: "manual", message: "Captcha does not match." });
      setShowToast({ warning: true, message: "Captcha does not match." });
      return false;
    }
    clearErrors("declaration.captcha");
    return true;
  };

  const onPreview = (data) => {
    if (hasPendingUpload) {
      setShowToast({ warning: true, message: "Please wait for all file uploads to complete." });
      return;
    }
    if (!validateCaptcha(data)) return;
    setPreviewMode(true);
    scrollToTop();
  };

  const onSubmit = async (data) => {
    if (hasPendingUpload) {
      setShowToast({ warning: true, message: "Please wait for all file uploads to complete." });
      return;
    }
    if (!validateCaptcha(data)) return;

    if (!propertyDetails?.Properties?.[0]) {
      setShowToast({ key: "error", message: "ERR_INVALID_PROPERTY_ID" });
      return;
    }

    try {
      // Inject property details into the form data for payload generation
      const formDataWithProperty = {
        ...data,
        cpt: {
          details: propertyDetails?.Properties?.[0],
        },
      };

      const payload = await createPayloadOfWS(formDataWithProperty);

      let waterAndSewerageLoader = false;
      if (payload?.water && payload?.sewerage) waterAndSewerageLoader = true;
      
      if (waterAndSewerageLoader) {
        setWaterAndSewerageBoth(true);
        sessionStorage.setItem("setWaterAndSewerageBoth", JSON.stringify(true));
      } else {
        sessionStorage.setItem("setWaterAndSewerageBoth", JSON.stringify(false));
      }

      let waterConnection = { WaterConnection: payload, disconnectRequest: false, reconnectRequest: false };
      let sewerageConnection = { SewerageConnection: payload, disconnectRequest: false, reconnectRequest: false };

      // Case 1: Both Water and Sewerage
      if (payload?.water && payload?.sewerage) {
        if (waterMutation && sewerageMutation) {
          setIsEnableLoader(true);
          await waterMutation(waterConnection, {
            onError: (error) => {
              setIsEnableLoader(false);
              setShowToast({
                key: "error",
                message: error?.response?.data?.Errors?.[0].message || error,
              });
              setTimeout(closeToastOfError, 5000);
            },
            onSuccess: async (waterData) => {
              let response = await updatePayloadOfWS(waterData?.WaterConnection?.[0], "WATER");
              let waterConnectionUpdate = { WaterConnection: response, disconnectRequest: false, reconnectRequest: false };
              
              waterUpdateMutation(waterConnectionUpdate, {
                onError: (error) => {
                  setIsEnableLoader(false);
                  setShowToast({
                    key: "error",
                    message: error?.response?.data?.Errors?.[0].message || error,
                  });
                  setTimeout(closeToastOfError, 5000);
                },
                onSuccess: async (waterUpdateData) => {
                  setAppDetails((prev) => ({ ...prev, waterConnection: waterUpdateData?.WaterConnection?.[0] }));
                  
                  await sewerageMutation(sewerageConnection, {
                    onError: (error) => {
                      setIsEnableLoader(false);
                      setShowToast({
                        key: "error",
                        message: error?.response?.data?.Errors?.[0].message || error,
                      });
                      setTimeout(closeToastOfError, 5000);
                    },
                    onSuccess: async (sewerageData) => {
                      let response = await updatePayloadOfWS(sewerageData?.SewerageConnections?.[0], "SEWERAGE");
                      let sewerageConnectionUpdate = { SewerageConnection: response, disconnectRequest: false, reconnectRequest: false };
                      
                      await sewerageUpdateMutation(sewerageConnectionUpdate, {
                        onError: (error) => {
                          setIsEnableLoader(false);
                          setShowToast({
                            key: "error",
                            message: error?.response?.data?.Errors?.[0].message || error,
                          });
                          setTimeout(closeToastOfError, 5000);
                        },
                        onSuccess: async (sewerageUpdateData) => {
                          setAppDetails((prev) => ({ ...prev, sewerageConnection: sewerageUpdateData?.SewerageConnections?.[0] }));
                          window.sessionStorage.removeItem(FORM_STORAGE_KEY);
                          history.push(
                            `/digit-ui/employee/ws/ws-response?applicationNumber=${waterUpdateData?.WaterConnection?.[0]?.applicationNo}&applicationNumber1=${sewerageUpdateData?.SewerageConnections?.[0]?.applicationNo}`
                          );
                        },
                      });
                    },
                  });
                },
              });
            },
          });
        }
      } 
      // Case 2: Only Water
      else if (payload?.water && !payload?.sewerage) {
        if (waterMutation) {
          setIsEnableLoader(true);
          await waterMutation(waterConnection, {
            onError: (error) => {
              setIsEnableLoader(false);
              setShowToast({
                key: "error",
                message: error?.response?.data?.Errors?.[0].message || error,
              });
              setTimeout(closeToastOfError, 5000);
            },
            onSuccess: async (data) => {
              let response = await updatePayloadOfWS(data?.WaterConnection?.[0], "WATER");
              let waterConnectionUpdate = { WaterConnection: response };
              waterUpdateMutation(waterConnectionUpdate, {
                onError: (error) => {
                  setIsEnableLoader(false);
                  setShowToast({
                    key: "error",
                    message: error?.response?.data?.Errors?.[0].message || error,
                  });
                  setTimeout(closeToastOfError, 5000);
                },
                onSuccess: (data) => {
                  setAppDetails((prev) => ({ ...prev, waterConnection: data?.WaterConnection?.[0] }));
                  window.sessionStorage.removeItem(FORM_STORAGE_KEY);
                  history.push(`/digit-ui/employee/ws/ws-response?applicationNumber=${data?.WaterConnection?.[0]?.applicationNo}`);
                },
              });
            },
          });
        }
      } 
      // Case 3: Only Sewerage
      else if (payload?.sewerage && !payload?.water) {
        if (sewerageMutation) {
          setIsEnableLoader(true);
          await sewerageMutation(sewerageConnection, {
            onError: (error) => {
              setIsEnableLoader(false);
              setShowToast({
                key: "error",
                message: error?.response?.data?.Errors?.[0].message || error,
              });
              setTimeout(closeToastOfError, 5000);
            },
            onSuccess: async (data) => {
              let response = await updatePayloadOfWS(data?.SewerageConnections?.[0], "SEWERAGE");
              let sewerageConnectionUpdate = { SewerageConnection: response };
              await sewerageUpdateMutation(sewerageConnectionUpdate, {
                onError: (error) => {
                  setIsEnableLoader(false);
                  setShowToast({
                    key: "error",
                    message: error?.response?.data?.Errors?.[0].message || error,
                  });
                  setTimeout(closeToastOfError, 5000);
                },
                onSuccess: (data) => {
                  setAppDetails((prev) => ({ ...prev, sewerageConnection: data?.SewerageConnections?.[0] }));
                  window.sessionStorage.removeItem(FORM_STORAGE_KEY);
                  history.push(`/digit-ui/employee/ws/ws-response?applicationNumber1=${data?.SewerageConnections?.[0]?.applicationNo}`);
                },
              });
            },
          });
        }
      }
    } catch (error) {
      setIsEnableLoader(false);
      setShowToast({ key: "error", message: "Failed to generate payload or submit application." });
    }
  };

  const onEdit = () => {
    setPreviewMode(false);
    scrollToTop();
  };

  const onReset = () => {
    reset(DEFAULT_FORM_VALUES);
    setPreviewMode(false);
    setGeneratedCaptcha(generateCaptcha());
    setCollapsedSections(DEFAULT_SECTION_STATE);
    setUploadingFields({});
    setShowToast(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(FORM_STORAGE_KEY);
    }
    scrollToTop();
  };

  if (isEnableLoader || isPropertyLoading) {
    return <Loader />;
  }

  return (
    <div className="employee-form-content-with-action-bar">
      <style>
        {`
          .ws-new-application-collapsible .collapsible-card-tabs {
            display: none;
          }

          .ws-new-application-collapsible .collapsible-card-tab-content {
            padding: 0;
          }
        `}
      </style>
      <Header>{t("New Water / Sewerage Application")}</Header>

      <Card style={{ marginBottom: "16px" }}>
        <CardSubHeader>{previewMode ? t("Preview Application") : t("Application Form")}</CardSubHeader>
       
      </Card>

      <div style={{ display: previewMode ? "none" : "block" }}>
        <React.Fragment>
          <SectionCard
            description="Primary request selections"
            isOpen={collapsedSections.application}
            onToggle={toggleSection}
            sectionKey="application"
            title="Application Selection"
          >
            <FieldBlock error={getFieldError("typeOfRequest")} label="Type of Request" required>
              <Controller
                control={control}
                name="typeOfRequest"
                rules={{ required: "Type of Request is required." }}
                render={(props) => (
                  <RadioButtons
                    name="typeOfRequest"
                    options={TYPE_OF_REQUEST_OPTIONS}
                    optionsKey="name"
                    onSelect={props.onChange}
                    selectedOption={props.value}
                  />
                )}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("connectionType")} label="Connection Type" required>
              <Controller
                control={control}
                name="connectionType"
                rules={{ required: "Connection Type is required." }}
                render={(props) => (
                  <RadioButtons
                    name="connectionType"
                    options={CONNECTION_TYPE_OPTIONS}
                    optionsKey="name"
                    onSelect={props.onChange}
                    selectedOption={props.value}
                  />
                )}
              />
            </FieldBlock>
          </SectionCard>

          <SectionCard
            description="Applicant name, organization details, and supporting ID proof."
            isOpen={collapsedSections.applicant}
            onToggle={toggleSection}
            sectionKey="applicant"
            title="Details of Applicant"
          >
            <FieldBlock error={getFieldError("applicant.firstName")} label="First Name" required>
              <TextInput
                errorStyle={!!getFieldError("applicant.firstName")}
                inputRef={register({
                  pattern: { value: NAME_PATTERN, message: "Use letters only." },
                  required: "First Name is required.",
                })}
                name="applicant.firstName"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("applicant.middleName")} label="Middle Name">
              <TextInput
                errorStyle={!!getFieldError("applicant.middleName")}
                inputRef={register({
                  pattern: { value: NAME_PATTERN, message: "Use letters only." },
                })}
                name="applicant.middleName"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("applicant.lastName")} label="Last Name" required>
              <TextInput
                errorStyle={!!getFieldError("applicant.lastName")}
                inputRef={register({
                  pattern: { value: NAME_PATTERN, message: "Use letters only." },
                  required: "Last Name is required.",
                })}
                name="applicant.lastName"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("applicant.fatherOrHusbandName")} label="Father / Husband Name" required>
              <TextInput
                errorStyle={!!getFieldError("applicant.fatherOrHusbandName")}
                inputRef={register({
                  pattern: { value: NAME_PATTERN, message: "Use letters only." },
                  required: "Father / Husband Name is required.",
                })}
                name="applicant.fatherOrHusbandName"
              />
            </FieldBlock>

            <FieldBlock label="Government Organization">
              <Controller
                control={control}
                name="applicant.isGovernmentOrganization"
                render={(props) => (
                  <CheckBox
                    checked={!!props.value}
                    label="Applicant belongs to a Government Organization"
                    onChange={(event) => props.onChange(event.target.checked)}
                  />
                )}
              />
            </FieldBlock>

            {isGovernmentOrganization ? (
              <FieldBlock error={getFieldError("applicant.governmentOrganizationName")} isFullWidth label="Name of Government Organization" required>
                <TextInput
                  errorStyle={!!getFieldError("applicant.governmentOrganizationName")}
                  inputRef={register({
                    required: isGovernmentOrganization ? "Government Organization Name is required." : false,
                  })}
                  name="applicant.governmentOrganizationName"
                />
              </FieldBlock>
            ) : null}

            <Controller
              control={control}
              name="applicant.applicantIdProofFile"
              rules={{ validate: (value) => !!value || "Applicant ID Proof is required." }}
              render={(props) => (
                <FileUploadField
                  error={getFieldError("applicant.applicantIdProofFile")}
                  helperText="Max size 5 MB. Allowed types: PDF, PNG, JPG, JPEG."
                  id="applicant-id-proof"
                  isUploading={!!uploadingFields["applicant.applicantIdProofFile"]}
                  label="Upload ID Proof"
                  onDelete={() => clearUploadedFile("applicant.applicantIdProofFile", props.onChange)}
                  onUpload={(event) => uploadFile(event, "applicant.applicantIdProofFile", props.onChange)}
                  required
                  value={props.value}
                />
              )}
            />
          </SectionCard>

          <SectionCard
            description="Basic communication details for the application."
            isOpen={collapsedSections.contact}
            onToggle={toggleSection}
            sectionKey="contact"
            title="Contact Details"
          >
            <FieldBlock error={getFieldError("contact.emailId")} label="Email ID" required>
              <TextInput
                errorStyle={!!getFieldError("contact.emailId")}
                inputRef={register({
                  pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address." },
                  required: "Email ID is required.",
                })}
                name="contact.emailId"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("contact.mobileNumber")} label="Mobile Number" required>
              <TextInput
                errorStyle={!!getFieldError("contact.mobileNumber")}
                inputRef={register({
                  pattern: { value: MOBILE_PATTERN, message: "Enter a valid 10-digit mobile number." },
                  required: "Mobile Number is required.",
                })}
                maxlength={10}
                name="contact.mobileNumber"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("contact.officeNumber")} label="Office No.">
              <TextInput
                errorStyle={!!getFieldError("contact.officeNumber")}
                inputRef={register({
                  pattern: { value: OFFICE_PATTERN, message: "Enter a valid office number." },
                })}
                name="contact.officeNumber"
              />
            </FieldBlock>
          </SectionCard>

          <SectionCard
            description="Enable this section only when the applicant is a DJB employee."
            isOpen={collapsedSections.employee}
            onToggle={toggleSection}
            sectionKey="employee"
            title="For DJB Employee"
          >
            <FieldBlock label="DJB Employee">
              <Controller
                control={control}
                name="djbEmployee.isDjbEmployee"
                render={(props) => (
                  <CheckBox checked={!!props.value} label="Applicant is a DJB Employee" onChange={(event) => props.onChange(event.target.checked)} />
                )}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("djbEmployee.employeeId")} label="Employee ID" required={isDjbEmployee}>
              <TextInput
                errorStyle={!!getFieldError("djbEmployee.employeeId")}
                inputRef={register({
                  required: isDjbEmployee ? "Employee ID is required." : false,
                })}
                name="djbEmployee.employeeId"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("djbEmployee.retirementDate")} label="Date of Retirement" required={isDjbEmployee}>
              <Controller
                control={control}
                name="djbEmployee.retirementDate"
                rules={{ required: isDjbEmployee ? "Date of Retirement is required." : false }}
                render={(props) => <DatePicker date={props.value} onChange={props.onChange} />}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("djbEmployee.officeNameAndAddress")} isFullWidth label="Office Name & Address" required={isDjbEmployee}>
              <TextArea
                className={getFieldError("djbEmployee.officeNameAndAddress") ? "employee-card-input-error" : ""}
                inputRef={register({
                  required: isDjbEmployee ? "Office Name & Address is required." : false,
                })}
                name="djbEmployee.officeNameAndAddress"
                style={{ minHeight: "96px" }}
              />
            </FieldBlock>
          </SectionCard>

          <SectionCard
            description="Property location and administrative boundary details."
            isOpen={collapsedSections.address}
            onToggle={toggleSection}
            sectionKey="address"
            title="Property Address"
          >
            <FieldBlock error={getFieldError("propertyAddress.address")} isFullWidth label="Address" required>
              <TextArea
                className={getFieldError("propertyAddress.address") ? "employee-card-input-error" : ""}
                inputRef={register({
                  required: "Address is required.",
                })}
                name="propertyAddress.address"
                style={{ minHeight: "96px" }}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("propertyAddress.landmark")} label="Landmark">
              <TextInput errorStyle={!!getFieldError("propertyAddress.landmark")} inputRef={register()} name="propertyAddress.landmark" />
            </FieldBlock>

            <FieldBlock error={getFieldError("propertyAddress.pinCode")} label="Pin Code" required>
              <TextInput
                errorStyle={!!getFieldError("propertyAddress.pinCode")}
                inputRef={register({
                  pattern: { value: PINCODE_PATTERN, message: "Enter a valid 6-digit pin code." },
                  required: "Pin Code is required.",
                })}
                maxlength={6}
                name="propertyAddress.pinCode"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("propertyAddress.locality")} label="Locality" required>
              <Controller
                control={control}
                name="propertyAddress.locality"
                rules={{ required: "Locality is required." }}
                render={(props) => <Dropdown option={LOCALITY_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("propertyAddress.subLocality")} label="Sub Locality" required>
              <Controller
                control={control}
                name="propertyAddress.subLocality"
                rules={{ required: "Sub Locality is required." }}
                render={(props) => (
                  <Dropdown
                    disable={!selectedLocality}
                    option={subLocalityOptions}
                    optionKey="name"
                    selected={props.value}
                    select={props.onChange}
                    t={t}
                  />
                )}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("propertyAddress.assembly")} label="Assembly" required>
              <Controller
                control={control}
                name="propertyAddress.assembly"
                rules={{ required: "Assembly is required." }}
                render={(props) => <Dropdown option={ASSEMBLY_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("propertyAddress.ward")} label="Ward" required>
              <Controller
                control={control}
                name="propertyAddress.ward"
                rules={{ required: "Ward is required." }}
                render={(props) => <Dropdown option={WARD_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />}
              />
            </FieldBlock>
          </SectionCard>

          <SectionCard
            description="Usage attributes for the property and the requested water connection."
            isOpen={collapsedSections.usage}
            onToggle={toggleSection}
            sectionKey="usage"
            title="Property and Water Connection Use Details"
          >
            <FieldBlock error={getFieldError("useDetails.propertyType")} label="Property Type" required>
              <Controller
                control={control}
                name="useDetails.propertyType"
                rules={{ required: "Property Type is required." }}
                render={(props) => <Dropdown option={PROPERTY_TYPE_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("useDetails.noOfFloors")} label="No. of Floors" required>
              <TextInput
                errorStyle={!!getFieldError("useDetails.noOfFloors")}
                inputRef={register({
                  pattern: { value: NUMBER_PATTERN, message: "Enter a valid whole number." },
                  required: "No. of Floors is required.",
                })}
                name="useDetails.noOfFloors"
              />
            </FieldBlock>

            {isHospitalProperty ? (
              <FieldBlock error={getFieldError("useDetails.hospitalBeds")} label="No. of Beds for Hospitals & Nursing Home" required>
                <TextInput
                  errorStyle={!!getFieldError("useDetails.hospitalBeds")}
                  inputRef={register({
                    pattern: { value: NUMBER_PATTERN, message: "Enter a valid whole number." },
                    required: isHospitalProperty ? "No. of Beds is required for Hospital / Nursing Home." : false,
                  })}
                  name="useDetails.hospitalBeds"
                />
              </FieldBlock>
            ) : null}

            <FieldBlock error={getFieldError("useDetails.plotArea")} label="Plot Area in Sqm" required>
              <TextInput
                errorStyle={!!getFieldError("useDetails.plotArea")}
                inputRef={register({
                  pattern: { value: DECIMAL_PATTERN, message: "Enter a valid numeric value." },
                  required: "Plot Area is required.",
                })}
                name="useDetails.plotArea"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("useDetails.builtUpArea")} label="Built Up Area" required>
              <TextInput
                errorStyle={!!getFieldError("useDetails.builtUpArea")}
                inputRef={register({
                  pattern: { value: DECIMAL_PATTERN, message: "Enter a valid numeric value." },
                  required: "Built Up Area is required.",
                })}
                name="useDetails.builtUpArea"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("useDetails.waterConnectionCategory")} label="Water Connection Category" required>
              <Controller
                control={control}
                name="useDetails.waterConnectionCategory"
                rules={{ required: "Water Connection Category is required." }}
                render={(props) => (
                  <Dropdown option={WATER_CONNECTION_CATEGORY_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />
                )}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("useDetails.waterConnectionUsedBy")} label="Water Connection Used By" required>
              <Controller
                control={control}
                name="useDetails.waterConnectionUsedBy"
                rules={{ required: "Water Connection Used By is required." }}
                render={(props) => (
                  <Dropdown option={WATER_CONNECTION_USED_BY_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />
                )}
              />
            </FieldBlock>
          </SectionCard>

          <SectionCard
            description="Refund or payment-linked bank account details."
            isOpen={collapsedSections.bank}
            onToggle={toggleSection}
            sectionKey="bank"
            title="Bank Details"
          >
            <FieldBlock error={getFieldError("bankDetails.bankName")} label="Name of the Bank" required>
              <TextInput
                errorStyle={!!getFieldError("bankDetails.bankName")}
                inputRef={register({
                  required: "Bank Name is required.",
                })}
                name="bankDetails.bankName"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("bankDetails.branchName")} label="Name of the Branch" required>
              <TextInput
                errorStyle={!!getFieldError("bankDetails.branchName")}
                inputRef={register({
                  required: "Branch Name is required.",
                })}
                name="bankDetails.branchName"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("bankDetails.ifscCode")} label="IFSC Code" required>
              <TextInput
                errorStyle={!!getFieldError("bankDetails.ifscCode")}
                inputRef={register({
                  pattern: { value: IFSC_PATTERN, message: "Enter a valid IFSC code." },
                  required: "IFSC Code is required.",
                })}
                name="bankDetails.ifscCode"
                onChange={(event) => {
                  event.target.value = event.target.value.toUpperCase();
                }}
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("bankDetails.bankAccountNumber")} label="Bank Account No." required>
              <TextInput
                errorStyle={!!getFieldError("bankDetails.bankAccountNumber")}
                inputRef={register({
                  pattern: { value: ACCOUNT_PATTERN, message: "Enter a valid bank account number." },
                  required: "Bank Account Number is required.",
                })}
                name="bankDetails.bankAccountNumber"
              />
            </FieldBlock>
          </SectionCard>

          <SectionCard
            description="Optional rain water harvesting certificate request."
            isOpen={collapsedSections.rainWaterHarvesting}
            onToggle={toggleSection}
            sectionKey="rainWaterHarvesting"
            title="Rain Water Harvesting"
          >
            <FieldBlock isFullWidth label="Apply for RWH Adequacy Certificate">
              <Controller
                control={control}
                name="rainWaterHarvesting.applyForAdequacyCertificate"
                render={(props) => (
                  <CheckBox
                    checked={!!props.value}
                    label="Apply for RWH Adequacy Certificate"
                    onChange={(event) => props.onChange(event.target.checked)}
                  />
                )}
              />
            </FieldBlock>
          </SectionCard>

          <SectionCard
            description="Documents to be attached. Maximum allowed file size is 5 MB."
            isOpen={collapsedSections.documents}
            onToggle={toggleSection}
            sectionKey="documents"
            title="Documents to be Attached"
          >
            <FieldBlock error={getFieldError("documents.proofOfIdentity")} label="Proof of Identity" required>
              <Controller
                control={control}
                name="documents.proofOfIdentity"
                rules={{ required: "Proof of Identity is required." }}
                render={(props) => (
                  <Dropdown option={PROOF_OF_IDENTITY_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />
                )}
              />
            </FieldBlock>

            <Controller
              control={control}
              name="documents.identityProofFile"
              rules={{ validate: (value) => !!value || "Upload Identity Proof is required." }}
              render={(props) => (
                <FileUploadField
                  error={getFieldError("documents.identityProofFile")}
                  helperText="Max size 5 MB. Allowed types: PDF, PNG, JPG, JPEG."
                  id="identity-proof-file"
                  isUploading={!!uploadingFields["documents.identityProofFile"]}
                  label="Upload Identity Proof"
                  onDelete={() => clearUploadedFile("documents.identityProofFile", props.onChange)}
                  onUpload={(event) => uploadFile(event, "documents.identityProofFile", props.onChange)}
                  required
                  value={props.value}
                />
              )}
            />

            <FieldBlock error={getFieldError("documents.ownershipStatus")} label="Ownership Status" required>
              <Controller
                control={control}
                name="documents.ownershipStatus"
                rules={{ required: "Ownership Status is required." }}
                render={(props) => (
                  <Dropdown option={OWNERSHIP_STATUS_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />
                )}
              />
            </FieldBlock>

            <Controller
              control={control}
              name="documents.ownershipDocumentFile"
              rules={{ validate: (value) => !!value || "Upload Ownership Document is required." }}
              render={(props) => (
                <FileUploadField
                  error={getFieldError("documents.ownershipDocumentFile")}
                  helperText="Max size 5 MB. Allowed types: PDF, PNG, JPG, JPEG."
                  id="ownership-document-file"
                  isUploading={!!uploadingFields["documents.ownershipDocumentFile"]}
                  label="Upload Ownership Document"
                  onDelete={() => clearUploadedFile("documents.ownershipDocumentFile", props.onChange)}
                  onUpload={(event) => uploadFile(event, "documents.ownershipDocumentFile", props.onChange)}
                  required
                  value={props.value}
                />
              )}
            />

            <Controller
              control={control}
              name="documents.otherDocumentFile"
              render={(props) => (
                <FileUploadField
                  error={getFieldError("documents.otherDocumentFile")}
                  helperText="Optional. Max size 5 MB. Allowed types: PDF, PNG, JPG, JPEG."
                  id="other-document-file"
                  isUploading={!!uploadingFields["documents.otherDocumentFile"]}
                  label="Other Document"
                  onDelete={() => clearUploadedFile("documents.otherDocumentFile", props.onChange)}
                  onUpload={(event) => uploadFile(event, "documents.otherDocumentFile", props.onChange)}
                  value={props.value}
                />
              )}
            />
          </SectionCard>

          <SectionCard
            description="Final undertaking details before preview and submit."
            isOpen={collapsedSections.declaration}
            onToggle={toggleSection}
            sectionKey="declaration"
            title="Declaration / Undertaking"
          >
            <FieldBlock error={getFieldError("declaration.submittedBy")} label="Submitted By" required>
              <Controller
                control={control}
                name="declaration.submittedBy"
                rules={{ required: "Submitted By is required." }}
                render={(props) => <Dropdown option={SUBMITTED_BY_OPTIONS} optionKey="name" selected={props.value} select={props.onChange} t={t} />}
              />
            </FieldBlock>

            <Controller
              control={control}
              name="declaration.signatureFile"
              rules={{ validate: (value) => !!value || "Upload Signature is required." }}
              render={(props) => (
                <FileUploadField
                  error={getFieldError("declaration.signatureFile")}
                  helperText="Max size 5 MB. Allowed types: PDF, PNG, JPG, JPEG."
                  id="signature-file"
                  isUploading={!!uploadingFields["declaration.signatureFile"]}
                  label="Upload Signature"
                  onDelete={() => clearUploadedFile("declaration.signatureFile", props.onChange)}
                  onUpload={(event) => uploadFile(event, "declaration.signatureFile", props.onChange)}
                  required
                  value={props.value}
                />
              )}
            />

            <FieldBlock isFullWidth label="Captcha" required>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={captchaBoxStyle}>{generatedCaptcha}</div>
                <button type="button" onClick={refreshCaptcha} style={linkButtonStyle}>
                  Refresh Captcha
                </button>
              </div>
            </FieldBlock>

            <FieldBlock error={getFieldError("declaration.captcha")} label="Enter Captcha" required>
              <TextInput
                errorStyle={!!getFieldError("declaration.captcha")}
                inputRef={register({
                  required: "Captcha is required.",
                })}
                name="declaration.captcha"
              />
            </FieldBlock>

            <FieldBlock error={getFieldError("declaration.agree")} isFullWidth label="Declaration" required>
              <Controller
                control={control}
                name="declaration.agree"
                rules={{ validate: (value) => value || "Please accept the declaration to continue." }}
                render={(props) => <CheckBox checked={!!props.value} label="I Agree" onChange={(event) => props.onChange(event.target.checked)} />}
              />
            </FieldBlock>
          </SectionCard>
        </React.Fragment>
      </div>

      {previewMode && (
        <React.Fragment>
          <SectionCard
            description="Selected request and connection type."
            isOpen={collapsedSections.application}
            onToggle={toggleSection}
            sectionKey="application"
            title="Application Selection"
          >
            <PreviewItem label="Type of Request" value={formValues?.typeOfRequest} />
            <PreviewItem label="Connection Type" value={formValues?.connectionType} />
          </SectionCard>

          <SectionCard
            description="Applicant identity and organization information."
            isOpen={collapsedSections.applicant}
            onToggle={toggleSection}
            sectionKey="applicant"
            title="Details of Applicant"
          >
            <PreviewItem label="First Name" value={formValues?.applicant?.firstName} />
            <PreviewItem label="Middle Name" value={formValues?.applicant?.middleName} />
            <PreviewItem label="Last Name" value={formValues?.applicant?.lastName} />
            <PreviewItem label="Father / Husband Name" value={formValues?.applicant?.fatherOrHusbandName} />
            <PreviewItem label="Government Organization" value={formValues?.applicant?.isGovernmentOrganization} />
            {formValues?.applicant?.isGovernmentOrganization ? (
              <PreviewItem isFullWidth label="Name of Government Organization" value={formValues?.applicant?.governmentOrganizationName} />
            ) : null}
            <PreviewItem isFullWidth label="Uploaded ID Proof" value={formValues?.applicant?.applicantIdProofFile} />
          </SectionCard>

          <SectionCard
            description="Communication details captured in the application."
            isOpen={collapsedSections.contact}
            onToggle={toggleSection}
            sectionKey="contact"
            title="Contact Details"
          >
            <PreviewItem label="Email ID" value={formValues?.contact?.emailId} />
            <PreviewItem label="Mobile Number" value={formValues?.contact?.mobileNumber} />
            <PreviewItem label="Office No." value={formValues?.contact?.officeNumber} />
          </SectionCard>

          <SectionCard
            description="DJB employee-specific information."
            isOpen={collapsedSections.employee}
            onToggle={toggleSection}
            sectionKey="employee"
            title="For DJB Employee"
          >
            <PreviewItem label="DJB Employee" value={formValues?.djbEmployee?.isDjbEmployee} />
            {formValues?.djbEmployee?.isDjbEmployee ? (
              <React.Fragment>
                <PreviewItem label="Employee ID" value={formValues?.djbEmployee?.employeeId} />
                <PreviewItem label="Date of Retirement" value={formValues?.djbEmployee?.retirementDate} />
                <PreviewItem isFullWidth label="Office Name & Address" value={formValues?.djbEmployee?.officeNameAndAddress} />
              </React.Fragment>
            ) : null}
          </SectionCard>

          <SectionCard
            description="Property address and administrative boundary values."
            isOpen={collapsedSections.address}
            onToggle={toggleSection}
            sectionKey="address"
            title="Property Address"
          >
            <PreviewItem isFullWidth label="Address" value={formValues?.propertyAddress?.address} />
            <PreviewItem label="Landmark" value={formValues?.propertyAddress?.landmark} />
            <PreviewItem label="Pin Code" value={formValues?.propertyAddress?.pinCode} />
            <PreviewItem label="Locality" value={formValues?.propertyAddress?.locality} />
            <PreviewItem label="Sub Locality" value={formValues?.propertyAddress?.subLocality} />
            <PreviewItem label="Assembly" value={formValues?.propertyAddress?.assembly} />
            <PreviewItem label="Ward" value={formValues?.propertyAddress?.ward} />
          </SectionCard>

          <SectionCard
            description="Property and connection usage values."
            isOpen={collapsedSections.usage}
            onToggle={toggleSection}
            sectionKey="usage"
            title="Property and Water Connection Use Details"
          >
            <PreviewItem label="Property Type" value={formValues?.useDetails?.propertyType} />
            <PreviewItem label="No. of Floors" value={formValues?.useDetails?.noOfFloors} />
            {formValues?.useDetails?.propertyType?.code === "HOSPITAL_NURSING_HOME" ? (
              <PreviewItem label="No. of Beds for Hospitals & Nursing Home" value={formValues?.useDetails?.hospitalBeds} />
            ) : null}
            <PreviewItem label="Plot Area in Sqm" value={formValues?.useDetails?.plotArea} />
            <PreviewItem label="Built Up Area" value={formValues?.useDetails?.builtUpArea} />
            <PreviewItem label="Water Connection Category" value={formValues?.useDetails?.waterConnectionCategory} />
            <PreviewItem label="Water Connection Used By" value={formValues?.useDetails?.waterConnectionUsedBy} />
          </SectionCard>

          <SectionCard
            description="Banking information as entered in the form."
            isOpen={collapsedSections.bank}
            onToggle={toggleSection}
            sectionKey="bank"
            title="Bank Details"
          >
            <PreviewItem label="Name of the Bank" value={formValues?.bankDetails?.bankName} />
            <PreviewItem label="Name of the Branch" value={formValues?.bankDetails?.branchName} />
            <PreviewItem label="IFSC Code" value={formValues?.bankDetails?.ifscCode} />
            <PreviewItem label="Bank Account No." value={formValues?.bankDetails?.bankAccountNumber} />
          </SectionCard>

          <SectionCard
            description="Rain water harvesting request status."
            isOpen={collapsedSections.rainWaterHarvesting}
            onToggle={toggleSection}
            sectionKey="rainWaterHarvesting"
            title="Rain Water Harvesting"
          >
            <PreviewItem
              isFullWidth
              label="Apply for RWH Adequacy Certificate"
              value={formValues?.rainWaterHarvesting?.applyForAdequacyCertificate}
            />
          </SectionCard>

          <SectionCard
            description="Uploaded supporting documents."
            isOpen={collapsedSections.documents}
            onToggle={toggleSection}
            sectionKey="documents"
            title="Documents to be Attached"
          >
            <PreviewItem label="Proof of Identity" value={formValues?.documents?.proofOfIdentity} />
            <PreviewItem label="Upload Identity Proof" value={formValues?.documents?.identityProofFile} />
            <PreviewItem label="Ownership Status" value={formValues?.documents?.ownershipStatus} />
            <PreviewItem label="Upload Ownership Document" value={formValues?.documents?.ownershipDocumentFile} />
            <PreviewItem label="Other Document" value={formValues?.documents?.otherDocumentFile} />
          </SectionCard>

          <SectionCard
            description="Declaration and undertaking details."
            isOpen={collapsedSections.declaration}
            onToggle={toggleSection}
            sectionKey="declaration"
            title="Declaration / Undertaking"
          >
            <PreviewItem label="Submitted By" value={formValues?.declaration?.submittedBy} />
            <PreviewItem label="Upload Signature" value={formValues?.declaration?.signatureFile} />
            <PreviewItem label="Entered Captcha" value={formValues?.declaration?.captcha} />
            <PreviewItem label="I Agree" value={formValues?.declaration?.agree} />
          </SectionCard>
        </React.Fragment>
      )}

      <ActionBar style={actionBarStyle}>
        {!previewMode ? (
          <React.Fragment>
            <SubmitBar label="Reset" onSubmit={onReset} style={secondaryButtonStyle} />
            <SubmitBar disabled={hasPendingUpload} label={hasPendingUpload ? "Uploading..." : "Preview"} onSubmit={handleSubmit(onPreview)} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <SubmitBar label="Edit Details" onSubmit={onEdit} style={secondaryButtonStyle} />
            <SubmitBar disabled={hasPendingUpload} label={hasPendingUpload ? "Uploading..." : "Submit"} onSubmit={handleSubmit(onSubmit)} />
          </React.Fragment>
        )}
      </ActionBar>

      {showToast ? <Toast error={showToast?.key === "error"} label={showToast?.message} onClose={closeToast} warning={showToast?.warning} /> : null}
    </div>
  );
};

export default NewApplication;