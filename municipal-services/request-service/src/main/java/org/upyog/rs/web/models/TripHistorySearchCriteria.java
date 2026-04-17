package org.upyog.rs.web.models;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripHistorySearchCriteria {
    private String tenantId;
    private String tripId;
    private String driverId;
    private String vehicleId;
    private Long fromTime;
    private Long toTime;
    private Integer offset;
    private Integer limit;
}