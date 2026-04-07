package org.upyog.rs.web.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.request.RequestInfo;



@Data
@AllArgsConstructor
@NoArgsConstructor

public class CriteriyaSearchDto {

    @NotNull
    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("criteriyasearch")
    private CriteriyaSearch criteriyaSearch;


}
