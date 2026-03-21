package org.upyog.rs.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.upyog.rs.web.models.fillingpoint.FillingPoint;
import org.upyog.rs.web.models.fillingpoint.FillingPointSearchCriteria;

import java.util.ArrayList;
import java.util.List;

@Repository
public class FillingPointRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void save(List<FillingPoint> list) {

        String query = "INSERT INTO upyog_rs_water_tanker_filling_point " +
                "(id, tenant_id, filling_point_name, emergency_name, " +
                "ee_name, ee_email, ee_mobile, ae_name, ae_email, ae_mobile, " +
                "je_name, je_email, je_mobile, createdby, lastmodifiedby, createdtime, lastmodifiedtime) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; // ← VALUES added + 17 ?

        jdbcTemplate.batchUpdate(query, list, list.size(), (ps, fp) -> {
            ps.setString(1, fp.getId());
            ps.setString(2, fp.getTenantId());
            ps.setString(3, fp.getFillingPointName());
            ps.setString(4, fp.getEmergencyName());
            ps.setString(5, fp.getEeName());
            ps.setString(6, fp.getEeEmail());
            ps.setString(7, fp.getEeMobile());
            ps.setString(8, fp.getAeName());
            ps.setString(9, fp.getAeEmail());
            ps.setString(10, fp.getAeMobile());
            ps.setString(11, fp.getJeName());
            ps.setString(12, fp.getJeEmail());
            ps.setString(13, fp.getJeMobile());   // ← added
            ps.setString(14, fp.getCreatedBy());
            ps.setString(15, fp.getLastModifiedBy());
            ps.setLong(16, fp.getCreatedTime());
            ps.setLong(17, fp.getLastModifiedTime());
        });
    }


    public List<FillingPoint> search(FillingPointSearchCriteria criteria) {

        StringBuilder query = new StringBuilder(
                "SELECT * FROM upyog_rs_water_tanker_filling_point WHERE tenant_id = ?"
        );

        List<Object> params = new ArrayList<>();
        params.add(criteria.getTenantId());

        // Dynamic logic
        if ("JE".equalsIgnoreCase(criteria.getDesignation())) {

            query.append(" AND je_name = ? AND je_mobile = ?");
            params.add(criteria.getName());
            params.add(criteria.getMobileNo());

        } else if ("AE".equalsIgnoreCase(criteria.getDesignation())) {

            query.append(" AND ae_name = ? AND ae_mobile = ?");
            params.add(criteria.getName());
            params.add(criteria.getMobileNo());

        } else if ("EE".equalsIgnoreCase(criteria.getDesignation())) {

            query.append(" AND ee_name = ? AND ee_mobile = ?");
            params.add(criteria.getName());
            params.add(criteria.getMobileNo());
        }

        return jdbcTemplate.query(
                query.toString(),
                params.toArray(),
                new BeanPropertyRowMapper<>(FillingPoint.class)
        );
    }


    public void update(List<FillingPoint> list) {

        String query = "UPDATE upyog_rs_water_tanker_filling_point SET " +
                "filling_point_name=?, emergency_name=?, " +
                "ee_name=?, ee_email=?, ee_mobile=?, " +
                "ae_name=?, ae_email=?, ae_mobile=?, " +
                "je_name=?, je_email=?, " +
                "lastmodifiedby=?, lastmodifiedtime=? " +
                "WHERE id=?";

        jdbcTemplate.batchUpdate(query, list, list.size(), (ps, fp) -> {
            ps.setString(1, fp.getFillingPointName());
            ps.setString(2, fp.getEmergencyName());
            ps.setString(3, fp.getEeName());
            ps.setString(4, fp.getEeEmail());
            ps.setString(5, fp.getEeMobile());
            ps.setString(6, fp.getAeName());
            ps.setString(7, fp.getAeEmail());
            ps.setString(8, fp.getAeMobile());
            ps.setString(9, fp.getJeName());
            ps.setString(10, fp.getJeEmail());
            ps.setString(11, fp.getLastModifiedBy());
            ps.setLong(12, fp.getLastModifiedTime());
            ps.setString(13, fp.getId());
        });
    }
}
