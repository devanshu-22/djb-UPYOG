package org.upyog.rs.web.models.fillingpointlocality;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FillingPointLocalitySearchCriteria {

    @JsonProperty("fillingPointIds")
    private List<String> fillingPointIds;

    @JsonProperty("localityCodes")
    private List<String> localityCodes;

    @JsonProperty("tenantId")
    private String tenantId;
}
