package org.upyog.rs.web.models.waterTanker;

import com.fasterxml.jackson.annotation.JsonProperty;
import javax.validation.Valid;
import lombok.*;
import org.egov.common.contract.request.RequestInfo;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FixedFillingPointMappingRequest {


    @Valid
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("fixedFillingPointMapping")
    private FixedFillingPointMapping fixedFillingPointMapping;
}
