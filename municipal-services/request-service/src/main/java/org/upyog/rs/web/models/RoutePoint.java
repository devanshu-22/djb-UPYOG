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
public class RoutePoint {
    @JsonProperty("pointId")
    private String pointId;

    @JsonProperty("lat")
    private Double lat;

    @JsonProperty("lng")
    private Double lng;

    @JsonProperty("rawLat")
    private Double rawLat;

    @JsonProperty("rawLng")
    private Double rawLng;

    @JsonProperty("accuracy")
    private Double accuracy;

    @JsonProperty("speed")
    private Double speed;

    @JsonProperty("bearing")
    private Double bearing;

    @JsonProperty("tripId")
    private String tripId;
    @JsonProperty("provider")
    private String provider;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("epochMillis")
    private Long epochMillis;

    @JsonProperty("isPrecise")
    private Boolean isPrecise;
}