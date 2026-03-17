import React, { useEffect, useState } from "react";
import { Dropdown, FilterForm, FilterFormField } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const Filter = ({ searchParams, onFilterChange, defaultSearchParams, statusMap, moduleCode, ...props }) => {
    const { t } = useTranslation();

    const [_searchParams, setSearchParams] = useState(() => ({ ...searchParams }));

    const localParamChange = (filterParam) => {
        let keys_to_delete = filterParam.delete;
        let _new = { ..._searchParams, ...filterParam };
        if (keys_to_delete) keys_to_delete.forEach((key) => delete _new[key]);
        delete filterParam.delete;
        setSearchParams({ ..._new });
    };

    const applyLocalFilters = () => {
        onFilterChange(_searchParams);
    };

    const clearAll = () => {
        setSearchParams({ ...defaultSearchParams });
        onFilterChange({ ...defaultSearchParams });
    };

    const onStatusChange = (value) => {
        localParamChange({ status: value });
    };

    return (
        <FilterForm
            onSubmit={applyLocalFilters}
            handleSubmit={(fn) => (e) => { e && e.preventDefault(); fn(); }}
            onResetFilterForm={clearAll}
            id="ekyc-filter-form"
            onMobileExclusiveFilterPopupFormClose={props.onClose}
        >
            <FilterFormField>
                <div className="filter-label" style={{ fontWeight: "normal" }}>
                    {t("EKYC_STATUS")}:
                </div>
                <Dropdown
                    option={[
                        { label: t("EKYC_STATUS_ALL"), value: "" },
                        { label: t("EKYC_STATUS_COMPLETED"), value: "COMPLETED" },
                        { label: t("EKYC_STATUS_PENDING"), value: "PENDING" },
                        { label: t("EKYC_STATUS_REJECTED"), value: "REJECTED" },
                    ]}
                    optionKey="label"
                    select={onStatusChange}
                    selected={_searchParams?.status || { label: t("EKYC_STATUS_ALL"), value: "" }}
                />
            </FilterFormField>
        </FilterForm>
    );
};

export default Filter;
