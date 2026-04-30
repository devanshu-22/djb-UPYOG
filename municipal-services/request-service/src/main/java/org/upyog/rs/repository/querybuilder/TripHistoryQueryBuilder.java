package org.upyog.rs.repository.querybuilder;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;
import org.upyog.rs.web.models.TripHistory;
import org.upyog.rs.web.models.TripHistorySearchCriteria;

import java.util.ArrayList;
import java.util.List;

@Component
public class TripHistoryQueryBuilder {

    private static final String QUERY = "SELECT th.*, rp.* FROM eg_trip_history th " +
            "LEFT JOIN eg_trip_route_points rp ON th.tripId = rp.tripId ";

    public String getTripHistorySearchQuery(TripHistorySearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder builder = new StringBuilder(QUERY);

        builder.append(" WHERE th.tenantId = ? ");
        preparedStmtList.add(criteria.getTenantId());

        if (StringUtils.isNotBlank(criteria.getTripId())) {
            builder.append(" AND th.tripId = ? ");
            preparedStmtList.add(criteria.getTripId());
        }

        if (StringUtils.isNotBlank(criteria.getDriverId())) {
            builder.append(" AND th.driverId = ? ");
            preparedStmtList.add(criteria.getDriverId());
        }
        if (StringUtils.isNotBlank(criteria.getBookingNo())) {
            builder.append(" AND th.bookingno = ? ");
            preparedStmtList.add(criteria.getBookingNo());
        }

        if (criteria.getFromTime() != null) {
            builder.append(" AND th.startTime >= ? ");
            preparedStmtList.add(criteria.getFromTime());
        }

        if (criteria.getToTime() != null) {
            builder.append(" AND th.startTime <= ? ");
            preparedStmtList.add(criteria.getToTime());
        }

        builder.append(" ORDER BY th.startTime DESC ");
        addPagination(builder, criteria, preparedStmtList);

        return builder.toString();
    }

    private void addPagination(StringBuilder builder, TripHistorySearchCriteria criteria, List<Object> preparedStmtList) {
        builder.append(" LIMIT ? OFFSET ? ");
        preparedStmtList.add(criteria.getLimit() == null ? 50 : criteria.getLimit());
        preparedStmtList.add(criteria.getOffset() == null ? 0 : criteria.getOffset());
    }

    public String getTripHistoryCountQuery(TripHistorySearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder builder = new StringBuilder(
                "SELECT COUNT(DISTINCT th.tripId) FROM eg_trip_history th WHERE th.tenantId = ? ");

        preparedStmtList.add(criteria.getTenantId());

        if (StringUtils.isNotBlank(criteria.getTripId())) {
            builder.append(" AND th.tripId = ? ");
            preparedStmtList.add(criteria.getTripId());
        }

        if (StringUtils.isNotBlank(criteria.getDriverId())) {
            builder.append(" AND th.driverId = ? ");
            preparedStmtList.add(criteria.getDriverId());
        }

        if (criteria.getFromTime() != null) {
            builder.append(" AND th.startTime >= ? ");
            preparedStmtList.add(criteria.getFromTime());
        }

        if (criteria.getToTime() != null) {
            builder.append(" AND th.startTime <= ? ");
            preparedStmtList.add(criteria.getToTime());
        }

        return builder.toString();
    }

}
