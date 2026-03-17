package org.upyog.rs.repository.rowMapper;

import org.springframework.jdbc.core.RowMapper;
import org.upyog.rs.web.models.AuditDetails;
import org.upyog.rs.web.models.DriverTrip;

import java.sql.ResultSet;
import java.sql.SQLException;

public class DriverRowMapper implements RowMapper<DriverTrip> {

    @Override
    public DriverTrip mapRow(ResultSet rs, int rowNum) throws SQLException {

        AuditDetails auditDetails = AuditDetails.builder()
                .createdBy(rs.getString("created_by"))
                .createdTime(rs.getLong("created_time"))
                .lastModifiedBy(rs.getString("last_modified_by"))
                .lastModifiedTime(rs.getLong("last_modified_time"))
                .build();

        return DriverTrip.builder()
                .id(rs.getString("id"))
                .bookingId(rs.getString("booking_id"))
                .bookingNo(rs.getString("booking_no"))
                .tenantId(rs.getString("tenant_id"))
                .tankerType(rs.getString("tanker_type"))
                .vendorId(rs.getString("vendor_id"))
                .vehicleId(rs.getString("vehicle_id"))
                .driverId(rs.getString("driver_id"))
                .currentStatus(rs.getString("current_status"))
                .startLatitude(rs.getBigDecimal("start_latitude"))
                .startLongitude(rs.getBigDecimal("start_longitude"))
                .startFileStoreId(rs.getString("start_file_store_id"))
                .endLatitude(rs.getBigDecimal("end_latitude"))
                .endLongitude(rs.getBigDecimal("end_longitude"))
                .endFileStoreId(rs.getString("end_file_store_id"))
                .remark(rs.getString("remark"))
                .auditDetails(auditDetails)
                .build();
    }
}
