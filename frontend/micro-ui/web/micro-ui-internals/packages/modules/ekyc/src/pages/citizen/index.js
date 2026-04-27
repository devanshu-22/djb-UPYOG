import { AppContainer, PrivateRoute, ModuleHeader, ArrowLeft, HomeIcon } from "@djb25/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Switch, useLocation, useRouteMatch } from "react-router-dom";
import Create from "../employee/Create";
import AadhaarVerification from "../employee/AadhaarVerification";
import AddressDetails from "../employee/AddressDetails";
import PropertyInfo from "../employee/PropertyInfo";
import MeterDetails from "../employee/MeterDetails";
import Review from "../employee/Review";

const CitizenApp = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { path } = useRouteMatch();

    sessionStorage.removeItem("revalidateddone");

    const getBreadcrumbLabel = () => {
        const pathname = location.pathname;
        if (pathname.includes("/create-kyc")) return "EKYC_CREATE_KYC";
        if (pathname.includes("/aadhaar-verification")) return "EKYC_AADHAAR_VERIFICATION";
        if (pathname.includes("/address-details")) return "EKYC_ADDRESS_DETAILS";
        if (pathname.includes("/property-info")) return "EKYC_PROPERTY_INFO";
        if (pathname.includes("/meter-details")) return "EKYC_METER_DETAILS";
        if (pathname.includes("/review")) return "EKYC_REVIEW";
        return "EKYC_HOME";
    };

    const breadcrumbs = [
        { icon: HomeIcon, path: "/digit-ui/citizen" },
        { label: t(getBreadcrumbLabel()) }
    ];

    return (
        <AppContainer>
            <div className="ground-container employee-app-container form-container">
                <ModuleHeader
                    leftContent={
                        <React.Fragment>
                            <ArrowLeft className="icon" />
                            {t("CS_COMMON_BACK")}
                        </React.Fragment>
                    }
                    onLeftClick={() => window.history.back()}
                    breadcrumbs={breadcrumbs}
                />

                <Switch>
                    <PrivateRoute
                        path={`${path}/create-kyc`}
                        component={() => <Create />}
                    />

                    <PrivateRoute
                        path={`${path}/aadhaar-verification`}
                        component={() => <AadhaarVerification />}
                    />

                    <PrivateRoute
                        path={`${path}/address-details`}
                        component={() => <AddressDetails />}
                    />

                    <PrivateRoute
                        path={`${path}/property-info`}
                        component={() => <PropertyInfo />}
                    />

                    <PrivateRoute
                        path={`${path}/meter-details`}
                        component={() => <MeterDetails />}
                    />
                    
                    <PrivateRoute
                        path={`${path}/review`}
                        component={() => <Review />}
                    />

                    <PrivateRoute
                        path={`${path}/`}
                        component={() => <Create />}
                    />
                </Switch>
            </div>
        </AppContainer>
    );
};

export default CitizenApp;
