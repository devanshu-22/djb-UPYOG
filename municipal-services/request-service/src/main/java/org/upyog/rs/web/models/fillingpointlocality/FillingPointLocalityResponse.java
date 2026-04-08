package org.upyog.rs.web.models.fillingpointlocality;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.response.ResponseInfo;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FillingPointLocalityResponse {

    @JsonProperty("ResponseInfo")
    private ResponseInfo responseInfo;

    @JsonProperty("FillingPointLocality")
    private List<FillingPointLocality> fillingPointLocality;


    @JsonProperty("totalCount")
    private Long totalCount;

    @JsonProperty("pageSize")
    private Integer pageSize;

    @JsonProperty("hasMore")
    private Boolean hasMore;
}
