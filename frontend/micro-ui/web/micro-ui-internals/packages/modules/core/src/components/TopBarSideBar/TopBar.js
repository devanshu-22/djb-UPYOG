import React from "react";
import { Hamburger, Calender } from "@djb25/digit-ui-react-components";
// import { useHistory, useLocation } from "react-router-dom";
import ChangeCity from "../ChangeCity";
import ChangeLanguage from "../ChangeLanguage";
import CustomUserDropdown from "./CustomUserDropdown";

const TopBar = ({
  t,
  stateInfo,
  toggleSidebar,
  isSidebarOpen,
  handleLogout,
  userDetails,
  CITIZEN,
  cityDetails,
  mobileView,
  userOptions,
  roleOptions = [],
  selectedRole = null,
  handleRoleChange,
  handleUserDropdownSelection,
  logoUrl,
  showLanguageChange = true,
  setSideBarScrollTop,
}) => {
  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return month >= 4 ? `FY ${year}-${(year + 1).toString().slice(-2)}` : `FY ${year - 1}-${year.toString().slice(-2)}`;
  };

  const financialYearStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1F2937",
  };
  const [profilePic, setProfilePic] = React.useState(null);
  const [zoneName, setZoneName] = React.useState(Digit.SessionStorage.get("Employee.zone"));
  const [designationName, setDesignationName] = React.useState(Digit.SessionStorage.get("Employee.designation"));

  React.useEffect(() => {
    const interval = setInterval(() => {
      const storedZone = Digit.SessionStorage.get("Employee.zone");
      if (storedZone && storedZone !== zoneName) {
        setZoneName(storedZone);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const storedDesignation = Digit.SessionStorage.get("Employee.designation");
      if (storedDesignation && storedDesignation !== designationName) {
        setDesignationName(storedDesignation);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    (async () => {
      const tenant = Digit.ULBService.getCurrentTenantId();
      const uuid = userDetails?.info?.uuid;
      if (uuid) {
        const usersResponse = await Digit.UserService.userSearch(tenant, { uuid: [uuid] }, {});
        if (usersResponse && usersResponse.user && usersResponse.user.length) {
          const userDetails = usersResponse.user[0];
          const thumbs = userDetails?.photo?.split(",");
          setProfilePic(thumbs?.at(0));
        }
      }
    })();
  }, [profilePic !== null, userDetails?.info?.uuid]);

  // const CitizenHomePageTenantId = Digit.ULBService.getCitizenCurrentTenant(true);

  // let history = useHistory();
  // const { pathname } = useLocation();

  // const conditionsToDisableNotificationCountTrigger = () => {
  //   if (Digit.UserService?.getUser()?.info?.type === "EMPLOYEE") return false;
  //   if (Digit.UserService?.getUser()?.info?.type === "CITIZEN") {
  //     if (!CitizenHomePageTenantId) return false;
  //     else return true;
  //   }
  //   return false;
  // };

  // const { data: { unreadCount: unreadNotificationCount } = {}, isSuccess: notificationCountLoaded } = Digit.Hooks.useNotificationCount({
  //   tenantId: CitizenHomePageTenantId,
  //   config: {
  //     enabled: conditionsToDisableNotificationCountTrigger(),
  //   },
  // });

  const updateSidebar = () => {
    if (!Digit.clikOusideFired) {
      toggleSidebar(true);
      setSideBarScrollTop(true);
    } else {
      Digit.clikOusideFired = false;
    }
  };

  // function onNotificationIconClick() {
  //   history.push("/digit-ui/citizen/engagement/notifications");
  // }

  // const urlsToDisableNotificationIcon = (pathname) =>
  //   !!window.keycloak?.token ? false : ["/digit-ui/citizen/select-language", "/digit-ui/citizen/select-location"].includes(pathname);

  if (CITIZEN) {
    const loggedIn = userDetails?.access_token ? true : false;
    return (
      <div className="topbar" style={CITIZEN ? { left: "0px", width: "100%", backgroundColor: "#FFFFFF" } : { backgroundColor: "#FFFFFF" }}>
        {mobileView ? <Hamburger handleClick={updateSidebar} color="#9E9E9E" /> : null}
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div
            className="brand"
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
            onClick={() => (window.location.href = "/digit-ui/citizen")}
          >
            <div
              className="brand-mark"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "10px",
                background: "#065297",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(12, 35, 64, 0.35)",
                overflow: "hidden",
              }}
            >
              <img src="https://objectstorage.ap-hyderabad-1.oraclecloud.com/n/axn3czn1s06y/b/djb-dev-asset-bucket/o/djb_logo.png" alt="DJB Logo" />
            </div>
            <div className="btx" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: "17px", fontWeight: "700", color: "#003366", margin: 0 }}>
                Delhi Jal Board
              </h1>
              <p style={{ fontSize: "10.5px", fontWeight: "500", color: "#0070B4", margin: 0 }}>Integrated Enterprise Management System</p>
            </div>
          </div>

          {!mobileView && (
            <div className="flex-right right w-80 column-gap-15">
              <div style={financialYearStyle}>
                <Calender width="20" height="20" />
                <span>{getFinancialYear()}</span>
              </div>
              <div className="left">{showLanguageChange && <ChangeLanguage dropdown={true} />}</div>
              <div style={{ width: "2px", height: "28px", backgroundColor: "rgb(203, 213, 225)" }}></div>

              {loggedIn && (
                <div className="left" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CustomUserDropdown
                    userOptions={userOptions}
                    roleOptions={[]}
                    selectedRole={null}
                    handleRoleChange={() => {}}
                    profilePic={profilePic}
                    userName={userDetails?.info?.name || userDetails?.info?.userInfo?.name || "Citizen"}
                    t={t}
                  />
                </div>
              )}

              <img
                className="state"
                src="https://objectstorage.ap-hyderabad-1.oraclecloud.com/n/axn3czn1s06y/b/djb-dev-asset-bucket/o/SBM_IMG.png"
                alt="SBM Img"
              />
            </div>
          )}
        </span>
      </div>
    );
  }
  const loggedin = window.keycloak?.token ? true : false;

  return (
    <div className="topbar" style={{ backgroundColor: "#FFFFFF" }}>
      {mobileView ? <Hamburger handleClick={toggleSidebar} color="#9E9E9E" /> : null}
      <span className="topbar-content">
        <div
          className="brand"
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
          onClick={() => (window.location.href = "/digit-ui/employee")}
        >
          <div
            className="brand-mark"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "10px",
              background: "#065297",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(12, 35, 64, 0.35)",
              overflow: "hidden",
            }}
          >
            <img src="https://objectstorage.ap-hyderabad-1.oraclecloud.com/n/axn3czn1s06y/b/djb-dev-asset-bucket/o/djb_logo.png" alt="DJB Logo" />
          </div>
          <div className="btx" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: "17px", fontWeight: "700", color: "#003366", margin: 0 }}>Delhi Jal Board</h1>
            <p style={{ fontSize: "10.5px", fontWeight: "500", color: "#0070B4", margin: 0 }}>Integrated Enterprise Management System</p>
          </div>
        </div>

        {!loggedin && (
          <p className="ulb" style={mobileView ? { fontSize: "14px", display: "inline-block" } : {}}>
            {t(`MYCITY_${stateInfo?.code?.toUpperCase()}_LABEL`)} {t(`MYCITY_STATECODE_LABEL`)}
          </p>
        )}
        {!mobileView && (
          <div className={mobileView ? "right" : "flex-right right w-80 mx-4 column-gap-15"} style={!loggedin ? { width: "80%" } : {}}>
            <div className="left">
              {!window.location.href.includes("employee/user/login") && !window.location.href.includes("employee/user/language-selection") && (
                <ChangeCity dropdown={true} t={t} />
              )}
            </div>
            <div style={financialYearStyle}>
              <Calender width="20" height="20" />
              <span>{getFinancialYear()}</span>
            </div>
            <div style={{ width: "2px", height: "28px", backgroundColor: "rgb(203, 213, 225)" }}></div>
            <div className="left">{showLanguageChange && <ChangeLanguage dropdown={true} />}</div>
            <div style={{ width: "2px", height: "28px", backgroundColor: "rgb(203, 213, 225)" }}></div>

            {userDetails?.access_token && (
              <div className="left" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <CustomUserDropdown
                  userOptions={userOptions}
                  roleOptions={roleOptions}
                  selectedRole={selectedRole}
                  handleRoleChange={handleRoleChange}
                  profilePic={profilePic}
                  userName={userDetails?.info?.name || userDetails?.info?.userInfo?.name || "Employee"}
                  t={t}
                />
              </div>
            )}
            <img
              className="spect-icon"
              src="https://objectstorage.ap-hyderabad-1.oraclecloud.com/n/axn3czn1s06y/b/djb-dev-asset-bucket/o/SBM_IMG.png"
              alt="Swatch Bharat Icon"
            />
          </div>
        )}
      </span>
    </div>
  );
};

export default TopBar;
