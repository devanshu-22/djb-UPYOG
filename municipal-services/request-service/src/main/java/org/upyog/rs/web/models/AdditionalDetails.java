package org.upyog.rs.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdditionalDetails {

    @JsonProperty("weather")
    private String weather;
    @JsonProperty("trafficLevel")
    private String trafficLevel;
    @JsonProperty("fuelConsumed")
    private String fuelConsumed;

}
