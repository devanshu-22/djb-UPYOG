package org.upyog.rs.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverTripReport {

    @JsonProperty("sr_no")
    private Integer srNo;

    @JsonProperty("arrival_time")
    private String arrivalTime;

    private String vehicleStatus;

    @JsonProperty("departure_time")
    private String departureTime;

    private String driverStatus;

    @JsonProperty("initial_km")
    private Long initialKm;

    @JsonProperty("final_km")
    private Long finalKm;

    @JsonProperty("total_km")
    private Long totalKm;

    @JsonProperty("complaint_no")
    private String complaintNo;

    @JsonProperty("k_no")
    private String kNo;

    @JsonProperty("complainer_name")
    private String complainerName;

    @JsonProperty("address")
    private String address;

    @JsonProperty("contact_no")
    private String contactNo;

    @JsonProperty("driver_sign")
    private String driverSign;

    @JsonProperty("nms_staff_sign")
    private String nmsStaffSign;

    @JsonProperty("complainer_sign")
    private String complainerSign;

    @JsonProperty("remarks")
    private String remarks;


    private String id;
    private String bookingId;
    private String bookingNo;
    private String tenantId;

    private String tankerType;
    private String vendorId;
    private String vehicleId;
    private String driverId;

    private String tankCapicity;

    private String currentStatus;

    private String vehicleRegistrationNo;

    private String vehicleModel;

    private String vehicleType;

    private String driverName;

    private String driverLicenseNumber;

    private BigDecimal startLatitude;
    private BigDecimal startLongitude;

    private String startFileStoreId;

    private BigDecimal endLatitude;
    private BigDecimal endLongitude;

    private String endFileStoreId;

    @JsonProperty("je_filestore_id")
    private String jefilestoreId;

    private String remark;

    private String photoUpdatedByRole;

    @JsonProperty("remark_update")
    private String remarkUpdatedByRole;

    private AuditDetails auditDetails;
}
