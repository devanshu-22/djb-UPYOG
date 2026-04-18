import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  ActionBar,
  CardLabel,
  CardLabelError,
  CardSectionSubText,
  CardText,
  CheckBox,
  CollapsibleCardPage,
  DatePicker,
  Dropdown,
  RadioButtons,
  SubmitBar,
  TextArea,
  TextInput,
  Toast,
  UploadFile,
  Loader,
  LabelFieldPair,
  VerticalTimeline,
} from "@djb25/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { createPayloadOfWS, updatePayloadOfWS } from "../../../utils";
import dropdownData from "../../../config/dropdown_data.json";

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

const SUB_LOCALITY_OPTIONS = {};

const WATER_CONNECTION_USED_BY_OPTIONS = [
  createOption("5 Star Hotel", "5 Star Hotel"),
  createOption("4/5 Star Hotel", "4/5 Star Hotel"),
  createOption("Ex-Army Service", "Ex-Army Service"),
  createOption("General", "General"),
  createOption("Bank", "Bank"),
  createOption("Airport", "Airport"),
  createOption("Govt. College", "Govt. College"),
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
    ParentorSpouse: "",
    isGovernmentOrganization: false,
    applicantIdProofFile: null,
    governmentOrganizationName: "",
  },
  contact: {
    emailId: "",
    mobileNumber: "",
    whatsAppNumber: "",
  },
  applicationSelection: {
    serviceType: null,
    applicantType: null,
    connectionType: null,
    categoryType: null,
    subCategory: null,
    commercialType: null,
    govtOrganization: {
      organizationName: "",
      natureOfWork: "",
      organizationDocument: null,
    },
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
    state: "",
    district: "",
    city: "",
    street: "",
    houseNo: "",
    block: "",
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
    gender: null,
    NumberofDwellingUnits: "",
    SelectYearofConstruction: null,
    WaterConnectionUsageType: null,
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

const ProfileImagePreview = ({ fileStoreId }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (fileStoreId) {
        try {
          const tenantId = Digit.ULBService.getStateId();
          const response = await Digit.UploadServices.Filefetch([fileStoreId], tenantId);
          const url = response?.data?.fileStoreIds?.[0]?.url;
          if (url) {
            let differentFormats = url?.split(",") || [];
            let fileURL = "";
            differentFormats.map((link) => {
              if (!link.includes("large") && !link.includes("medium") && !link.includes("small")) {
                fileURL = link;
              }
            });
            setImageUrl(fileURL || differentFormats[0]);
          }
        } catch (err) {
          console.error("Error fetching image URL:", err);
          setImageUrl(null);
        }
      }
    };
    fetchImageUrl();
  }, [fileStoreId]);

  if (!imageUrl) return null;
  return <img src={imageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
};

