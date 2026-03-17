package org.egov.vehicle.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VehicleDriverMap {

    @JsonProperty("id")
    private String id;

    @JsonProperty("vehicle_id")
    private String vehicleId;

    @JsonProperty("driver_id")
    private String driverId;

    @JsonProperty("status")
    private String status;
}
