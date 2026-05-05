import { AppContainer, PrivateRoute, ModuleHeader, ArrowLeft, HomeIcon } from "@djb25/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Switch, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import Inbox from "./Inbox";
import Mapping from "./Mapping";
import Create from "./Create";

import Review from "./Review";
import EKYCForm from "./EKYCForm";

const EmployeeApp = ({ path }) => {
  const { t } = useTranslation();
  const location = useLocation();

  sessionStorage.removeItem("revalidateddone");

  const getBreadcrumbLabel = () => {
    const pathname = location.pathname;
    if (pathname.includes("/dashboard")) return "ES_COMMON_INBOX";
    if (pathname.includes("/create-kyc")) return "EKYC_CREATE_KYC";
    if (pathname.includes("/k-details")) return "EKYC_K_DETAILS";
    if (pathname.includes("/consumer-details")) return "EKYC_CONSUMER_DETAILS";
    if (pathname.includes("/address-details")) return "EKYC_ADDRESS_DETAILS";
    if (pathname.includes("/property-info")) return "EKYC_PROPERTY_INFO";
    if (pathname.includes("/meter-details")) return "EKYC_METER_DETAILS";
    if (pathname.includes("/review")) return "EKYC_REVIEW";
    return "ES_COMMON_INBOX";
  };

  const breadcrumbs = [{ icon: HomeIcon, path: "/digit-ui/employee" }, { label: t(getBreadcrumbLabel()) }];

  const formStepRoutes = ["consumer-details", "address-details", "property-info", "meter-details"];

  return (
    <AppContainer>
      <div className="ground-container employee-app-container form-container">
        <ModuleHeader
          leftContent={
            <React.Fragment>
              <ArrowLeft className="icon" />
              Back
            </React.Fragment>
          }
          onLeftClick={() => window.history.back()}
          breadcrumbs={breadcrumbs}
        />

        <div className="employee-form">
          <div className="employee-form-content">
            <Switch>
              <PrivateRoute
                path={`${path}/dashboard`}
                component={() => <Dashboard parentRoute={path} businessService="EKYC" moduleCode="EKYC" isInbox={true} />}
              />
              <PrivateRoute
                path={`${path}/inbox`}
                component={() => <Inbox parentRoute={path} businessService="EKYC" moduleCode="EKYC" isInbox={true} />}
              />

              <PrivateRoute path={`${path}/create-kyc`} component={() => <Create />} />

              <PrivateRoute path={`${path}/mapping`} component={() => <Mapping />} />

              <PrivateRoute path={formStepRoutes.map((route) => `${path}/${route}`)} component={(props) => <EKYCForm {...props} path={path} />} />

              <PrivateRoute path={`${path}/review`} component={() => <Review />} />

              {/* <PrivateRoute
                path={`${path}/`}
                component={() => <Inbox parentRoute={path} businessService="EKYC" moduleCode="EKYC" isInbox={true} />}
              /> */}
            </Switch>
          </div>
        </div>
      </div>
    </AppContainer>
  );
};

export default EmployeeApp;
