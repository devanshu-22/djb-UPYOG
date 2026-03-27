package org.egov.vendor.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FillingPointAddress {
    // address_id column
    @JsonProperty("addressId")
    private String addressId;

    // house_no column
    @JsonProperty("houseNo")
    private String houseNo;

    // address_line_1 column
    @JsonProperty("addressLine1")
    private String addressLine1;

    // address_line_2 column
    @JsonProperty("addressLine2")
    private String addressLine2;

    // street_name column
    @JsonProperty("streetName")
    private String streetName;

    // landmark column
    @JsonProperty("landmark")
    private String landmark;

    // city column
    @JsonProperty("city")
    private String city;

    // city_code column
    @JsonProperty("cityCode")
    private String cityCode;

    // locality column
    @JsonProperty("locality")
    private String locality;

    // locality_code column
    @JsonProperty("localityCode")
    private String localityCode;

    // pincode column
    @JsonProperty("pincode")
    private String pincode;

    // latitude column
    @JsonProperty("latitude")
    private String latitude;

    // longitude column
    @JsonProperty("longitude")
    private String longitude;

    // type column (e.g. FILLING-POINT)
    @JsonProperty("type")
    private String type;
}
