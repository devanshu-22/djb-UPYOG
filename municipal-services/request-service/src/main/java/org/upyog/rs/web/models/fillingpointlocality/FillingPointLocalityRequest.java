    package org.upyog.rs.web.models.fillingpointlocality;

    import com.fasterxml.jackson.annotation.JsonProperty;
    import javax.validation.Valid;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;
    import org.egov.common.contract.request.RequestInfo;
    import java.util.List;


    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public class FillingPointLocalityRequest {
        @JsonProperty("RequestInfo")
        private RequestInfo requestInfo;

        @JsonProperty("FillingPointLocality")
        @Valid
        private List<FillingPointLocality> fillingPointLocality;
    }