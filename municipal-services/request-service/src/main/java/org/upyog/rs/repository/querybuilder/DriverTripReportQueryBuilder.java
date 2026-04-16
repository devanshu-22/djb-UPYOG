package org.upyog.rs.repository.querybuilder;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.upyog.rs.web.models.DriverTripReportSearchCriteria;
import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class DriverTripReportQueryBuilder {

    private static final List<String> ALLOWED_SORT_COLUMNS = Arrays.asList(
            "created_time", "last_modified_time", "current_status",
            "booking_no", "tanker_type"
    );

    private static final String BASE_QUERY =
            "SELECT DISTINCT dt.id AS trip_id, " +
                    "    dt.booking_id, " +
                    "    dt.booking_no, " +
                    "    dt.tenant_id, " +
                    "    dt.tanker_type, " +
                    "    dt.vendor_id, " +
                    "    dt.vehicle_id, " +
                    "    dt.driver_id, " +
                    "    dt.current_status, " +
                    "    dt.start_latitude, " +
                    "    dt.start_longitude, " +
                    "    dt.start_file_store_id, " +
                    "    dt.end_latitude, " +
                    "    dt.end_longitude, " +
                    "    dt.end_file_store_id, " +
                    "    dt.jefilestoreid, " +
                    "    dt.remark, " +
                    "    dt.remark_updated_by_role, " +
                    "    dt.photo_updated_by_role, " +
                    "    dt.created_by, " +
                    "    dt.created_time, " +
                    "    dt.last_modified_by, " +
                    "    dt.last_modified_time, " +
                    "    dt.initial_km, " +
                    "    dt.total_km, " +
                    "    dt.final_km, " +
                    "    v.registrationnumber AS vehicle_registration_number, " +
                    "    v.type AS vehicle_type, " +
                    "    v.model AS vehicle_model, " +
                    "    v.tankcapicity AS tank_capacity, " +
                    "    v.status AS vehicle_status, " +
                    "    d.name AS driver_name, " +
                    "    d.licensenumber AS license_number, " +
                    "    d.status AS driver_status " +
                    "FROM eg_driver_trip dt " +
                    "LEFT JOIN eg_vehicle v ON dt.vehicle_id = v.id " +
                    "LEFT JOIN ( " +
                    "    SELECT DISTINCT ON (owner_id) id, owner_id, name, licensenumber, status " +
                    "    FROM eg_driver " +
                    "    ORDER BY owner_id, lastmodifiedtime DESC " +
                    ") d ON dt.driver_id = d.owner_id ";

    private static final String COUNT_QUERY =
            "SELECT COUNT(DISTINCT dt.id) " +
                    "FROM eg_driver_trip dt " +
                    "LEFT JOIN eg_vehicle v ON dt.vehicle_id = v.id " +
                    "LEFT JOIN ( " +
                    "    SELECT DISTINCT ON (owner_id) id, owner_id " +
                    "    FROM eg_driver " +
                    "    ORDER BY owner_id, lastmodifiedtime DESC " +
                    ") d ON dt.driver_id = d.owner_id ";
//    private static final String COUNT_QUERY =
//            "SELECT COUNT(*) " +
//                    "FROM eg_driver_trip dt " +
//                    "LEFT JOIN eg_vehicle v  ON dt.vehicle_id = v.id " +
//                    "LEFT JOIN eg_driver  d  ON dt.driver_id  = d.owner_id ";


    /**
     * Builds the paginated data query with all active filters applied.
     *
     * @param criteria  search criteria POJO
     * @param preparedStatementValues list that will be populated with bind values (in order)
     * @return parameterised SQL string
     */
    public String getDriverTripReportQuery(DriverTripReportSearchCriteria criteria,
                                           List<Object> preparedStatementValues) {
        StringBuilder query = new StringBuilder(BASE_QUERY);
        addWhereClause(query, criteria, preparedStatementValues);
        addOrderByClause(query, criteria);
        addPaginationClause(query, criteria, preparedStatementValues);
        log.debug("Driver trip report query: {}", query);
        return query.toString();
    }

    /**
     * Builds the COUNT query (no ORDER BY / LIMIT) for total-count pagination.
     */
    public String getDriverTripReportCountQuery(DriverTripReportSearchCriteria criteria,
                                                List<Object> preparedStatementValues) {
        StringBuilder query = new StringBuilder(COUNT_QUERY);
        addWhereClause(query, criteria, preparedStatementValues);
        log.debug("Driver trip report count query: {}", query);
        return query.toString();
    }

    /* ─────────────────────────────────────────────────────────────────────────
     *  PRIVATE HELPERS
     * ──────────────────────────────────────────────────────────────────────── */

    private void addWhereClause(StringBuilder query,
                                DriverTripReportSearchCriteria criteria,
                                List<Object> values) {

        boolean isFirst = true;

        /* tenantId — mandatory in UPYOG multi-tenant setup */
        if (StringUtils.isNotBlank(criteria.getTenantId())) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.tenant_id = ?");
            values.add(criteria.getTenantId());
        }

        /* bookingId */
        if (StringUtils.isNotBlank(criteria.getBookingId())) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.booking_id = ?");
            values.add(criteria.getBookingId());
        }

        /* bookingNo */
        if (StringUtils.isNotBlank(criteria.getBookingNo())) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.booking_no = ?");
            values.add(criteria.getBookingNo());
        }

        /* driverId */
        if (StringUtils.isNotBlank(criteria.getDriverId())) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.driver_id = ?");
            values.add(criteria.getDriverId());
        }

        /* vehicleId */
        if (StringUtils.isNotBlank(criteria.getVehicleId())) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.vehicle_id = ?");
            values.add(criteria.getVehicleId());
        }

        /* vendorId */
        if (StringUtils.isNotBlank(criteria.getVendorId())) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.vendor_id = ?");
            values.add(criteria.getVendorId());
        }

        /* tankerType */
        if (StringUtils.isNotBlank(criteria.getTankerType())) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.tanker_type = ?");
            values.add(criteria.getTankerType());
        }

        /* currentStatus */
        if (StringUtils.isNotBlank(criteria.getCurrentStatus())) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.current_status = ?");
            values.add(criteria.getCurrentStatus());
        }

        /* Date range – fromDate */
        if (criteria.getFromDate() != null) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.created_time >= ?");
            values.add(criteria.getFromDate());
        }

        /* Date range – toDate */
        if (criteria.getToDate() != null) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.created_time <= ?");
            values.add(criteria.getToDate());
        }

        /* ids – IN clause */
        if (criteria.getIds() != null && !criteria.getIds().isEmpty()) {
            isFirst = addAnd(query, isFirst);
            query.append("dt.id IN (")
                    .append(String.join(",", Collections.nCopies(criteria.getIds().size(), "?")))
                    .append(")");
            values.addAll(criteria.getIds());
        }
    }

    private void addOrderByClause(StringBuilder query, DriverTripReportSearchCriteria criteria) {
        String sortBy = ALLOWED_SORT_COLUMNS.contains(criteria.getSortBy())
                ? "dt." + criteria.getSortBy()
                : "dt.created_time";
        String sortOrder = "ASC".equalsIgnoreCase(criteria.getSortOrder()) ? "ASC" : "DESC";
        query.append(" ORDER BY ").append(sortBy).append(" ").append(sortOrder);
    }

    private void addPaginationClause(StringBuilder query,
                                     DriverTripReportSearchCriteria criteria,
                                     List<Object> values) {
        int limit  = (criteria.getLimit()  != null && criteria.getLimit()  > 0) ? criteria.getLimit()  : 10;
        int offset = (criteria.getOffset() != null && criteria.getOffset() >= 0) ? criteria.getOffset() : 0;

        query.append(" LIMIT ? OFFSET ?");
        values.add(limit);
        values.add(offset);
    }

    /** Appends WHERE (first predicate) or AND (subsequent predicates). */
    private boolean addAnd(StringBuilder query, boolean isFirst) {
        query.append(isFirst ? " WHERE " : " AND ");
        return false;
    }
}