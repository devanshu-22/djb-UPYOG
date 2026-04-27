package org.upyog.rs.repository.querybuilder;

import java.util.List;

public class DriverDetailsQueryBuilder {

    public static final String DRIVER_QUERY = new StringBuilder()
            .append("SELECT DISTINCT ON (ursbd.booking_id) ") // Prevents duplicates per booking
            .append("ursbd.booking_id, ursbd.booking_no, ursbd.tenant_id, ursbd.tanker_type, ursbd.tanker_quantity, ")
            .append("ursbd.water_quantity, ursbd.address_detail_id, ursbd.mobile_number, ursbd.locality_code, ")
            .append("ursbd.payment_receipt_filestore_id, ursbd.water_type, ursbd.description, ursbd.applicant_uuid, ")
            .append("ursbd.delivery_date, ursbd.delivery_time, ursbd.extra_charge, ursbd.vendor_id, ursbd.vehicle_id, ")
            .append("ursbd.driver_id, ursbd.vehicle_type, ursbd.vehicle_capacity, ursbd.booking_createdby, ")
            .append("ursbd.booking_status, ursbd.createdby, ursbd.lastmodifiedby, ursbd.createdtime, ursbd.lastmodifiedtime, ")
            .append("urad.name AS applicant_name, urad.mobile_number AS applicant_mobile, urad.email_id AS applicant_email, ")
            .append("uraddr.house_no, uraddr.address_line_1, uraddr.address_line_2, uraddr.street_name, uraddr.landmark, ")
            .append("uraddr.city, uraddr.pincode, uraddr.latitude, uraddr.longitude, uraddr.locality_code AS address_locality_code, ")
            .append("edt.id AS trip_id, edt.booking_id AS trip_booking_id, edt.booking_no AS trip_booking_no, edt.divert_file_store_id, edt.divert_long, edt.divert_lat, edt.divert_remark, ")
            .append("edt.tanker_type AS trip_tanker_type, edt.vendor_id AS trip_vendor_id, edt.vehicle_id AS trip_vehicle_id, ")
            .append("edt.driver_id AS trip_driver_id, edt.current_status AS trip_current_status, ")
            .append("edt.jefilestoreid, edt.remark_updated_by_role,")
            .append("edt.start_latitude AS trip_start_latitude, edt.start_longitude AS trip_start_longitude, ")
            .append("edt.start_file_store_id AS trip_start_file_store_id, edt.end_latitude AS trip_end_latitude, ")
            .append("edt.end_longitude AS trip_end_longitude, edt.end_file_store_id AS trip_end_file_store_id, ")
            .append("edt.remark AS trip_remark, edt.created_by AS trip_created_by, edt.created_time AS trip_created_time, ")
            .append("edt.last_modified_by AS trip_last_modified_by, edt.last_modified_time AS trip_last_modified_time,edt.initial_km,edt.final_km,edt.total_km, ")
            .append("ev.registrationnumber AS registrationNumber, ev.model AS vehicle_model, ")

            // NEW: Filling Point Master Columns
            .append("urwtfp.id AS fp_uuid, urwtfp.filling_point_id AS fp_code, urwtfp.filling_point_name, ")
            .append("urwtfp.emergency_name AS fp_emergency, urwtfp.ee_name AS fp_ee_name, urwtfp.ee_mobile AS fp_ee_mobile, ")
            .append("urwtfp.ae_name AS fp_ae_name, urwtfp.ae_mobile AS fp_ae_mobile, ")
            .append("urwtfp.je_name AS fp_je_name, urwtfp.je_mobile AS fp_je_mobile, urwtfp.je_email AS fp_je_email ")

            .append("FROM upyog_rs_water_tanker_booking_details ursbd ")
            .append("INNER JOIN upyog_rs_water_tanker_applicant_details urad ON ursbd.booking_id = urad.booking_id ")
            .append("INNER JOIN upyog_rs_water_tanker_address_details uraddr ON urad.applicant_id = uraddr.applicant_id ")
            .append("LEFT JOIN eg_vehicle ev ON ursbd.vehicle_id = ev.id ")
            .append("LEFT JOIN eg_driver_trip edt ON ursbd.booking_id = edt.booking_id ")

            .append("LEFT JOIN filling_point_locality_mapping fplm ON ursbd.locality_code = fplm.locality_code ")
            .append("LEFT JOIN upyog_rs_water_tanker_filling_point urwtfp ON fplm.filling_point_id = urwtfp.id ")

            .append("WHERE ursbd.driver_id = ? ")

            .append("ORDER BY ursbd.booking_id, urwtfp.createdtime DESC ")
            .toString();


    public static String buildQuery(String driverId, Long fromDate, Long toDate, List<Object> params) {
        params.add(driverId);

        if (fromDate == null || toDate == null) {
            return DRIVER_QUERY;
        }

        params.add(fromDate);
        params.add(toDate);

        // Insert date filter before ORDER BY
        return DRIVER_QUERY.replace(
                "ORDER BY ursbd.booking_id, urwtfp.createdtime DESC",
                "AND ursbd.lastmodifiedtime BETWEEN ? AND ? " +
                                 "AND ursbd.booking_status = 'TANKER_DELIVERED' " +
                                 "ORDER BY ursbd.booking_id, urwtfp.createdtime DESC"
        );
    }
}