import { FormComposer, Header, Loader, Toast } from "@djb25/digit-ui-react-components";
import cloneDeep from "lodash/cloneDeep";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import * as func from "../../../utils";
import _ from "lodash";
import { newConfig as newConfigLocal } from "../../../config/wsCreateConfig";
import { createPayloadOfWS, updatePayloadOfWS } from "../../../utils";

const OLDApplication = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const history = useHistory();
  let filters = func.getQueryStringParams(location.search);
  const [canSubmit, setSubmitValve] = useState(false);
  const [isEnableLoader, setIsEnableLoader] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [appDetails, setAppDetails] = useState({});
  const [waterAndSewerageBoth, setWaterAndSewerageBoth] = useState(null);
  const [config, setConfig] = useState({ head: "", body: [] });

  // FIX 1: Properly assign tenantId fallback (was a no-op before)
  let tenantId = Digit.ULBService.getCurrentTenantId();
  if (!tenantId) {
    tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code;
  }

  const stateId = Digit.ULBService.getStateId();
  let { data: newConfig, isLoading } = Digit.Hooks.ws.useWSConfigMDMS.WSCreateConfig(stateId, {});

  const [propertyId, setPropertyId] = useState(new URLSearchParams(useLocation().search).get("propertyId"));

  const [sessionFormData, setSessionFormData, clearSessionFormData] = Digit.Hooks.useSessionStorage("PT_CREATE_EMP_WS_NEW_FORM", {});

  const { data: propertyDetails } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: propertyId }, tenantId: tenantId },
    { filters: { propertyIds: propertyId }, tenantId: tenantId, enabled: propertyId && propertyId != "" ? true : false }
  );

  // FIX 2: Clear stale FORMSTATE_ERRORS from sessionStorage on component mount
  useEffect(() => {
    sessionStorage.removeItem("FORMSTATE_ERRORS");
  }, []);

  useEffect(() => {
    console.log("[WS] useEffect newConfig triggered", { isLoading, newConfig });
    if (!isLoading && newConfig) {
      const config = newConfig.find((conf) => conf.hideInCitizen && conf.isCreate);
      console.log("[WS] found config", config);
      if (config) {
        config.head = "WS_APP_FOR_WATER_AND_SEWERAGE_LABEL";
        
        // Filter sections that are for creation
        const allCreateSections = config?.body?.filter(section => section?.isCreateConnection) || [];
        console.log("[WS] allCreateSections", allCreateSections);
        
        // Define the desired order based on the component inside the section
        const desiredComponentOrder = [
          "CPTPropertySearchNSummary",
          "WSConnectionHolderDetails",
          "WSConnectionDetails",
          "WSDocumentsEmployee"
        ];

        // Manually reorder sections
        const reorderedBody = [];
        desiredComponentOrder.forEach(compName => {
          const section = allCreateSections.find(s => {
            const bodyComp = s.body?.[0]?.component;
            return bodyComp === compName || (compName === "WSConnectionDetails" && bodyComp === "WSConnectionDetails");
          });
          if (section) {
            // Override headers to match primary form if needed
            if (compName === "CPTPropertySearchNSummary") section.head = "WS_COMMON_PROPERTY_DETAILS";
            if (compName === "WSConnectionHolderDetails") section.head = "WS_COMMON_CONNECTION_HOLDER_DETAILS_HEADER";
            if (compName === "WSConnectionDetails") section.head = "WS_COMMON_CONNECTION_DETAIL";
            if (compName === "WSDocumentsEmployee") section.head = "WS_COMMON_DOCS";
            
            reorderedBody.push(section);
          } else {
            console.warn(`[WS] section for component ${compName} not found in allCreateSections`);
          }
        });

        // Add any remaining sections that were not in desiredComponentOrder
        allCreateSections.forEach(section => {
          const bodyComp = section.body?.[0]?.component;
          if (!reorderedBody.find(r => r.body?.[0]?.component === bodyComp)) {
            reorderedBody.push(section);
          }
        });

        console.log("[WS] reorderedBody", reorderedBody);
        config.body = reorderedBody;
        setConfig(config);
      }
    }
  }, [newConfig, isLoading]);

  useEffect(() => {
    !propertyId && sessionFormData?.cpt?.details?.propertyId && setPropertyId(sessionFormData?.cpt?.details?.propertyId);
  }, [sessionFormData?.cpt]);

  useEffect(() => {
    setSessionFormData({ ...sessionFormData, cpt: { details: propertyDetails?.Properties?.[0] } });
  }, [propertyDetails]);

  const {
    isLoading: creatingWaterApplicationLoading,
    isError: createWaterApplicationError,
    data: createWaterResponse,
    error: createWaterError,
    mutate: waterMutation,
  } = Digit.Hooks.ws.useWaterCreateAPI("WATER");

  const {
    isLoading: updatingWaterApplicationLoading,
    isError: updateWaterApplicationError,
    data: updateWaterResponse,
    error: updateWaterError,
    mutate: waterUpdateMutation,
  } = Digit.Hooks.ws.useWSApplicationActions("WATER");

  const {
    isLoading: creatingSewerageApplicationLoading,
    isError: createSewerageApplicationError,
    data: createSewerageResponse,
    error: createSewerageError,
    mutate: sewerageMutation,
  } = Digit.Hooks.ws.useWaterCreateAPI("SEWERAGE");

  const {
    isLoading: updatingSewerageApplicationLoading,
    isError: updateSewerageApplicationError,
    data: updateSewerageResponse,
    error: updateSewerageError,
    mutate: sewerageUpdateMutation,
  } = Digit.Hooks.ws.useWSApplicationActions("SEWERAGE");

  const onFormValueChange = (setValue, formData, formState) => {
    if (!_.isEqual(sessionFormData, formData)) {
      setSessionFormData({ ...sessionFormData, ...formData });
      sessionStorage.setItem("FORMSTATE_ERRORS", JSON.stringify(formState?.errors));
    }

    if (
      Object.keys(formState.errors).length > 0 &&
      Object.keys(formState.errors).length == 1 &&
      formState?.errors?.["ConnectionHolderDetails"]?.type &&
      Object.keys(formState?.errors?.["ConnectionHolderDetails"]?.type)?.length == 1 &&
      formState.errors["ConnectionHolderDetails"] &&
      Object.values(formState.errors["ConnectionHolderDetails"].type).filter((ob) => ob.type === "required" && ob?.ref?.value !== "").length > 0
    )
      setSubmitValve(true);
    else setSubmitValve(!Object.keys(formState.errors).length);
  };

  const closeToastOfError = () => {
    setShowToast(null);
  };

  const onSubmit = async (data) => {
    // DEBUG: Remove these logs once issue is confirmed fixed
    console.log("[WS] onSubmit triggered", { data, propertyId, propertyDetails });

    // FIX 3: Proper property validation with clear logging
    if (!data?.cpt?.id && !propertyDetails?.Properties?.[0]) {
      if (!data?.cpt?.details || !propertyDetails) {
        console.warn("[WS] onSubmit EXIT: invalid property", { cpt: data?.cpt, propertyDetails });
        setShowToast({ key: "error", message: "ERR_INVALID_PROPERTY_ID" });
        return;
      }
    }

    // FIX 4: Read and validate sessionStorage errors
    const errors = sessionStorage.getItem("FORMSTATE_ERRORS");
    console.log("[WS] FORMSTATE_ERRORS from sessionStorage:", errors);
    const formStateErros = typeof errors === "string" && errors !== "null" ? JSON.parse(errors) : {};

    if (
      Object.keys(formStateErros).length > 0 &&
      !(
        Object.keys(formStateErros).length == 1 &&
        formStateErros?.["ConnectionHolderDetails"]?.type &&
        Object.keys(formStateErros?.["ConnectionHolderDetails"]?.type)?.length == 1 &&
        formStateErros["ConnectionHolderDetails"] &&
        Object.values(formStateErros["ConnectionHolderDetails"].type).filter((ob) => ob.type === "required" && ob?.ref?.value !== "").length > 0
      )
    ) {
      console.warn("[WS] onSubmit EXIT: formState errors blocking submit", formStateErros);
      setShowToast({ warning: true, message: "PLEASE_FILL_MANDATORY_DETAILS" });
      return;
    }

    // Ensure cpt details are set before payload creation
      if (!data?.cpt?.details) {
        data.cpt = {
          details: propertyDetails?.Properties?.[0],
        };
      }
      data.channel = "CITIZEN";

    // Ensure applicationSelection is set for createPayloadOfWS compatibility
    const connDetail = data?.ConnectionDetails?.[0] || {};
    data.applicationSelection = {
      serviceType: { code: "WATER" },
      connectionType: { code: connDetail?.connectionType || "Metered" },
      applicantType: { code: "NONPTPRESSURE" }, // Default for legacy form
      categoryType: { code: data?.ConnectionHolderDetails?.[0]?.ownerType?.code || data?.ConnectionHolderDetails?.[0]?.ownerType || propertyDetails?.Properties?.[0]?.owners?.[0]?.ownerType || "NONE" },
    };

    if (data?.ConnectionDetails?.[0]) {
      data.ConnectionDetails[0].water = true;
      data.ConnectionDetails[0].sewerage = false;
      data.ConnectionDetails[0].service = "Water";
    }

    const allDetails = cloneDeep(data);
    const payload = await createPayloadOfWS(data);

    // DEBUG: Log payload to confirm water/sewerage fields are present
    console.log("[WS] createPayloadOfWS result:", payload);

    // FIX 5: Guard against empty payload — show a meaningful error instead of silent no-op
    if (!payload?.water && !payload?.sewerage) {
      console.error("[WS] onSubmit EXIT: payload has neither water nor sewerage", payload);
      setShowToast({ key: "error", message: "ERR_CONNECTION_TYPE_MISSING" });
      return;
    }

    let waterAndSewerageLoader = false,
      waterLoader = false,
      sewerageLoader = false;

    if (payload?.water && payload?.sewerage) waterAndSewerageLoader = true;
    if (payload?.water && !payload?.sewerage) waterLoader = true;
    if (!payload?.water && payload?.sewerage) sewerageLoader = true;

    let waterConnection = { WaterConnection: payload, disconnectRequest: false, reconnectRequest: false };
    let sewerageConnection = { SewerageConnection: payload, disconnectRequest: false, reconnectRequest: false };

    if (waterAndSewerageLoader) {
      setWaterAndSewerageBoth(true);
      sessionStorage.setItem("setWaterAndSewerageBoth", JSON.stringify(true));
    } else {
      sessionStorage.setItem("setWaterAndSewerageBoth", JSON.stringify(false));
    }

    // --- WATER APPLICATION FLOW ---
    if (payload?.water) {
      if (waterMutation) {
        setIsEnableLoader(true);
        await waterMutation(waterConnection, {
          onError: (error) => {
            setIsEnableLoader(false);
            console.error("[WS] waterMutation error", error);
            setShowToast({
              key: "error",
              message: error?.response?.data?.Errors?.[0]?.message || error?.message || "ERR_UNKNOWN",
            });
            setTimeout(closeToastOfError, 5000);
          },
          onSuccess: async (data) => {
            console.log("[WS] waterMutation success", data);
            let response = await updatePayloadOfWS(data?.WaterConnection?.[0], "WATER");
            let waterConnectionUpdate = { WaterConnection: response };

            waterUpdateMutation(waterConnectionUpdate, {
              onError: (error) => {
                setIsEnableLoader(false);
                console.error("[WS] waterUpdateMutation error", error);
                setShowToast({
                  key: "error",
                  message: error?.response?.data?.Errors?.[0]?.message || error?.message || "ERR_UNKNOWN",
                });
                setTimeout(closeToastOfError, 5000);
              },
              onSuccess: (data) => {
                console.log("[WS] waterUpdateMutation success", data);
                setAppDetails((prev) => ({ ...prev, waterConnection: data?.WaterConnection?.[0] }));
                clearSessionFormData();
                history.push(`/digit-ui/employee/ws/ws-response?applicationNumber=${data?.WaterConnection?.[0]?.applicationNo}`);
              },
            });
          },
        });
      }
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  if (isEnableLoader || isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div style={{ marginLeft: "15px" }}>
        <Header>{t(config.head)}</Header>
      </div>
      <FormComposer
        config={config.body}
        userType={"employee"}
        onFormValueChange={onFormValueChange}
        label={creatingWaterApplicationLoading || creatingSewerageApplicationLoading || updatingWaterApplicationLoading || updatingSewerageApplicationLoading ? t("CS_COMMON_SUBMITTING") : t("CS_COMMON_SUBMIT")}
        onSubmit={onSubmit}
        defaultValues={sessionFormData}
        cardFormWrapperClassName="new-application-card"
      />
      {showToast && (
        <Toast
          isDleteBtn={true}
          error={showToast?.key === "error" ? true : false}
          warning={showToast?.warning}
          label={t(showToast?.message)}
          onClose={closeToast}
          isWarning={showToast?.isWarning}
        />
      )}
    </React.Fragment>
  );
};

export default OLDApplication;