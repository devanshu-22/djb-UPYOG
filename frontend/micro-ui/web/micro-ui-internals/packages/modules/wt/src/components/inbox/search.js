import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Label, SubmitBar, LinkLabel, ActionBar, CloseSvg, DatePicker, MobileNumber, Dropdown } from "@djb25/digit-ui-react-components";

import { useTranslation } from "react-i18next";

const fieldComponents = {
  mobileNumber: MobileNumber,
};

/*
    A dynamic search form for applications, allowing users to filter by various fields
    such as mobile number, and hall codes,booking no. 
    The form adapts to both mobile and desktop views, with input validation and error handling.
    It also includes functionality for clearing search filters.
  */

const SearchApplication = ({ onSearch, type, onClose, searchFields, searchParams, isInboxPage, defaultSearchParams, clearSearch: _clearSearch }) => {
  const { t } = useTranslation();
  const { handleSubmit, reset, watch, control, setError, clearErrors, formState, setValue } = useForm({
    defaultValues: isInboxPage ? searchParams : { locality: null, city: null, ...searchParams },
  });
  const form = watch();

  const formValueEmpty = () => {
    let isEmpty = true;
    Object.keys(form).forEach((key) => {
      if (!["locality", "city"].includes(key) && form[key]) isEmpty = false;
    });

    if (searchFields?.find((e) => e.name === "locality") && !form?.locality?.code) isEmpty = true;
    return isEmpty;
  };

  const mobileView = innerWidth <= 640;

  const onSubmitInput = (data) => {
    if (!data.mobileNumber) {
      delete data.mobileNumber;
    }

    data.delete = [];

    searchFields.forEach((field) => {
      if (!data[field.name]) data.delete.push(field.name);
    });

    onSearch(data);
    if (type === "mobile") {
      onClose();
    }
  };

  function clearSearch() {
    const resetValues = searchFields.reduce((acc, field) => ({ ...acc, [field?.name]: "" }), {});
    reset(resetValues);
    if (isInboxPage) {
      const _newParams = { ...searchParams };
      _newParams.delete = [];
      searchFields.forEach((e) => {
        _newParams.delete.push(e?.name);
      });
      onSearch({ ..._newParams });
    } else {
      _clearSearch();
    }
  }

  const clearAll = (mobileView) => {
    const mobileViewStyles = mobileView ? { margin: 0 } : {};
    return (
      <LinkLabel style={{ display: "inline", ...mobileViewStyles }} onClick={clearSearch}>
        {t("ES_COMMON_CLEAR_SEARCH")}
      </LinkLabel>
    );
  };

  const isFixedPoint = searchParams?.services?.includes("watertanker-fixedpoint");
  const { data: fillingPointsData } = Digit.Hooks.wt.useFillPointSearch(
    { tenantId: Digit.ULBService.getCurrentTenantId(), filters: { limit: 1000 } },
    { enabled: !!isFixedPoint }
  );
  const fillingPoints = fillingPointsData?.fillingPoints || [];

  return (
    <form id="search-form" onSubmit={handleSubmit(onSubmitInput)} className="search-form-wrapper search-complaint-container">
      <React.Fragment>
        {(type === "mobile" || mobileView) && (
          <div className="complaint-header">
            <h2>{t("ES_COMMON_SEARCH_BY")}</h2>
            <span onClick={onClose}>
              <CloseSvg />
            </span>
          </div>
        )}
        <div className="formcomposer-section-grid">
          {searchFields
            ?.filter((e) => true)
            ?.map((input, index) => (
              <div key={input.name} className="input-fields">
                {/* <span className={index === 0 ? "complaint-input" : "mobile-input"}> */}
                <span className={"mobile-input"}>
                  <Label>{t(input.label) + ` ${input.isMendatory ? "*" : ""}`}</Label>
                  {!input.type ? (
                    <Controller
                      render={(props) => {
                        return <TextInput onChange={props.onChange} value={props.value} />;
                      }}
                      name={input.name}
                      control={control}
                      defaultValue={""}
                    />
                  ) : (
                    <Controller
                      render={(props) => {
                        const Comp = fieldComponents?.[input.type];
                        return <Comp formValue={form} setValue={setValue} onChange={props.onChange} value={props.value} />;
                      }}
                      name={input.name}
                      control={control}
                      defaultValue={""}
                    />
                  )}
                </span>
                {formState?.dirtyFields?.[input.name] && formState?.errors?.[input.name]?.message ? (
                  <span
                    style={{ fontWeight: "700", color: "rgba(212, 53, 28)", paddingLeft: "8px", marginTop: "-20px", fontSize: "12px" }}
                    className="inbox-search-form-error"
                  >
                    {formState?.errors?.[input.name]?.message}
                  </span>
                ) : null}
              </div>
            ))}
          {isFixedPoint && (
            <div className="input-fields">
              <span className="mobile-input">
                <Label>{t("WT_FILLING_POINT")}</Label>
                <Controller
                  control={control}
                  name="fillingPointId"
                  render={(props) => (
                    <Dropdown
                      selected={fillingPoints.find((fp) => (fp.id || fp.fillingPointId || fp.bookingId) === props.value)}
                      select={(val) => props.onChange(val?.id || val?.fillingPointId || val?.bookingId)}
                      onBlur={props.onBlur}
                      option={fillingPoints}
                      optionKey="fillingPointName"
                      t={t}
                    />
                  )}
                />
              </span>
            </div>
          )}
        </div>
        <div className="formcomposer-section-button">
          {isInboxPage ? (
            <div className="generic-button clear-search">
              <p onClick={clearSearch}>{t("ES_COMMON_CLEAR_SEARCH")}</p>
            </div>
          ) : (
            <div>{clearAll()}</div>
          )}
          {type === "desktop" && !mobileView && (
            <SubmitBar
              className="generic-button"
              disabled={!!Object.keys(formState.errors).length || formValueEmpty()}
              label={t("ES_COMMON_SEARCH")}
              submit
              form="search-form"
            />
          )}
        </div>

        {(type === "mobile" || mobileView) && (
          <ActionBar className="clear-search-container">
            <button className="clear-search" style={{ flex: 1 }}>
              {clearAll(mobileView)}
            </button>
            <SubmitBar disabled={!!Object.keys(formState.errors).length} label={t("ES_COMMON_SEARCH")} style={{ flex: 1 }} submit={true} />
          </ActionBar>
        )}
      </React.Fragment>
    </form>
  );
};

export default SearchApplication;
