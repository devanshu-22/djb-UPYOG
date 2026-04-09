import React, { useEffect, useState } from "react";
import { FormComposer, Toast, Loader } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { newConfig } from "../components/config/config";

const Stepper = ({ customSteps, currentStep, onStepClick, t }) => {
  return (
    <div className="stepper-container">
      {customSteps.map((stepObj, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div className="stepper-item" key={index}>
            <div className="stepper-row">
              <div className={`stepper-circle ${isCompleted ? "completed" : isActive ? "active" : ""}`}>
                {isCompleted ? (
                  <svg width="14" height="10" viewBox="0 0 14 10">
                    <path
                      d="M4.7 9.99L0.28 5.58C-0.09 5.21 -0.09 4.6 0.28 4.22C0.66 3.85 1.26 3.85 1.64 4.22L4.7 7.28L12.36 0.28C12.79 -0.11 13.44 -0.08 13.84 0.35C14.24 0.78 14.19 1.46 13.77 1.84L4.7 9.99Z"
                      fill="white"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              <div className={`stepper-label ${isActive ? "active" : ""}`} onClick={() => isCompleted && onStepClick(index)}>
                {t(stepObj.head)}
              </div>
            </div>

            {index !== customSteps.length - 1 && <div className={`stepper-line ${isCompleted ? "completed" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
};

const CreateEmployee = () => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [canSubmit, setSubmitValve] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [phonecheck, setPhonecheck] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = window.Digit.Utils.browser.isMobile();
  // const [activeStep, setActiveStep] = useState(0); Commented for development by Avinash
  const [activeStep, setActiveStep] = useState(0); // Only used during development
  const isAutoAdvancing = React.useRef(false);
  const previouslyValidSteps = React.useRef({ 0: false, 1: false, 2: false });

  const defaultValues = {
    Jurisdictions: [
      {
        id: undefined,
        key: 1,
        hierarchy: null,
        boundaryType: null,
        boundary: {
          code: tenantId,
        },
        roles: [],
      },
    ],
  };
  const [sessionFormData, setSessionFormData] = useState(defaultValues);

  const { data: mdmsData, isLoading } = Digit.Hooks.useCommonMDMS(Digit.ULBService.getStateId(), "egov-hrms", ["CommonFieldsConfig"], {
    select: (data) => {
      return {
        config: data?.MdmsRes?.["egov-hrms"]?.CommonFieldsConfig,
      };
    },
    retry: false,
    enable: false,
  });
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_HAPPENED", false);
  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_ERROR_DATA", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_SUCCESS_DATA", false);

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
  }, []);

  const checkMailNameNum = (formData) => {
    const email = formData?.SelectEmployeeEmailId?.emailId || "";
    const name = formData?.SelectEmployeeName?.employeeName || "";
    const address = formData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress || "";
    const validEmail = email.length === 0 ? true : Boolean(email.match(Digit.Utils.getPattern("Email")));
    return Boolean(validEmail && name.match(Digit.Utils.getPattern("Name")) && address.match(Digit.Utils.getPattern("Address")));
  };
  useEffect(() => {
    if (mobileNumber && mobileNumber.length == 10 && mobileNumber.match(Digit.Utils.getPattern("MobileNo"))) {
      setShowToast(null);
      Digit.HRMSService.search(tenantId, null, { phone: mobileNumber }).then((result, err) => {
        if (result.Employees.length > 0) {
          setShowToast({ key: true, label: "ERR_HRMS_USER_EXIST_MOB" });
          setPhonecheck(false);
        } else {
          setPhonecheck(true);
        }
      });
    } else {
      setPhonecheck(false);
    }
  }, [mobileNumber]);

  const checkPersonalDetails = (currentData, currentPhoneCheck) => {
    const email = currentData?.SelectEmployeeEmailId?.emailId || "";
    const name = currentData?.SelectEmployeeName?.employeeName || "";
    const address = currentData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress || "";
    const dob = currentData?.SelectDateofBirthEmployment?.dob;
    const validEmail = email.length === 0 ? true : Boolean(email.match(Digit.Utils.getPattern("Email")));
    const isMailNameNumValid = Boolean(validEmail && name.match(Digit.Utils.getPattern("Name")) && address.match(Digit.Utils.getPattern("Address")));

    let isAgeValid = true;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      isAgeValid = age >= 18;
    } else {
      isAgeValid = false;
    }

    return !!(
      currentData?.SelectEmployeeName?.employeeName &&
      currentData?.SelectEmployeePhoneNumber?.mobileNumber &&
      currentData?.SelectEmployeeGender?.gender?.code &&
      isAgeValid &&
      currentPhoneCheck &&
      isMailNameNumValid
    );
  };

  const checkEmployeeDetails = (currentData) => {
    return !!(currentData?.SelectEmployeeType?.code && currentData?.SelectDateofEmployment?.dateOfAppointment);
  };

  const checkJurisdictionDetails = (currentData) => {
    if (!currentData?.Jurisdictions || currentData.Jurisdictions.length === 0) return false;
    return currentData.Jurisdictions.every((key) => {
      return !!(key?.boundary && key?.boundaryType && key?.hierarchy && key?.tenantId && key?.roles?.length > 0);
    });
  };

  const checkAssignmentDetails = (currentData) => {
    if (!currentData?.Assignments || currentData.Assignments.length === 0) return false;
    return currentData.Assignments.every((key) => {
      return !!(key.department && key.designation && key.fromDate && (key.toDate || key.isCurrentAssignment));
    });
  };

  const config = mdmsData?.config ? mdmsData.config : newConfig;
  const formDataRef = React.useRef(sessionFormData);

  const validate = (currentData, currentPhoneCheck) => {
    let isValid = true;

    isValid =
      checkPersonalDetails(currentData, currentPhoneCheck) &&
      checkEmployeeDetails(currentData) &&
      checkJurisdictionDetails(currentData) &&
      checkAssignmentDetails(currentData);

    if (isValid !== canSubmit) {
      setSubmitValve(isValid);
    }
  };

  useEffect(() => {
    validate(formDataRef.current, phonecheck);
  }, [phonecheck, config, canSubmit]);

  useEffect(() => {
    const handleScroll = () => {
      if (isAutoAdvancing.current) return;
      const sections = document.querySelectorAll(".employee-form-section .card-header");
      let currentStep = activeStep;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          currentStep = index;
        }
      });
      if (currentStep !== activeStep) {
        setActiveStep(currentStep);
      }
    };

    const scrollContainer = document.querySelector(".employee-form-section");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [activeStep]);

  const onFormValueChange = (setValue = true, formData) => {
    const updatedData = { ...sessionFormData, ...formData };
    formDataRef.current = updatedData;
    if (formData?.SelectEmployeePhoneNumber?.mobileNumber !== mobileNumber) {
      setMobileNumber(formData?.SelectEmployeePhoneNumber?.mobileNumber);
    }
    validate(updatedData, phonecheck);

    // Auto-advance logic
    const sectionsStatus = [
      { isValid: checkPersonalDetails(updatedData, phonecheck), lastField: updatedData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress },
      { isValid: checkEmployeeDetails(updatedData), lastField: updatedData?.SelectEmployeeId?.code },
      { isValid: checkJurisdictionDetails(updatedData), lastField: true }, // Jurisdictions is non-empty and valid
    ];

    if (activeStep < sectionsStatus.length) {
      const currentSection = sectionsStatus[activeStep];
      if (currentSection.isValid && currentSection.lastField && !previouslyValidSteps.current[activeStep]) {
        previouslyValidSteps.current[activeStep] = true;
        setTimeout(() => {
          handleStepClick(activeStep + 1);
        }, 600);
      } else if (!currentSection.isValid) {
        previouslyValidSteps.current[activeStep] = false;
      }
    }

    // Auto-reverse logic: If any previous section becomes invalid, jump back to it
    for (let i = 0; i < activeStep; i++) {
      if (!sectionsStatus[i].isValid) {
        handleStepClick(i);
        break;
      }
    }
  };

  const navigateToAcknowledgement = (Employees) => {
    history.replace("/digit-ui/employee/hrms/response", { Employees, key: "CREATE", action: "CREATE" });
  };

  const onSubmit = (data) => {
    const finalData = { ...sessionFormData, ...data };
    formDataRef.current = finalData;
    setSessionFormData(finalData);

    // Final submit logic
    if (finalData.Jurisdictions.filter((juris) => juris.tenantId == tenantId).length == 0) {
      setShowToast({ key: true, label: "ERR_BASE_TENANT_MANDATORY" });
      return;
    }
    if (
      !Object.values(
        finalData.Jurisdictions.reduce((acc, sum) => {
          if (sum && sum?.tenantId) {
            acc[sum.tenantId] = acc[sum.tenantId] ? acc[sum.tenantId] + 1 : 1;
          }
          return acc;
        }, {})
      ).every((s) => s == 1)
    ) {
      setShowToast({ key: true, label: "ERR_INVALID_JURISDICTION" });
      return;
    }
    let roles = finalData?.Jurisdictions?.map((ele) => {
      return ele.roles?.map((item) => {
        item["tenantId"] = ele.boundary;
        return item;
      });
    });

    const mappedroles = [].concat.apply([], roles);
    let Employees = [
      {
        tenantId: tenantId,
        employeeStatus: "EMPLOYED",
        assignments: finalData?.Assignments,
        code: finalData?.SelectEmployeeId?.code ? finalData?.SelectEmployeeId?.code : undefined,
        dateOfAppointment: new Date(finalData?.SelectDateofEmployment?.dateOfAppointment).getTime(),
        employeeType: finalData?.SelectEmployeeType?.code,
        jurisdictions: finalData?.Jurisdictions,
        user: {
          mobileNumber: finalData?.SelectEmployeePhoneNumber?.mobileNumber,
          name: finalData?.SelectEmployeeName?.employeeName,
          correspondenceAddress: finalData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress,
          emailId: finalData?.SelectEmployeeEmailId?.emailId ? finalData?.SelectEmployeeEmailId?.emailId : undefined,
          gender: finalData?.SelectEmployeeGender?.gender.code,
          dob: new Date(finalData?.SelectDateofBirthEmployment?.dob).getTime(),
          roles: mappedroles,
          tenantId: tenantId,
        },
        serviceHistory: [],
        education: [],
        tests: [],
      },
    ];
    /* use customiseCreateFormData hook to make some chnages to the Employee object */
    Employees = Digit?.Customizations?.HRMS?.customiseCreateFormData
      ? Digit.Customizations.HRMS.customiseCreateFormData(finalData, Employees)
      : Employees;

    if (finalData?.SelectEmployeeId?.code && finalData?.SelectEmployeeId?.code?.trim().length > 0) {
      Digit.HRMSService.search(tenantId, null, { codes: finalData?.SelectEmployeeId?.code }).then((result, err) => {
        if (result.Employees.length > 0) {
          setShowToast({ key: true, label: "ERR_HRMS_USER_EXIST_ID" });
          return;
        } else {
          navigateToAcknowledgement(Employees);
        }
      });
    } else {
      navigateToAcknowledgement(Employees);
    }
  };

  const handleSecondaryAction = () => {
    history.goBack();
  };

  const handleStepClick = (index) => {
    isAutoAdvancing.current = true;
    setActiveStep(index);
    const sections = document.querySelectorAll(".employee-form-section .card-header");
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => {
      isAutoAdvancing.current = false;
    }, 1000);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={`employee-form-content ${isMobile ? "mobile-view" : ""}`}>
      <div className="employee-form-section-wrapper">
        <Stepper customSteps={config} currentStep={activeStep} onStepClick={handleStepClick} t={t} />
        <div className="employee-form-section">
          <FormComposer
            defaultValues={sessionFormData}
            heading={t("")}
            config={config.map((config) => {
              return {
                ...config,
                isCollapsible: true,
                isDefaultOpen: true,
                body: config.body,
              };
            })}
            t={t}
            onSubmit={onSubmit}
            onFormValueChange={onFormValueChange}
            isDisabled={!canSubmit}
            label={t("HR_COMMON_BUTTON_SUBMIT")}
            onSecondayActionClick={handleSecondaryAction}
            cardClassName=""
            formClassName=""
            noCard={true}
            noBreakLine={true}
            sectionHeadStyle={{ gridColumn: "span 2" }}
          />
        </div>
      </div>
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </div>
  );
};
export default CreateEmployee;
