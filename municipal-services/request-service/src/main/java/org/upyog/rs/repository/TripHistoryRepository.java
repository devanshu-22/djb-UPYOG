package org.upyog.rs.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.upyog.rs.repository.querybuilder.TripHistoryQueryBuilder;
import org.upyog.rs.repository.rowMapper.TripHistoryRowMapper;
import org.upyog.rs.web.models.TripHistory;
import org.upyog.rs.web.models.TripHistorySearchCriteria;

import java.util.ArrayList;
import java.util.List;

@Repository
public class TripHistoryRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TripHistoryQueryBuilder queryBuilder;

    @Autowired
    private TripHistoryRowMapper rowMapper;

    public List<TripHistory> getTripHistory(TripHistorySearchCriteria criteria) {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = queryBuilder.getTripHistorySearchQuery(criteria, preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
    }

    public Integer getTripHistoryCount(TripHistorySearchCriteria criteria) {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = queryBuilder.getTripHistoryCountQuery(criteria, preparedStmtList);

        return jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Integer.class);
    }
}
