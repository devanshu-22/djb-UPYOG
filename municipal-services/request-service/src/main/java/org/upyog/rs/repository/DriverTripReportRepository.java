package org.upyog.rs.repository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.upyog.rs.repository.querybuilder.DriverTripReportQueryBuilder;
import org.upyog.rs.repository.rowMapper.DriverTripReportRowMapper;
import org.upyog.rs.web.models.DriverTripReport;
import org.upyog.rs.web.models.DriverTripReportSearchCriteria;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Repository
public class DriverTripReportRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DriverTripReportQueryBuilder queryBuilder;

    @Autowired
    private DriverTripReportRowMapper rowMapper;

    /**
     * Returns paginated list of driver trip records matching the given criteria.
     */
    public List<DriverTripReport> getDriverTripReport(DriverTripReportSearchCriteria criteria) {
        List<Object> preparedStatementValues = new ArrayList<>();
        String query = queryBuilder.getDriverTripReportQuery(criteria, preparedStatementValues);

        log.info("Executing driver trip report query with {} bind params", preparedStatementValues.size());
        return jdbcTemplate.query(query, preparedStatementValues.toArray(), rowMapper);
    }

    /**
     * Returns total count of records (used for pagination metadata).
     */
    public Integer getDriverTripReportCount(DriverTripReportSearchCriteria criteria) {
        List<Object> preparedStatementValues = new ArrayList<>();
        String countQuery = queryBuilder.getDriverTripReportCountQuery(criteria, preparedStatementValues);

        log.info("Executing driver trip report count query");
        Integer count = jdbcTemplate.queryForObject(countQuery, preparedStatementValues.toArray(), Integer.class);
        return count != null ? count : 0;
    }
}