package org.upyog.rs.web.models.fillingpoint;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class FillingPointSearchCriteria {

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("designation")
    private String designation;

    @JsonProperty("name")
    private String name;

    @JsonProperty("mobileNo")
    private String mobileNo;

    public boolean isValidSearch() {
        return tenantId != null && !tenantId.isEmpty() &&
                name != null && !name.isEmpty() &&
                mobileNo != null && !mobileNo.isEmpty() &&
                designation != null && !designation.isEmpty();
    }

}
