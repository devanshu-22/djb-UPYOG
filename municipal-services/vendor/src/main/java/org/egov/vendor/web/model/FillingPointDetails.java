package org.egov.vendor.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FillingPointDetails {

    @JsonProperty("id")
    private String id;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("fillingPointName")
    private String fillingPointName;

    @JsonProperty("emergencyName")
    private String emergencyName;

    @JsonProperty("eeName")
    private String eeName;

    @JsonProperty("eeEmail")
    private String eeEmail;

    @JsonProperty("eeMobile")
    private String eeMobile;

    @JsonProperty("aeName")
    private String aeName;

    @JsonProperty("aeEmail")
    private String aeEmail;

    @JsonProperty("aeMobile")
    private String aeMobile;

    @JsonProperty("jeName")
    private String jeName;

    @JsonProperty("jeEmail")
    private String jeEmail;

    @JsonProperty("jeMobile")
    private String jeMobile;

    @JsonProperty("address")
    private Object address;
}
