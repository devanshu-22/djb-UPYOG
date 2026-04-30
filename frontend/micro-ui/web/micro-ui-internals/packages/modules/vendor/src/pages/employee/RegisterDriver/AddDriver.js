import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormComposer, Toast, VerticalTimeline } from "@djb25/digit-ui-react-components";
//import DriverConfig from "../../configs/DriverConfig";
import { useQueryClient } from "react-query";
import DriverConfig from "../../../config/DriverConfig";
import Timeline from "../../../components/VENDORTimeline";

const AddDriver = ({ parentUrl, heading }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();

  const stateId = Digit.ULBService.getStateId();
  const [showToast, setShowToast] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();
  const steps = [t("ES_FSM_REGISTRY_TITLE_NEW_DRIVER")];

  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("FSM_MUTATION_HAPPENED", false);
  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("FSM_ERROR_DATA", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("FSM_MUTATION_SUCCESS_DATA", false);

  const { isLoading: isLoading, isError: vendorCreateError, data: updateResponse, error: updateError, mutate } = Digit.Hooks.fsm.useDriverCreate(
    tenantId
  );

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
  }, []);

  const Config = DriverConfig(t);

  const [canSubmit, setSubmitValve] = useState(false);

  const defaultValues = {
    serviceType: {
      code: "WT",
      name: "WT",
      i18nKey: "WT",
    },
    tripData: {
      noOfTrips: 1,
      amountPerTrip: null,
      amount: null,
    },
  };

  const onFormValueChange = (setValue, formData) => {
    if (formData?.license) {
      const cleaned = formData.license.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      let formatted = cleaned;
      if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "-" + cleaned.slice(2);
      if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "-" + formatted.slice(5);
      if (cleaned.length > 8) formatted = formatted.slice(0, 10) + "-" + formatted.slice(10);
      const finalFormatted = formatted.slice(0, 18);
      if (formData.license !== finalFormatted) {
        setValue("license", finalFormatted);
      }
    }

    if (
      formData?.driverName &&
      /^[A-Za-z\s]+$/.test(formData?.driverName) &&
      formData?.license &&
      /^[A-Z]{2}-[0-9]{2}-[0-9]{4}-[0-9]{7}$/.test(formData?.license) &&
      formData?.selectGender &&
      formData?.dob &&
      new Date(formData?.dob).getTime() <= new Date().setFullYear(new Date().getFullYear() - 18)
    ) {
      setSubmitValve(true);
    } else {
      setSubmitValve(false);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };
  const isCitizen = Digit.UserService.getType() === "WT_VENDOR";
  console.log(isCitizen,'iscitizen')

  const onSubmit = (data) => {
    const name = data?.driverName;
    const license = data?.license;
    const gender = data?.selectGender?.code;
    const emailId = data?.emailId;
    const phone = data?.phone;
    const dob = new Date(`${data.dob}`).getTime() || new Date(`1/1/1970`).getTime();
    const additionalDetails = data?.serviceType?.code;
    const formData = {
      driver: {
        tenantId: !isCitizen ? "dl.djb" : tenantId,
        name: name,
        licenseNumber: license,
        status: "ACTIVE",
        owner: {
          tenantId: stateId,
          name: name,
          fatherOrHusbandName: name,
          relationship: "OTHER",
          gender: gender,
          dob: dob,
          emailId: emailId || "abc@egov.com",
          mobileNumber: phone,
        },
        additionalDetails: {
          serviceType: additionalDetails,
        },

        vendorDriverStatus: "ACTIVE",
      },
    };

    mutate(formData, {
      onError: (error, variables) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: "ADD_DRIVER" });
        setTimeout(closeToast, 5000);
        queryClient.invalidateQueries("FSM_DRIVER_SEARCH");
        // setTimeout(() => {
        //   closeToast();
        //   history.push(`/digit-ui/employee/vendor/search-vendor`);
        // }, 5000);
      },
    });
  };

  return (
    <React.Fragment>
      <VerticalTimeline
        config={[
          {
            route: "vendor-details",
            timeLine: [{ actions: t("ES_FSM_REGISTRY_TITLE_NEW_DRIVER"), currentStep: 1 }],
          },
        ]}
        currentActiveIndex={currentStep - 1}
        showFinalStep={false}
      />
      <div style={{ flex: "1", overflowY: "auto" }}>
        <FormComposer
          isDisabled={!canSubmit}
          label={t("ES_COMMON_APPLICATION_SUBMIT")}
          config={Config.filter((i) => !i.hideInEmployee).map((config) => {
            return {
              ...config,
              isCollapsible: true,
              isDefaultOpen: true,
              body: config.body.filter((a) => !a.hideInEmployee),
            };
          })}
          fieldStyle={{ marginRight: 0 }}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          onFormValueChange={onFormValueChange}
          noBreakLine={true}
          mode="onChange"
          noCard={true}
        />
        {showToast && (
          <Toast
            error={showToast.key === "error" ? true : false}
            label={t(showToast.key === "success" ? `ES_FSM_${showToast.action}_SUCCESS` : showToast.action)}
            onClose={closeToast}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default AddDriver;
