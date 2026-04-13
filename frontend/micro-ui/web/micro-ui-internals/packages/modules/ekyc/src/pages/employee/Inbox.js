import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DesktopInbox from "../../components/DesktopInbox";
import MobileInbox from "../../components/MobileInbox";
import Filter from "../../components/Filter";

// Mock data removed in favor of API integration

const Inbox = ({
    parentRoute,
    businessService = "EKYC",
    initialStates = {},
    filterComponent,
    isInbox,
}) => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const { t } = useTranslation();

    // 1. Unified State Management
    const [pageOffset, setPageOffset] = useState(initialStates.pageOffset || 0);
    const [pageSize, setPageSize] = useState(initialStates.pageSize || 10);
    const [sortParams, setSortParams] = useState(initialStates.sortParams || [{ id: "createdTime", desc: true }]);

    // Define the default option for the dropdown
    const defaultStatusOption = useMemo(() => ({ label: t("EKYC_STATUS_ALL"), value: "" }), [t]);

    // Maintain the full search objects for the Search component
    const [searchParams, setSearchParams] = useState(initialStates.searchParams || { status: defaultStatusOption });

    // 2. API Data Fetching
    const { isLoading, data: dashboardData, isFetching } = Digit.Hooks.ekyc.useEkycSurveyorDashboard(
        {}, 
        { 
            tenantId, 
            offset: pageOffset, 
            limit: pageSize,
            status: searchParams.status?.value || ""
        },
        {
            enabled: !!tenantId,
        }
    );

    const filteredData = useMemo(() => {
        const items = dashboardData?.dashboardInfo?.consumerList || [];
        return items.map(item => ({
            ...item,
            applicationNumber: item.kno || item.applicationNumber,
            citizenName: item.consumerName || item.citizenName,
        }));
    }, [dashboardData]);

    const countData = useMemo(() => {
        const info = dashboardData?.dashboardInfo || {};
        return {
            total: info.total || 0,
            completed: info.completed || 0,
            pending: info.pending || 0,
            rejected: info.rejected || 0
        };
    }, [dashboardData]);

    const totalRecords = dashboardData?.dashboardInfo?.totalRecords || dashboardData?.totalCount || 0;

    // 3. Handlers
    const handleSearch = useCallback((filterParam) => {
        // Here we keep the full objects (like for dropdowns) in searchParams
        // so that the Search component can display them correctly.
        setSearchParams((prev) => ({ ...prev, ...filterParam }));
        setPageOffset(0);
    }, []);

    const fetchNextPage = () => setPageOffset((prev) => prev + pageSize);
    const fetchPrevPage = () => setPageOffset((prev) => Math.max(prev - pageSize, 0));

    const handlePageSizeChange = (e) => {
        const newSize = Number(e.target.value);
        setPageSize(newSize);
        setPageOffset(0);
    };

    const handleSort = useCallback((args) => {
        if (args.length > 0) setSortParams(args);
    }, []);

    // 4. Form Configuration
    const searchFields = useMemo(() => [
        {
            label: t("EKYC_STATUS"),
            name: "status",
            type: "dropdown",
            options: [
                { label: t("CHOOSE_STATUS"), value: "" },
                { label: t("EKYC_STATUS_COMPLETED"), value: "COMPLETED" },
                { label: t("EKYC_STATUS_PENDING"), value: "PENDING" },
                { label: t("EKYC_STATUS_REJECTED"), value: "REJECTED" },
            ],
            optionsKey: "label"
        },
    ], [t]);

    return (
        <div className="ekyc-employee-container">
            <div className="inbox-main-container">
                {Digit.Utils.browser.isMobile() ? (
                    <MobileInbox
                        data={{ items: filteredData, totalCount: totalRecords }}
                        isLoading={isLoading || isFetching}
                        onSearch={handleSearch}
                        searchFields={searchFields}
                        searchParams={searchParams}
                        parentRoute={parentRoute}
                        countData={countData}
                    />
                ) : (
                    <DesktopInbox
                        businessService={businessService}
                        data={{ items: filteredData, totalCount: totalRecords }}
                        isLoading={isLoading || isFetching}
                        searchFields={searchFields}
                        onSearch={handleSearch}
                        onSort={handleSort}
                        onNextPage={fetchNextPage}
                        onPrevPage={fetchPrevPage}
                        currentPage={Math.floor(pageOffset / pageSize)}
                        pageSizeLimit={pageSize}
                        onPageSizeChange={handlePageSizeChange}
                        parentRoute={parentRoute}
                        searchParams={searchParams}
                        sortParams={sortParams}
                        totalRecords={totalRecords}
                        countData={countData}
                        filterComponent="EKYC_INBOX_FILTER"
                    />
                )}
            </div>
        </div>
    );
};

export default Inbox;