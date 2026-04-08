import React from "react";
import { Table } from "@djb25/digit-ui-react-components";

const ApplicationTable = ({
  t,
  columns,
  data,
  getCellProps,
  onNextPage,
  onPrevPage,
  currentPage,
  totalRecords,
  pageSizeLimit,
  onPageSizeChange,
  showCSVExport,
  csvExportFileName,
  csvExportData,
  getCSVExportData,
  csvExportColumns,
  csvExportButtonLabel,
  ...rest
}) => (
  <Table
    t={t}
    data={data}
    columns={columns}
    getCellProps={getCellProps}
    onNextPage={onNextPage}
    onPrevPage={onPrevPage}
    currentPage={currentPage}
    totalRecords={totalRecords}
    onPageSizeChange={onPageSizeChange}
    pageSizeLimit={pageSizeLimit}
    showCSVExport={showCSVExport}
    csvExportFileName={csvExportFileName}
    csvExportData={csvExportData}
    getCSVExportData={getCSVExportData}
    csvExportColumns={csvExportColumns}
    csvExportButtonLabel={csvExportButtonLabel}
    {...rest}
  />
);

export default ApplicationTable;
