package org.upyog.rs.repository;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.upyog.rs.repository.rowMapper.DriverRowMapper;
import org.upyog.rs.util.RequestServiceUtil;
import org.upyog.rs.web.models.DriverTrip;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@Slf4j
public class DriverTripRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

        public void save(DriverTrip trip) {
            String sql = "INSERT INTO eg_driver_trip " +
                    "(id, booking_id, booking_no, tenant_id, tanker_type, vendor_id, vehicle_id, driver_id, " +
                    "current_status, start_latitude, start_longitude, start_file_store_id, " +
                    "created_by, created_time, initial_km) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

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
                    trip.getInitialKM()
                    );
        }

        public void update(DriverTrip trip) {
            String sql = "UPDATE eg_driver_trip " +
                    "SET current_status = ?, end_latitude = ?, end_longitude = ?, end_file_store_id = ?, " +
                    "last_modified_by = ?, last_modified_time = ? , remark = ?, final_km= ? , total_km = ? " +
                    "WHERE booking_no = ?";

            jdbcTemplate.update(sql,
                    trip.getCurrentStatus(),
                    trip.getEndLatitude(),
                    trip.getEndLongitude(),
                    trip.getEndFileStoreId(),
                    trip.getAuditDetails().getLastModifiedBy(),
                    trip.getAuditDetails().getLastModifiedTime(),
                    trip.getRemark(),
                    trip.getFinalKM(),
                    trip.getTotalKM(),
                    trip.getBookingNo());
        }
    public void updateDivert(DriverTrip trip) {
        String sql = "UPDATE eg_driver_trip " +
                "SET current_status = ?, divert_lat = ?, divert_long = ?, " +
                "divert_file_store_id = ?, divert_remark = ?, " +
                "last_modified_by = ?, last_modified_time = ? " +
                "WHERE booking_no = ?";

        jdbcTemplate.update(sql,
                trip.getCurrentStatus(),
                trip.getDivertLat(), trip.getDivertLong(),
                trip.getDivertFileStoreId(), trip.getDivertRemark(),
                trip.getAuditDetails().getLastModifiedBy(), trip.getAuditDetails().getLastModifiedTime(),
                trip.getBookingNo());
    }

        public DriverTrip findByBookingNo(String bookingNo) {
            String sql = "SELECT * FROM eg_driver_trip WHERE booking_no = ?";

            //return jdbcTemplate.queryForObject(sql, new DriverRowMapper(), bookingNo);
            List<DriverTrip> trips = jdbcTemplate.query(sql, new DriverRowMapper(), bookingNo);
            return trips.isEmpty() ? null : trips.get(0);
        }

    public void saveTripHistory(DriverTrip trip) {

        String sql = "INSERT INTO eg_driver_trip_history (" +
                "history_id, booking_no, tenant_id, vendor_id, vehicle_id, driver_id, " +
                "current_status, " +

                "start_latitude, start_longitude, start_file_store_id, " +
                "end_latitude, end_longitude, end_file_store_id, " +

                "divert_lat, divert_long, divert_file_store_id, divert_remark, " +

                "initial_km, final_km, total_km, " +

                "remark, remark_updated_by_role, photo_updated_by_role, jefilestoreid, " +

                "completion_time, " +

                "created_time, created_by, " +
                "lastmodifiedby, lastmodifiedtime" +

                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        jdbcTemplate.update(sql,
                RequestServiceUtil.getRandonUUID(),

                trip.getBookingNo(),
                trip.getTenantId(),
                trip.getVendorId(),
                trip.getVehicleId(),
                trip.getDriverId(),

                trip.getCurrentStatus(),

                // Start
                trip.getStartLatitude(),
                trip.getStartLongitude(),
                trip.getStartFileStoreId(),

                // End
                trip.getEndLatitude(),
                trip.getEndLongitude(),
                trip.getEndFileStoreId(),
                trip.getDivertLat(),
                trip.getDivertLong(),
                trip.getDivertFileStoreId(),
                trip.getDivertRemark(),
                trip.getInitialKM(),
                trip.getFinalKM(),
                trip.getTotalKM(),
                trip.getRemark(),
                trip.getRemarkUpdatedByRole(),
                trip.getPhotoUpdatedByRole(),
                trip.getJefilestoreId(),

                System.currentTimeMillis(),

                trip.getAuditDetails().getCreatedTime(),
                trip.getAuditDetails().getCreatedBy(),
                trip.getAuditDetails().getLastModifiedBy(),
                trip.getAuditDetails().getLastModifiedTime()
        );
    }

        public void updateByNonDriver(DriverTrip trip) {
        String sql = "UPDATE eg_driver_trip " +
                "SET jefilestoreid = ?, " +
                "photo_updated_by_role = ?, remark_updated_by_role = ?,current_status = ?, " +
                "last_modified_by = ?, last_modified_time = ? " +
                "WHERE booking_no = ?";

        log.info("Updating trip with values: jefilestoreid={}, photoRole={}, remarkRole={},currentStatus={}, lastModifiedBy={}, bookingNo={}",
                trip.getJefilestoreId(),
                trip.getPhotoUpdatedByRole(),
                trip.getRemarkUpdatedByRole(),
                trip.getCurrentStatus(),
                trip.getAuditDetails().getLastModifiedBy(),
                trip.getBookingNo());

        jdbcTemplate.update(sql,
                trip.getJefilestoreId(),
                trip.getPhotoUpdatedByRole(),
                trip.getRemarkUpdatedByRole(),
                trip.getCurrentStatus(),
                trip.getAuditDetails().getLastModifiedBy(),
                trip.getAuditDetails().getLastModifiedTime(),
                trip.getBookingNo());
    }

    public List<DriverTrip> getHistoryByDriver(String driverId) {
        String sql = "SELECT * FROM eg_driver_trip_history WHERE driver_id = ? ORDER BY completion_time DESC";
        return jdbcTemplate.query(sql, new Object[]{driverId}, new DriverRowMapper());
    }
}
