import React from "react";

const RegistrationSuccess = ({ t, params, history, showToast, closeToast, Toast, StatusTable, Row, TickMark }) => {
  return (
    <div className="Citizen_register registration-page-container">
      <div className="registration-card">
        <div className="registration__wrapper">
          {/* Sidebar */}
          <div style={{ minWidth: "33.33%" }} className="registration__sidebar">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p className="registration__sidebar-title">{t("CITIZEN_REGISTRATION_PORTAL", "Citizen Registration Portal")}</p>

                <div className="registration__step">
                  <div className="success-icon-wrapper">
                    <div className="icon-outer">
                      <div className="icon-inner">
                        <TickMark size="60" color="rgb(5, 150, 105)" />
                      </div>
                    </div>

                    <h2 className="registration__sidebar-title">{t("CORE_COMMON_ALL_DONE", "All Done!")}</h2>

                    <p className="registration__sidebar-title">
                      {t("CORE_COMMON_REGISTRATION_SUCCESS_DESC", "You have been successfully registered with Delhi Jal Board.")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sidebar-footer">{t("CORE_COMMON_COPYRIGHT_FOOTER", "© 2026 Delhi Jal Board. All rights reserved.")}</div>
            </div>
          </div>

          {/* Content */}
          <div className="registration-content">
            <div className="content-wrapper">
              <h1>{t("CORE_COMMON_LOGIN_CREDENTIALS")}</h1>

              <p>
                {t(
                  "CORE_COMMON_REGISTRATION_COMPLETE_DESC",
                  "Your registration is complete. Please use your registered mobile number as your username to continue."
                )}
              </p>

              <div className="credentials-box">
                <StatusTable>
                  <Row
                    label={t("CORE_COMMON_USERNAME", "Username")}
                    text={params?.mobileNumber}
                    textStyle={{ fontWeight: "600", color: "#1E293B" }}
                  />
                  <Row
                    label={t("CORE_COMMON_PASSWORD", "Password")}
                    text={t("CORE_COMMON_PASSWORD_SENT_SMS", "Sent via SMS to your mobile")}
                    textStyle={{ color: "#059669", fontWeight: "600" }}
                  />
                </StatusTable>
              </div>

              <button className="continue-btn" onClick={() => history.push("/digit-ui/citizen/login")}>
                {t("CORE_COMMON_CONTINUE_TO_LOGIN")}
              </button>
            </div>
          </div>
        </div>

        {showToast && <Toast label={showToast.label} error={showToast.error} onClose={closeToast} />}
      </div>
    </div>
  );
};

export default RegistrationSuccess;
