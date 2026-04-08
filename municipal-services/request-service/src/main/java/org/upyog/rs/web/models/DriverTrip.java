package org.upyog.rs.web.models;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DriverTrip {
    private String id;
    private String bookingId;
    private String bookingNo;
    private String tenantId;
    private String tankerType;
    private String vendorId;
    private String vehicleId;
    private String driverId;
    private String currentStatus;
    private BigDecimal startLatitude;
    private BigDecimal startLongitude;
    private String startFileStoreId;
    private BigDecimal endLatitude;
    private BigDecimal endLongitude;
    private String endFileStoreId;
    private AuditDetails auditDetails;
    private String remark;
    private String photoUpdatedByRole;
    @JsonProperty("remark_update")
    private String remarkUpdatedByRole;
    @JsonProperty("je_filestore_id")
    private String jefilestoreId;
}