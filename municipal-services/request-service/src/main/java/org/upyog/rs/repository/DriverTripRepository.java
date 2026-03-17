package org.upyog.rs.repository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.upyog.rs.repository.rowMapper.DriverRowMapper;
import org.upyog.rs.web.models.DriverTrip;

@Repository
public class DriverTripRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

        public void save(DriverTrip trip) {
            String sql = "INSERT INTO eg_driver_trip " +
                    "(id, booking_id, booking_no, tenant_id, tanker_type, vendor_id, vehicle_id, driver_id, " +
                    "current_status, start_latitude, start_longitude, start_file_store_id, " +
                    "created_by, created_time, last_modified_by, last_modified_time) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            jdbcTemplate.update(sql,
                    trip.getId(),
                    trip.getBookingId(),
                    trip.getBookingNo(),
                    trip.getTenantId(),
                    trip.getTankerType(),
                    trip.getVendorId(),
                    trip.getVehicleId(),
                    trip.getDriverId(),
                    trip.getCurrentStatus(),
                    trip.getStartLatitude(),
                    trip.getStartLongitude(),
                    trip.getStartFileStoreId(),
                    trip.getAuditDetails().getCreatedBy(),
                    trip.getAuditDetails().getCreatedTime(),
                    trip.getAuditDetails().getLastModifiedBy(),
                    trip.getAuditDetails().getLastModifiedTime());
        }

        public void update(DriverTrip trip) {
            String sql = "UPDATE eg_driver_trip " +
                    "SET current_status = ?, end_latitude = ?, end_longitude = ?, end_file_store_id = ?, " +
                    "last_modified_by = ?, last_modified_time = ? " +
                    "WHERE booking_no = ?";

            jdbcTemplate.update(sql,
                    trip.getCurrentStatus(),
                    trip.getEndLatitude(),
                    trip.getEndLongitude(),
                    trip.getEndFileStoreId(),
                    trip.getAuditDetails().getLastModifiedBy(),
                    trip.getAuditDetails().getLastModifiedTime(),
                    trip.getBookingNo());
        }

        public DriverTrip findByBookingNo(String bookingNo) {
            String sql = "SELECT * FROM eg_driver_trip WHERE booking_no = ?";

            return jdbcTemplate.queryForObject(sql, new DriverRowMapper(), bookingNo);
        }

}
