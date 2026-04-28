/**
 * Config for the Emergency Fixed Point (WT Fixed Point) create form.
 * This is completely separate from the regular WT / MT / TP create flow.
 * All routes, keys, and component references are prefixed with "fp" or "fp-".
 */
export const fixedPointConfig = [
  {
    head: "FP_INFO",
    body: [
      {
        route: "fp-info",
        component: "EmergencyFixedPointInfoPage",
        nextStep: "fp-applicant-details",
        key: "fpInfoDetails",
      },
    ],
  },
  {
    head: "ES_TITILE_OWNER_DETAILS",
    body: [
      {
        route: "fp-applicant-details",
        component: "ApplicantDetails",
        withoutLabel: true,
        key: "owner",
        type: "component",
        nextStep: "fp-address-details",
        isMandatory: true,
        texts: {
          submitBarLabel: "COMMON_SAVE_NEXT",
          header: "ES_APPLICANT_DETAILS",
        },
        timeLine: [
          {
            currentStep: 1,
            actions: "ES_APPLICANT_DETAILS",
          },
        ],
      },
    ],
  },
  {
    head: "ES_TITLE_ADDRESS_DETAILS",
    body: [
      {
        route: "fp-address-details",
        component: "AddressDetails",
        withoutLabel: true,
        key: "address",
        type: "component",
        isMandatory: true,
        nextStep: "fp-request-details",
        texts: {
          submitBarLabel: "COMMON_SAVE_NEXT",
          header: "ES_ADDRESS_DETAILS",
        },
        timeLine: [
          {
            currentStep: 2,
            actions: "ES_ADDRESS_DETAILS",
          },
        ],
      },
    ],
  },
  {
    head: "FP_REQUEST_DETAILS",
    body: [
      {
        route: "fp-request-details",
        component: "RequestDetails",
        withoutLabel: true,
        key: "requestDetails",
        type: "component",
        isMandatory: true,
        nextStep: null,
        texts: {
          submitBarLabel: "COMMON_SAVE_NEXT",
          header: "WT_REQUEST_DETAILS",
        },
        timeLine: [
          {
            currentStep: 3,
            actions: "ES_REQUEST_DETAILS",
          },
        ],
      },
    ],
  },
];
