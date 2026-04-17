import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, SubmitBar, Header, Card, HomeIcon, PersonIcon, Modal, Loader } from "@djb25/digit-ui-react-components";
import { Link } from "react-router-dom";
import StatusCards from "./StatusCards";

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
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [FilterComponent, setComp] = React.useState(() => Digit.ComponentRegistryService?.getComponent(filterComponent));

  // State for Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewHtml, setReviewHtml] = useState("");
  const [selectedKno, setSelectedKno] = useState("");

  const generateReviewHtml = (info) => {
    if (!info) return "<h3>No data found</h3>";

    // Helper to format labels
    const formatLabel = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #101828; line-height: 1.5; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #185FA5; padding-bottom: 20px; margin-bottom: 30px; }
            .title { margin: 0; color: #185FA5; font-size: 24px; font-weight: 700; }
            .subtitle { margin: 5px 0 0; color: #667085; font-size: 14px; }
            .section { margin-bottom: 30px; border: 1px solid #EAECF0; border-radius: 12px; overflow: hidden; }
            .section-header { background: #F9FAFB; padding: 12px 20px; border-bottom: 1px solid #EAECF0; font-weight: 700; font-size: 14px; color: #344054; text-transform: uppercase; letter-spacing: 0.05em; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; }
            .item { padding: 16px 20px; border-bottom: 1px solid #F2F4F7; }
            .item:nth-last-child(-n+2) { border-bottom: none; }
            .label { font-size: 11px; color: #667085; text-transform: uppercase; font-weight: 600; letter-spacing: 0.02em; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 500; color: #1D2939; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
            .badge-success { background: #ECFDF3; color: #027A48; }
            .badge-warning { background: #FFFAEB; color: #B54708; }
            .print-btn { background: #185FA5; color: #fff; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; display: block; margin: 20px auto; }
            @media print { .print-btn { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Delhi Jal Board</h1>
              <p class="subtitle">EKYC Application Review Summary</p>
            </div>
            <div style="text-align: right">
              <span class="badge ${info.statusFlag === 'ACTIVE' ? 'badge-success' : 'badge-warning'}">${info.statusFlag || 'N/A'}</span>
              <p class="subtitle" style="margin-top: 8px">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-header">Basic Details</div>
            <div class="grid">
              <div class="item"><div class="label">KNO Number</div><div class="value">${info.kno || 'N/A'}</div></div>
              <div class="item"><div class="label">Consumer Name</div><div class="value">${info.consumerName || 'N/A'}</div></div>
              <div class="item"><div class="label">Mobile Number</div><div class="value">${info.mobileNo || 'N/A'}</div></div>
              <div class="item"><div class="label">Email Address</div><div class="value">${info.email || 'N/A'}</div></div>
              <div class="item"><div class="label">Connection Type</div><div class="value">${info.typeOfConnection || 'N/A'}</div></div>
              <div class="item"><div class="label">Category</div><div class="value">${info.connectionCategory || 'N/A'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">Location & Property Information</div>
            <div class="grid">
              <div class="item"><div class="label">Address</div><div class="value">${info.addressRaw || 'N/A'}</div></div>
              <div class="item"><div class="label">Locality</div><div class="value">${info.locality || 'N/A'}</div></div>
              <div class="item"><div class="label">City - Pincode</div><div class="value">${info.city || 'N/A'} - ${info.pincode || 'N/A'}</div></div>
              <div class="item"><div class="label">PID Number</div><div class="value">${info.pidNumber || 'N/A'}</div></div>
              <div class="item"><div class="label">No. of Floors</div><div class="value">${info.noOfFloor || 'N/A'}</div></div>
              <div class="item"><div class="label">Verification Status</div><div class="value"><span class="badge ${info.verificationStatus === 'SUCCESSFUL' ? 'badge-success' : 'badge-warning'}">${info.verificationStatus || 'PENDING'}</span></div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">Meter Information</div>
            <div class="grid">
              <div class="item"><div class="label">Meter Number</div><div class="value">${info.meterNumber || 'N/A'}</div></div>
              <div class="item"><div class="label">Meter Make</div><div class="value">${info.meterMake || 'N/A'}</div></div>
              <div class="item"><div class="label">Meter Location</div><div class="value">${info.meterLocationAddress || 'N/A'}</div></div>
              <div class="item"><div class="label">Working Status</div><div class="value">${info.workingStatus ? 'Working' : 'Not Working'}</div></div>
            </div>
          </div>

          <button class="print-btn" onclick="window.print()">Print This Review</button>
        </body>
      </html>
    `;
  };

  // Use the library hook if available, otherwise fallback to local definition
  // This is a safety measure to handle stale library builds in dev environment
  const useReviewHook = Digit.Hooks.ekyc?.useEkycApplicationReview || ((p, config) => {
    return Digit.Hooks.useMutation((data) => Digit.EkycService.application_review(data, p), config);
  });

  const { mutate: getReview, isLoading: isReviewLoading } = useReviewHook(
    { tenantId },
    {
      onSuccess: (res) => {
        if (res?.applicationReviewInfo) {
          const html = generateReviewHtml(res.applicationReviewInfo);
          setReviewHtml(html);
          setShowReviewModal(true);
        } else {
          // Fallback to URL method if the API is updated later to return a URL
          const url = res?.acknowledgementURL || res?.reviewUrl || res?.url;
          if (url) {
            setReviewHtml(""); // Clear HTML so iframe uses URL
            setReviewUrl(url);
            setShowReviewModal(true);
          } else {
            alert(t("EKYC_REVIEW_INFO_NOT_FOUND"));
          }
        }
      },
      onError: (err) => {
        alert(err?.message || t("ERR_FAILED_TO_FETCH_REVIEW"));
      }
    }
  );

  const handleReview = (kno) => {
    setSelectedKno(kno);
    getReview({ kno });
  };

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
        accessor: "status",
        Cell: ({ row }) => {
          const status = row.original?.status || "DEFAULT";
          return <span className={`ekyc-status-tag ${status}`}>{t(`${status}`)}</span>;
        },
      },
    ],
    [t, parentRoute]
  );

  const tableData = useMemo(() => {
    return data?.items || [];
  }, [data]);

  return (
    <div className="ground-container employee-app-container form-container">
      <div className="inbox-container" style={{ paddingBottom: "16px" }}>
        {showReviewModal && (
          <Modal
            headerBarMain={t("EKYC_APPLICATION_REVIEW") + (selectedKno ? ` - ${selectedKno}` : "")}
            headerBarEnd={<div style={{ cursor: "pointer", padding: "5px 10px", background: "#F2F4F7", borderRadius: "4px" }} onClick={() => setShowReviewModal(false)}>{t("CLOSE")}</div>}
            hideSubmit={true}
            popupStyles={{ width: "90%", height: "90%", maxWidth: "1000px" }}
            popupModuleMianStyles={{ height: "calc(100% - 60px)", padding: 0 }}
          >
            <iframe
              srcDoc={reviewHtml}
              src={!reviewHtml ? reviewUrl : undefined}
              title="Application Review"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </Modal>
        )}
        {(isLoading || isReviewLoading) && <Loader />}
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
    </div>
  );
};

export default DesktopInbox;