const ProfileImageUpload = ({ value, onUpload, isUploading, error, t, label, required }) => {
  const fileInputRef = React.useRef(null);
  const fileStoreId = value?.fileStoreId;
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (fileStoreId) {
        try {
          const tenantId = Digit.ULBService.getStateId();
          const response = await Digit.UploadServices.Filefetch([fileStoreId], tenantId);
          const url = response?.data?.fileStoreIds?.[0]?.url;
          if (url) {
            let differentFormats = url?.split(",") || [];
            let fileURL = "";
            differentFormats.map((link) => {
              if (!link.includes("large") && !link.includes("medium") && !link.includes("small")) {
                fileURL = link;
              }
            });
            setImageUrl(fileURL || differentFormats[0]);
          }
        } catch (err) {
          console.error("Error fetching image URL:", err);
          setImageUrl(null);
        }
      } else {
        setImageUrl(null);
      }
    };
    fetchImageUrl();
  }, [fileStoreId]);

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="avatar-upload-container">
      {label && <CardLabel style={{ textAlign: "center", marginBottom: "16px", fontWeight: "700" }}>{`${t(label)}${required ? "*" : ""}`}</CardLabel>}
      <div className="avatar-wrapper">
        <div className="avatar-circle" onClick={handleEditClick}>
          {imageUrl ? (
            <img src={imageUrl} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>
        <div className="avatar-edit-icon" onClick={handleEditClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B4B66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </div>
      </div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={onUpload} />
      {isUploading && <div style={{ fontSize: "14px", marginTop: "8px", color: "#505A5F" }}>Uploading...</div>}
      {error && <CardLabelError style={{ textAlign: "center", marginTop: "8px" }}>{error}</CardLabelError>}
    </div>
  );
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

const buildDefaultValues = () => ({
  zro: { value: "", error: "" },
  typeOfRequest: DEFAULT_FORM_VALUES.typeOfRequest,
  connectionType: DEFAULT_FORM_VALUES.connectionType,
  applicant: { ...DEFAULT_FORM_VALUES.applicant },
  contact: { ...DEFAULT_FORM_VALUES.contact },
  djbEmployee: { ...DEFAULT_FORM_VALUES.djbEmployee },
  propertyAddress: { ...DEFAULT_FORM_VALUES.propertyAddress },
  useDetails: { ...DEFAULT_FORM_VALUES.useDetails },
  bankDetails: { ...DEFAULT_FORM_VALUES.bankDetails },
  rainWaterHarvesting: { ...DEFAULT_FORM_VALUES.rainWaterHarvesting },
  applicationSelection: { ...DEFAULT_FORM_VALUES.applicationSelection },
  documents: { ...DEFAULT_FORM_VALUES.documents },
  declaration: { ...DEFAULT_FORM_VALUES.declaration },
  cpt: { id: "", details: null },
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

const SectionCard = ({ title, description, isOpen = true, children, sectionRef, sectionKey, onEditClick }) => {
  return (
    <div className="ws-new-application-collapsible" style={{ marginBottom: "16px", position: "relative" }} ref={sectionRef} data-section={sectionKey}>
      {onEditClick && (
        <div
          onClick={onEditClick}
          style={{
            position: "absolute",
            top: "20px",
            right: "50px",
            zIndex: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "#0B4B66",
            fontSize: "14px",
            fontWeight: "600",
          }}
          title="Edit Section"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          Edit
        </div>
      )}
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

const handleView = async (fileStoreId, tenantId) => {
  try {
    const response = await Digit.UploadServices.Filefetch([fileStoreId], tenantId);
    const url = response?.data?.fileStoreIds?.[0]?.url;
    if (url) {
      const differentFormats = url?.split(",") || [];
      let fileURL = "";
      differentFormats.map((link) => {
        if (!link.includes("large") && !link.includes("medium") && !link.includes("small")) {
          fileURL = link;
        }
      });
      window.open(fileURL || differentFormats[0], "_blank");
    }
  } catch (error) {
    console.error("Error fetching file URL:", error);
  }
};

const PreviewItem = ({ label, value, isFullWidth }) => {
  const stateId = Digit.ULBService.getStateId();
  const isFile = value && typeof value === "object" && value?.fileStoreId;

  return (
    <div style={{ ...fieldWrapperStyle, ...(isFullWidth ? { gridColumn: "1 / -1" } : {}) }}>
      <CardLabel style={{ fontWeight: "600", marginBottom: "0px" }}>{label}</CardLabel>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CardText style={{ marginBottom: "0px", marginTop: "0px" }}>{getDisplayValue(value)}</CardText>
        {isFile && (
          <div
            onClick={() => handleView(value.fileStoreId, stateId)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", color: "#0B4B66" }}
            title="View Document"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}
      </div>
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
  const { data: allCities, isLoading } = Digit.Hooks.useTenants();

  const stateId = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId() || Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code;

  const [previewMode, setPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [collapsedSections, setCollapsedSections] = useState(DEFAULT_SECTION_STATE);
  const [showToast, setShowToast] = useState(null);
  const [uploadingFields, setUploadingFields] = useState({});

  // API Integration States
  const [isEnableLoader, setIsEnableLoader] = useState(false);
  const [appDetails, setAppDetails] = useState({});
  const [waterAndSewerageBoth, setWaterAndSewerageBoth] = useState(null);
  const [propertyId, setPropertyId] = useState(new URLSearchParams(location.search).get("propertyId"));
  const initialFormValues = buildDefaultValues();
  const [zro, setZro] = useState(initialFormValues.zro);
  const [localFormState, setLocalFormState] = useState(false);
  const [city, setCity] = useState("");

  useEffect(() => {
    if (allCities && tenantId && !city) {
      const currentCity = allCities?.find((c) => c.code === tenantId);
      if (currentCity) {
        setCity(currentCity);
        setValue("propertyAddress.city", currentCity);
      }
    }
  }, [allCities, tenantId]);

  const { data: egovLocationData } = Digit.Hooks.useCommonMDMS(tenantId, "egov-location", ["TenantBoundary"]);

  const boundaryData = useMemo(() => {
    const tenantBoundary = egovLocationData?.["egov-location"]?.TenantBoundary || [];
    const revenueData = tenantBoundary.find((item) => item?.hierarchyType?.code === "REVENUE");
    const boundary = revenueData?.boundary || [];
    return Array.isArray(boundary) ? boundary : [boundary];
  }, [egovLocationData]);

  const structuredLocalityData = useMemo(() => {
    let localities = [];
    const boundaries = Array.isArray(boundaryData) ? boundaryData : boundaryData ? [boundaryData] : [];

    const extractLocalities = (node, zone = null, ward = null) => {
      if (!node) return;

      let currentZone = zone;
      let currentWard = ward;

      if (node.label === "Zone" || node.label === "ZONE") {
        currentZone = node.localname || node.code || node.name;
      }
      if (node.label === "Ward" || node.label === "WARD" || node.label === "Block" || node.label === "BLOCK") {
        currentWard = node.code || node.localname || node.name;
      }

      if (node.label === "Locality" || node.label === "LOCALITY") {
        localities.push({
          ...node,
          name: node.localname || node.name || node.code,
          i18nKey: node.i18nKey || `${tenantId.replace(".", "_")}_REVENUE_${node.code}`.toUpperCase(),
          zone: currentZone,
          ward: currentWard,
        });
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => extractLocalities(child, currentZone, currentWard));
      }
    };

    boundaries.forEach((rootNode) => extractLocalities(rootNode));

    return localities;
  }, [boundaryData, tenantId]);

  const fetchedPincodes = useMemo(() => {
    const pinSet = new Set();
    structuredLocalityData.forEach((loc) => {
      if (loc.pincode) {
        const pins = Array.isArray(loc.pincode) ? loc.pincode : [loc.pincode];
        pins.forEach((p) => {
          if (p) {
            const sanitizedPin = p.toString().split(".")[0];
            pinSet.add(sanitizedPin);
          }
        });
      }
    });

    return Array.from(pinSet)
      .sort()
      .map((pin) => ({
        code: pin,
        name: pin,
        i18nKey: pin,
      }));
  }, [structuredLocalityData]);

  // Refs for auto-stepper
  const sectionRefs = {
    application: React.useRef(null),
    applicant: React.useRef(null),
    contact: React.useRef(null),
    djbEmployee: React.useRef(null),
    propertyAddress: React.useRef(null),
    useDetails: React.useRef(null),
    bankDetails: React.useRef(null),
    documents: React.useRef(null),
    declaration: React.useRef(null),
  };

  // Current Year
  const currentYear = new Date().getFullYear();

  // Generate 1970 to Current Year
  const yearOptions = [];
  for (let year = 1970; year <= currentYear; year++) {
    yearOptions.push({
      i18nKey: `${year}`,
      code: `${year}`,
      value: `${year}`,
    });
  }

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    getValues,
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
  const pCode = watch("propertyAddress.pinCode");

  const filteredLocalities = useMemo(() => {
    if (!pCode) return structuredLocalityData;
    return structuredLocalityData.filter((loc) => {
      if (!loc.pincode) return false;
      const pins = Array.isArray(loc.pincode) ? loc.pincode : [loc.pincode];
      return pins.some((p) => p.toString() === pCode);
    });
  }, [structuredLocalityData, pCode]);

  const selectedSubCategory = watch("applicationSelection.subCategory");
  const selectedCommercialType = watch("applicationSelection.commercialType");
  const subCategoryIsCommercial = selectedSubCategory?.code === "COMMERCIAL";
  const commercialTypeIsGov = selectedCommercialType?.code === "GOV";
  const hasPendingUpload = Object.values(uploadingFields).some(Boolean);
  const isHospitalProperty = selectedPropertyType?.code === "HOSPITAL" || selectedPropertyType?.code === "HOSPITAL_NURSING_HOME";

  const timelineConfig = [
    { sectionId: "application", route: "application-selection", actions: "Application Selection" },
    { sectionId: "applicant", route: "applicant-details", actions: "Details of Applicant" },
    ...(isDjbEmployee ? [{ sectionId: "djbEmployee", route: "djb-employee", actions: "For DJB Employee" }] : []),
    { sectionId: "propertyAddress", route: "property-address", actions: "Property Address" },
    { sectionId: "useDetails", route: "use-details", actions: "Property & Connection Use Details" },
    { sectionId: "bankDetails", route: "bank-details", actions: "Bank Details" },
    { sectionId: "documents", route: "documents", actions: "Documents to be Attached" },
    { sectionId: "Review", route: "review", actions: "Review Application" },
  ].map((step, index) => ({
    ...step,
    timeLine: [{ actions: step.actions, currentStep: index + 1 }],
  }));

  // Auto-stepper intersection observer
  useEffect(() => {
    if (previewMode) return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -50% 0px", // Focus on the upper half of the screen
      threshold: [0, 0.1, 0.5, 1.0],
    };

    const handleIntersection = (entries) => {
      // Find the entry that has the largest intersection ratio
      const mostVisible = entries.reduce((prev, current) => {
        return current.intersectionRatio > (prev ? prev.intersectionRatio : 0) ? current : prev;
      }, null);

      if (mostVisible && mostVisible.isIntersecting) {
        const sectionKey = mostVisible.target.getAttribute("data-section");
        const stepIndex = timelineConfig.findIndex((c) => c.sectionId === sectionKey);
        if (stepIndex !== -1) {
          setCurrentStep(stepIndex + 1);
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [previewMode, sectionRefs, timelineConfig]);

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
    // Logic for subLocality was removed as it is replaced by MDMS locality logic
  }, [selectedLocality?.code, setValue]);

  const closeToast = () => setShowToast(null);
  const closeToastOfError = () => setShowToast(null);

  const toggleSection = (sectionKey) => {
    setCollapsedSections((previousState) => ({
      ...previousState,
      [sectionKey]: !previousState[sectionKey],
    }));
  };

  const getFieldError = (fieldName) => resolveNestedValue(errors, fieldName);

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

  const onPreview = (data) => {
    if (hasPendingUpload) {
      setShowToast({ warning: true, message: "Please wait for all file uploads to complete." });
      return;
    }
    setPreviewMode(true);
    scrollToTop();
  };

  const onSubmit = async (data) => {
    if (hasPendingUpload) {
      setShowToast({ warning: true, message: "Please wait for all file uploads to complete." });
      return;
    }

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

  const handleSectionEdit = (sectionKey) => {
    setPreviewMode(false);
    setTimeout(() => {
      const element = sectionRefs[sectionKey]?.current;
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const onReset = () => {
    reset(DEFAULT_FORM_VALUES);
    setPreviewMode(false);
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

  const menu = [
    {
      i18nKey: "ASHOK VIHAR",
      code: "ASHOK VIHAR",
      value: "ASHOK VIHAR",
    },
    {
      i18nKey: "BURARI",
      code: "BURARI",
      value: "BURARI",
    },
    {
      i18nKey: "DWARKA",
      code: "DWARKA",
      value: "DWARKA",
    },
    {
      i18nKey: "OKHLA",
      code: "OKHLA",
      value: "OKHLA",
    },
  ];

  return (
    <div>
      <style>
        {`
          .ws-new-application-collapsible .collapsible-card-tabs {
            display: none;
          }

          .ws-new-application-collapsible .collapsible-card-tab-content {
            padding: 0;
          }

          .avatar-upload-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            grid-column: 1 / -1;
          }

          .avatar-wrapper {
            position: relative;
            width: 120px;
            height: 120px;
          }

          .avatar-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid #E5E7EB;
            overflow: hidden;
            background-color: #F3F4F6;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .avatar-circle:hover {
            border-color: #0B4B66;
            opacity: 0.9;
          }

          .avatar-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .avatar-placeholder {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .avatar-edit-icon {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #E5E7EB;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .avatar-edit-icon:hover {
            transform: scale(1.1);
            background-color: #F9FAFB;
          }
        `}
      </style>
      {/* <Header>{t("New Water / Sewerage Application")}</Header> */}

      <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "80px" }}>
        {!previewMode && <VerticalTimeline config={timelineConfig} currentActiveIndex={currentStep - 1} showFinalStep={false} />}

        <div style={{ flex: "1", overflowY: "auto", minWidth: 0 }}>
          {/* <Card style={{ marginBottom: "16px" }}>
          <CardSubHeader>{previewMode ? t("Preview Application") : t("Application Form")}</CardSubHeader>
        </Card> */}
          <div style={{ display: previewMode ? "none" : "block" }}>
            <SectionCard
              isOpen={collapsedSections.application}
              onToggle={toggleSection}
              sectionKey="application"
              title="Application Selection"
              sectionRef={sectionRefs.application}
            >
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">ZRO Location</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"zro"}
                    defaultValue={zro}
                    rules={{ required: t("REQUIRED_FIELD") }}
                    isMandatory={true}
                    render={(props) => (
                      <div>
                        <Dropdown
                          className="form-field"
                          selected={props.value}
                          disable={false}
                          option={menu}
                          errorStyle={!!getFieldError("zro")}
                          select={(e) => {
                            props.onChange(e);
                            setZro((prev) => ({
                              ...prev,
                              value: e,
                            }));
                          }}
                          optionKey="i18nKey"
                          onBlur={props.onBlur}
                          t={t}
                        />
                      </div>
                    )}
                  />
                </div>
              </LabelFieldPair>
              {localFormState && zro.error && <CardLabelError>{zro.error}</CardLabelError>}

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">Service Type</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"applicationSelection.serviceType"}
                    rules={{ required: t("REQUIRED_FIELD") }}
                    isMandatory={true}
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        selected={props.value}
                        disable={false}
                        option={dropdownData.serviceTypes}
                        errorStyle={!!getFieldError("applicationSelection.serviceType")}
                        select={props.onChange}
                        optionKey="name"
                        onBlur={props.onBlur}
                        t={t}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {getFieldError("applicationSelection.serviceType") && (
                <CardLabelError>{getFieldError("applicationSelection.serviceType")?.message}</CardLabelError>
              )}

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">Applicant Type</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"applicationSelection.applicantType"}
                    rules={{ required: t("REQUIRED_FIELD") }}
                    isMandatory={true}
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        selected={props.value}
                        disable={false}
                        option={dropdownData.applicantTypes}
                        errorStyle={!!getFieldError("applicationSelection.applicantType")}
                        select={props.onChange}
                        optionKey="name"
                        onBlur={props.onBlur}
                        t={t}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {getFieldError("applicationSelection.applicantType") && (
                <CardLabelError>{getFieldError("applicationSelection.applicantType")?.message}</CardLabelError>
              )}

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">Connection Type</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"applicationSelection.connectionType"}
                    rules={{ required: t("REQUIRED_FIELD") }}
                    isMandatory={true}
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        selected={props.value}
                        disable={false}
                        option={dropdownData.connectionTypes}
                        errorStyle={!!getFieldError("applicationSelection.connectionType")}
                        select={props.onChange}
                        optionKey="name"
                        onBlur={props.onBlur}
                        t={t}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {getFieldError("applicationSelection.connectionType") && (
                <CardLabelError>{getFieldError("applicationSelection.connectionType")?.message}</CardLabelError>
              )}

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">Category Type</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"applicationSelection.categoryType"}
                    rules={{ required: t("REQUIRED_FIELD") }}
                    isMandatory={true}
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        selected={props.value}
                        disable={false}
                        option={dropdownData.categoryTypes}
                        errorStyle={!!getFieldError("applicationSelection.categoryType")}
                        select={props.onChange}
                        optionKey="name"
                        onBlur={props.onBlur}
                        t={t}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {getFieldError("applicationSelection.categoryType") && (
                <CardLabelError>{getFieldError("applicationSelection.categoryType")?.message}</CardLabelError>
              )}

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">Sub Category</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name={"applicationSelection.subCategory"}
                    rules={{ required: t("REQUIRED_FIELD") }}
                    isMandatory={true}
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        selected={props.value}
                        disable={false}
                        option={dropdownData.subCategories}
                        errorStyle={!!getFieldError("applicationSelection.subCategory")}
                        select={props.onChange}
                        optionKey="name"
                        onBlur={props.onBlur}
                        t={t}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
              {getFieldError("applicationSelection.subCategory") && (
                <CardLabelError>{getFieldError("applicationSelection.subCategory")?.message}</CardLabelError>
              )}

              {subCategoryIsCommercial && (
                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">Commercial Type</CardLabel>
                  <div className="field">
                    <Controller
                      control={control}
                      name={"applicationSelection.commercialType"}
                      rules={{ required: t("REQUIRED_FIELD") }}
                      isMandatory={true}
                      render={(props) => (
                        <RadioButtons
                          onSelect={props.onChange}
                          selectedOption={props.value}
                          options={[
                            { code: "GOV", name: "Gov" },
                            { code: "NON_GOV", name: "Non-Gov" },
                          ]}
                          optionsKey="name"
                          t={t}
                        />
                      )}
                    />
                  </div>
                </LabelFieldPair>
              )}

              {subCategoryIsCommercial && !!selectedCommercialType && (
                <React.Fragment>
                  <div style={{ gridColumn: "span 2", marginTop: "24px", marginBottom: "16px" }}>
                    <CardLabel style={{ color: "#3B82F6", fontWeight: "700", fontSize: "18px", marginBottom: "0" }}>Organization Details</CardLabel>
                  </div>

                  <LabelFieldPair>
                    <CardLabel className="card-label-smaller">Organization Name</CardLabel>
                    <div className="field">
                      <TextInput
                        name="applicationSelection.govtOrganization.organizationName"
                        inputRef={register({ required: !!selectedCommercialType ? "Organization Name is required" : false })}
                        errorStyle={!!getFieldError("applicationSelection.govtOrganization.organizationName")}
                      />
                    </div>
                  </LabelFieldPair>
                  {getFieldError("applicationSelection.govtOrganization.organizationName") && (
                    <CardLabelError>{getFieldError("applicationSelection.govtOrganization.organizationName")?.message}</CardLabelError>
                  )}

                  <LabelFieldPair>
                    <CardLabel className="card-label-smaller">Nature of Work</CardLabel>
                    <div className="field">
                      <TextInput
                        name="applicationSelection.govtOrganization.natureOfWork"
                        inputRef={register({ required: !!selectedCommercialType ? "Nature of Work is required" : false })}
                        errorStyle={!!getFieldError("applicationSelection.govtOrganization.natureOfWork")}
                      />
                    </div>
                  </LabelFieldPair>
                  {getFieldError("applicationSelection.govtOrganization.natureOfWork") && (
                    <CardLabelError>{getFieldError("applicationSelection.govtOrganization.natureOfWork")?.message}</CardLabelError>
                  )}

                  <LabelFieldPair>
                    <CardLabel className="card-label-smaller">Upload Document</CardLabel>
                    <div className="field">
                      <Controller
                        control={control}
                        name="applicationSelection.govtOrganization.organizationDocument"
                        rules={{ required: !!selectedCommercialType ? "Document is required" : false }}
                        render={(props) => (
                          <FileUploadField
                            error={getFieldError("applicationSelection.govtOrganization.organizationDocument")}
                            id="govt-org-doc"
                            isUploading={!!uploadingFields["applicationSelection.govtOrganization.organizationDocument"]}
                            onDelete={() => clearUploadedFile("applicationSelection.govtOrganization.organizationDocument", props.onChange)}
                            onUpload={(event) => uploadFile(event, "applicationSelection.govtOrganization.organizationDocument", props.onChange)}
                            value={props.value}
                          />
                        )}
                      />
                    </div>
                  </LabelFieldPair>
                </React.Fragment>
              )}
              {subCategoryIsCommercial && getFieldError("applicationSelection.commercialType") && (
                <CardLabelError>{getFieldError("applicationSelection.commercialType")?.message}</CardLabelError>
              )}
            </SectionCard>
          </div>

          <div style={{ display: previewMode ? "none" : "block" }}>
            <React.Fragment>
              <SectionCard
                description="Applicant name, organization details, and supporting ID proof."
                isOpen={collapsedSections.applicant}
                onToggle={toggleSection}
                sectionKey="applicant"
                title="Details of Applicant"
                sectionRef={sectionRefs.applicant}
              >
                <Controller
                  control={control}
                  name="applicant.UploadPicture"
                  rules={{ validate: (value) => !!value || "Applicant Picture is required." }}
                  render={(props) => (
                    <ProfileImageUpload
                      error={getFieldError("applicant.UploadPicture")?.message}
                      isUploading={!!uploadingFields["applicant.UploadPicture"]}
                      label="Upload Picture"
                      onUpload={(event) => uploadFile(event, "applicant.UploadPicture", props.onChange)}
                      required
                      t={t}
                      value={props.value}
                    />
                  )}
                />

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

                <FieldBlock error={getFieldError("useDetails.gender")} label="Gender" required>
                  <Controller
                    control={control}
                    name="useDetails.gender"
                    rules={{ required: "Gender is required." }}
                    render={(props) => (
                      <Dropdown
                        option={[
                          { name: "Male", code: "MALE" },
                          { name: "Female", code: "FEMALE" },
                        ]}
                        optionKey="name"
                        selected={props.value}
                        select={props.onChange}
                        t={t}
                      />
                    )}
                  />
                </FieldBlock>

                <FieldBlock error={getFieldError("applicant.ParentorSpouse")} label="Parent/ spouse" required>
                  <TextInput
                    errorStyle={!!getFieldError("applicant.ParentorSpouse")}
                    inputRef={register({
                      pattern: { value: NAME_PATTERN, message: "Use letters only." },
                      required: "Parent/ spouse Name is required.",
                    })}
                    name="applicant.ParentorSpouse"
                  />
                </FieldBlock>

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

                <FieldBlock error={getFieldError("contact.whatsAppNumber")} label="WhatsApp Number">
                  <TextInput
                    errorStyle={!!getFieldError("contact.whatsAppNumber")}
                    inputRef={register({
                      pattern: { value: MOBILE_PATTERN, message: "Enter a valid 10-digit WhatsApp number." },
                    })}
                    maxlength={10}
                    name="contact.whatsAppNumber"
                  />
                </FieldBlock>
              </SectionCard>

              <SectionCard
                description="Enable this section only when the applicant is a DJB employee."
                isOpen={collapsedSections.employee}
                onToggle={toggleSection}
                sectionKey="djbEmployee"
                title="For DJB Employee"
                sectionRef={sectionRefs.djbEmployee}
              >
                <FieldBlock label="DJB Employee">
                  <Controller
                    control={control}
                    name="djbEmployee.isDjbEmployee"
                    render={(props) => (
                      <CheckBox
                        checked={!!props.value}
                        label="Applicant is a DJB Employee"
                        onChange={(event) => props.onChange(event.target.checked)}
                      />
                    )}
                  />
                </FieldBlock>

                {isDjbEmployee && (
                  <React.Fragment>
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

                    <FieldBlock
                      error={getFieldError("djbEmployee.officeNameAndAddress")}
                      isFullWidth
                      label="Office Name & Address"
                      required={isDjbEmployee}
                    >
                      <TextArea
                        className={getFieldError("djbEmployee.officeNameAndAddress") ? "employee-card-input-error" : ""}
                        inputRef={register({
                          required: isDjbEmployee ? "Office Name & Address is required." : false,
                        })}
                        name="djbEmployee.officeNameAndAddress"
                        style={{ minHeight: "96px" }}
                      />
                    </FieldBlock>
                  </React.Fragment>
                )}
              </SectionCard>

              <SectionCard
                description="Property location and administrative boundary details."
                isOpen={collapsedSections.address}
                onToggle={toggleSection}
                sectionKey="propertyAddress"
                title="Property Address"
                sectionRef={sectionRefs.propertyAddress}
              >
                <FieldBlock error={getFieldError("propertyAddress.city")} label="City" >
                  <Controller
                    control={control}
                    name="propertyAddress.city"
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        selected={props.value || city}
                        select={(val) => {
                          setCity(val);
                          props.onChange(val);
                        }}
                        option={allCities}
                        optionCardStyles={{ overflowY: "auto", maxHeight: "300px" }}
                        optionKey="i18nKey"
                        t={t}
                        style={{ width: "100%" }}
                        placeholder={"Select"}
                      />
                    )}
                  />
                </FieldBlock>
                <FieldBlock error={getFieldError("propertyAddress.pinCode")} label="Pin Code" required>
                  <Controller
                    control={control}
                    name="propertyAddress.pinCode"
                    rules={{ required: "Pin Code is required." }}
                    render={(props) => (
                      <Dropdown
                        option={fetchedPincodes}
                        optionKey="i18nKey"
                        selected={
                          fetchedPincodes?.find((p) => p.code === props.value) ||
                          (props.value ? { code: props.value, name: props.value, i18nKey: props.value } : null)
                        }
                        select={(val) => {
                          const newPin = val?.code;
                          if (newPin !== props.value) {
                            setValue("propertyAddress.locality", null);
                            setValue("propertyAddress.zone", "");
                            setValue("propertyAddress.block", "");
                            setValue("propertyAddress.address", "");
                          }
                          props.onChange(newPin);
                        }}
                        t={t}
                      />
                    )}
                  />
                </FieldBlock>

                <FieldBlock error={getFieldError("propertyAddress.locality")} label="Locality" required>
                  <Controller
                    control={control}
                    name="propertyAddress.locality"
                    rules={{ required: "Locality is required." }}
                    render={(props) => (
                      <Dropdown
                        option={filteredLocalities}
                        optionKey="i18nKey"
                        selected={props.value}
                        select={(val) => {
                          props.onChange(val);
                          if (val?.zone) setValue("propertyAddress.zone", val.zone);
                          if (val?.ward) setValue("propertyAddress.block", val.ward);
                          if (val?.localname) setValue("propertyAddress.address", val.localname);
                          if (val?.pincode) {
                            const p = Array.isArray(val.pincode) ? val.pincode[0] : val.pincode;
                            if (p) {
                              setValue("propertyAddress.pinCode", p.toString().split(".")[0]);
                            }
                          }
                        }}
                        t={t}
                      />
                    )}
                  />
                </FieldBlock>

                <FieldBlock error={getFieldError("propertyAddress.state")} label="State">
                  <TextInput errorStyle={!!getFieldError("propertyAddress.state")} inputRef={register()} name="propertyAddress.state" />
                </FieldBlock>

                <FieldBlock error={getFieldError("propertyAddress.district")} label="District">
                  <TextInput errorStyle={!!getFieldError("propertyAddress.district")} inputRef={register()} name="propertyAddress.district" />
                </FieldBlock>

                <FieldBlock error={getFieldError("propertyAddress.street")} label="Street">
                  <TextInput errorStyle={!!getFieldError("propertyAddress.street")} inputRef={register()} name="propertyAddress.street" />
                </FieldBlock>

                <FieldBlock error={getFieldError("propertyAddress.houseNo")} label="House No">
                  <TextInput errorStyle={!!getFieldError("propertyAddress.houseNo")} inputRef={register()} name="propertyAddress.houseNo" />
                </FieldBlock>

                <FieldBlock error={getFieldError("propertyAddress.block")} label="Block">
                  <TextInput errorStyle={!!getFieldError("propertyAddress.block")} inputRef={register()} name="propertyAddress.block" />
                </FieldBlock>

                <FieldBlock error={getFieldError("propertyAddress.zone")} label="Zone">
                  <TextInput errorStyle={!!getFieldError("propertyAddress.zone")} inputRef={register()} name="propertyAddress.zone" />
                </FieldBlock>
                <FieldBlock error={getFieldError("propertyAddress.landmark")} label="Landmark">
                  <TextInput errorStyle={!!getFieldError("propertyAddress.landmark")} inputRef={register()} name="propertyAddress.landmark" />
                </FieldBlock>
                <FieldBlock error={getFieldError("propertyAddress.address")} isFullWidth label="Address">
                  <TextArea
                    className={getFieldError("propertyAddress.address") ? "employee-card-input-error" : ""}
                    inputRef={register({
                      required: "Address is required.",
                    })}
                    name="propertyAddress.address"
                    style={{ minHeight: "96px" }}
                  />
                </FieldBlock>
              </SectionCard>

              <SectionCard
                description="Usage attributes for the property and the requested water connection."
                isOpen={collapsedSections.usage}
                onToggle={toggleSection}
                sectionKey="useDetails"
                title="Property and Water Connection Use Details"
                sectionRef={sectionRefs.useDetails}
              >
                <FieldBlock error={getFieldError("useDetails.propertyType")} label="Property Type" required>
                  <Controller
                    control={control}
                    name="useDetails.propertyType"
                    rules={{ required: "Property Type is required." }}
                    render={(props) => (
                      <Dropdown option={dropdownData.propertyTypes} optionKey="name" selected={props.value} select={props.onChange} t={t} />
                    )}
                  />
                </FieldBlock>

                <FieldBlock error={getFieldError("useDetails.plotArea")} label="Plot Area (Sq. m.)" required>
                  <TextInput
                    errorStyle={!!getFieldError("useDetails.plotArea")}
                    inputRef={register({
                      pattern: { value: DECIMAL_PATTERN, message: "Enter a valid numeric value." },
                      required: "Plot Area is required.",
                    })}
                    name="useDetails.plotArea"
                  />
                </FieldBlock>

                <FieldBlock error={getFieldError("useDetails.builtUpArea")} label="Built-up Area (Sq. m.)" required>
                  <TextInput
                    errorStyle={!!getFieldError("useDetails.builtUpArea")}
                    inputRef={register({
                      pattern: { value: DECIMAL_PATTERN, message: "Enter a valid numeric value." },
                      required: "Built Up Area is required.",
                    })}
                    name="useDetails.builtUpArea"
                  />
                </FieldBlock>

                <FieldBlock error={getFieldError("useDetails.noOfFloors")} label="Number of Floors" required>
                  <TextInput
                    errorStyle={!!getFieldError("useDetails.noOfFloors")}
                    inputRef={register({
                      pattern: { value: NUMBER_PATTERN, message: "Enter a valid whole number." },
                      required: "No. of Floors is required.",
                    })}
                    name="useDetails.noOfFloors"
                  />
                </FieldBlock>

                <FieldBlock error={getFieldError("useDetails.NumberofDwellingUnits")} label="Number of Dwelling Units" required>
                  <TextInput
                    errorStyle={!!getFieldError("useDetails.NumberofDwellingUnits")}
                    inputRef={register({
                      pattern: { value: DECIMAL_PATTERN, message: "Enter a valid numeric value." },
                      required: "Built Up Area is required.",
                    })}
                    name="useDetails.NumberofDwellingUnits"
                  />
                </FieldBlock>

                {isHospitalProperty ? (
                  <FieldBlock error={getFieldError("useDetails.hospitalBeds")} label="Number of Beds" required>
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

                <FieldBlock error={getFieldError("useDetails.SelectYearofConstruction")} label="Select Year of Construction" required>
                  <Controller
                    control={control}
                    name="useDetails.SelectYearofConstruction"
                    rules={{ required: "Select Year of Construction is required." }}
                    render={(props) => <Dropdown option={yearOptions} optionKey="value" selected={props.value} select={props.onChange} t={t} />}
                  />
                </FieldBlock>

                <FieldBlock error={getFieldError("useDetails.WaterConnectionUsageType")} label="Water Connection Usage Type" required>
                  <Controller
                    control={control}
                    name="useDetails.WaterConnectionUsageType"
                    rules={{ required: "Water Connection Usage Type is required." }}
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
                sectionKey="bankDetails"
                title="Bank Details"
                sectionRef={sectionRefs.bankDetails}
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
                description="Documents to be attached. Maximum allowed file size is 5 MB."
                isOpen={collapsedSections.documents}
                onToggle={toggleSection}
                sectionKey="documents"
                title="Documents to be Attached"
                sectionRef={sectionRefs.documents}
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
                onEditClick={() => handleSectionEdit("application")}
              >
                <PreviewItem label="ZRO Location" value={formValues?.zro} />
                <PreviewItem label="Service Type" value={formValues?.applicationSelection?.serviceType} />
                <PreviewItem label="Applicant Type" value={formValues?.applicationSelection?.applicantType} />
                <PreviewItem label="Connection Type" value={formValues?.applicationSelection?.connectionType} />
                <PreviewItem label="Category Type" value={formValues?.applicationSelection?.categoryType} />
                <PreviewItem label="Sub Category" value={formValues?.applicationSelection?.subCategory} />
                {formValues?.applicationSelection?.subCategory?.code === "COMMERCIAL" && (
                  <React.Fragment>
                    <PreviewItem label="Commercial Type" value={formValues?.applicationSelection?.commercialType} />
                    <PreviewItem label="Organization Name" value={formValues?.applicationSelection?.govtOrganization?.organizationName} />
                    <PreviewItem label="Nature of Work" value={formValues?.applicationSelection?.govtOrganization?.natureOfWork} />
                    <PreviewItem label="Organization Document" value={formValues?.applicationSelection?.govtOrganization?.organizationDocument} />
                  </React.Fragment>
                )}
              </SectionCard>

              <SectionCard
                description="Applicant identity and organization information."
                isOpen={collapsedSections.applicant}
                onToggle={toggleSection}
                sectionKey="applicant"
                title="Details of Applicant"
                onEditClick={() => handleSectionEdit("applicant")}
              >
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <div className="avatar-wrapper" style={{ cursor: "default" }}>
                    <div className="avatar-circle" style={{ cursor: "default" }}>
                      {formValues?.applicant?.UploadPicture?.fileStoreId ? (
                        <ProfileImagePreview fileStoreId={formValues?.applicant?.UploadPicture?.fileStoreId} />
                      ) : (
                        <div className="avatar-placeholder">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <PreviewItem label="First Name" value={formValues?.applicant?.firstName} />
                <PreviewItem label="Middle Name" value={formValues?.applicant?.middleName} />
                <PreviewItem label="Last Name" value={formValues?.applicant?.lastName} />
                <PreviewItem label="Gender" value={formValues?.useDetails?.gender} />
                <PreviewItem label="Parent/ spouse" value={formValues?.applicant?.ParentorSpouse} />
                <PreviewItem label="Email ID" value={formValues?.contact?.emailId} />
                <PreviewItem label="Mobile Number" value={formValues?.contact?.mobileNumber} />
                <PreviewItem label="WhatsApp Number" value={formValues?.contact?.whatsAppNumber} />
                <PreviewItem isFullWidth label="Uploaded ID Proof" value={formValues?.documents?.identityProofFile} />
              </SectionCard>

              <SectionCard
                description="DJB employee-specific information."
                isOpen={collapsedSections.employee}
                onToggle={toggleSection}
                sectionKey="employee"
                title="For DJB Employee"
                onEditClick={() => handleSectionEdit("djbEmployee")}
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
                onEditClick={() => handleSectionEdit("propertyAddress")}
              >
                <PreviewItem label="Pin Code" value={formValues?.propertyAddress?.pinCode} />
                <PreviewItem label="State" value={formValues?.propertyAddress?.state} />
                <PreviewItem label="District" value={formValues?.propertyAddress?.district} />
                <PreviewItem label="City" value={formValues?.propertyAddress?.city} />
                <PreviewItem label="Locality" value={formValues?.propertyAddress?.locality} />
                <PreviewItem label="Street" value={formValues?.propertyAddress?.street} />
                <PreviewItem label="House No" value={formValues?.propertyAddress?.houseNo} />
                <PreviewItem label="Block" value={formValues?.propertyAddress?.block} />
                <PreviewItem label="Zone" value={formValues?.propertyAddress?.zone} />
                <PreviewItem label="Landmark" value={formValues?.propertyAddress?.landmark} />
                <PreviewItem isFullWidth label="Address" value={formValues?.propertyAddress?.address} />
              </SectionCard>

              <SectionCard
                description="Property and connection usage values."
                isOpen={collapsedSections.usage}
                onToggle={toggleSection}
                sectionKey="usage"
                title="Property and Water Connection Use Details"
                onEditClick={() => handleSectionEdit("useDetails")}
              >
                <PreviewItem label="Property Type" value={formValues?.useDetails?.propertyType} />
                <PreviewItem label="Plot Area (Sq. m.)" value={formValues?.useDetails?.plotArea} />
                <PreviewItem label="Built-up Area (Sq. m.)" value={formValues?.useDetails?.builtUpArea} />
                <PreviewItem label="Number of Floors" value={formValues?.useDetails?.noOfFloors} />
                <PreviewItem label="Number of Dwelling Units" value={formValues?.useDetails?.NumberofDwellingUnits} />
                {formValues?.useDetails?.propertyType?.code === "HOSPITAL" || formValues?.useDetails?.propertyType?.code === "HOSPITAL_NURSING_HOME" ? (
                  <PreviewItem label="No. of Beds" value={formValues?.useDetails?.hospitalBeds} />
                ) : null}
                <PreviewItem label="Year of Construction" value={formValues?.useDetails?.SelectYearofConstruction} />
                <PreviewItem label="Water Connection Usage Type" value={formValues?.useDetails?.WaterConnectionUsageType} />
              </SectionCard>

              <SectionCard
                description="Banking information as entered in the form."
                isOpen={collapsedSections.bank}
                onToggle={toggleSection}
                sectionKey="bank"
                title="Bank Details"
                onEditClick={() => handleSectionEdit("bankDetails")}
              >
                <PreviewItem label="Name of the Bank" value={formValues?.bankDetails?.bankName} />
                <PreviewItem label="Name of the Branch" value={formValues?.bankDetails?.branchName} />
                <PreviewItem label="IFSC Code" value={formValues?.bankDetails?.ifscCode} />
                <PreviewItem label="Bank Account No." value={formValues?.bankDetails?.bankAccountNumber} />
              </SectionCard>

              <SectionCard
                description="Uploaded supporting documents."
                isOpen={collapsedSections.documents}
                onToggle={toggleSection}
                sectionKey="documents"
                title="Documents to be Attached"
                onEditClick={() => handleSectionEdit("documents")}
              >
                <PreviewItem label="Proof of Identity" value={formValues?.documents?.proofOfIdentity} />
                <PreviewItem label="Upload Identity Proof" value={formValues?.documents?.identityProofFile} />
                <PreviewItem label="Ownership Status" value={formValues?.documents?.ownershipStatus} />
                <PreviewItem label="Upload Ownership Document" value={formValues?.documents?.ownershipDocumentFile} />
                <PreviewItem label="Other Document" value={formValues?.documents?.otherDocumentFile} />
              </SectionCard>
            </React.Fragment>
          )}
        </div>
      </div>

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
