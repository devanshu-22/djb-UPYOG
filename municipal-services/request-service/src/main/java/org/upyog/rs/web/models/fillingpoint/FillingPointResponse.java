package org.upyog.rs.web.models.fillingpoint;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.response.ResponseInfo;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocality;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FillingPointResponse {

    private ResponseInfo responseInfo;
    private List<FillingPoint> fillingPoints;

}
