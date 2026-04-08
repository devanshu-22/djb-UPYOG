package org.upyog.rs.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.upyog.rs.repository.querybuilder.FillingPointLocalityQueryBuilder;
import org.upyog.rs.repository.rowMapper.FillingPointLocalityRowMapper;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocality;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalitySearchCriteria;

import java.util.ArrayList;
import java.util.List;

@Repository
public class FillingPointLocalityRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private FillingPointLocalityQueryBuilder queryBuilder;

    @Autowired
    private FillingPointLocalityRowMapper rowMapper;

    public List<FillingPointLocality> searchMapping(FillingPointLocalitySearchCriteria criteria) {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = queryBuilder.getSearchQuery(criteria, preparedStmtList);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
    }

    public Long getCount(FillingPointLocalitySearchCriteria criteria) {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = queryBuilder.getCountQuery(criteria, preparedStmtList);
        Long count = jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Long.class);
        return count != null ? count : 0L;
    }
}