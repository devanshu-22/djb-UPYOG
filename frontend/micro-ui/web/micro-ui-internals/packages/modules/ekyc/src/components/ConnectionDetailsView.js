import React, { useState } from "react";
import { Loader, Modal, RadioButtons } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";

const ConnectionDetailsView = ({ kNumber, kName, connectionDetails, isLoading }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { path } = useRouteMatch();

  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState({ code: "SELF", name: "EKYC_SELF" });

  const options = [
    { code: "SELF", name: "EKYC_SELF" },
    { code: "OTHER", name: "EKYC_OTHER" },
  ];

  const handleStartVerification = () => setShowModal(true);

  const onModalConfirm = () => {
    const parentPath = path.includes("/create-kyc")
      ? path.replace("/create-kyc", "")
      : path.replace("/k-details", "");
    history.push(`${parentPath}/aadhaar-verification`, { kNumber, selectedOption, connectionDetails });
    setShowModal(false);
  };

  if (isLoading) return <Loader />;
  if (!connectionDetails) return null;

  const details = connectionDetails?.connectionDetails || {};
  const statusFlag = details.statusflag || "";
  const isActive = statusFlag?.toLowerCase() === "active" || statusFlag === "A";

  return (
    <React.Fragment>
      <div className="ekyc-employee-container">
        {/* Main Card */}
        <div className="connection-details-card">
          {/* Card Header */}
          <div className="details-card-header">
            <div className="header-title-wrapper">
              <div className="header-icon-bg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3A7BD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="header-title-text">
                {t("EKYC_K_NUMBER_DETAILS") || "Consumer Identity Details"}
              </span>
            </div>

            {/* Status Badge */}
            <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
              {isActive ? (t("EKYC_ACTIVE_CONNECTION") || "Active Connection") : (statusFlag || t("CS_NA"))}
            </span>
          </div>

          {/* Card Body */}
          <div className="details-card-body">
            <div className="body-content-row">
              {/* Left: Verification Parameters */}
              <div className="detail-section">
                <div className="section-title">
                  {t("EKYC_VERIFICATION_PARAMETERS") || "Verification Parameters"}
                </div>

                <div className="data-grid">
                  {/* Consumer Name */}
                  <div className="data-item">
                    <div className="data-label">
                      {t("EKYC_CONSUMER_NAME") || "Consumer Name"}
                    </div>
                    <div className="data-value">
                      {details.consumerName || kName || t("CS_NA")}
                    </div>
                  </div>

                  {/* K Number */}
                  <div className="data-item">
                    <div className="data-label">
                      {t("EKYC_K_NUMBER") || "K Number"}
                    </div>
                    <div className="data-value blue">
                      {kNumber || t("CS_NA")}
                    </div>
                  </div>

                  {/* Meter Serial No */}
                  <div className="data-item">
                    <div className="data-label">
                      {t("EKYC_METER_NO") || "Meter Serial No."}
                    </div>
                    <div className="data-value">
                      {details.meterNumber || t("CS_NA")}
                    </div>
                  </div>

                  {/* Connection Type */}
                  <div className="data-item">
                    <div className="data-label">
                      {t("EKYC_CONNECTION_TYPE") || "Connection Type"}
                    </div>
                    <div className="data-value">
                      {details.connectionType || t("CS_NA")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="vertical-divider" />

              {/* Right: Address & Contact */}
              <div className="detail-section">
                <div className="section-title">
                  {t("EKYC_ADDRESS_AND_CONTACT") || "Address & Contact"}
                </div>

                {/* Service Address */}
                <div className="address-block">
                  <div className="icon-wrapper-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7B8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="data-label">
                      {t("EKYC_ADDRESS") || "Service Address"}
                    </div>
                    <div className="address-text">
                      {details.address || t("CS_NA")}
                    </div>
                  </div>
                </div>

                {/* Contact + Email row */}
                <div className="contact-row">
                  {/* Contact */}
                  <div className="contact-item">
                    <div className="icon-wrapper-small">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7B8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    </div>
                    <div>
                      <div className="data-label">
                        {t("EKYC_PHONE_NO") || "Contact"}
                      </div>
                      <div className="address-text">
                        {details.phoneNumber || t("CS_NA")}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="contact-item">
                    <div className="icon-wrapper-small">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7B8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                      </svg>
                    </div>
                    <div>
                      <div className="data-label">
                        {t("EKYC_EMAIL") || "Email Address"}
                      </div>
                      <div className="address-text">
                        {details.email || t("CS_NA")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="details-card-footer">
            {/* Last Verified */}
            <div className="footer-meta-text">
              {connectionDetails?.lastVerified
                ? `${t("EKYC_LAST_VERIFIED") || "Last verified:"} ${connectionDetails.lastVerified}`
                : ""}
            </div>

            {/* Action Buttons */}
            <div className="action-btns-container">
              <button
                onClick={handleStartVerification}
                className="primary-action-btn"
              >
                {t("EKYC_START_VERIFICATION") || "Start Verification"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          headerBarMain={t("EKYC_SELECT_VERIFICATION_TYPE")}
          headerBarEnd={
            <span onClick={() => setShowModal(false)} style={{ cursor: "pointer", padding: "8px" }}>
              X
            </span>
          }
          actionSaveLabel={t("ES_COMMON_CONFIRM")}
          actionSaveOnSubmit={onModalConfirm}
          actionCancelLabel={t("ES_COMMON_CANCEL")}
          actionCancelOnSubmit={() => setShowModal(false)}
          style={{ borderRadius: "12px" }}
        >
          <div style={{ padding: "24px" }}>
            <RadioButtons
              options={options}
              optionsKey="name"
              selectedOption={selectedOption}
              onSelect={setSelectedOption}
              style={{ display: "flex", flexDirection: "column", gap: "12px", buttonStyle: { borderRadius: "5px" } }}
              t={t}
            />
          </div>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default ConnectionDetailsView;