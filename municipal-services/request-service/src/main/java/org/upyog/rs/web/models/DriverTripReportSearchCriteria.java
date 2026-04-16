package org.upyog.rs.web.models;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverTripReportSearchCriteria {

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("bookingId")
    private String bookingId;

    @JsonProperty("bookingNo")
    private String bookingNo;

    @JsonProperty("driverId")
    private String driverId;

    @JsonProperty("vehicleId")
    private String vehicleId;

    @JsonProperty("vendorId")
    private String vendorId;

    @JsonProperty("tankerType")
    private String tankerType;

    @JsonProperty("currentStatus")
    private String currentStatus;

    @JsonProperty("fromDate")
    private Long fromDate;

    @JsonProperty("toDate")
    private Long toDate;

    @JsonProperty("ids")
    private List<String> ids;

    @JsonProperty("offset")
    @Builder.Default
    private Integer offset = 0;

    @JsonProperty("limit")
    @Builder.Default
    private Integer limit = 50;

    @JsonProperty("sortBy")
    @Builder.Default
    private String sortBy = "created_time";

    @JsonProperty("sortOrder")
    @Builder.Default
    private String sortOrder = "DESC";
}
