package org.egov.vehicle.web.model;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class FillingPoint {

    @JsonProperty("fillingStationId")
    private String id;

    private String fillingPointId;
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

    @JsonProperty("createdBy")
    private String createdBy;

    @JsonProperty("lastModifiedBy")
    private String lastModifiedBy;

    @JsonProperty("createdTime")
    private Long createdTime;

    @JsonProperty("lastModifiedTime")
    private Long lastModifiedTime;

    @JsonProperty("fillingPointLocalityCodes")
    private List<String> localityCodes;
}
