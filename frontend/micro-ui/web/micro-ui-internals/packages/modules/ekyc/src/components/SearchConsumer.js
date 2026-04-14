import React, { useState, Fragment } from "react";
import { TextInput, Card, SubmitBar, Header, HomeIcon } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import StatusCards from "./StatusCards";

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
    <div className="inbox-container">
      <div className="filters-container">
        {/* Sidebar Title Card */}
        <Card
          className="sidebar-title-card"
          style={{ display: "flex", alignItems: "center", padding: "16px", marginBottom: "16px", borderRadius: "4px" }}
        >
          <div className="icon-container" style={{ color: "#3A8DCC", marginRight: "12px" }}>
            <HomeIcon style={{ width: "24px", height: "24px" }} />
          </div>
          <div style={{ fontWeight: "700", fontSize: "18px", color: "#0B0C0C" }}>{t("ACTION_CREATE_EKYC")}</div>
        </Card>

        <div>
          {FilterComponent && (
            <FilterComponent
              defaultSearchParams={props.defaultSearchParams}
              onFilterChange={props.onSearch}
              searchParams={searchParams}
              type="desktop"
              moduleCode="EKYC"
            />
          )}
        </div>
      </div>

      <div style={{ flex: 1, marginLeft: "16px" }}>
        {/* <Card className="ekyc-metrics-card" style={{ marginBottom: "16px", padding: "16px" }}>
                    <StatusCards countData={props.countData} />
                </Card> */}

        <Card
          className="ekyc-search-card"
          style={{ padding: "24px", marginBottom: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        >
          <Header style={{ fontSize: "24px", marginBottom: "20px", fontWeight: "700", color: "#0B0C0C" }}>{t("EKYC_SEARCH_CONSUMER_HEADER")}</Header>
          <form onSubmit={onSubmit}>
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: "1", minWidth: "250px" }}>
                <div className="filter-label" style={{ fontWeight: "600", marginBottom: "8px", fontSize: "14px", color: "#505A5F" }}>
                  {t("EKYC_K_NUMBER")}
                </div>
                <div style={{ position: "relative" }}>
                  <TextInput
                    value={_searchParams?.kNumber}
                    onChange={(e) => onChange("kNumber", e.target.value)}
                    placeholder={t("EKYC_K_NUMBER_PLACEHOLDER")}
                    style={{ borderRadius: "8px", paddingLeft: "12px", height: "44px" }}
                  />
                </div>
              </div>

              <div style={{ flex: "1", minWidth: "250px" }}>
                <div className="filter-label" style={{ fontWeight: "600", marginBottom: "8px", fontSize: "14px", color: "#505A5F" }}>
                  {t("EKYC_K_NAME")}
                </div>
                <div style={{ position: "relative" }}>
                  <TextInput
                    value={_searchParams?.kName}
                    onChange={(e) => onChange("kName", e.target.value)}
                    placeholder={t("EKYC_K_NAME_PLACEHOLDER")}
                    style={{ borderRadius: "8px", paddingLeft: "12px", height: "44px" }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={onClear}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0076f3ff",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "10px",
                  }}
                >
                  {t("ES_COMMON_CLEAR")}
                </button>

                <SubmitBar
                  label={t("ES_COMMON_SEARCH")}
                  onSubmit={onSubmit}
                  style={{
                    margin: 0,
                    borderRadius: "8px",
                    height: "44px",
                    padding: "0 32px",
                    // ❌ remove this (it breaks alignment)
                    // marginTop: "-55px"
                  }}
                />
              </div>
            </div>
          </form>
        </Card>
        {children}
      </div>
    </div>
  );
};

export default SearchConsumer;
