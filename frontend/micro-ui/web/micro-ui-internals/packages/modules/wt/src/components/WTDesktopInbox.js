import { Card, Loader } from "@djb25/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ApplicationTable from "./inbox/ApplicationTable";
import InboxLinks from "./inbox/InboxLink";
import SearchApplication from "./inbox/search";

/**
 * `WTDesktopInbox` is a desktop view component for managing and displaying Water Tanker (WT) service applications.
 * It includes functionality to search, filter, and view application details in a table format.
 * The component dynamically renders content based on the state of the data:
 * - Displays a loader if the data is loading.
 * - Shows a "no application" message or a custom empty result component if no data is available.
 * - Renders an application table if data exists, supporting pagination, sorting, and filtering.
 * The component also handles the display of filters and search components, and conditionally shows additional links related to the WT service.
 *
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} A desktop inbox UI for Water Tanker applications, with search, filter, and table display.
 */

const WTDesktopInbox = ({ tableConfig, filterComponent, ...props }) => {
  const { data, useNewInboxAPI } = props;
  const { t } = useTranslation();
  const [FilterComponent, setComp] = useState(() => Digit.ComponentRegistryService?.getComponent(filterComponent));
  const [EmptyInboxComp, setEmptyInboxComp] = useState(() => {
    const com = Digit.ComponentRegistryService?.getComponent(props.EmptyResultInboxComp);
    return com;
  });

  const [clearSearchCalled, setClearSearchCalled] = useState(false);

  const columns = React.useMemo(() => (props.isSearch ? tableConfig.searchColumns(props) : tableConfig.inboxColumns(props) || []), []);

  const inboxCsvColumns = React.useMemo(
    () => [
      {
        Header: columns?.[0]?.Header || t("WT_BOOKING_NO"),
        exportAccessor: (row) => row?.searchData?.bookingNo || "",
      },
      {
        Header: columns?.[1]?.Header || t("WT_APPLICANT_NAME"),
        exportAccessor: (row) => row?.searchData?.applicantDetail?.name || "",
      },
      {
        Header: columns?.[2]?.Header || t("WT_MOBILE_NUMBER"),
        exportAccessor: (row) => row?.searchData?.applicantDetail?.mobileNumber || "",
      },
      {
        Header: columns?.[3]?.Header || t("LOCALITY"),
        exportAccessor: (row) => (row?.searchData?.localityCode ? t(row.searchData.localityCode) : ""),
      },
      {
        Header: columns?.[4]?.Header || t("WT_STATUS"),
        exportAccessor: (row) => (row?.workflowData?.state?.applicationStatus ? t(row.workflowData.state.applicationStatus) : ""),
      },
    ],
    [columns, t]
  );

  let result;
  if (props.isLoading) {
  result = <Loader />;
} else if (clearSearchCalled) {
  result = null;
} else if (
  !data ||
  data?.length === 0 ||
  (useNewInboxAPI && data?.[0]?.dataEmpty)
) {
  if (EmptyInboxComp) {
    result = <EmptyInboxComp data={data} />;
  } else if (
    data?.length === 0 ||
    (useNewInboxAPI && data?.[0]?.dataEmpty)
  ) {
    result = (
      <Card style={{ marginTop: 20 }}>
        {t("CS_MYAPPLICATIONS_NO_APPLICATION")
          .split("\n")
          .map((text, index) => (
            <p key={index} style={{ textAlign: "center" }}>
              {text}
            </p>
          ))}
      </Card>
    );
  } else {
    result = <Loader />;
  }
} else if (data?.length > 0) {
  result = (
    <ApplicationTable
      t={t}
      data={data}
      columns={columns}
      getCellProps={(cellInfo) => ({
        style: {
          padding: "8px 12px",
          fontSize: "13.5px",
        },
      })}
      onPageSizeChange={props.onPageSizeChange}
      currentPage={props.currentPage}
      onNextPage={props.onNextPage}
      onPrevPage={props.onPrevPage}
      pageSizeLimit={props.pageSizeLimit}
      onSort={props.onSort}
      disableSort={props.disableSort}
      sortParams={props.sortParams}
      autoSort={false}
      totalRecords={props.totalRecords}
      showCSVExport={true}
      getCSVExportData={props.getCSVExportData}
      csvExportColumns={inboxCsvColumns}
      csvExportFileName={`${String(props.moduleCode || "wt").toLowerCase()}-inbox`}
    />
  );
}

  return (
    <div className="inbox-container">
      {!props.isSearch && (
        <div className="side-panel-item">
          <InboxLinks parentRoute={props.parentRoute} businessService={props.moduleCode} />
          <div className="filter-form ">
            {
              <FilterComponent
                defaultSearchParams={props.defaultSearchParams}
                onFilterChange={props.onFilterChange}
                searchParams={props.searchParams}
                type="desktop"
                useNewInboxAPI={useNewInboxAPI}
                statusMap={useNewInboxAPI ? data?.[0].statusMap : null}
                moduleCode={props.moduleCode}
              />
            }
          </div>
        </div>
      )}
      <div className="employee-form-content" style={{ flex: 1 }}>
        <SearchApplication
          defaultSearchParams={props.defaultSearchParams}
          onSearch={(d) => {
            props.onSearch(d);
            setClearSearchCalled(false);
          }}
          type="desktop"
          searchFields={props.searchFields}
          isInboxPage={!props?.isSearch}
          searchParams={props.searchParams}
          clearSearch={() => setClearSearchCalled(true)}
        />
        <div className="result" style={{ flex: 1 }}>
          {result}
        </div>
      </div>
    </div>
  );
};

export default WTDesktopInbox;
