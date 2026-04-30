import { Header, MultiLink, Button, SubmitBar, EditIcon } from "@djb25/digit-ui-react-components";
import WTEditApplicationModal from "../../components/WTEditApplicationModal";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ApplicationDetailsTemplate from "../../../../templates/ApplicationDetails";
import WorkflowTimeline from "../../components/WorkflowTimeline";

/*
    The ApplicationDetails component fetches and displays details of an application 
    (either Water Tanker or Mobile Toilet) based on a booking number from the URL parameter. 
    It includes functionality for displaying download options like receipt and permission letter, 
    managing workflow details, and handling PDF generation for receipts/letters. 
    The component integrates with hooks for data fetching and mutation, 
    and provides a UI for interacting with the application details.
*/

const ApplicationDetails = () => {
  const { t } = useTranslation();
  const [hideTimeline, setHideTimeline] = React.useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  // const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // const { tenants } = storeData || {};
  const { id: bookingNo } = useParams();
  const [showToast, setShowToast] = useState(null);
  const [appDetailsToShow, setAppDetailsToShow] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  // const [showOptions, setShowOptions] = useState(false);
  const [BusinessService, setBusinessService] = useState("watertanker"); // Default to water tanker service
  // Determine business service dynamically
  const isWaterTanker = bookingNo?.startsWith("WT"); // Water Tanker
  const isTreePruning = bookingNo?.startsWith("TP"); // Tree Pruning
  const businessService = isWaterTanker ? "watertanker" : isTreePruning ? "treePruning" : "mobileToilet";
  const user = Digit.UserService.getUser().info;

  // Store the booking number in session storage with key based on service type
  const storageKey = isWaterTanker ? "wt" : isTreePruning ? "tp" : "mt";
  sessionStorage.setItem(storageKey, bookingNo);

  // Fetch application details based on service type
  const { isLoading, isError, data: applicationDetails, error } = isWaterTanker
    ? Digit.Hooks.wt.useWTApplicationDetail(t, tenantId, bookingNo)
    : isTreePruning
    ? Digit.Hooks.wt.useTPApplicationDetail(t, tenantId, bookingNo)
    : Digit.Hooks.wt.useMTApplicationDetail(t, tenantId, bookingNo);

  // Fetch application action hooks based on service type
  const { isLoading: updatingApplication, isError: updateApplicationError, data: updateResponse, error: updateError, mutate } = isWaterTanker
    ? Digit.Hooks.wt.useWTApplicationAction(tenantId)
    : isTreePruning
    ? Digit.Hooks.wt.useTPApplicationAction(tenantId)
    : Digit.Hooks.wt.useMTApplicationAction(tenantId);

  // Fetch workflow details for the application
  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: applicationDetails?.applicationData?.tenantId || tenantId,
    id: applicationDetails?.applicationData?.applicationData?.bookingNo,
    moduleCode: businessService,
    role: isWaterTanker ? ["WT_CEMP"] : isTreePruning ? ["TP_CEMP"] : ["MT_CEMP"],
  });

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    if (applicationDetails) {
      setAppDetailsToShow(_.cloneDeep(applicationDetails));
    }
  }, [applicationDetails]);

  useEffect(() => {
    if (
      workflowDetails?.data?.applicationBusinessService &&
      !(
        (workflowDetails?.data?.applicationBusinessService === "watertanker" && businessService === "watertanker") ||
        (workflowDetails?.data?.applicationBusinessService === "mobileToilet" && businessService === "mobileToilet") ||
        (workflowDetails?.data?.applicationBusinessService === "treePruning" && businessService === "treePruning")
      )
    ) {
      setBusinessService(workflowDetails?.data?.applicationBusinessService);
    }
  }, [workflowDetails.data]);

  // const [showTimeline, setShowTimeline] = useState(true);
  // let dowloadOptions = [];
  return (
    <div className="employee-form-content-with-action-bar" style={{ padding: user?.type === "CITIZEN" ? "0 15px" : "", height: "100%" }}>
      <div className="employee-application-details" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <Header styles={{ margin: "0px", fontSize: "32px" }}>{t("BOOKING_DETAILS")}</Header>
        <div 
          onClick={() => setShowEditModal(true)} 
          style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "#f47738", gap: "8px", padding: "8px 16px", backgroundColor: "#fff", borderRadius: "4px", border: "1px solid #f47738", transition: "all 0.2s ease" }}
        >
          <EditIcon style={{ fill: "#f47738", width: "20px", height: "20px" }} />
          <span style={{ fontWeight: "600", fontSize: "16px" }}>{t("WT_EDIT_FIELDS")}</span>
        </div>
      </div>
      {showEditModal && (
        <WTEditApplicationModal
          t={t}
          applicationData={appDetailsToShow?.applicationData?.applicationData}
          closeModal={() => setShowEditModal(false)}
        />
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", height: "100%" }}>
        {/* Left Column: Workflow Timeline */}
        <div className={`workflow-timeline-wrapper ${hideTimeline ? "hide-workflow" : ""}`} style={{ flex: "1 1 300px", maxWidth: hideTimeline ? "0px" : "400px", transition: "max-width 0.3s" }}>
          <WorkflowTimeline hideTimeline={hideTimeline} setHideTimeline={setHideTimeline} workflowDetails={workflowDetails} />
        </div>

        {/* Right Column: Application Details */}
        <div style={{ flex: "2 1 500px", minWidth: "300px", overflowY: "auto" }}>
          <ApplicationDetailsTemplate
            applicationDetails={appDetailsToShow?.applicationData}
            isLoading={isLoading}
            isDataLoading={isLoading}
            applicationData={appDetailsToShow?.applicationData?.applicationData}
            mutate={mutate}
            workflowDetails={workflowDetails}
            businessService={businessService}
            moduleCode="request-service"
            showToast={showToast}
            setShowToast={setShowToast}
            closeToast={closeToast}
            timelineStatusPrefix={""}
            forcedActionPrefix={"RS"}
            statusAttribute={"state"}
            MenuStyle={{ color: "#FFFFFF", fontSize: "18px" }}
            showTimeLine={false} // Hide default timeline
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ApplicationDetails);
