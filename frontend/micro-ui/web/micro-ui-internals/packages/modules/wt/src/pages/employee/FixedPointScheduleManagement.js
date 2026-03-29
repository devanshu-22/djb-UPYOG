import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Dropdown, SubmitBar, Toast, CardLabel } from "@djb25/digit-ui-react-components";
import AddTripModal from "../../components/AddTripModal";
import ApplicationTable from "../../components/inbox/ApplicationTable";

const FixedPointScheduleManagement = ({ ...props }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedDay, setSelectedDay] = useState("all");
  const [fixedPoint, setFixedPoint] = useState({ label: "All Fixed Points", value: "all" });
  const [day, setDay] = useState({ label: "All Days", value: "all" });
  const [status, setStatus] = useState({ label: "All Status", value: "all" });
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({ limit: 10, offset: 0 });

  const { isLoading, data: scheduleData, refetch: reSearch } = Digit.Hooks.wt.useFixedPointScheduleSearch(tenantId, filters);

  const { data: fixedPointData, isLoading: isFpLoading } = Digit.Hooks.wt.useFixedPointSearchAPI({ tenantId, filters: { offset: 0, limit: 100 } });

  // Fetch all filtered records for export (up to 1000)
  const allFilters = React.useMemo(() => ({ ...filters, limit: 1000, offset: 0 }), [filters]);
  const { data: allSchedulesData } = Digit.Hooks.wt.useFixedPointScheduleSearch(tenantId, allFilters);

  const fixedPoints = React.useMemo(() => {
    const fromFpApi = fixedPointData?.fixedPointTimeTableDetails || fixedPointData?.waterTankerBookingDetail || fixedPointData?.fixedPoints || [];
    const fromScheduleApi = allSchedulesData?.fixedPointTimeTableDetails || [];

    // Merge both sources
    const combinedData = [...fromFpApi, ...fromScheduleApi];

    const points = combinedData
      .map((fp) => ({
        label: fp.fixedPointCode || fp.name || fp.applicantDetail?.name || fp.bookingId,
        value: fp.fixedPointCode || fp.bookingId,
      }))
      .filter((p) => p.label && p.value);

    // Remove duplicates
    const uniquePoints = points.filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);

    return [
      { label: t("WT_ALL_FIXED_POINTS") !== "WT_ALL_FIXED_POINTS" ? t("WT_ALL_FIXED_POINTS") : "All Fixed Points", value: "all" },
      ...uniquePoints,
    ];
  }, [fixedPointData, allSchedulesData, t]);

  const { mutate: createSchedule } = Digit.Hooks.wt.useCreateFixedPointSchedule(tenantId);
  const { mutate: updateSchedule } = Digit.Hooks.wt.useUpdateFixedPointSchedule(tenantId);

  const closeToast = () => {
    setToast(null);
  };

  const handleDelete = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  const handleDownload = (type) => {
    const now = new Date();
    const formattedDate = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    const filename = `FixedPointSchedule_${type.value}_${formattedDate}`;
    const allData = allSchedulesData?.fixedPointTimeTableDetails || [];

    // Format data for Excel: Array of Arrays starting with Headers
    const excelData = [
      [
        t("WT_SCHEDULE_ID"),
        t("WT_FIXED_POINT"),
        t("WT_DAY"),
        t("WT_FREQ"),
        t("WT_ARR_TO_FPL"),
        t("WT_DEP_FROM_FPL"),
        t("WT_ARR_AT_FIXED_POINT"),
        t("WT_DEP_AT_FIXED_POINT"),
        t("WT_RETURN_TO_FPL"),
        t("WT_VOLUME"),
        t("WT_VEHICLE"),
        t("WT_ACTIVE"),
      ],
      ...allData.map((item) => [
        item.systemAssignedScheduleId,
        item.fixedPointCode,
        t(item.day),
        item.tripNo,
        item.arrivalTimeToFpl,
        item.departureTimeFromFpl,
        item.arrivalTimeDeliveryPoint,
        item.departureTimeDeliveryPoint,
        item.timeOfArrivingBackFplAfterDelivery,
        item.volumeWaterTobeDelivery,
        item.vehicleId,
        item.isEnable ? "Y" : "N",
      ]),
    ];

    if (window.Digit && window.Digit.Download && window.Digit.Download.Excel) {
      window.Digit.Download.Excel(excelData, filename);
    } else {
      // Fallback to CSV with formatted excelData
      const csvRows = excelData.map((row) =>
        row
          .map((cell) => {
            const escaped = ("" + (cell === null || cell === undefined ? "" : cell)).replace(/"/g, '\\"');
            return `"${escaped}"`;
          })
          .join(",")
      );
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const [data, setData] = useState([]);

  const mapScheduleRows = React.useCallback(
    (rows = []) =>
      rows.map((item) => ({
        scheduleId: item.systemAssignedScheduleId,
        fixedPoint: item.fixedPointCode,
        day: item.day,
        freq: item.tripNo,
        arrToFpl: item.arrivalTimeToFpl,
        depFromFpl: item.departureTimeFromFpl,
        arrAtFixedPoint: item.arrivalTimeDeliveryPoint,
        depAtFixedPoint: item.departureTimeDeliveryPoint,
        returnToFpl: item.timeOfArrivingBackFplAfterDelivery,
        volume: item.volumeWaterTobeDelivery,
        vehicle: item.vehicleId,
        active: item.isEnable ? "Y" : "N",
        totalCount: item.totalCount,
      })),
    []
  );

  React.useEffect(() => {
    if (scheduleData?.fixedPointTimeTableDetails) {
      setData(mapScheduleRows(scheduleData.fixedPointTimeTableDetails));
    }
  }, [mapScheduleRows, scheduleData]);

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - pageSize);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const handleSearch = (customFilters = null, offset = null) => {
    const searchFilters = customFilters || {
      fixedPointCode: fixedPoint?.value === "all" ? "" : fixedPoint?.value,
      day: day?.value === "all" ? "" : day?.value?.toUpperCase(),
      status: status?.value === "all" ? "" : status?.value,
    };
    const newOffset = offset !== null ? offset : 0;
    if (offset === null) setPageOffset(0);
    setFilters({ ...searchFilters, limit: pageSize, offset: newOffset });
  };

  React.useEffect(() => {
    if (pageOffset !== 0) {
      handleSearch(null, pageOffset);
    }
  }, [pageOffset, pageSize]);

  const columns = React.useMemo(
    () => [
      // { Header: t("WT_SCHEDULE_ID"), accessor: "scheduleId" },
      { Header: t("WT_FIXED_POINT"), accessor: "fixedPoint" },
      { Header: t("WT_DAY"), accessor: "day" },
      // { Header: t("WT_FREQ"), accessor: "freq" },
      { Header: t("WT_ARR_TO_FPL"), accessor: "arrToFpl" },
      { Header: t("WT_DEP_FROM_FPL"), accessor: "depFromFpl" },
      { Header: t("WT_ARR_AT_FIXED_POINT"), accessor: "arrAtFixedPoint" },
      { Header: t("WT_DEP_AT_FIXED_POINT"), accessor: "depAtFixedPoint" },
      { Header: t("WT_RETURN_TO_FPL"), accessor: "returnToFpl" },
      { Header: t("WT_VOLUME"), accessor: "volume" },
      {
        Header: t("WT_ACTIVE"),
        accessor: "active",
        Cell: ({ value }) => (
          <span
            style={{
              background: value === "Y" ? "#E6F4EA" : "#FCE8E6",
              padding: "2px 8px",
              borderRadius: "10px",
              color: value === "Y" ? "#1E8E3E" : "#D93025",
            }}
          >
            {value}
          </span>
        ),
      },
      {
        Header: t("WT_ACTION"),
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={() => {
                setEditingRowIndex(row.index);
                setShowModal(true);
              }}
              style={{ color: "#1D4E7F", border: "1px solid #1D4E7F", background: "none", padding: "2px 8px", cursor: "pointer" }}
            >
              {t("WT_EDIT")}
            </button>
            {/* <button
              onClick={() => handleDelete(row.index)}
              style={{ color: "#fff", border: "none", background: "#D93025", padding: "2px 8px", cursor: "pointer" }}
            >
              {t("WT_DELETE")}
            </button> */}
          </div>
        ),
      },
    ],
    [t]
  );

  const getCSVExportData = React.useCallback(async () => {
    const baseFilters = { ...(filters || {}) };
    delete baseFilters.limit;
    delete baseFilters.offset;
    const batchSize = 200;
    let offset = 0;
    let totalCount = Number.POSITIVE_INFINITY;
    const allRows = [];

    while (offset < totalCount) {
      const response = await Digit.WTService.SearchFixedPointSchedule({
        tenantId,
        filters: { ...baseFilters, limit: batchSize, offset },
      });
      const pageRows = response?.fixedPointTimeTableDetails || [];
      allRows.push(...pageRows);

      const resolvedTotal = Number(response?.count ?? response?.totalCount ?? response?.Count);
      totalCount = Number.isFinite(resolvedTotal) && resolvedTotal >= 0 ? resolvedTotal : allRows.length;

      if (!pageRows.length || pageRows.length < batchSize) {
        break;
      }
      offset += pageRows.length;
    }

    return mapScheduleRows(allRows);
  }, [filters, mapScheduleRows, tenantId]);

  const csvExportColumns = React.useMemo(
    () => [
      { Header: t("WT_SCHEDULE_ID"), accessor: "scheduleId" },
      { Header: t("WT_FIXED_POINT"), accessor: "fixedPoint" },
      { Header: t("WT_DAY"), accessor: "day" },
      { Header: t("WT_FREQ"), accessor: "freq" },
      { Header: t("WT_ARR_TO_FPL"), accessor: "arrToFpl" },
      { Header: t("WT_DEP_FROM_FPL"), accessor: "depFromFpl" },
      { Header: t("WT_ARR_AT_FIXED_POINT"), accessor: "arrAtFixedPoint" },
      { Header: t("WT_DEP_AT_FIXED_POINT"), accessor: "depAtFixedPoint" },
      { Header: t("WT_RETURN_TO_FPL"), accessor: "returnToFpl" },
      { Header: t("WT_VOLUME"), accessor: "volume" },
      { Header: t("WT_ACTIVE"), accessor: "active" },
    ],
    [t]
  );

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  return (
    <div className="fixed-point-schedule-management">
      <Card style={{ padding: "20px" }}>
        <div className="finance-mainlayout" style={{ marginBottom: "20px" }}>
          <div className="finance-mainlayout-col1">
            <CardLabel>{t("WT_EXPORT")}</CardLabel>
            <Dropdown
              option={[
                { label: t("WT_EXCEL_WEEKWISE"), value: "Weekwise" },
                { label: t("WT_EXCEL_MONTHWISE"), value: "Monthwise" },
                { label: t("WT_EXCEL_YEARWISE"), value: "Yearwise" },
              ]}
              optionKey="label"
              placeholder={t("WT_EXPORT")}
              t={t}
              select={handleDownload}
            />
          </div>
          <div className="finance-mainlayout-col1">
            <CardLabel>{t("WT_FIXED_POINT")}</CardLabel>
            <Dropdown
              option={fixedPoints}
              optionKey="label"
              selected={fixedPoint}
              t={t}
              select={(val) => {
                setFixedPoint(val);
              }}
              placeholder={t("WT_ALL_FIXED_POINTS")}
            />
          </div>
          <div className="finance-mainlayout-col1">
            <CardLabel>{t("WT_DAY")}</CardLabel>
            <Dropdown
              option={[
                { label: "All Days", value: "all" },
                { label: t("MONDAY"), value: "MONDAY" },
                { label: t("TUESDAY"), value: "TUESDAY" },
                { label: t("WEDNESDAY"), value: "WEDNESDAY" },
                { label: t("THURSDAY"), value: "THURSDAY" },
                { label: t("FRIDAY"), value: "FRIDAY" },
                { label: t("SATURDAY"), value: "SATURDAY" },
                { label: t("SUNDAY"), value: "SUNDAY" },
              ]}
              optionKey="label"
              selected={day}
              t={t}
              select={(val) => {
                setDay(val);
                setSelectedDay(val.value);
                handleSearch({
                  fixedPointCode: fixedPoint?.value === "all" ? "" : fixedPoint?.value,
                  day: val?.value === "all" ? "" : val?.value?.toUpperCase(),
                  status: status?.value === "all" ? "" : status?.value,
                });
              }}
              placeholder="All Days"
            />
          </div>
          <div className="finance-mainlayout-col1">
            <CardLabel>{t("WT_STATUS")}</CardLabel>
            <Dropdown
              option={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
              optionKey="label"
              selected={status}
              t={t}
              select={(val) => {
                setStatus(val);
                handleSearch({
                  fixedPointCode: fixedPoint?.value === "all" ? "" : fixedPoint?.value,
                  day: day?.value === "all" ? "" : day?.value?.toUpperCase(),
                  status: val?.value === "all" ? "" : val?.value,
                });
              }}
              placeholder="All Status"
            />
          </div>
          <div className="finance-mainlayout-col1" style={{ alignSelf: "flex-end" }}>
            <SubmitBar label={t("ES_COMMON_SEARCH")} onSubmit={() => handleSearch()} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "5px", marginBottom: "20px", flexWrap: "wrap" }}>
          {days.map((dayItem) => (
            <button
              key={dayItem}
              onClick={() => {
                setSelectedDay(dayItem);
                const dayOption = { label: dayItem, value: dayItem };
                setDay(dayOption);
                handleSearch({
                  fixedPointCode: fixedPoint?.value === "all" ? "" : fixedPoint?.value,
                  day: dayItem.toUpperCase(),
                  status: status?.value === "all" ? "" : status?.value,
                });
              }}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: selectedDay === dayItem ? "#1D4E7F" : "#fff",
                color: selectedDay === dayItem ? "#fff" : "#333",
                cursor: "pointer",
              }}
            >
              {t(dayItem.toUpperCase())}
            </button>
          ))}
        </div>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <ApplicationTable
            t={t}
            data={data}
            columns={columns}
            getCellProps={(cellInfo) => ({})}
            styles={{ minWidth: "1200px" }}
            inboxStyles={{ overflowX: "auto" }}
            isLoading={isLoading}
            onPageSizeChange={handlePageSizeChange}
            currentPage={Math.floor(pageOffset / pageSize)}
            onNextPage={fetchNextPage}
            onPrevPage={fetchPrevPage}
            pageSizeLimit={pageSize}
            onSort={props.onSort}
            disableSort={props.disableSort}
            sortParams={props.sortParams}
            totalRecords={scheduleData?.count || scheduleData?.totalCount || data?.[0]?.totalCount}
            showCSVExport={true}
            getCSVExportData={getCSVExportData}
            csvExportColumns={csvExportColumns}
            csvExportFileName="wt-fixed-point-schedule"
          />
        </div>
        <span>
          <button
            onClick={() => {
              setEditingRowIndex(null);
              setShowModal(true);
            }}
            style={{
              background: "#1E8E3E",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "10px",
            }}
          >
            <span>+</span> {t("WT_ADD_TRIP")}
          </button>
        </span>
      </Card>
      {showModal && (
        <AddTripModal
          t={t}
          closeModal={() => {
            setShowModal(false);
            setEditingRowIndex(null);
          }}
          initialValues={
            editingRowIndex !== null
              ? {
                  scheduleId: data[editingRowIndex].scheduleId,
                  fixedPointCode: data[editingRowIndex].fixedPoint,
                  day: [{ label: t(data[editingRowIndex].day), value: data[editingRowIndex].day }],

                  frequencyNo: data[editingRowIndex].freq,
                  arrivalTimeFpl: data[editingRowIndex].arrToFpl,
                  departureTimeFpl: data[editingRowIndex].depFromFpl,
                  arrivalFixedPoint: data[editingRowIndex].arrAtFixedPoint,
                  departureFixedPoint: data[editingRowIndex].depAtFixedPoint,
                  returnFpl: data[editingRowIndex].returnToFpl,
                  volume: data[editingRowIndex].volume,
                  vehicleId: data[editingRowIndex].vehicle,
                  active: {
                    label: data[editingRowIndex].active === "Y" ? t("YES") : t("NO"),
                    value: data[editingRowIndex].active === "Y" ? "Yes" : "No",
                  },
                }
              : null
          }
          onSubmit={(formData) => {
            const formDataDay = formData?.day;
            let daysArr = [];
            if (Array.isArray(formDataDay)) {
              daysArr = formDataDay
                .map((d) => (typeof d === "string" ? d : d?.value || (Array.isArray(d) ? d[1] : d)))
                .filter((d) => typeof d === "string" && d !== "WT_SELECT_ALL");

              // Handle "Select All" case specifically if nothing remains after filter but it was present
              if (
                daysArr.length === 0 &&
                formDataDay.some((d) => {
                  const val = typeof d === "string" ? d : d?.value || (Array.isArray(d) ? d[1] : d);
                  return val === "WT_SELECT_ALL";
                })
              ) {
                daysArr = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
              }
            } else if (formDataDay) {
              const dayVal =
                typeof formDataDay === "string" ? formDataDay : formDataDay?.value || (Array.isArray(formDataDay) ? formDataDay[1] : formDataDay);
              if (dayVal && dayVal !== "WT_SELECT_ALL") daysArr = [dayVal];
            }

            const fixedPointDetails = {
              tenantId,
              system_assigned_schedule_id: formData.scheduleId,
              fixed_point_code: formData.fixedPointCode,
              day: daysArr.map((d) => d?.toUpperCase?.() || d),
              trip_no: Number(formData.frequencyNo),
              arrival_time_to_fpl: formData.arrivalTimeFpl,
              departure_time_from_fpl: formData.departureTimeFpl,
              arrival_time_delivery_point: formData.arrivalFixedPoint,
              departure_time_delivery_point: formData.departureFixedPoint,
              time_of_arriving_back_fpl_after_delivery: formData.returnFpl,
              volume_water_tobe_delivery: formData.volume,
              active: formData.active?.value === "Yes" || formData.active === "Yes",
              is_enable: formData.active?.value === "Yes" || formData.active === "Yes",
              remarks: formData.remarks,
              vehicle_id: formData.vehicleId,
            };

            const payload =
              editingRowIndex !== null
                ? {
                    fixedPointDetailsList: [fixedPointDetails],
                  }
                : {
                    fixedPointDetails,
                  };

            if (editingRowIndex !== null) {
              updateSchedule(payload, {
                onError: (error, variables) => {
                  setToast({ key: "error", label: error?.response?.data?.Errors?.[0]?.message || "ERROR_WHILE_UPDATING_SCHEDULE" });
                  setTimeout(closeToast, 5000);
                },
                onSuccess: (data, variables) => {
                  setToast({ label: t("WT_SCHEDULE_UPDATE_SUCCESS") });
                  setTimeout(closeToast, 5000);
                  setShowModal(false);
                  setEditingRowIndex(null);
                  reSearch();
                },
              });
            } else {
              createSchedule(payload, {
                onError: (error, variables) => {
                  setToast({ key: "error", label: error?.response?.data?.Errors?.[0]?.message || "ERROR_WHILE_CREATING_SCHEDULE" });
                  setTimeout(closeToast, 5000);
                },
                onSuccess: (data, variables) => {
                  setToast({ label: t("WT_SCHEDULE_CREATE_SUCCESS") });
                  setTimeout(closeToast, 5000);
                  setShowModal(false);
                  setEditingRowIndex(null);
                  reSearch();
                },
              });
            }
          }}
        />
      )}
      {toast && <Toast error={toast.key === "error"} label={toast.label} onClose={closeToast} />}
    </div>
  );
};

export default FixedPointScheduleManagement;
