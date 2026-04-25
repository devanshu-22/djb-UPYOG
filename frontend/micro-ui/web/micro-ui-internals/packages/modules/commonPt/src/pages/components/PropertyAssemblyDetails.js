import React, { useEffect, useState } from "react";
import {
  FormStep,
  TextInput,
  CardLabel,
  RadioButtons,
  LabelFieldPair,
  Dropdown,
  Menu,
  MobileNumber,
  CardLabelError,
} from "@djb25/digit-ui-react-components";
import { cardBodyStyle } from "../utils";
import { useLocation, useRouteMatch } from "react-router-dom";
import { stringReplaceAll } from "../utils";
import { Controller, useForm } from "react-hook-form";
import _ from "lodash";

const PropertyAssemblyDetails = ({ t, config, onSelect, userType, formData, formState, ownerIndex, setError, clearErrors }) => {
  const [assemblyDetails, setAssemblyDetails] = React.useState({
    ...formData.assemblyDet,
    BuildingType: formData?.PropertyType,
    floorarea: formData?.landArea,
    constructionArea: formData?.constructionArea,
    usageCategoryMajor:
      formData?.usageCategoryMajor && formData?.usageCategoryMajor?.code === "NONRESIDENTIAL.OTHERS"
        ? { code: `${formData?.usageCategoryMajor?.code}`, i18nKey: `PROPERTYTAX_BILLING_SLAB_OTHERS` }
        : formData?.usageCategoryMajor,
  });
  const [focusField, setFocusField] = React.useState("");
  let tenantId = "dl.djb";

  const [isErrors, setIsErrors] = useState(false);
  const isMobile = window.Digit.Utils.browser.isMobile();

  let proptype = [];

  console.log("Calling usePropertyMDMS with tenantId:", tenantId);

  const { data: Menu = [], isLoading } = Digit.Hooks.pt.usePropertyMDMS(tenantId, "PropertyTax", "PTPropertyType") || {};
  console.log("PropertyType Menu Data (transformed):", Menu);
  proptype = Menu?.PropertyTax?.PropertyType || (Array.isArray(Menu) ? Menu : []);

  const { data: Menu1 = [], isLoading: menuLoading } = Digit.Hooks.pt.usePropertyMDMS(tenantId, "PropertyTax", "UsageCategory") || {};
  console.log("UsageCategory Menu Data (transformed):", Menu1);
  let usagecat = Menu1?.PropertyTax?.UsageCategory || (Array.isArray(Menu1) ? Menu1 : []);


  function getPropertyTypeMenu(proptype) {
    if (userType === "employee") {
      return proptype
        ?.filter((e) => e.code === "VACANT" || e.code.split(".").length > 1)
        ?.map((item) => ({ i18nKey: "COMMON_PROPTYPE_" + stringReplaceAll(item?.code, ".", "_"), code: item?.code }))
        ?.sort((a, b) => a.i18nKey.split("_").pop().localeCompare(b.i18nKey.split("_").pop()));
    } else {
      let menu = [];
      if (Array.isArray(proptype) && proptype.length > 0) {
        for (let i = 0; i < proptype.length; i++) {
          if (i != 1 && i != 4) menu.push({ i18nKey: "COMMON_PROPTYPE_" + stringReplaceAll(proptype[i].code, ".", "_"), code: proptype[i].code });
        }
      }
      menu.sort((a, b) => a.i18nKey.split("_").pop().localeCompare(b.i18nKey.split("_").pop()));
      return menu;
    }
  }

  function usageCategoryMajorMenu(usagecat) {
    if (userType === "employee") {
      const catMenu = usagecat
        ?.filter((e) => e?.code.split(".").length <= 2 && e.code !== "NONRESIDENTIAL")
        ?.map((item) => {
          const arr = item?.code.split(".");
          if (arr.length == 2) return { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + arr[1], code: item?.code };
          else return { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + item?.code, code: item?.code };
        });
      return catMenu;
    } else {
      let menu = [];
      for (let i = 0; i < usagecat.length; i++) {
        if (
          Array.isArray(usagecat) &&
          usagecat.length > 0 &&
          usagecat[i]?.code?.split?.(".")[0] == "NONRESIDENTIAL" &&
          usagecat[i]?.code?.split?.(".").length == 2
        ) {
          menu.push({ i18nKey: "PROPERTYTAX_BILLING_SLAB_" + usagecat[i].code.split(".")[1], code: usagecat[i].code });
        }
      }
      return menu;
    }
  }

  const {
    control,
    formState: { errors, touched },
    trigger,
    watch,
    setError: setLocalError,
    clearErrors: clearLocalErrors,
    setValue,
    getValues,
  } = useForm();
  const formValue = watch();
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  React.useEffect(() => {
    let hasErrors = false;
    const part = {};

    Object.keys(assemblyDetails).forEach((key) => {
      part[key] = formValue?.[key];
    });

    if (!_.isEqual(part, assemblyDetails)) {
      Object.keys(assemblyDetails).forEach((key) => {
        if (assemblyDetails[key]) {
          hasErrors = false;
          clearLocalErrors(key);
        } else {
          hasErrors = true;
        }
      });
    }

    if (hasErrors) {
      setError(config?.key, { type: errors });
    } else {
      clearErrors(config?.key);
    }

    trigger();
    setIsErrors(hasErrors);
    onSelect(config?.key, assemblyDetails);
  }, [assemblyDetails]);

  React.useEffect(() => {
    if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) {
      setError(config.key, { type: errors });
    } else if (!Object.keys(errors).length && formState.errors[config.key] && isErrors) {
      clearErrors(config.key);
    }
  }, [errors]);

  return (
    <div>
      <LabelFieldPair>
        <CardLabel>{`${t("PT_PROP_TYPE")}*`}</CardLabel>
        <div className="form-field">
          <Controller
            name="BuildingType"
            control={control}
            defaultValue={assemblyDetails?.BuildingType}
            rules={{ required: t("REQUIRED_FIELD") }}
            key={config?.key}
            render={(props) => (
              <Dropdown
                selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : assemblyDetails?.BuildingType}
                disable={getPropertyTypeMenu(proptype)?.length === 1}
                option={getPropertyTypeMenu(proptype)}
                autoFocus={focusField === "BuildingType"}
                select={(value) => {
                  props.onChange(value);
                  setAssemblyDetails({ ...assemblyDetails, ["BuildingType"]: value });
                  setFocusField("BuildingType");
                }}
                optionKey="i18nKey"
                onBlur={props?.onBlur}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {touched?.BuildingType && errors?.BuildingType?.message && <CardLabelError style={errorStyle}>{errors?.BuildingType?.message}</CardLabelError>}

      <LabelFieldPair>
        <CardLabel>{`${t("PT_TOT_LAND_AREA")}*`}</CardLabel>
        <div className="form-field">
          <Controller
            name="floorarea"
            control={control}
            defaultValue={assemblyDetails?.floorarea}
            rules={{
              required: t("REQUIRED_FIELD"),
              validate: (val) => (/^([0-9]){0,8}$/i.test(val) ? true : t("PT_TOT_LAND_AREA_ERROR_MESSAGE")),
            }}
            key={config?.key}
            render={(props) => (
              <TextInput
                t={t}
                type={"number"}
                isMandatory={false}
                optionKey="i18nKey"
                name="totLandArea"
                value={props?.value}
                autoFocus={focusField === "floorarea"}
                onChange={(ev) => {
                  props?.onChange(ev.target.value);
                  setAssemblyDetails({ ...assemblyDetails, ["floorarea"]: ev.target.value });
                  setFocusField("floorarea");
                }}
                onBlur={props?.onBlur}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {touched?.floorarea && errors?.floorarea?.message && <CardLabelError style={errorStyle}>{errors?.floorarea?.message}</CardLabelError>}

      <LabelFieldPair>
        <CardLabel>{`${t("PT_TOT_CONSTRUCTION_AREA")}*`}</CardLabel>
        <div className="form-field">
          <Controller
            name="constructionArea"
            control={control}
            defaultValue={assemblyDetails?.constructionArea}
            key={config?.key}
            rules={{
              required: t("REQUIRED_FIELD"),
              validate: (val) =>
                /^([0-9]){0,8}$/i.test(val) && assemblyDetails?.floorarea && parseInt(val) < parseInt(assemblyDetails?.floorarea)
                  ? true
                  : t("PT_TOT_CONSTRUCTION_AREA_ERROR_MESSAGE"),
            }}
            render={(props) => (
              <TextInput
                t={t}
                type={"number"}
                isMandatory={false}
                optionKey="i18nKey"
                name="totConstructionArea"
                value={props?.value}
                autoFocus={focusField === "constructionArea"}
                onChange={(ev) => {
                  props?.onChange(ev.target.value);
                  setFocusField("constructionArea");
                  setAssemblyDetails({ ...assemblyDetails, ["constructionArea"]: ev.target.value });
                }}
                onBlur={props?.onBlur}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {touched?.constructionArea && errors?.constructionArea?.message && (
        <CardLabelError style={isMobile ? { ...errorStyle, marginLeft: "0px" } : { ...errorStyle }}>
          {errors?.constructionArea?.message}
        </CardLabelError>
      )}

      <LabelFieldPair>
        <CardLabel>{`${t("PT_ASSESMENT_INFO_USAGE_TYPE")}*`}</CardLabel>
        <div className="form-field">
          <Controller
            name="usageCategoryMajor"
            defaultValue={assemblyDetails?.usageCategoryMajor}
            rules={{ required: t("REQUIRED_FIELD") }}
            control={control}
            key={config?.key}
            render={(props) => (
              <Dropdown
                selected={props?.value}
                disable={usageCategoryMajorMenu(usagecat)?.length === 1}
                option={usageCategoryMajorMenu(usagecat)}
                autoFocus={focusField === "usageCategoryMajor"}
                select={(value) => {
                  props?.onChange(value);
                  setFocusField("usageCategoryMajor");
                  setAssemblyDetails({ ...assemblyDetails, ["usageCategoryMajor"]: value });
                }}
                optionKey="i18nKey"
                onBlur={props?.onBlur}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {touched?.usageCategoryMajor && errors?.usageCategoryMajor?.message && <CardLabelError style={errorStyle}>{errors?.usageCategoryMajor?.message}</CardLabelError>}
    </div>
  );
};

export default PropertyAssemblyDetails;
