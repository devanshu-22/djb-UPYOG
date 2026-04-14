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
import java.util.stream.Collectors;

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

    private static final String DELETE_BY_FILLING_POINT =
            "DELETE FROM filling_point_locality_mapping WHERE filling_point_id = ?";

    public void deleteByFillingPointId(String fillingPointId) {
        jdbcTemplate.update(DELETE_BY_FILLING_POINT, fillingPointId);
    }

    private static final String UPSERT =
            "INSERT INTO filling_point_locality_mapping " +
                    "(filling_point_id, locality_code, createdby, lastmodifiedby, createdtime, lastmodifiedtime) " +
                    "VALUES (?, ?, ?, ?, ?, ?)";

    public void saveAll(List<FillingPointLocality> localities) {
        List<Object[]> batchArgs = localities.stream()
                .map(l -> new Object[]{
                        l.getFillingPointId(),
                        l.getLocalityCode(),
                        l.getAuditDetails().getCreatedBy(),
                        l.getAuditDetails().getLastModifiedBy(),
                        l.getAuditDetails().getCreatedTime(),
                        l.getAuditDetails().getLastModifiedTime()
                })
                .collect(Collectors.toList());

        jdbcTemplate.batchUpdate(UPSERT, batchArgs);
    }
}