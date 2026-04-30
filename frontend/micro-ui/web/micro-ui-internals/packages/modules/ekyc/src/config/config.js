import AddressDetails from "../pages/employee/AddressDetails";
import AadhaarVerification from "../pages/employee/AadhaarVerification";

export const ekycConfig = [
  {
    body: [
      {
        route: "aadhaar-verification",
        component: AadhaarVerification,
        key: "aadhaarData",
        texts: {
          header: "EKYC_CONSUMER_DETAILS",
          submitBarLabel: "COMMON_SAVE_NEXT",
        },
        timeLine: [
          {
            currentStep: 1,
            actions: "EKYC_AADHAAR_VERIFICATION",
          },
        ],
      },
      {
        route: "address-details",
        component: AddressDetails,
        key: "addressDetails",
        texts: {
          header: "EKYC_ADDRESS_DETAILS",
          submitBarLabel: "COMMON_SAVE_NEXT",
        },
        timeLine: [
          {
            currentStep: 2,
            actions: "EKYC_ADDRESS_DETAILS",
          },
        ],
      },
      {
        route: "property-info",
        component: "PropertyInfo",
        key: "propertyDetails",
        texts: {
          header: "EKYC_PROPERTY_INFO",
          submitBarLabel: "COMMON_SAVE_NEXT",
        },
        timeLine: [
          {
            currentStep: 3,
            actions: "EKYC_PROPERTY_INFO",
          },
        ],
      },
      {
        route: "meter-details",
        component: "MeterDetails",
        key: "meterDetails",
        texts: {
          header: "EKYC_METER_DETAILS",
          submitBarLabel: "COMMON_SAVE_NEXT",
        },
        timeLine: [
          {
            currentStep: 4,
            actions: "EKYC_METER_DETAILS",
          },
        ],
      },
    ],
  },
];
