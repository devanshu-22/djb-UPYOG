package org.upyog.rs.web.models.fillingpointlocality;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.upyog.rs.web.models.AuditDetails;

import javax.validation.constraints.NotNull;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FillingPointLocality {
    @NotNull
    @JsonProperty("fillingPointId")
    private String fillingPointId;
    @NotNull
    @JsonProperty("localityCode")
    private String localityCode;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;
}
