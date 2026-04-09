import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { Card, Dropdown, Loader, Menu, SubmitBar, Toast } from "@djb25/digit-ui-react-components";
//import FSMLink from "./inbox/FSMLink";
import VENDORLink from "./inbox/VENDORLink";
import ApplicationTable from "./inbox/ApplicationTable";
import Filter from "./inbox/Filter";
import { ToggleSwitch } from "@djb25/digit-ui-react-components";
//import RegistrySearch from "./RegistrySearch";
import RegistredVendorSearch from "./RegisteredVendorSearch";
import { useQueryClient } from "react-query";

const parseAdditionalDetails = (additionalDetails) => {
  if (!additionalDetails) return {};
  if (typeof additionalDetails === "object") return additionalDetails;
  if (typeof additionalDetails !== "string") return {};
  try {
    return JSON.parse(additionalDetails);
  } catch (error) {
    return {};
  }
};

const getFillingPointIdentifiers = (fillingPoint) => {
  if (!fillingPoint) return [];
  if (typeof fillingPoint === "string" || typeof fillingPoint === "number") return [String(fillingPoint)];

  return [
    fillingPoint?.id,
    fillingPoint?.fillingStationId,
    fillingPoint?.bookingId,
    fillingPoint?.fillingPointId,
    fillingPoint?.uuid,
    fillingPoint?.fillingpointmetadata?.fillingPointId,
  ]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String);
};

const getRowFillingPointIdentifiers = (row = {}) => {
  return Array.from(
    new Set([
      ...[
        row?.fillingPointId,
        row?.dsoDetails?.fillingPointId,
        row?.fillingpointmetadata?.fillingPointId,
        row?.fillingPtName,
        row?.filling_pt_name,
      ]
        .filter((value) => value !== undefined && value !== null && value !== "")
        .map(String),
      ...getFillingPointIdentifiers(row?.fillingPoint),
      ...getFillingPointIdentifiers(row?.dsoDetails?.fillingPoint),
      ...getFillingPointIdentifiers(row?.fillingPointDetail),
    ])
  );
};

const getSelectedFillingPointOption = (row, fillingPoints = []) => {
  const rowFillingPointIdentifiers = getRowFillingPointIdentifiers(row);
  if (!rowFillingPointIdentifiers.length) return null;

  return (
    fillingPoints.find((fillingPoint) =>
      getFillingPointIdentifiers(fillingPoint).some((identifier) => rowFillingPointIdentifiers.includes(identifier))
    ) || null
  );
};

const getFillingPointDisplayValue = (row = {}) => {
  return (
    row?.fillingPoint?.fillingPointName ||
    row?.dsoDetails?.fillingPoint?.fillingPointName ||
    row?.fillingPointName ||
    row?.dsoDetails?.fillingPointName ||
    row?.fillingPointId ||
    row?.dsoDetails?.fillingPointId ||
    (typeof row?.fillingPoint === "string" ? row?.fillingPoint : null) ||
    (typeof row?.dsoDetails?.fillingPoint === "string" ? row?.dsoDetails?.fillingPoint : null) ||
    row?.fillingpointmetadata?.fillingPointId ||
    row?.filling_pt_name ||
    row?.fillingPtName ||
    "NA"
  );
};

const normalizeFillingPointForVehicleUpdate = (fillingPoint) => {
  if (!fillingPoint || typeof fillingPoint !== "object") return fillingPoint;

  const { id, ...rest } = fillingPoint;

  return {
    ...rest,
    fillingStationId: fillingPoint?.fillingStationId || id || fillingPoint?.bookingId || fillingPoint?.uuid || fillingPoint?.fillingPointId,
  };
};

