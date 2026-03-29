package org.upyog.rs.fixedpoint.repository.querybuilder;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import org.upyog.rs.config.RequestServiceConfiguration;
import org.upyog.rs.fixedpoint.web.model.FixedPointSearchCriteria;
import java.util.List;

@Component
@Slf4j
public class FixedPointTimeTableQueryBuilder {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RequestServiceConfiguration config;

    public boolean existsByFixedPointCode(String fixedPointCode) {
        String query = "SELECT COUNT(1) FROM eg_fixed_point_time_table WHERE fixed_point_code = ?";
        log.info("FixedPointTimeTable :: existsByFixedPointCode :: Checking for fixedPointCode: {}", fixedPointCode);
        Integer count = jdbcTemplate.queryForObject(query, Integer.class, fixedPointCode);
        return count != null && count > 0;
    }

    private static final String SEARCH_QUERY =
            "SELECT fpt.system_assigned_schedule_id, fpt.fixed_point_code, fpt.day, fpt.trip_no, " +
                    "fpt.arrival_time_to_fpl, fpt.departure_time_from_fpl, " +
                    "fpt.arrival_time_delivery_point, fpt.departure_time_delivery_point, " +
                    "fpt.time_of_arriving_back_fpl_after_delivery, fpt.volume_water_tobe_delivery, " +
                    "fpt.active, fpt.is_enable, fpt.remarks, fpt.vehicle_id, fpt.tenant_id, " +
                    "fpt.createdby, fpt.lastmodifiedby, fpt.createdtime, fpt.lastmodifiedtime, " +
                    "apd.name AS fixed_point_name, apd.fixed_point_id " +
                    "FROM public.eg_fixed_point_time_table fpt " +
                    "LEFT JOIN public.upyog_rs_water_tanker_applicant_details apd " +
                    "ON apd.booking_id = fpt.fixed_point_code";

    private static final String COUNT_QUERY = "SELECT count(*) FROM public.eg_fixed_point_time_table";

    private final String paginationWrapper =
            "SELECT * FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY createdtime DESC) AS offset_ FROM ({}) result) result_offset " +
                    "WHERE offset_ > ? AND offset_ <= ?";

    public String getSearchQuery(FixedPointSearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder query = new StringBuilder(criteria.isCountCall() ? COUNT_QUERY : SEARCH_QUERY);

        if (!ObjectUtils.isEmpty(criteria.getScheduleId())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" system_assigned_schedule_id = ? ");
            preparedStmtList.add(criteria.getScheduleId());
        }

        if (!ObjectUtils.isEmpty(criteria.getFixedPointCode())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" fixed_point_code = ? ");
            preparedStmtList.add(criteria.getFixedPointCode());
        }

        if (!ObjectUtils.isEmpty(criteria.getDay())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" day = ? ");
            preparedStmtList.add(criteria.getDay());
        }


        if (!ObjectUtils.isEmpty(criteria.getTenantId())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" tenant_id = ? ");
            preparedStmtList.add(criteria.getTenantId());
        }

        if (!ObjectUtils.isEmpty(criteria.getVehicleId())) {
            addClauseIfRequired(query, preparedStmtList);
            query.append(" vehicle_id = ? ");
            preparedStmtList.add(criteria.getVehicleId());
        }

        if (criteria.isCountCall()) {
            return query.toString();
        }

        return addPaginationWrapper(query.toString(), preparedStmtList, criteria);
    }

    private void addClauseIfRequired(StringBuilder query, List<Object> preparedStmtList) {
        if (preparedStmtList.isEmpty()) {
            query.append(" WHERE ");
        } else {
            query.append(" AND ");
        }
    }

    private String addPaginationWrapper(String query, List<Object> preparedStmtList, FixedPointSearchCriteria criteria) {
        int limit = (criteria.getLimit() != null) ? criteria.getLimit() : config.getDefaultLimit();
        int offset = (criteria.getOffset() != null) ? criteria.getOffset() : config.getDefaultOffset();

        String finalQuery = paginationWrapper.replace("{}", query);
        preparedStmtList.add(offset);
        preparedStmtList.add(offset + limit);

        return finalQuery;
    }
}
