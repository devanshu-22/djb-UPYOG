package org.upyog.rs.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class FillingPointVendorMapRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public boolean isVendorAlreadyMapped(String vendorId) {

        UUID vendorUUID = UUID.fromString(vendorId);

        String query = "SELECT COUNT(1) FROM eg_wt_fillingpoint_vendor_map WHERE vendor_id = ?";

        Integer count = jdbcTemplate.queryForObject(query, Integer.class, vendorUUID);

        return count != null && count > 0;
    }
}
