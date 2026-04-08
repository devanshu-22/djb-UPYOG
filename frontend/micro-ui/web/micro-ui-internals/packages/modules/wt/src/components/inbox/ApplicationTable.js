import React from "react";
import { Table } from "@djb25/digit-ui-react-components";

const ApplicationTable = ({
  t,
  currentPage,
  columns,
  data,
  getCellProps,
  disableSort,
  onSort,
  onNextPage,
  onPrevPage,
  onPageSizeChange,
  isPaginationRequired,
  pageSizeLimit,
  sortParams,
  totalRecords,
  showCSVExport,
  csvExportFileName,
  csvExportData,
  getCSVExportData,
  csvExportColumns,
  csvExportButtonLabel,
  ...rest
}) => {
  return (
    <Table
      t={t}
      data={data}
      currentPage={currentPage}
      columns={columns}
      getCellProps={getCellProps}
      onNextPage={onNextPage}
      onPrevPage={onPrevPage}
      pageSizeLimit={pageSizeLimit}
      disableSort={disableSort}
      isPaginationRequired={isPaginationRequired}
      onPageSizeChange={onPageSizeChange}
      onSort={onSort}
      sortParams={sortParams}
      totalRecords={totalRecords}
      showCSVExport={showCSVExport}
      csvExportFileName={csvExportFileName}
      csvExportData={csvExportData}
      getCSVExportData={getCSVExportData}
      csvExportColumns={csvExportColumns}
      csvExportButtonLabel={csvExportButtonLabel}
      inboxStyles={{ overflowX: "scroll" }}
      {...rest}
    />
  );
};

export default ApplicationTable;
