package org.upyog.rs.repository.rowMapper;

import org.springframework.jdbc.core.RowMapper;
import org.upyog.rs.web.models.Address;
import org.upyog.rs.web.models.RequestDetailsByDriverId;

import java.sql.ResultSet;
import java.sql.SQLException;

public class DriverDetailsRowMapper implements RowMapper<RequestDetailsByDriverId.RequestDetailsInfo> {

    @Override
    public RequestDetailsByDriverId.RequestDetailsInfo mapRow(ResultSet rs, int rowNum) throws SQLException {
        RequestDetailsByDriverId.RequestDetailsInfo details = new RequestDetailsByDriverId.RequestDetailsInfo();
        details.setBookingId(rs.getString("booking_id"));
        details.setBookingNo(rs.getString("booking_no"));
        details.setTenantId(rs.getString("tenant_id"));
        details.setTankerType(rs.getString("tanker_type"));
        details.setTankerQuantity(rs.getInt("tanker_quantity"));
        details.setWaterQuantity(rs.getInt("water_quantity"));
        details.setAddressDetailId(rs.getString("address_detail_id"));
        details.setMobileNumber(rs.getString("mobile_number"));
        details.setLocalityCode(rs.getString("locality_code"));
        details.setPaymentReceiptFilestoreId(rs.getString("payment_receipt_filestore_id"));
        details.setWaterType(rs.getString("water_type"));
        details.setDescription(rs.getString("description"));
        details.setApplicantUuid(rs.getString("applicant_uuid"));
        details.setDeliveryDate(rs.getString("delivery_date"));
        details.setDeliveryTime(rs.getString("delivery_time"));

        details.setExtraCharge(rs.getString("extra_charge"));
        details.setVendorId(rs.getString("vendor_id"));
        details.setVehicleId(rs.getString("vehicle_id"));
        details.setDriverId(rs.getString("driver_id"));
        details.setVehicleType(rs.getString("vehicle_type"));
        details.setVehicleCapacity(rs.getString("vehicle_capacity"));
        details.setBookingCreatedBy(rs.getString("booking_createdby"));
        details.setBookingStatus(rs.getString("booking_status"));
        details.setCreatedby(rs.getString("createdby"));
        details.setLastmodifiedby(rs.getString("lastmodifiedby"));
        details.setCreatedtime(rs.getLong("createdtime"));
        details.setLastmodifiedtime(rs.getLong("lastmodifiedtime"));

        // Applicant Details Mapping
        details.setApplicantName(rs.getString("applicant_name"));
        details.setApplicantMobile(rs.getString("applicant_mobile"));
        details.setEmailId(rs.getString("applicant_email"));

        Address address = new Address();
        address.setAddressId(rs.getString("address_detail_id"));
        address.setHouseNo(rs.getString("house_no"));
        address.setAddressLine1(rs.getString("address_line_1"));
        address.setAddressLine2(rs.getString("address_line_2"));
        address.setStreetName(rs.getString("street_name"));
        address.setLandmark(rs.getString("landmark"));
        address.setCity(rs.getString("city"));
        address.setPincode(rs.getString("pincode"));
        address.setLatitude(rs.getString("latitude"));
        address.setLongitude(rs.getString("longitude"));
        address.setLocalityCode(rs.getString("locality_code"));
        details.setAddress(address);
        address.setLocalityCode(rs.getString("address_locality_code"));

        details.setRegistrationNumber(rs.getString("registrationNumber"));
        details.setVehicleModel(rs.getString("vehicle_model"));

        return details;
    }
}