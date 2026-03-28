import React, { useState } from "react";
import { Card, Menu, AddIcon, TextInput, Dropdown, Label, SubmitBar, Toast } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, Link } from "react-router-dom";
import LocalityModal from "./LocalityModal";
import ApplicationTable from "./inbox/ApplicationTable";

const SearchFillingPointAddress = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState("FIXED_POINT");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [status, setStatus] = useState(null);
  const [fixedPointStatus, setFixedPointStatus] = useState(null);
  const [appliedFixedPointStatus, setAppliedFixedPointStatus] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [toast, setToast] = useState(null);
  const [showLocalityModal, setShowLocalityModal] = useState(false);
  const [selectedLocalityRow, setSelectedLocalityRow] = useState(null);
  const [modalMode, setModalMode] = useState("ADD"); // ADD, UPDATE, VIEW
  const [pageSize, setPageSize] = useState(10);
  const [pageOffset, setPageOffset] = useState(0);

  const tenantId = Digit.ULBService.getCurrentTenantId();

  const closeToast = () => {
    setToast(null);
  };

  // ✅ Hooks for Search
  const { isLoading: isFixedLoading, data: fixedPointData, refetch: refetchFixed } = Digit.Hooks.wt.useFixedPointSearchAPI(
    {
      tenantId,
      filters: { ...searchParams, offset: pageOffset, limit: pageSize },
    },
    { enabled: selectedTab === "FIXED_POINT" }
  );

  const { isLoading: isFillingLoading, data: fillingPointData, refetch: refetchFilling } = Digit.Hooks.wt.useFillPointSearch(
    {
      tenantId,
      filters: { ...searchParams, offset: pageOffset, limit: pageSize },
    },
    { enabled: selectedTab === "FILLING_POINT" }
  );

  // ✅ Hook to fetch all filling points for mapping dropdown
  const { isLoading: isAllFillingPointsLoading, data: allFillingPointsData } = Digit.Hooks.wt.useFillPointSearch(
    {
      tenantId,
      filters: { limit: 1000 },
    },
    { enabled: true }
  );

  const allFillingPoints = allFillingPointsData?.fillingPoints || [];

  // ✅ Hook for Mapping
  const { mutate: mapFixedFilling } = Digit.Hooks.wt.useVendorFillingMapping(tenantId);

  const isLoading = selectedTab === "FIXED_POINT" ? isFixedLoading : isFillingLoading;
  const tableData = React.useMemo(() => {
    let data = (selectedTab === "FIXED_POINT" ? fixedPointData?.waterTankerBookingDetail : fillingPointData?.fillingPoints) || [];

    if (selectedTab === "FIXED_POINT" && appliedFixedPointStatus?.code) {
      data = data.filter((item) => {
        const isMapped =
          item.fillingPointId ||
          item.fillingpointmetadata?.fillingPointId ||
          item.fillingPtName ||
          item.filling_pt_name ||
          (item.fillingPoint && typeof item.fillingPoint === "object" ? item.fillingPoint?.id : item.fillingPoint) ||
          item.fillingPointDetail?.id ||
          item.fillingPointDetail?.bookingId;

        if (appliedFixedPointStatus.code === "MAPPED") return !!isMapped;
        if (appliedFixedPointStatus.code === "UNMAPPED") return !isMapped;
        return true;
      });
    }
    return data;
  }, [fixedPointData, fillingPointData, selectedTab, appliedFixedPointStatus]);

  // ✅ Dynamic config
  const searchConfig = {
    FIXED_POINT: {
      label: "WT_FIXING_POINT_APPLICANT_DETAILS",
      placeholder: "WT_ENTER_FIXED_POINT_NAME",
    },
    FILLING_POINT: {
      label: "WT_FILLING_POINT_CODE",
      placeholder: "WT_ENTER_FILLING_POINT_NAME",
    },
  };

  const statusOptions = [
    { i18nKey: "WT_FILLING_POINT_DESIGNATION_AE", code: "DESIGNATION_AE" },
    { i18nKey: "WT_FILLING_POINT_DESIGNATION_JE", code: "DESIGNATION_JE" },
    { i18nKey: "WT_FILLING_POINT_DESIGNATION_EE", code: "DESIGNATION_EE" },
  ];

  const FixedPointStatus = [
    { i18nKey: "WT_FIXED_POINT_MAPPED", code: "MAPPED" },
    { i18nKey: "WT_FIXED_POINT_UNMAPPED", code: "UNMAPPED" },
  ];

  const { label, placeholder } = searchConfig[selectedTab];

  // ✅ Handlers
  const clearSearch = () => {
    setSearchValue("");
    setMobileNumber("");
    setStatus(null);
    setFixedPointStatus(null);
    setAppliedFixedPointStatus(null);
    setSearchParams({});
  };

  const onTabChange = (tab) => {
    setSelectedTab(tab);
    clearSearch();
    setPageOffset(0);
    // Re-trigger search with empty filters for the new tab
    setSearchParams({});
  };

  const onAddClick = () => {
    setShowAddMenu((prev) => !prev);
  };

  const onActionSelect = (option) => {
    if (option === "FILLING_POINT") {
      history.push(`/digit-ui/employee/wt/add-filling-point-address`);
    } else if (option === "FIXED_POINT") {
      history.push(`/digit-ui/employee/wt/add-fix-point-address`);
    }
    setShowAddMenu(false);
  };

  const onSearch = () => {
    const filters = {
      name: searchValue,
      ...(selectedTab === "FILLING_POINT" ? { mobileNo: mobileNumber } : { mobileNumber: mobileNumber }),
      status: selectedTab === "FILLING_POINT" ? status?.code : null,
    };
    setAppliedFixedPointStatus(fixedPointStatus);
    setSearchParams(filters);
    setPageOffset(0);
  };

  const onFillingPointSelect = (row, value) => {
    const payload = {
      fixedFillingPointMapping: {
        fixed_pt_name: row.original.applicantDetail?.applicantId,
        filling_pt_name: value.id || value.bookingId || value.fillingPointId || value.uuid || value.fillingpointmetadata?.fillingPointId,
      },
    };

    mapFixedFilling(payload, {
      onSuccess: () => {
        setToast({ label: t("WT_FIXED_FILLING_MAPPING_SUCCESS") });
        setTimeout(closeToast, 5000);
        refetchFixed();
      },
      onError: (err) => {
        setToast({
          label: err?.response?.data?.Errors?.[0]?.message || t("WT_FIXED_FILLING_MAPPING_FAIL"),
          error: true,
        });
        setTimeout(closeToast, 5000);
      },
    });
  };

  const handleLocalityAdd = (row, mode = "ADD") => {
    setSelectedLocalityRow(row.original);
    setModalMode(mode);
    setShowLocalityModal(true);
  };

  // ✅ Hooks for Locality Linking
  const { mutate: linkLocality } = Digit.Hooks.wt.useLinkFillingPointLocality(tenantId);
  const { mutate: updateLocality } = Digit.Hooks.wt.useUpdateFillingPointLocality(tenantId);

  const onLocalityModalSubmit = (data) => {
    const payload = {
      FillingPointLocality: data.locality.map((loc) => ({
        fillingPointId: selectedLocalityRow.bookingId || selectedLocalityRow.id,
        localityCode: loc.code,
      })),
    };

    const mutation = modalMode === "UPDATE" ? updateLocality : linkLocality;

    mutation(payload, {
      onSuccess: () => {
        setToast({ label: t(modalMode === "UPDATE" ? "WT_LOCALITY_UPDATE_SUCCESS" : "WT_LOCALITY_LINKING_SUCCESS") });
        setShowLocalityModal(false);
        setTimeout(closeToast, 5000);
        if (selectedTab === "FIXED_POINT") refetchFixed();
        else refetchFilling();
      },
      onError: (err) => {
        setToast({
          label: err?.response?.data?.Errors?.[0]?.message || t("WT_LOCALITY_LINKING_FAIL"),
          error: true,
        });
        setTimeout(closeToast, 5000);
      },
    });
  };

  const columns = React.useMemo(() => {
    if (selectedTab === "FIXED_POINT") {
      return [
        {
          Header: t("WT_FIXING_POINT_APPLICANT_DETAILS"),
          accessor: (row) => row?.applicantDetail?.name || "NA",
          id: "applicantName",
          Cell: ({ row }) => (
            <span className="link">
              <Link to={`/digit-ui/employee/wt/add-fix-point-address?id=${row.original.bookingId}`}>
                {row.original.applicantDetail?.name || "NA"}
              </Link>
            </span>
          ),
        },
        {
          Header: t("WT_MOBILE_NUMBER"),
          accessor: (row) => row?.applicantDetail?.mobileNumber || "NA",
          id: "mobileNumber",
        },
        {
          Header: t("WT_LOCALITY"),
          accessor: (row) => row?.address?.locality || "NA",
          id: "locality",
        },

        {
          Header: t("WT_FILLING_POINT"),
          accessor: (row) =>
            row?.fillingPointId ||
            row?.fillingpointmetadata?.fillingPointId ||
            row?.fillingPtName ||
            row?.filling_pt_name ||
            row?.fillingPoint ||
            "NA",
          id: "fillingPoint",
          Cell: ({ row }) => {
            const rowFpId = String(
              row.original.fillingPointId ||
                row.original.fillingpointmetadata?.fillingPointId ||
                row.original.fillingPtName ||
                row.original.filling_pt_name ||
                (row.original.fillingPoint && typeof row.original.fillingPoint === "object"
                  ? row.original.fillingPoint?.id
                  : row.original.fillingPoint) ||
                row.original.fillingPointDetail?.id ||
                row.original.fillingPointDetail?.bookingId ||
                ""
            );

            const selectedOption = allFillingPoints?.find((fp) => {
              const fpId = String(fp.id || fp.bookingId || fp.fillingPointId || fp.uuid || fp.fillingpointmetadata?.fillingPointId);
              return fpId === rowFpId && rowFpId !== "undefined" && rowFpId !== "null" && rowFpId !== "";
            });

            return (
              <Dropdown
                className="fsm-registry-dropdown"
                selected={selectedOption}
                option={allFillingPoints}
                select={(value) => onFillingPointSelect(row, value)}
                style={{ textAlign: "left" }}
                optionKey="fillingPointName"
                t={t}
              />
            );
          },
        },
      ];
    } else {
      return [
        {
          Header: t("WT_FILLING_POINT_CODE"),
          accessor: (row) => row?.fillingPointName || "NA",
          id: "fillingPointName",
          Cell: ({ row }) => (
            <span className="link">
              <Link to={`/digit-ui/employee/wt/add-filling-point-address?id=${row.original.id}`}>{row.original.fillingPointName || "NA"}</Link>
            </span>
          ),
        },
        {
          Header: t("WT_AE_NAME"),
          accessor: (row) => row?.aeName || "NA",
          id: "aeName",
        },
        {
          Header: t("WT_JE_NAME"),
          accessor: (row) => row?.jeName || "NA",
          id: "jeName",
        },
        {
          Header: t("WT_EE_NAME"),
          accessor: (row) => row?.eeName || "NA",
          id: "eeName",
        },
        {
          Header: t("WT_LOCALITY"),
          // accessor: (row) => row?.address?.locality || "NA",
          Cell: ({ row }) => {
            const localities =
              row.original?.fillingPointLocalityCodes?.length > 0
                ? row.original.fillingPointLocalityCodes.join(", ")
                : row.original?.address?.locality || "NA";
            return (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{localities}</span>
              </div>
            );
          },
        },
        {
          Header: t("WT_ADD_LOCALITY"),
          Cell: ({ row }) => {
            const hasLocality =
              row.original?.fillingPointLocalityCodes?.length > 0 || (row.original?.address?.locality && row.original?.address?.locality !== "NA");
            return (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {!hasLocality ? (
                  <button
                    onClick={() => handleLocalityAdd(row, "ADD")}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#f4f4f4",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "4px 8px",
                    }}
                  >
                    <AddIcon styles={{ width: "16px", height: "16px" }} fill="#1D4E7F" />
                    {t("CS_COMMON_ADD")}
                  </button>
                ) : (
                  <React.Fragment>
                    <button
                      onClick={() => handleLocalityAdd(row, "VIEW")}
                      style={{
                        cursor: "pointer",
                        background: "#fff",
                        border: "1px solid #1D4E7F",
                        color: "#1D4E7F",
                        borderRadius: "4px",
                        padding: "4px 12px",
                      }}
                    >
                      {t("CS_COMMON_VIEW")}
                    </button>
                    <button
                      onClick={() => handleLocalityAdd(row, "UPDATE")}
                      style={{
                        cursor: "pointer",
                        background: "#1D4E7F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 12px",
                      }}
                    >
                      {t("CS_COMMON_UPDATE")}
                    </button>
                  </React.Fragment>
                )}
              </div>
            );
          },
        },
      ];
    }
  }, [allFillingPoints, selectedTab, t]);

  const isMobile = window.Digit.Utils.browser.isMobile();

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - pageSize);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const fixedLength = fixedPointData?.waterTankerBookingDetail?.length || 0;
  const fillingLength = fillingPointData?.fillingPoints?.length || 0;

  return (
    <React.Fragment>
      <Card>
        {/* 🔹 Tabs + Add */}
        <div className="search-tabs-container" style={{ flexDirection: isMobile ? "column" : "row", gap: isMobile ? "16px" : "0" }}>
          <div>
            <button
              className={selectedTab === "FIXED_POINT" ? "search-tab-head-selected" : "search-tab-head"}
              onClick={() => onTabChange("FIXED_POINT")}
              style={{ width: isMobile ? "50%" : "auto" }}
            >
              {t("WT_FIXED_POINT")}
            </button>

            <button
              className={selectedTab === "FILLING_POINT" ? "search-tab-head-selected" : "search-tab-head"}
              onClick={() => onTabChange("FILLING_POINT")}
              style={{ width: isMobile ? "50%" : "auto" }}
            >
              {t("WT_FILLING_POINT")}
            </button>
          </div>

          <div className="action-bar-wrap-registry" style={{ alignSelf: isMobile ? "flex-end" : "auto" }}>
            <div className="search-add" onClick={onAddClick}>
              {t("ES_VENDOR_REGISTRY_INBOX_HEADER_ADD")}
              <div className="search-add-icon">
                <AddIcon />
              </div>
            </div>

            {showAddMenu && (
              <Menu localeKeyPrefix={"ES_FSM_ACTION_CREATE"} options={["FIXED_POINT", "FILLING_POINT"]} t={t} onSelect={onActionSelect} />
            )}
          </div>
        </div>

        {/* 🔥 Search Section (same card) */}
        <div className="finance-mainlayout">
          <div className="finance-mainlayout-col1">
            <Label>{t(label)}</Label>
            <TextInput value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder={t(placeholder)} />
          </div>

          <div className="finance-mainlayout-col1">
            <Label>{t("WT_MOBILE_NUMBER")}</Label>
            <TextInput
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder={t("WT_ENTER_MOBILE_NUMBER")}
              validation={{
                pattern: /^[6-9]\d{9}$/,
              }}
            />
          </div>

          {selectedTab === "FIXED_POINT" && (
            <div className="finance-mainlayout-col1">
              <Label>{t("WT_FIXED_POINT_STATUS")}</Label>
              <Dropdown option={FixedPointStatus} optionKey="i18nKey" selected={fixedPointStatus} select={setFixedPointStatus} t={t} />
            </div>
          )}

          {selectedTab === "FILLING_POINT" && (
            <div className="finance-mainlayout-col1">
              <Label>{t("WT_FILLING_POINT_DESIGNATION")}</Label>
              <Dropdown option={statusOptions} optionKey="i18nKey" selected={status} select={setStatus} t={t} />
            </div>
          )}
          <div
            style={{
              display: "flex",
              marginTop: "32px",
              justifyContent: isMobile ? "center" : "flex-end",
              flexDirection: isMobile ? "column-reverse" : "row",
              gap: "16px",
            }}
          >
            <span className="clear-search" onClick={clearSearch} style={{ alignSelf: "center" }}>
              {t("ES_COMMON_CLEAR_SEARCH")}
            </span>
            <SubmitBar label={t("ES_COMMON_SEARCH")} onSubmit={onSearch} />
          </div>
        </div>
      </Card>

      {/* 🔹 Table */}
      <Card>
        <ApplicationTable
          key={allFillingPoints?.length > 0 ? "loaded" : "loading"}
          data={tableData}
          columns={columns}
          pageSize={pageSize}
          getCellProps={() => ({
            style: {
              padding: "20px 18px",
              fontSize: "16px",
            },
          })}
          styles={{ minWidth: "1200px" }}
          inboxStyles={{ overflowX: "auto" }}
          t={t}
          isLoading={isLoading || isAllFillingPointsLoading}
          onPageSizeChange={handlePageSizeChange}
          currentPage={Math.floor(pageOffset / pageSize)}
          onNextPage={fetchNextPage}
          onPrevPage={fetchPrevPage}
          pageSizeLimit={pageSize}
          totalRecords={fixedLength + fillingLength}
          showPagination={true}
          showPageSizeOptions={true}
          isSearchRequired={false}
          isDownloadRequired={true}
          isFilterRequired={true}
          isSortRequired={true}
        />
      </Card>
      {toast && <Toast error={toast.error} label={toast.label} onClose={closeToast} />}
      {showLocalityModal && (
        <LocalityModal
          t={t}
          closeModal={() => setShowLocalityModal(false)}
          onSubmit={onLocalityModalSubmit}
          initialValues={selectedLocalityRow}
          tenantId={tenantId}
          modalMode={modalMode}
        />
      )}
    </React.Fragment>
  );
};

export default SearchFillingPointAddress;
