package org.egov.vendor.web.models.vendorcontract.workorder;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.common.contract.response.ResponseInfo;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class VendorWorkOrderResponse {

        @JsonProperty("responseInfo")
        private ResponseInfo responseInfo = null;

        @JsonProperty("vendorWorkOrder")
        private VendorWorkOrder vendorWorkOrder;

    }
