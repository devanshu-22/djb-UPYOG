import React, { useState } from "react";
import { Dropdown, FilterForm, FilterFormField } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const Filter = ({ searchParams, onFilterChange, defaultSearchParams, statusMap, moduleCode, ...props }) => {
  const { t } = useTranslation();

  const [_searchParams, setSearchParams] = useState(() => ({ ...searchParams }));

  const applyLocalFilters = () => {
    onFilterChange(_searchParams);
  };

  const clearAll = () => {
    setSearchParams({ ...defaultSearchParams });
    onFilterChange({ ...defaultSearchParams });
  };

  const onStatusChange = (value) => {
    const newParams = { ..._searchParams, status: value };
    setSearchParams(newParams);
    onFilterChange(newParams);
  };

  return (
    <FilterForm
      onSubmit={applyLocalFilters}
      handleSubmit={(fn) => (e) => {
        e && e.preventDefault();
        fn();
      }}
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
            { label: t("EKYC_STATUS_ACTIVE"), value: "ACTIVE" },
            { label: t("EKYC_STATUS_PENDING"), value: "PENDING START" },
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
