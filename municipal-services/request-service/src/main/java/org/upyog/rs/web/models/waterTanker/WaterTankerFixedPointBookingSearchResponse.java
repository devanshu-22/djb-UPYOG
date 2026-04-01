package org.upyog.rs.web.models.waterTanker;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.annotations.ApiModel;
import lombok.*;
import org.springframework.validation.annotation.Validated;
import org.upyog.rs.web.models.ResponseInfo;

import java.util.List;




    @ApiModel(description = "Store booking details")
    @Validated
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public class WaterTankerFixedPointBookingSearchResponse {

        @JsonProperty("ResponseInfo")
        private ResponseInfo responseInfo;

        @JsonProperty("hasMore")
        private Boolean hasMore;
        @JsonProperty("waterTankerBookingDetail")
        private List<WaterTankerFixedPointDetail> waterTankerFixedPointDetails;

        @JsonProperty("count")
        private Long count;

        @JsonProperty("pageSize")
        private Integer pageSize;

    }
