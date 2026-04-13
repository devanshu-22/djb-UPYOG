import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormComposer, Toast, VerticalTimeline } from "@djb25/digit-ui-react-components";
// import { useHistory } from "react-router-dom";
// import { useQueryClient } from "react-query";
import VendorConfig from "../../../config/VendorConfig";

const AddVendor = ({ parentUrl, heading }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const { t } = useTranslation();
  // const history = useHistory();
  // const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("FSM_MUTATION_HAPPENED", false);

  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("FSM_ERROR_DATA", false);

  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("FSM_MUTATION_SUCCESS_DATA", false);

  const { isLoading, isError: vendorCreateError, data: updateResponse, error: updateError, mutate } = Digit.Hooks.fsm.useVendorCreate(tenantId);

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
  }, []);

  const Config = VendorConfig(t);

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
    if (formData?.vendorName && formData?.phone && formData?.serviceType?.code) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const onSubmit = (data) => {
    // FINAL SUBMIT
    const mergedData = data;

    const name = mergedData?.vendorName;
    const pincode = mergedData?.pincode;
    const street = mergedData?.street?.trim();
    const doorNo = mergedData?.doorNo?.trim();
    const plotNo = mergedData?.plotNo?.trim();
    const landmark = mergedData?.landmark?.trim();
    const city = mergedData?.address?.city?.name;
    const state = mergedData?.address?.city?.state;
    const district = mergedData?.address?.city?.name;
    const region = mergedData?.address?.city?.name;
    const buildingName = mergedData?.buildingName?.trim();
    const localityCode = mergedData?.address?.locality?.code;
    const localityName = mergedData?.address?.locality?.name;
    const localityArea = mergedData?.address?.locality?.area;
    const gender = "MALE";
    const emailId = mergedData?.emailId;
    const phone = mergedData?.phone;

    const dob = new Date(`${mergedData.dob}`).getTime() || new Date(`1/1/1970`).getTime();

    const additionalDetails = mergedData?.serviceType?.code;

    const formData = {
      vendor: {
        tenantId: tenantId,
        name,
        agencyType: "ULB",
        paymentPreference: "post-service",

        address: {
          tenantId: tenantId,
          landmark,
          doorNo,
          plotNo,
          street,
          city,
          district,
          region,
          state,
          country: "in",
          pincode,
          buildingName,

          locality: {
            code: localityCode || "",
            name: localityName || "",
            label: "Locality",
            area: localityArea || "",
          },

          geoLocation: {
            latitude: mergedData?.address?.latitude || 0,
            longitude: mergedData?.address?.longitude || 0,
          },
        },

        owner: {
          tenantId: stateId,
          name: name,
          fatherOrHusbandName: name,
          relationship: "OTHER",
          gender: gender,
          dob: "915148800",
          emailId: emailId || "abc@egov.com",
          mobileNumber: phone,
        },

        additionalDetails: {
          serviceType: additionalDetails,
        },

        vehicle: [],
        drivers: [],
        source: "WhatsApp",
      },
    };

    mutate(formData, {
      onError: (error) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: "ADD_VENDOR" });
        setTimeout(closeToast, 5000);
      },
    });
  };

  return (
    <React.Fragment>
       <VerticalTimeline
        config={[
          {
            route: "vendor-details",
            timeLine: [{ actions: "New Vendor Details", currentStep: 1 }],
          },
          {
            route: "address-details",
            timeLine: [{ actions: "Address Details", currentStep: 2 }],
          },
        ]}
        currentActiveIndex={currentStep - 1}
        showFinalStep={false}
      />
      <div style={{ flex: "1", overflowY: "auto" }}>
        <FormComposer
          label={t("ES_COMMON_APPLICATION_SUBMIT")}
          config={Config.filter((i) => !i.hideInEmployee).map((config) => ({
            ...config,
            isCollapsible: true,
            isDefaultOpen: true,
            body: config.body.filter((a) => !a.hideInEmployee),
          }))}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          onFormValueChange={onFormValueChange}
          noBreakLine={true}
          noCard={true}
        />

        {showToast && (
          <Toast
            error={showToast.key === "error"}
            label={t(showToast.key === "success" ? `ES_FSM_REGISTRY_${showToast.action}_SUCCESS` : showToast.action)}
            onClose={closeToast}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default AddVendor;
