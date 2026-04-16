package org.upyog.rs.repository.rowMapper;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import org.upyog.rs.web.models.AuditDetails;
import org.upyog.rs.web.models.DriverTripReport;
import org.upyog.rs.web.models.DriverTripReportResponse;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class DriverTripReportRowMapper implements RowMapper<DriverTripReport> {

    @Override
    public DriverTripReport mapRow(ResultSet rs, int rowNum) throws SQLException {

        DriverTripReport response = new DriverTripReport();

        response.setId(rs.getString("trip_id"));
        response.setBookingId(rs.getString("booking_id"));
        response.setBookingNo(rs.getString("booking_no"));
        response.setTenantId(rs.getString("tenant_id"));
        response.setTankerType(rs.getString("tanker_type"));
        response.setVendorId(rs.getString("vendor_id"));
        response.setVehicleId(rs.getString("vehicle_id"));
        response.setDriverId(rs.getString("driver_id"));
        response.setCurrentStatus(rs.getString("current_status"));

        BigDecimal startLat = rs.getBigDecimal("start_latitude");
        if (!rs.wasNull()) response.setStartLatitude(startLat);

        BigDecimal startLong = rs.getBigDecimal("start_longitude");
        if (!rs.wasNull()) response.setStartLongitude(startLong);

        response.setStartFileStoreId(rs.getString("start_file_store_id"));

        BigDecimal endLat = rs.getBigDecimal("end_latitude");
        if (!rs.wasNull()) response.setEndLatitude(endLat);

        BigDecimal endLong = rs.getBigDecimal("end_longitude");
        if (!rs.wasNull()) response.setEndLongitude(endLong);

        response.setEndFileStoreId(rs.getString("end_file_store_id"));
        response.setJefilestoreId(rs.getString("jefilestoreid"));
        response.setRemark(rs.getString("remark"));
        response.setRemarkUpdatedByRole(rs.getString("remark_updated_by_role"));
        response.setPhotoUpdatedByRole(rs.getString("photo_updated_by_role"));
        response.setVehicleType(rs.getString("vehicle_type"));
        response.setVehicleModel(rs.getString("vehicle_model"));
        response.setTankCapicity(rs.getString("tank_capacity"));
        response.setVehicleStatus(rs.getString("vehicle_status"));

        response.setVehicleRegistrationNo(rs.getString("vehicle_registration_number"));

        response.setDriverName(rs.getString("driver_name"));
        response.setDriverLicenseNumber(rs.getString("license_number"));
        response.setDriverStatus(rs.getString("driver_status"));
        response.setInitialKm(rs.getLong("initial_km"));
        response.setFinalKm(rs.getLong("final_km"));
        response.setTotalKm(rs.getLong("total_km"));



        AuditDetails auditDetails = AuditDetails.builder()
                .createdBy(rs.getString("created_by"))
                .createdTime(rs.getLong("created_time"))
                .lastModifiedBy(rs.getString("last_modified_by"))
                .lastModifiedTime(rs.getLong("last_modified_time"))
                .build();
        response.setAuditDetails(auditDetails);

        return response;
    }
}