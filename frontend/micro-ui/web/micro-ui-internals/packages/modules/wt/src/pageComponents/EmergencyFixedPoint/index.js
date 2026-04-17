import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { fixedPointConfig } from "../../config/fixedpoint-config";
import VerticalTimeline from "../../components/VerticalTimeline";

const WTEmergencyFixedPointCreate = () => {
  const queryClient = useQueryClient();
  const match = useRouteMatch();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const history = useHistory();

  // Separate session storage key so it doesn't collide with regular WT_Create
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("FP_Create", {});
  const userInfo = Digit.UserService.getUser();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const uuid = userInfo?.info?.uuid;
  const { data: userDetails } = Digit.Hooks.useUserSearch(tenantId, { uuid: [uuid] }, {}, { enabled: uuid ? true : false });

  // Build flat config array
  let config = [];
  fixedPointConfig.forEach((obj) => {
    config = config.concat(obj.body);
  });

  // Default indexRoute for employee flow
  config.indexRoute = "fp-info";

  // Clear params if navigating back to info page
  if (
    params &&
    Object.keys(params).length > 0 &&
    window.location.href.includes("/fp-info") &&
    sessionStorage.getItem("docReqScreenByBack") !== "true"
  ) {
    clearParams();
    queryClient.invalidateQueries("FP_Create");
  }

  /* ------------------------------------------------------------------ */
  /*                            NAVIGATION                               */
  /* ------------------------------------------------------------------ */

  const goNext = (skipStep, index, isAddMultiple, key) => {
    let currentPath = pathname.split("/").pop();
    let isMultiple = false;
    let nextPage;

    const lastchar = currentPath.charAt(currentPath.length - 1);
    if (Number(parseInt(currentPath)) || currentPath === "0" || currentPath === "-1") {
      if (currentPath === "-1" || currentPath === "-2") {
        currentPath = pathname.slice(0, -3).split("/").pop();
      } else {
        currentPath = pathname.slice(0, -2).split("/").pop();
      }
      isMultiple = true;
    } else {
      isMultiple = false;
    }
    if (!isNaN(lastchar)) isMultiple = true;

    let routeObj = config.find((r) => (key ? r.key === key : r.route === currentPath));
    if (!routeObj) routeObj = config.find((r) => r.route === currentPath);
    let { nextStep = {} } = routeObj || {};

    let redirectWithHistory = skipStep ? history.replace : history.push;
    if (isAddMultiple) nextStep = key;

    if (nextStep === null) {
      return redirectWithHistory(`${match.path}/fp-check`);
    }
    if (!isNaN(nextStep.split("/").pop())) {
      nextPage = `${match.path}/${nextStep}`;
    } else {
      nextPage = isMultiple && nextStep !== "map" ? `${match.path}/${nextStep}/${index}` : `${match.path}/${nextStep}`;
    }
    redirectWithHistory(nextPage);
  };

  /* ------------------------------------------------------------------ */
  /*                          SUBMIT / ACK                               */
  /* ------------------------------------------------------------------ */

  const wt_create = async () => {
    // Fixed point always submits as WT fixed point
    history.push(`${match.path}/fp-wt-acknowledgement`);
  };

  /* ------------------------------------------------------------------ */
  /*                         FORM STATE                                  */
  /* ------------------------------------------------------------------ */

  function handleSelect(key, data, skipStep, index, isAddMultiple = false) {
    if (key === "owners") {
      let owners = params.owners || [];
      owners[index] = data;
      setParams({ ...params, [key]: [...owners] });
    } else if (key === "units") {
      setParams({ ...params, units: data });
    } else {
      setParams({ ...params, [key]: { ...params[key], ...data } });
    }
    goNext(skipStep, index, isAddMultiple, key);
  }

  const onSuccess = () => {
    clearParams();
    queryClient.invalidateQueries("FP_Create");
  };

  /* ------------------------------------------------------------------ */
  /*                      SCROLL TO SECTION                              */
  /* ------------------------------------------------------------------ */

  const formStepRoutes = ["fp-applicant-details", "fp-address-details", "fp-request-details"];
  const isFormStep = formStepRoutes.some((route) => pathname.includes(route));
  const sectionRefs = useRef({});

  useEffect(() => {
    if (isFormStep) {
      const currentRoute = pathname.split("/").pop();
      if (sectionRefs.current[currentRoute]) {
        sectionRefs.current[currentRoute].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [pathname, isFormStep]);

  /* ------------------------------------------------------------------ */
  /*                      COMPONENT REGISTRY                             */
  /* ------------------------------------------------------------------ */

  const CheckPage     = Digit?.ComponentRegistryService?.getComponent("EmergencyFixedPointCheckPage");
  const WTAcknowledgement = Digit?.ComponentRegistryService?.getComponent("WTEmergencyFixedPointAcknowledgement");

  /* ------------------------------------------------------------------ */
  /*                           RENDER                                    */
  /* ------------------------------------------------------------------ */

  return (
    <React.Fragment>
      <div className="employee-form-section-wrapper">
        {!pathname.includes("/fp-info") && <VerticalTimeline config={config} showFinalStep={true} />}
        <div className="employee-form-section">
          <Switch>
            {/* Review / Check page */}
            <Route path={`${match.path}/fp-check`}>
              <CheckPage onSubmit={wt_create} value={params} />
            </Route>

            {/* Acknowledgement */}
            <Route path={`${match.path}/fp-wt-acknowledgement`}>
              <WTAcknowledgement data={params} onSuccess={onSuccess} />
            </Route>

            {/* Non-form-step routes (info page etc.) */}
            {config.map((routeObj, index) => {
              if (!formStepRoutes.includes(routeObj.route)) {
                const { component, texts, inputs, key, additionaFields } = routeObj;
                const Component =
                  typeof component === "string"
                    ? Digit.ComponentRegistryService.getComponent(component)
                    : component;
                return (
                  <Route path={`${match.path}/${routeObj.route}`} key={index}>
                    <Component
                      config={{ texts, inputs, key, additionaFields }}
                      onSelect={handleSelect}
                      t={t}
                      formData={params}
                      userDetails={userDetails?.user?.[0]}
                    />
                  </Route>
                );
              }
              return null;
            })}

            {/* Single-page scrollable form steps */}
            <Route path={formStepRoutes.map((route) => `${match.path}/${route}`)}>
              <div className="single-page-form-container">
                {config
                  .filter((routeObj) => formStepRoutes.includes(routeObj.route))
                  .map((routeObj, index) => {
                    const { component, texts, inputs, key, additionaFields } = routeObj;
                    const Component =
                      typeof component === "string"
                        ? Digit.ComponentRegistryService.getComponent(component)
                        : component;
                    return (
                      <div
                        key={index}
                        ref={(el) => (sectionRefs.current[routeObj.route] = el)}
                        className="form-section-unit"
                      >
                        <Component
                          config={{ ...routeObj, isCollapsible: true, defaultOpen: true }}
                          onSelect={handleSelect}
                          t={t}
                          formData={params}
                          userDetails={userDetails?.user?.[0]}
                        />
                      </div>
                    );
                  })}
              </div>
            </Route>

            {/* Default redirect */}
            <Route>
              <Redirect to={`${match.path}/${config.indexRoute}`} />
            </Route>
          </Switch>
        </div>
      </div>
    </React.Fragment>
  );
};

export default WTEmergencyFixedPointCreate;