const VendorInbox = (props) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  const history = useHistory();
  const DSO = Digit.UserService.hasAccess(["FSM_DSO"]) || false;
  const GetCell = (value) => <span className="cell-text">{value}</span>;
  const FSTP = Digit.UserService.hasAccess("FSM_EMP_FSTPO") || false;
  const [tableData, setTableData] = useState([]);
  const [showToast, setShowToast] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const queryClient = useQueryClient();

  const {
    data: vendorData,
    isLoading: isVendorLoading,
    isSuccess: isVendorSuccess,
    error: vendorError,
    refetch: refetchVendor,
  } = Digit.Hooks.fsm.useDsoSearch(tenantId, { sortBy: "name", sortOrder: "ASC", status: "ACTIVE" }, { enabled: false });

  const { data: driverData, refetch: refetchDriver } = Digit.Hooks.fsm.useDriverSearch({
    tenantId,
    filters: {
      sortBy: "name",
      sortOrder: "ASC",
      status: "ACTIVE",
    },
  });

  const {
    isLoading: isUpdateVendorLoading,
    isError: vendorUpdateError,
    data: updateVendorResponse,
    error: updateVendorError,
    mutate: mutateVendor,
  } = Digit.Hooks.fsm.useVendorUpdate(tenantId);

  const {
    isLoading: isUpdateVehicleLoading,
    isError: vehicleUpdateError,
    data: updateVehicleResponse,
    error: updateVehicleError,
    mutate: mutateVehicle,
  } = Digit.Hooks.fsm.useUpdateVehicle(tenantId);

  const {
    isLoading: isDriverLoading,
    isError: driverUpdateError,
    data: updateDriverResponse,
    error: updateDriverError,
    mutate: mutateDriver,
  } = Digit.Hooks.fsm.useDriverUpdate(tenantId);

  useEffect(() => {
    setTableData(props?.data?.table || []);
  }, [props]);

  useEffect(() => {
    if (props.selectedTab === "DRIVER" || props.selectedTab === "VEHICLE") {
      refetchVendor();
      refetchDriver();
    }
  }, [props.selectedTab]);

  useEffect(() => {
    if (vendorData) {
      let vendors = vendorData.map((data) => data.dsoDetails);
      setVendors(vendors);
    }
  }, [vendorData]);

  useEffect(() => {
    if (driverData) {
      setDrivers(driverData.driver || []);
    }
  }, [driverData]);

  const closeToast = () => {
    setShowToast(null);
  };

  const getVehicleUpdatePayload = (vehicle, overrides = {}) => {
    const normalizedVehicle = {
      ...vehicle,
      ...overrides,
      driverData: overrides?.driverData || vehicle?.driverData || vehicle?.driver,
      fillingPoint: normalizeFillingPointForVehicleUpdate(
        Object.prototype.hasOwnProperty.call(overrides, "fillingPoint") ? overrides.fillingPoint : vehicle?.fillingPoint
      ),
    };

    delete normalizedVehicle.vendor;
    delete normalizedVehicle.popup;
    delete normalizedVehicle.driver;

    return {
      vehicle: normalizedVehicle,
    };
  };

  const onVendorUpdate = (row) => {
    let formDetails = row.original.dsoDetails;
    const formData = {
      vendor: {
        ...formDetails,
        status: formDetails?.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
        owner: {
          ...formDetails.owner,
          gender: formDetails?.owner?.gender || "OTHER",
          dob: formDetails?.owner?.dob || new Date(`1/1/1970`).getTime(),
          emailId: formDetails?.owner?.emailId || "abc@egov.com",
          relationship: formDetails?.owner?.relationship || "OTHER",
        },
      },
    };

    mutateVendor(formData, {
      onError: (error, variables) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: "VENDOR" });
        queryClient.invalidateQueries("DSO_SEARCH");
        props.refetchData();
        setTimeout(closeToast, 3000);
      },
    });
  };

  const onVehicleUpdate = (row) => {
    const formData = getVehicleUpdatePayload(row.original, {
      status: row.original?.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
    });

    mutateVehicle(formData, {
      onError: (error, variables) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: "VEHICLE" });
        queryClient.invalidateQueries("FSM_VEICLES_SEARCH");
        props.refetchVendor();
        props.refetchData();
        setTimeout(closeToast, 3000);
      },
    });
  };

  const onDriverUpdate = (row) => {
    let formDetails = row.original;
    const formData = {
      driver: {
        ...formDetails,
        status: formDetails?.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
        owner: {
          ...formDetails.owner,
          gender: formDetails?.owner?.gender || "OTHER",
          dob: formDetails?.owner?.dob || new Date(`1/1/1970`).getTime(),
          emailId: formDetails?.owner?.emailId || "abc@egov.com",
          relationship: formDetails?.owner?.relationship || "OTHER",
        },
      },
    };

    mutateDriver(formData, {
      onError: (error, variables) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: "DRIVER" });
        queryClient.invalidateQueries("FSM_DRIVER_SEARCH");
        props.refetchVendor();
        props.refetchData();
        setTimeout(closeToast, 3000);
      },
    });
  };

  //vendor dropdown in driver
  const onVendorSelect = (row, selectedOption) => {
    let driverData = row.original;
    let formDetails = row.original.dsoDetails;

    let existingVendor = driverData?.vendor;
    let selectedVendor = selectedOption;
    delete driverData.vendor;
    driverData.vendorDriverStatus = "ACTIVE";
    if (existingVendor) {
      const drivers = existingVendor?.drivers;
      drivers.splice(
        drivers.findIndex((ele) => ele.id === driverData.id),
        1
      );
      const formData = {
        vendor: {
          ...formDetails,
          drivers: drivers,
        },
      };
    }
    const formData = {
      vendor: {
        ...selectedVendor,
        drivers: selectedVendor.drivers ? [...selectedVendor.drivers, driverData] : [driverData],
      },
    };

    mutateVendor(formData, {
      onError: (error, variables) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: "VENDOR" });
        queryClient.invalidateQueries("DSO_SEARCH");
        props.refetchVendor();
        props.refetchData();
        setTimeout(closeToast, 3000);
      },
    });
  };

  const onDriverSelect = (row, selectedOption) => {
    const formData = getVehicleUpdatePayload(row.original, {
      driverData: selectedOption,
    });

    mutateVehicle(formData, {
      onError: (error, variables) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: "VEHICLE" });
        queryClient.invalidateQueries("FSM_VEICLES_SEARCH");
        /* Mandatory: Invalidate DSO_SEARCH to ensure vendorData in the parent component is refetched with the new driver assignment */
        queryClient.invalidateQueries("DSO_SEARCH");
        props.refetchData();
        props.refetchVendor();
        setTimeout(closeToast, 3000);
      },
    });
  };

  const onVehicleFillingPointSelect = (row, selectedOption) => {
    const formData = getVehicleUpdatePayload(row.original, {
      fillingPoint: selectedOption,
    });

    mutateVehicle(formData, {
      onError: (error) => {
        setShowToast({
          key: "error",
          label: error?.message || error?.response?.data?.Errors?.[0]?.message || "Failed to map filling point",
        });
        setTimeout(closeToast, 5000);
      },
      onSuccess: () => {
        setTableData((currentTableData) =>
          currentTableData.map((vehicle) =>
            vehicle?.id === row.original?.id
              ? {
                  ...vehicle,
                  fillingPoint: {
                    ...selectedOption,
                    fillingStationId:
                      selectedOption?.fillingStationId ||
                      selectedOption?.id ||
                      selectedOption?.bookingId ||
                      selectedOption?.uuid ||
                      selectedOption?.fillingPointId,
                  },
                }
              : vehicle
          )
        );
        setShowToast({ key: "success", label: "Filling point mapped successfully" });
        queryClient.invalidateQueries("FSM_VEICLES_SEARCH");
        queryClient.invalidateQueries("DSO_SEARCH");
        props.refetchData();
        props.refetchVendor && props.refetchVendor();
        setTimeout(closeToast, 3000);
      },
    });
  };

  const onCellClick = (row, column, length) => {
    setTableData((old) =>
      old.map((data, index) => {
        if (index == row.id && row.id !== data?.popup?.row && column.id !== data?.popup?.column && length) {
          return {
            ...data,
            popup: {
              row: row.id,
              column: column.id,
            },
          };
        } else {
          return {
            ...data,
            popup: {},
          };
        }
      })
    );
  };

  const onActionSelect = (action, type, data) => {
    if (type === "VEHICLE") {
      history.push("/digit-ui/employee/vendor/registry/vehicle-details/" + action);
    } else {
      let driver = data.find((ele) => ele.name === action);
      history.push("/digit-ui/employee/vendor/registry/driver-details/" + driver?.id);
    }
  };

  //on search if the card is empty then it will
  const onSelectAdd = () => {
    switch (props.selectedTab) {
      case "VENDOR":
        return history.push("/digit-ui/employee/vendor/registry/new-vendor");
      case "VEHICLE":
        return history.push("/digit-ui/employee/fsm/registry/new-vehicle");
      case "DRIVER":
        return history.push("/digit-ui/employee/fsm/registry/new-driver");
      default:
        break;
    }
  };

  const vendorIds = React.useMemo(() => {
    if (props.selectedTab === "VENDOR") {
      return tableData?.map((row) => row.id) || [];
    }
    return vendorData?.map((v) => v.dsoDetails?.id) || [];
  }, [props.selectedTab, tableData, vendorData]);
  const { data: additionalVendorData } = Digit.Hooks.vendor.useEmpvendorCommonSearch(
    {
      tenantId,
      filters: { vendorIds: vendorIds?.join(","), vendorId: vendorIds?.join(",") },
    },
    { enabled: vendorIds?.length > 0 }
  );

  const { data: allFillingPointsData, isLoading: isAllFillingPointsLoading } = Digit.Hooks.wt.useFillPointSearch(
    {
      tenantId,
      filters: { limit: 1000 },
    },
    { enabled: true }
  );

  const allFillingPoints = allFillingPointsData?.fillingPoints || [];

  const { mutate: mapFixedFilling } = Digit.Hooks.wt.useVendorFillingMap(tenantId);

  const onFillingPointSelect = (row, value) => {
    const payload = {
      mappings: [
        {
          tenantId: tenantId,
          fillingPointId: value?.id || value?.bookingId || value?.fillingPointId,
          vendorId: row.original.id,
        },
      ],
    };

    mapFixedFilling(payload, {
      onSuccess: () => {
        setShowToast({ key: "success", label: "WT_FIXED_FILLING_MAPPING_SUCCESS" });
        props.refetchData();
        props.refetchVendor && props.refetchVendor();
        setTimeout(closeToast, 5000);
      },
      onError: (err) => {
        setShowToast({
          key: "error",
          label: err?.response?.data?.Errors?.[0]?.message || "WT_FIXED_FILLING_MAPPING_FAIL",
        });
        setTimeout(closeToast, 5000);
      },
    });
  };

  //used for columns in table
  const columns = React.useMemo(() => {
    switch (props.selectedTab) {
      case "VENDOR":
        return [
          //Vendor Name
          {
            Header: t("ES_VENDOR_INBOX_VENDOR_NAME"),
            accessor: "name",
            Cell: ({ row }) => {
              return (
                <div>
                  <span className="link">
                    <Link to={"/digit-ui/employee/vendor/registry/vendor-details/" + row.original["id"]}>
                      <div>
                        {row.original.name}
                      </div>
                    </Link>
                  </span>
                </div>
              );
            },
          },

          //creation date
          {
            Header: t("ES_VENDOR_INBOX_DATE_VENDOR_CREATION"),
            accessor: "createdTime",
            Cell: ({ row }) =>
              GetCell(row.original?.auditDetails?.createdTime ? Digit.DateUtils.ConvertEpochToDate(row.original?.auditDetails?.createdTime) : ""),
          },

          // {
          //   Header: t("ES_VENDOR_INBOX_SERVICE_TYPE"),
          //   disableSortBy: true,
          //   Cell: ({ row }) => {
          //     //let description =
          //     //const description = JSON.parse(payload.dsoDetails.address.additionalDetails).description;
          //     //console.log("description", description); // Debugging
          //     console.log("before addressssss",row.original.dsoDetails )
          //     console.log("service type", row.original.dsoDetails?.additionalDetails?.description);
          //     //let address = row.original.dsoDetails.address;
          //     //console.log("vendor", address.additionalDetails); // Debugging
          //     console.log("");
          //     const additionalDetails = JSON.parse(row.original.dsoDetails?.additionalDetails?.description);
          //     //const description = additionalDetails.description;

          //     return (
          //       <div>
          //         {/* <span className="link">
          //           <Link to={`/digit-ui/employee/vendor/registry/new-vendor${row.original["id"] || ""}`}>
          //             <div>
          //               {description}
          //               <br />
          //             </div>
          //           </Link>
          //         </span> */}
          //         {additionalDetails}
          //       </div>
          //     );
          //   },
          // },
          {
            Header: t("WT_FILLING_POINT"),
            accessor: (row) => getFillingPointDisplayValue(row),
            id: "fillingPoint",
            Cell: ({ row }) => {
              return (
                <Dropdown
                  className="fsm-registry-dropdown"
                  selected={getSelectedFillingPointOption(row.original, allFillingPoints)}
                  option={allFillingPoints}
                  select={(value) => onFillingPointSelect(row, value)}
                  style={{ textAlign: "left" }}
                  optionKey="fillingPointName"
                  t={t}
                />
              );
            },
          },

          {
            Header: t("ES_VENDOR_INBOX_SERVICE_TYPE"),
            id: "serviceType",
            accessor: (row) => {
              let additionalDetails = row.dsoDetails?.additionalDetails;
              if (typeof additionalDetails === "string") {
                try {
                  additionalDetails = JSON.parse(additionalDetails);
                } catch (error) {
                  additionalDetails = {};
                }
              }
              return additionalDetails?.serviceType || "N/A";
            },
            Cell: ({ row }) => {
              let additionalDetails = row.original.dsoDetails?.additionalDetails;
              if (typeof additionalDetails === "string") {
                try {
                  additionalDetails = JSON.parse(additionalDetails);
                } catch (error) {
                  console.error("Error parsing additionalDetails:", error);
                  additionalDetails = {};
                }
              }

              const serviceType = additionalDetails?.serviceType || "N/A";
              return <div>{serviceType}</div>;
            },
          },

          // {
          //   Header: t("ES_VENDOR_INBOX_VENDOR_NAME"),
          //   disableSortBy: true,
          //   Cell: ({ row }) => {

          //     return (
          //       <div>
          //         {/* <span className="link">
          //           <Link to={`/digit-ui/employee/vendor/registry/new-vendor${row.original["id"] || ""}`}>
          //             <div>
          //               {row}
          //               <br />
          //             </div>
          //           </Link>
          //         </span> */}
          //         {row.original.name}
          //       </div>
          //     );

          //   }
          // },

          // {
          //   Header: t("ES_FSM_REGISTRY_INBOX_VENDOR_NAME"),
          //   Cell: ({ row }) => {
          //     return (
          //       <Dropdown
          //         className="fsm-registry-dropdown"
          //         selected={row.original.vendor}
          //         option={vendors}
          //         select={(value) => onVendorSelect(row, value)}
          //         optionKey="name"
          //         t={t}
          //       />
          //     );
          //   },
          // },

          // {
          //   Header: t("ES_VENDOR_INBOX_SERVICE_TYPE"),
          //   disableSortBy: true,
          //   cell: ({ row }) => {
          //     //console.log("vendor", row.original.dsoDetails.address.additionalDetails); // Debugging
          //     const additionalDetails = JSON.parse(row.original.dsoDetails.address.additionalDetails);
          //     const description = additionalDetails.description;
          //     console.log("dsodetails", row.original.dsoDetails);
          //     return (
          //       <div>
          //         <span className="link">
          //           <Link to={"/digit-ui/employee/vendor/registry/vendor-details/" + row.original["id"]}>
          //             <div>{description}
          //             <br />
          //             </div>

          //           </Link>
          //         </span>
          //       </div>
          //     );
          //   },
          // },

          //total vehicles
          // {
          //   Header: t("ES_FSM_REGISTRY_INBOX_TOTAL_VEHICLES"),
          //   Cell: ({ row, column }) => {
          //     return (
          //       <div className="action-bar-wrap-registry" style={{ position: "relative" }}>
          //         <div
          //           className={row.original?.allVehicles?.length ? "link" : "cell-text"}
          //           style={{ cursor: "pointer" }}
          //           onClick={() => onCellClick(row, column, row.original?.allVehicles?.length)}
          //         >
          //           {row.original?.allVehicles?.length || 0}
          //           <br />
          //         </div>
          //         {row.id === row.original?.popup?.row && column.id === row.original?.popup?.column && (
          //           <Menu
          //             localeKeyPrefix={""}
          //             options={row.original?.allVehicles?.map((data) => data.registrationNumber)}
          //             onSelect={(action) => onActionSelect(action, "VEHICLE")}
          //           />
          //         )}
          //       </div>
          //     );
          //   },
          // },

          //active vehicles
          // {
          //   Header: t("ES_FSM_REGISTRY_INBOX_ACTIVE_VEHICLES"),
          //   disableSortBy: true,
          //   Cell: ({ row, column }) => {
          //     return (
          //       <div className="action-bar-wrap-registry" style={{ position: "relative" }}>
          //         <div
          //           className={row.original?.vehicles?.length ? "link" : "cell-text"}
          //           style={{ cursor: "pointer" }}
          //           onClick={() => onCellClick(row, column, row.original?.vehicles?.length)}
          //         >
          //           {row.original?.vehicles?.length || 0}
          //           <br />
          //         </div>
          //         {row.id === row.original?.popup?.row && column.id === row.original?.popup?.column && (
          //           <Menu
          //             localeKeyPrefix={""}
          //             options={row.original?.vehicles?.map((data) => data.registrationNumber)}
          //             onSelect={(action) => onActionSelect(action, "VEHICLE")}
          //           />
          //         )}
          //       </div>
          //     );
          //   },
          // },

          //total drivers
          // {
          //   Header: t("ES_FSM_REGISTRY_INBOX_TOTAL_DRIVERS"),
          //   disableSortBy: true,
          //   Cell: ({ row, column }) => {
          //     return (
          //       <div className="action-bar-wrap-registry" style={{ position: "relative" }}>
          //         <div
          //           className={row.original?.drivers?.length ? "link" : "cell-text"}
          //           style={{ cursor: "pointer" }}
          //           onClick={() => onCellClick(row, column, row.original?.drivers?.length)}
          //         >
          //           {row.original?.drivers?.length || 0}
          //           <br />
          //         </div>
          //         {row.id === row.original?.popup?.row && column.id === row.original?.popup?.column && (
          //           <Menu
          //             localeKeyPrefix={""}
          //             options={row.original?.drivers?.map((data) => data.name)}
          //             onSelect={(action) => onActionSelect(action, "DRIVER", row.original?.drivers)}
          //           />
          //         )}
          //       </div>
          //     );
          //   },
          // },

          //active drivers
          // {
          //   Header: t("ES_FSM_REGISTRY_INBOX_ACTIVE_DRIVERS"),
          //   disableSortBy: true,
          //   Cell: ({ row, column }) => {
          //     return (
          //       <div className="action-bar-wrap-registry" style={{ position: "relative" }}>
          //         <div
          //           className={row.original?.activeDrivers?.length ? "link" : "cell-text"}
          //           style={{ cursor: "pointer" }}
          //           onClick={() => onCellClick(row, column, row.original?.activeDrivers?.length)}
          //         >
          //           {row.original?.activeDrivers?.length || 0}
          //           <br />
          //         </div>
          //         {row.id === row.original?.popup?.row && column.id === row.original?.popup?.column && (
          //           <Menu
          //             localeKeyPrefix={""}
          //             options={row.original?.activeDrivers?.map((data) => data.name)}
          //             onSelect={(action) => onActionSelect(action, "DRIVER", row.original?.activeDrivers)}
          //           />
          //         )}
          //       </div>
          //     );
          //   },
          // },

          //enabled/disabled
          {
            Header: t("ES_VENDOR_REGISTRY_INBOX_ENABLED"),
            id: "status",
            accessor: (row) => row.dsoDetails?.status || "",
            Cell: ({ row }) => {
              return (
                <ToggleSwitch
                  style={{ display: "flex", justifyContent: "left" }}
                  value={row.original?.dsoDetails?.status === "DISABLED" ? false : true}
                  onChange={() => onVendorUpdate(row)}
                  name={`switch-${row.id}`}
                />
              );
            },
          },

          {
            Header: t("ES_VENDOR_ADDITIONAL_DETAILS"),
            disableSortBy: true,
            Cell: ({ row }) => {
              const vendorId = row.original?.id;

              // Guard: if data not yet loaded, show a neutral state
              if (!additionalVendorData) {
                return <span>Loading...</span>;
              }

              const hasDetails = additionalVendorData?.VendorDetails?.some((item) => item?.vendorAdditionalDetails?.vendorId === vendorId);
              return (
                <Link
                  to={
                    hasDetails
                      ? "/digit-ui/employee/vendor/registry/additionaldetails/info?vendorId=" + vendorId
                      : "/digit-ui/employee/vendor/registry/additionaldetails/vendor-details?vendorId=" + vendorId
                  }
                >
                  <button
                    className="submit-bar"
                    style={{
                      backgroundColor: hasDetails ? "#417505" : "#F47738",
                      color: "white",
                    }}
                  >
                    {hasDetails ? "View Details" : "Add Details"}
                  </button>
                </Link>
              );
            },
          },
        ];

      //if toggle on vehicle then it will show the below columns
      case "VEHICLE":
        return [
          //vehicle name/number
          {
            Header: t("ES_FSM_REGISTRY_INBOX_VEHICLE_NAME"),
            accessor: "registrationNumber",
            Cell: ({ row }) => {
              return (
                <div>
                  <span className="link">
                    <Link to={"/digit-ui/employee/vendor/registry/vehicle-details/" + row.original["registrationNumber"]}>
                      <div>
                        {row.original.registrationNumber}
                      </div>
                    </Link>
                  </span>
                </div>
              );
            },
          },

          //creation date
          {
            Header: t("ES_FSM_REGISTRY_INBOX_DATE_VEHICLE_CREATION"),
            accessor: "createdTime",
            Cell: ({ row }) =>
              GetCell(row.original?.auditDetails?.createdTime ? Digit.DateUtils.ConvertEpochToDate(row.original?.auditDetails?.createdTime) : ""),
          },

          //vendor name
          {
            Header: t("ES_FSM_REGISTRY_INBOX_VENDOR_NAME"),
            id: "vendorName",
            accessor: (row) => row.vendor?.name || "NA",
            Cell: ({ row }) => GetCell(row.original?.vendor?.name || "NA"),
          },

          // {
          //   Header: t("ES_VENDOR_INBOX_SERVICE_TYPE"),
          //   disableSortBy: true,
          //   Cell: ({ row }) => {

          //     let additionalDetails = row.original.additionalDetails;
          //     console.log("additonal detailssss", additionalDetails)
          //     if (typeof additionalDetails === "string") {
          //       try {
          //         additionalDetails = JSON.parse(additionalDetails);
          //       } catch (error) {
          //         console.error("Error parsing additionalDetails:", error);
          //         additionalDetails = {}; // Fallback to an empty object if parsing fails
          //       }
          //     }

          //     let servicetyee = additionalDetails.serviceType || "N/A";
          //     //const serviceType = additionalDetails?.serviceType || "N/A";
          //     console.log("servicee type", servicetyee)
          //     return (
          //       <div>
          //        {servicetyee}
          //       </div>
          //     );
          //   },
          // },

          {
            Header: t("ES_VENDOR_INBOX_SERVICE_TYPE"),
            id: "serviceType",
            accessor: (row) => {
              let additionalDetail = row.additionalDetails;
              if (typeof additionalDetail === "string") {
                try {
                  additionalDetail = JSON.parse(additionalDetail);
                } catch (error) {
                  additionalDetail = {};
                }
              }
              return additionalDetail?.serviceType || "N/A";
            },
            Cell: ({ row }) => {
              let additionalDetail = row.original.additionalDetails;
              if (typeof additionalDetail === "string") {
                try {
                  additionalDetail = JSON.parse(additionalDetail);
                } catch (error) {
                  console.error("Error parsing additionalDetails:", error);
                  additionalDetail = {};
                }
              }

              const serviceType = additionalDetail?.serviceType || "N/A";
              return <div>{serviceType}</div>;
            },
          },

          {
            Header: t("WT_FILLING_POINT"),
            accessor: (row) => getFillingPointDisplayValue(row),
            id: "fillingPoint",
            Cell: ({ row }) => {
              return (
                <Dropdown
                  className="fsm-registry-dropdown"
                  selected={getSelectedFillingPointOption(row.original, allFillingPoints)}
                  option={allFillingPoints}
                  select={(value) => onVehicleFillingPointSelect(row, value)}
                  style={{ textAlign: "left" }}
                  optionKey="fillingPointName"
                  t={t}
                />
              );
            },
          },

          {
            Header: t("ES_FSM_REGISTRY_SELECT_DRIVER"),
            id: "driver",
            accessor: (row) => (row.driverData?.name || row.driver?.name || "NA"),
            Cell: ({ row }) => {
              return (
                <Dropdown
                  className="fsm-registry-dropdown"
                  /* Use ID matching to ensure the selection is shown even if object references differ between API calls */
                  selected={
                    drivers?.find((driver) => (row.original.driverData?.id || row.original.driver?.id) === driver.id) ||
                    row.original.driverData ||
                    row.original.driver
                  }
                  option={drivers}
                  select={(value) => onDriverSelect(row, value)}
                  optionKey="name"
                  t={t}
                  style={{ textAlign: "left" }}
                />
              );
            },
          },

          //enabled
          {
            Header: t("ES_FSM_REGISTRY_INBOX_ENABLED"),
            id: "status",
            accessor: (row) => row.status || "",
            Cell: ({ row }) => {
              return (
                <ToggleSwitch
                  style={{ display: "flex", justifyContent: "left" }}
                  value={row.original?.status === "DISABLED" ? false : true}
                  onChange={() => onVehicleUpdate(row)}
                  name={`switch-${row.id}`}
                />
              );
            },
          },
        ];

      //if toggle on driver then it will show the below columns
      case "DRIVER":
        return [
          //Username
          {
            Header: t("ES_FSM_REGISTRY_INBOX_USERNAME"),
            id: "userName",
            accessor: (row) => row.owner?.userName || "NA",
            Cell: ({ row }) => {
              return (
                <div>
                  <span className="link">
                    <Link to={"/digit-ui/employee/vendor/registry/driver-details/" + row.original["id"]}>
                      <div>
                        {row.original.owner?.userName || "NA"}
                      </div>
                    </Link>
                  </span>
                </div>
              );
            },
          },
          //driver name
          {
            Header: t("ES_FSM_REGISTRY_INBOX_DRIVER_NAME"),
            accessor: "name",
            Cell: ({ row }) => {
              return (
                <div>
                  <span className="link">
                    <Link to={"/digit-ui/employee/vendor/registry/driver-details/" + row.original["id"]}>
                      <div>
                        {row.original.name}
                      </div>
                    </Link>
                  </span>
                </div>
              );
            },
          },

          //creation date
          {
            Header: t("ES_FSM_REGISTRY_INBOX_DATE_DRIVER_CREATION"),
            accessor: "createdTime",
            Cell: ({ row }) =>
              GetCell(row.original?.auditDetails?.createdTime ? Digit.DateUtils.ConvertEpochToDate(row.original?.auditDetails?.createdTime) : ""),
          },

          //vendor name
          {
            Header: t("ES_FSM_REGISTRY_INBOX_VENDOR_NAME"),
            id: "vendorName",
            accessor: (row) => (row.vendorData?.name || row.vendor?.name || "NA"),
            Cell: ({ row }) => {
              return (
                <Dropdown
                  className="fsm-registry-dropdown"
                  selected={
                    vendors?.find((vendor) => (row.original.vendorData?.id || row.original.vendor?.id) === vendor.id) ||
                    row.original.vendorData ||
                    row.original.vendor
                  }
                  // selected={row.original.vendor}
                  option={vendors}
                  select={(value) => onVendorSelect(row, value)}
                  style={{ textAlign: "left" }}
                  optionKey="name"
                  t={t}
                />
              );
            },
          },

          //enabled
          {
            Header: t("ES_FSM_REGISTRY_INBOX_ENABLED"),
            id: "status",
            accessor: (row) => row.status || "",
            Cell: ({ row }) => {
              return (
                <ToggleSwitch
                  style={{ display: "flex", justifyContent: "left" }}
                  value={row.original?.status === "DISABLED" ? false : true}
                  onChange={() => onDriverUpdate(row)}
                  name={`switch-${row.id}`}
                />
              );
            },
          },
        ];
      default:
        return [];
    }
  }, [props.selectedTab, vendors, drivers, tableData, additionalVendorData, allFillingPoints, t]);

  const csvExportColumns = React.useMemo(() => {
    switch (props.selectedTab) {
      case "VENDOR":
        return [
          {
            Header: t("ES_VENDOR_INBOX_VENDOR_NAME"),
            exportAccessor: (row) => row?.name || row?.dsoDetails?.name || "NA",
          },
          {
            Header: t("ES_VENDOR_INBOX_DATE_VENDOR_CREATION"),
            exportAccessor: (row) =>
              row?.auditDetails?.createdTime ? Digit.DateUtils.ConvertEpochToDate(row?.auditDetails?.createdTime) : "",
          },
          {
            Header: t("WT_FILLING_POINT"),
            exportAccessor: (row) => getFillingPointDisplayValue(row),
          },
          {
            Header: t("ES_VENDOR_INBOX_SERVICE_TYPE"),
            exportAccessor: (row) => parseAdditionalDetails(row?.dsoDetails?.additionalDetails)?.serviceType || "N/A",
          },
          {
            Header: t("ES_VENDOR_REGISTRY_INBOX_ENABLED"),
            exportAccessor: (row) => row?.dsoDetails?.status || "NA",
          },
        ];
      case "VEHICLE":
        return [
          {
            Header: t("ES_FSM_REGISTRY_INBOX_VEHICLE_NAME"),
            exportAccessor: (row) => row?.registrationNumber || "NA",
          },
          {
            Header: t("ES_FSM_REGISTRY_INBOX_DATE_VEHICLE_CREATION"),
            exportAccessor: (row) =>
              row?.auditDetails?.createdTime ? Digit.DateUtils.ConvertEpochToDate(row?.auditDetails?.createdTime) : "",
          },
          {
            Header: t("ES_FSM_REGISTRY_INBOX_VENDOR_NAME"),
            exportAccessor: (row) => row?.vendor?.name || "NA",
          },
          {
            Header: t("ES_VENDOR_INBOX_SERVICE_TYPE"),
            exportAccessor: (row) => parseAdditionalDetails(row?.additionalDetails)?.serviceType || "N/A",
          },
          {
            Header: t("WT_FILLING_POINT"),
            exportAccessor: (row) => getFillingPointDisplayValue(row),
          },
          {
            Header: t("ES_FSM_REGISTRY_SELECT_DRIVER"),
            exportAccessor: (row) => row?.driverData?.name || row?.driver?.name || "NA",
          },
          {
            Header: t("ES_FSM_REGISTRY_INBOX_ENABLED"),
            exportAccessor: (row) => row?.status || "NA",
          },
        ];
      case "DRIVER":
        return [
          {
            Header: t("ES_FSM_REGISTRY_INBOX_USERNAME"),
            exportAccessor: (row) => row?.owner?.userName || "NA",
          },
          {
            Header: t("ES_FSM_REGISTRY_INBOX_DRIVER_NAME"),
            exportAccessor: (row) => row?.name || "NA",
          },
          {
            Header: t("ES_FSM_REGISTRY_INBOX_DATE_DRIVER_CREATION"),
            exportAccessor: (row) =>
              row?.auditDetails?.createdTime ? Digit.DateUtils.ConvertEpochToDate(row?.auditDetails?.createdTime) : "",
          },
          {
            Header: t("ES_FSM_REGISTRY_INBOX_VENDOR_NAME"),
            exportAccessor: (row) => row?.vendorData?.name || row?.vendor?.name || "NA",
          },
          {
            Header: t("ES_FSM_REGISTRY_INBOX_ENABLED"),
            exportAccessor: (row) => row?.status || "NA",
          },
        ];
      default:
        return [];
    }
  }, [props.selectedTab, t]);

  const getCSVExportData = React.useCallback(async () => tableData, [tableData]);

  // if it validate the user role then it starts working
  let result;
  if (props.isLoading || isAllFillingPointsLoading) {
    result = <Loader />;
  } else if (tableData.length === 0) {
    let emptyCardText = "";
    let emptyButtonText = "";
    if (props.selectedTab === "VENDOR") {
      emptyCardText = "ES_FSM_REGISTRY_EMPTY_CARD_VENDOR";
      emptyButtonText = "ES_FSM_REGISTRY_EMPTY_BUTTON_VENDOR";
    } else if (props.selectedTab === "VEHICLE") {
      emptyCardText = "ES_FSM_REGISTRY_EMPTY_CARD_VEHICLE";
      emptyButtonText = "ES_FSM_REGISTRY_EMPTY_BUTTON_VEHICLE";
    } else {
      emptyCardText = "ES_FSM_REGISTRY_EMPTY_CARD_DRIVER";
      emptyButtonText = "ES_FSM_REGISTRY_EMPTY_BUTTON_DRIVER";
    }
    result = (
      <Card style={{ display: "flex", justifyContent: "center", minHeight: "250px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ marginTop: "50px", marginBottom: "25px" }}>{t(emptyCardText)}</div>
          <SubmitBar className="" label={t(emptyButtonText)} onSubmit={onSelectAdd} />
        </div>
      </Card>
    );

    //if data in table is greater than 0 then it will create table
  } else if (tableData.length > 0) {
    result = (
      <ApplicationTable
        className="table registryTable"
        t={t}
        data={tableData}
        columns={columns}
        getCellProps={(cellInfo) => {
          return {
            style: {
              padding: "8px 12px",
              fontSize: "13.5px",
            },
          };
        }}
        onPageSizeChange={props.onPageSizeChange}
        currentPage={props.currentPage}
        onNextPage={props.onNextPage}
        onPrevPage={props.onPrevPage}
        pageSizeLimit={props.pageSizeLimit}
        onSort={props.onSort}
        disableSort={props.disableSort}
        sortParams={props.sortParams}
        totalRecords={props.totalRecords}
        showCSVExport={true}
        getCSVExportData={getCSVExportData}
        csvExportColumns={csvExportColumns}
        csvExportFileName={`vendor-${String(props.selectedTab || "registry").toLowerCase()}-inbox`}
      />
    );
  }

  return (
    <div className="inbox-container">
      {props.userRole !== "FSM_EMP_FSTPO" && props.userRole !== "FSM_ADMIN" && !props.isSearch && (
        <div className="filters-container">
          <VENDORLink parentRoute={props.parentRoute} />
          <div style={{ marginTop: "24px" }}>
            <Filter
              searchParams={props.searchParams}
              paginationParms={props.paginationParms}
              applications={props.data}
              onFilterChange={props.onFilterChange}
              type="desktop"
            />
          </div>
        </div>
      )}
      <div style={{ flex: 1, width: "100%", marginLeft: props.userRole === "FSM_ADMIN" ? "" : "24px" }}>
        <RegistredVendorSearch
          onSearch={props.onSearch}
          type="desktop"
          searchFields={props.searchFields}
          isInboxPage={!props?.isSearch}
          searchParams={props.searchParams}
          onTabChange={props.onTabChange}
          selectedTab={props.selectedTab}
        />
        <div className="result" style={{ marginLeft: FSTP || props.userRole === "FSM_ADMIN" ? "" : !props?.isSearch ? "24px" : "", flex: 1 }}>
          {result}
        </div>
      </div>
      {showToast && (
        <Toast
          error={showToast.key === "error" ? true : false}
          label={showToast.label ? t(showToast.label) : t(showToast.key === "success" ? `ES_FSM_REGISTRY_${showToast.action}_DISABLE_SUCCESS` : showToast.action)}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default VendorInbox;
