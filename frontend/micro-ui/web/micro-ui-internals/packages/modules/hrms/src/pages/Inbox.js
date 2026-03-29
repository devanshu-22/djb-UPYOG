import React, { useCallback, useEffect, useState } from "react";
import { Loader } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import DesktopInbox from "../components/inbox/DesktopInbox";
import MobileInbox from "../components/inbox/MobileInbox";

const HRMS_SORT_FIELD_MAP = {
  employeeCode: "code",
  employeeName: "name",
  roleCount: "roles",
  designation: "designation",
  department: "department",
  status: "isActive",
  createdTime: "createdTime",
};

const Inbox = ({ parentRoute, businessService = "HRMS", initialStates = {}, filterComponent, isInbox }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { isLoading, data: res } = Digit.Hooks.hrms.useHRMSCount(tenantId);

  const { t } = useTranslation();
  const [pageOffset, setPageOffset] = useState(initialStates.pageOffset || 0);
  const [pageSize, setPageSize] = useState(initialStates.pageSize || 10);
  const [sortParams, setSortParams] = useState(initialStates.sortParams || [{ id: "createdTime", desc: false }]);
  const [totalRecords, setTotalReacords] = useState(null);
  const [searchParams, setSearchParams] = useState(() => {
    return initialStates.searchParams || {};
  });
  const resolvedSortBy = HRMS_SORT_FIELD_MAP[sortParams?.[0]?.id] || sortParams?.[0]?.id || "createdTime";

  let isMobile = window.Digit.Utils.browser.isMobile();
  let paginationParams = isMobile
    ? { limit: 100, offset: pageOffset, sortBy: resolvedSortBy, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
    : { limit: pageSize, offset: pageOffset, sortBy: resolvedSortBy, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };
  const isupdate = Digit.SessionStorage.get("isupdate");
  const { isLoading: hookLoading, isError, error, data, ...rest } = Digit.Hooks.hrms.useHRMSSearch(
    searchParams,
    tenantId,
    paginationParams,
    isupdate
  );

  useEffect(() => {
    if (res) {
      setTotalReacords(res?.EmployeCount?.totalEmployee || 0);
    }
  }, [res]);

  useEffect(() => {}, [hookLoading, rest]);

  useEffect(() => {
    setPageOffset(0);
  }, [searchParams]);

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - pageSize);
  };

  const handleFilterChange = (filterParam) => {
    let keys_to_delete = filterParam.delete;
    let _new = { ...searchParams, ...filterParam };
    if (keys_to_delete) keys_to_delete.forEach((key) => delete _new[key]);
    delete _new.delete;
    setSearchParams({ ..._new });
  };

  const handleSort = useCallback((args) => {
    if (!Array.isArray(args) || args.length === 0 || !args[0]?.id) return;
    const normalizedId = HRMS_SORT_FIELD_MAP[args[0].id] ? args[0].id : "createdTime";
    setSortParams([{ id: normalizedId, desc: !!args[0].desc }]);
  }, []);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const getCSVExportData = useCallback(async () => {
    const limit = 200;
    const maxIterations = 100;
    let offset = 0;
    let employees = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const response = await Digit.HRMSService.search(
        tenantId,
        {
          limit,
          offset,
          sortBy: HRMS_SORT_FIELD_MAP[sortParams?.[0]?.id] || sortParams?.[0]?.id || "createdTime",
          sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC",
        },
        searchParams
      );

      const batch = Array.isArray(response?.Employees) ? response.Employees : [];
      if (!batch.length) break;

      employees = [...employees, ...batch];
      if (batch.length < limit) break;

      offset += limit;
    }

    return employees;
  }, [tenantId, searchParams, sortParams]);

  const getSearchFields = () => {
    return [
      {
        label: t("HR_NAME_LABEL"),
        name: "names",
      },
      {
        label: t("HR_MOB_NO_LABEL"),
        name: "phone",
        maxlength: 10,
        pattern: "[6-9][0-9]{9}",
        title: t("ES_SEARCH_APPLICATION_MOBILE_INVALID"),
        componentInFront: "+91",
      },
      {
        label: t("HR_EMPLOYEE_ID_LABEL"),
        name: "codes",
      },
    ];
  };

  if (isLoading) {
    return <Loader />;
  }

  if (data?.length !== null) {
    if (isMobile) {
      return (
        <MobileInbox
          businessService={businessService}
          data={data}
          isLoading={hookLoading}
          defaultSearchParams={initialStates.searchParams}
          isSearch={!isInbox}
          onFilterChange={handleFilterChange}
          searchFields={getSearchFields()}
          onSearch={handleFilterChange}
          onSort={handleSort}
          onNextPage={fetchNextPage}
          tableConfig={rest?.tableConfig}
          onPrevPage={fetchPrevPage}
          currentPage={Math.floor(pageOffset / pageSize)}
          pageSizeLimit={pageSize}
          disableSort={false}
          onPageSizeChange={handlePageSizeChange}
          parentRoute={parentRoute}
          searchParams={searchParams}
          sortParams={sortParams}
          totalRecords={totalRecords}
          linkPrefix={"/digit-ui/employee/hrms/details/"}
          filterComponent={filterComponent}
        />
      );
    } else {
      return (
        <div className="employee-form-content">
          <DesktopInbox
            businessService={businessService}
            data={data}
            isLoading={hookLoading}
            defaultSearchParams={initialStates.searchParams}
            isSearch={!isInbox}
            onFilterChange={handleFilterChange}
            searchFields={getSearchFields()}
            onSearch={handleFilterChange}
            onSort={handleSort}
            onNextPage={fetchNextPage}
            onPrevPage={fetchPrevPage}
            currentPage={Math.floor(pageOffset / pageSize)}
            pageSizeLimit={pageSize}
            disableSort={false}
            onPageSizeChange={handlePageSizeChange}
            parentRoute={parentRoute}
            searchParams={searchParams}
            sortParams={sortParams}
            totalRecords={totalRecords}
            filterComponent={filterComponent}
            getCSVExportData={getCSVExportData}
          />
        </div>
      );
    }
  }
};

export default Inbox;
