import React, { useState } from "react";
import { TextInput, Card, HomeIcon } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const SearchConsumer = ({ onSearch, searchParams, FilterComponent, children, ...props }) => {
  const { t } = useTranslation();
  const [_searchParams, setSearchParams] = useState(() => ({ ...searchParams }));

  const onChange = (key, value) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onSearch(_searchParams);
  };

  const onClear = () => {
    const cleared = { kNumber: "", kName: "" };
    setSearchParams(cleared);
    onSearch(cleared);
  };

  return (
    <div className="ekyc-employee-container">
      <div className="search-consumer-wrapper">
        <div className="header-wrapper">
          {/* Sidebar Title Card — flush top, full width */}
          <Card className="sidebar-title-card">
            <div className="icon-container">
              <HomeIcon />
            </div>
            <div className="title-text">
              {t("EKYC_SEARCH_CONSUMER_HEADER")}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="main-content-wrapper">
          {/* Top Row: Search Card + Stats Cards */}
          <div className="search-stats-row">
            {/* Identity Lookup Card */}
            <div className="identity-lookup-card">
              {/* Card Title */}
              <div className="lookup-card-title">
                <div className="lookup-icon-bg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A7BD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <span className="lookup-title-text">
                  {t("EKYC_IDENTITY_LOOKUP") || "Identity Lookup"}
                </span>
              </div>

              {/* Inputs Row */}
              <form onSubmit={onSubmit}>
                <div className="inputs-row">
                  <div className="input-group">
                    <label>
                      {t("EKYC_K_NUMBER") || "K Number"}
                      <span className="info-badge">i</span>
                    </label>
                    <TextInput
                      value={_searchParams?.kNumber}
                      onChange={(e) => onChange("kNumber", e.target.value)}
                      placeholder={t("EKYC_K_NUMBER_PLACEHOLDER") || "e.g. 8234910234"}
                    />
                  </div>

                  <div className="input-group">
                    <label>
                      {t("EKYC_K_NAME") || "K Name"}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3A7BD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </label>
                    <TextInput
                      value={_searchParams?.kName}
                      onChange={(e) => onChange("kName", e.target.value)}
                      placeholder={t("EKYC_K_NAME_PLACEHOLDER") || "Consumer name search"}
                    />
                  </div>
                </div>

                {/* Actions Row */}
                <div className="actions-row">
                  <button type="button" onClick={onClear} className="clear-btn">
                    {t("ES_COMMON_CLEAR") || "Clear"}
                  </button>
                  <button type="submit" className="search-btn">
                    {t("ES_COMMON_SEARCH") || "Execute Search"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Stats Column */}
            <div className="stats-column">
              {/* Today's Audits Card */}
              <div className="audits-card">
                <div className="audits-label">{t("EKYC_TODAYS_AUDITS") || "Today's Audits"}</div>
                <div className="audits-count">{props.countData?.todaysAudits || 24}</div>
                <div className="audits-change">
                  <span>↗</span>
                  {props.countData?.auditChange || "12% increase from yesterday"}
                </div>
                <div className="audits-watermark">M</div>
              </div>

              {/* Queue Status Card */}
              <div className="queue-card">
                <div className="queue-label">{t("EKYC_QUEUE_STATUS") || "Queue Status"}</div>
                <div className="queue-content">
                  <div className="queue-status-text">
                    {props.countData?.pendingCount || 3} Pending
                  </div>
                  <div className="avatar-group">
                    {[0, 1].map((i) => (
                      <div key={i} className="avatar-item">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    <div className="avatar-more">+1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Children (ConnectionDetailsView or placeholder) */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default SearchConsumer;