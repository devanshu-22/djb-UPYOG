import React from "react";
const { DatePicker, Dropdown } = require("@djb25/digit-ui-react-components");
import { convertEpochToDate } from "../utils";

const VehicleConfig = (t, disabled = false) => {
  return [
    {
      head: "ES_FSM_REGISTRY_VEHICLE_DETAILS",
      body: [
        {
          label: "ES_FSM_REGISTRY_VEHICLE_NUMBER",
          isMandatory: true,
          type: "text",
          disable: disabled,
          populators: {
            name: "registrationNumber",
            ValidationRequired: true,
            validation: {
              pattern: `^[A-Z]{2}-[0-9]{2}-[A-Z]{1,2}-[0-9]{4}$`,
              title: t("ES_FSM_VEHICLE_FORMAT_TIP"),
            },
            error: t("FSM_REGISTRY_INVALID_REGISTRATION_NUMBER"),
            defaultValue: "",
          },
        },

        {
          label: "ES_VENDOR_REGISTRY_SERVICE_TYPE",
          isMandatory: true,
          type: "component",
          key: "serviceType",
          component: "SelectServiceType",
          disable: disabled,
          populators: {
            name: "serviceType",
            defaultValue: {
              code: "WT",
              name: "WT",
              i18nKey: "WT",
            },
          },
          texts: {
            header: "CS_COMMON_CHOOSE_SERVICE_TYPE",
            submitBarLabel: "CS_COMMON_NEXT",
          },
        },
        {
          route: "vehicle",
          component: "SelectVehicleType",
          withoutLabel: true,
          key: "vehicle",
          isMandatory: true,
          type: "component",
        },
        {
          label: "ES_FSM_REGISTRY_VEHICLE_POLLUTION_CERT",
          isMandatory: false,
          type: "custom",
          key: "pollutionCert",
          populators: {
            name: "pollutionCert",
            validation: {
              required: true,
            },
            component: (props, customProps) => <DatePicker onChange={props.onChange} date={props.value} {...customProps} />,
          },
        },
        {
          label: "ES_FSM_REGISTRY_VEHICLE_INSURANCE",
          isMandatory: false,
          type: "custom",
          key: "insurance",
          populators: {
            name: "insurance",
            validation: {
              required: true,
            },
            component: (props, customProps) => <DatePicker onChange={props.onChange} date={props.value} {...customProps} />,
          },
        },
        {
          label: "ES_FSM_REGISTRY_VEHICLE_ROAD_TAX",
          isMandatory: false,
          type: "custom",
          key: "roadTax",
          populators: {
            name: "roadTax",
            validation: {
              required: true,
            },
            component: (props, customProps) => <DatePicker onChange={props.onChange} date={props.value} {...customProps} />,
          },
        },
        {
          label: "ES_FSM_REGISTRY_NEW_FITNESS",
          isMandatory: false,
          type: "custom",
          key: "fitnessValidity",
          populators: {
            name: "fitnessValidity",
            validation: {
              required: true,
            },
            component: (props, customProps) => <DatePicker onChange={props.onChange} date={props.value} {...customProps} />,
          },
        },
        {
          label: "ES_FSM_REGISTRY_NEW_VEHICLE_OWNER_NAME",
          isMandatory: true,
          type: "text",
          disable: disabled,
          populators: {
            name: "ownerName",
            validation: {
              required: true,
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: t("FSM_REGISTRY_INVALID_NAME"),
              },
            },
            error: t("FSM_REGISTRY_INVALID_NAME"),
            defaultValue: "",
          },
        },
        {
          label: "ES_FSM_REGISTRY_NEW_VEHICLE_OWNER_PHONE",
          isMandatory: true,
          type: "mobileNumber",
          key: "phone",
          disable: disabled,
          populators: {
            name: "phone",
            validation: {
              required: true,
              pattern: /^[6-9]\d{9}$/,
            },
            error: t("FSM_REGISTRY_INVALID_PHONE"),
            defaultValue: "",
          },
        },
        {
          label: "ES_FSM_REGISTRY_NEW_GENDER",
          isMandatory: true,
          type: "component",
          route: "select-gender",
          hideInEmployee: false,
          key: "selectGender",
          component: "SelectGender",
          // disable: disabled,
        },
        {
          label: t("ES_FSM_REGISTRY_NEW_DOB"),
          isMandatory: true,
          type: "custom",
          key: "dob",
          populators: {
            name: "dob",
            validation: {
              required: true,
            },
            component: (props, customProps) => (
              <DatePicker
                onChange={props.onChange}
                date={props.value}
                {...customProps}
                max={(() => {
                  const date = new Date();
                  date.setFullYear(date.getFullYear() - 18);
                  return date.toISOString().split("T")[0];
                })()}
              />
            ),
          },
        },
        {
          label: "ES_FSM_REGISTRY_NEW_EMAIL",
          isMandatory: false,
          type: "text",
          key: "emailId",
          populators: {
            name: "emailId",
            validation: {
              required: false,
              pattern: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+$/,
            },
            error: t("FSM_REGISTRY_INVALID_EMAIL"),
            defaultValue: "",
          },
        },
      ],
    },
  ];
};

export default VehicleConfig;
