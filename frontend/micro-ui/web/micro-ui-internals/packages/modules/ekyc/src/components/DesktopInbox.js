import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, SubmitBar, Header, Card, HomeIcon, PersonIcon, Modal, Loader } from "@djb25/digit-ui-react-components";
import { Link, useHistory } from "react-router-dom";
import StatusCards from "./StatusCards";
import Review from "../pages/employee/Review";

const DesktopInbox = ({ tableConfig, filterComponent, ...props }) => {
  const {
    data,
    isLoading,
    onSort,
    onNextPage,
    onPrevPage,
    currentPage,
    pageSizeLimit,
    onPageSizeChange,
    parentRoute,
    searchParams,
    sortParams,
    totalRecords,
    countData,
    onSearch,
    searchFields,
  } = props;
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [FilterComponent, setComp] = React.useState(() => Digit.ComponentRegistryService?.getComponent(filterComponent));

  // State for Review Modal
  const [selectedKno, setSelectedKno] = useState("");
const {data:reviewData,isLoading:isReviewLoading,getReview}=Digit.Hooks.ekyc.useEkycAPI("review",tenantId);
  const handleReview = (kno) => {
    setSelectedKno(kno);
    getReview({ kno });
  };

  React.useEffect(() => {
    if (reviewData) {
      history.push("/digit-ui/employee/ekyc/review", { kNumber: selectedKno, aadhaarData: reviewData?.aadhaarData, reviewData });
    }
  }, [reviewData]);

  const columns = useMemo(
    () => [
      {
        Header: t("EKYC_APPLICATION_NO"),
        accessor: "applicationNumber",
        Cell: ({ row }) => {
          const kno = row.original?.kno || row.original?.applicationNumber || "NA";
          return (
            <span
              className="ekyc-application-link"
              style={{ color: "#add8f7", cursor: "pointer", fontWeight: "bold" }}
              onClick={() => handleReview(kno)}
            >
              {kno}
            </span>
          );
        },
      },
      {
        Header: t("EKYC_CITIZEN_NAME"),
        accessor: "citizenName",
        Cell: ({ row }) => <span>{row.original?.citizenName || "NA"}</span>,
      },
      // {
      //   Header: t("EKYC_MOBILE_NO"),
      //   accessor: "mobileNumber",
      //   Cell: ({ row }) => <span>{row.original?.mobileNumber || "NA"}</span>,
      // },
      {
        Header: t("EKYC_STATUS"),
        accessor: "actionStatus",
        Cell: ({ row }) => {
          const status = row.original?.status || "DEFAULT";
          return <span className={`ekyc-status-tag ${status}`}>{t(`${status}`)}</span>;
        },
      },
      {
        Header: t("EKYC_ACTION"),
        accessor: "status",
        Cell: ({ row }) => {
          const kno = row.original?.kno || row.original?.applicationNumber || "NA";
          return <span className="ekyc-application-link" style={{ color: "#add8f7", cursor: "pointer", fontWeight: "bold" }}
          onClick={()=>handleReview(kno)}>{t("EKYC_REVIEW")}</span>;
        },
      },
    ],
    [t, parentRoute]
  );

  const tableData = useMemo(() => {
    return data?.items || [];
  }, [data]);

  return (
    <div className="inbox-container">
      {isLoading && <Loader />}
      <div className="filters-container">
        {/* Sidebar Title Card */}
        <Card
          className="sidebar-title-card"
          style={{ display: "flex", alignItems: "center", padding: "16px", marginBottom: "16px", borderRadius: "4px" }}
        >
          <div className="icon-container" style={{ color: "#3A8DCC", marginRight: "12px" }}>
            <HomeIcon style={{ width: "24px", height: "24px" }} />
          </div>
          <div style={{ fontWeight: "700", fontSize: "18px", color: "#0B0C0C" }}>{t("ACTION_TEST_EKYC")}</div>
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
        {/* Header Section (retaining for context/actions) */}
        {/* <div className="ekyc-header-container module-header" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Header className="title" style={{ margin: 0 }}>{t("EKYC_INBOX_HEADER")}</Header>
                    <Link to={`${parentRoute}/create-kyc`}>
                        <SubmitBar label={t("EKYC_CREATE_KYC")} style={{ borderRadius: "8px" }} />
                    </Link>
                </div> */}

        {/* Metrics Section (The Card) */}
        <Card className="ekyc-metrics-card" style={{ marginBottom: "16px", padding: "16px" }}>
          <StatusCards countData={countData} />
        </Card>

        {/* Table Section */}
        <div className="result" style={{ flex: 1 }}>
          <Card className="ekyc-table-card" style={{ padding: 0 }}>
            <Table
              t={t}
              data={tableData}
              columns={columns}
              isLoading={isLoading}
              onSort={onSort}
              sortParams={sortParams}
              totalRecords={totalRecords}
              onNextPage={onNextPage}
              onPrevPage={onPrevPage}
              currentPage={currentPage}
              pageSizeLimit={pageSizeLimit}
              onPageSizeChange={onPageSizeChange}
              getCellProps={(cellInfo) => {
                return {
                  className: "ekyc-table-cell",
                };
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesktopInbox;
