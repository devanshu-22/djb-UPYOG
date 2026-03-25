import React from "react";
import { Table } from "@djb25/digit-ui-react-components";
import { over } from "lodash";

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
      inboxStyles={{ overflowX: "scroll" }}
    />
  );
};

export default ApplicationTable;
