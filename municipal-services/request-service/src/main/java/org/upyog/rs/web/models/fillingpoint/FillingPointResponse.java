package org.upyog.rs.web.models.fillingpoint;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.response.ResponseInfo;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocality;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FillingPointResponse {

    private ResponseInfo responseInfo;
    private List<FillingPoint> fillingPoints;

    @JsonProperty("totalCount")
    private Integer totalCount;

    @JsonProperty("offset")
    private Integer offset;

    @JsonProperty("limit")
    private Integer limit;

}
