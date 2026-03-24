package org.egov.vendor.web.models.vendorcontract.workorder;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.common.contract.request.RequestInfo;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VendorWorkOrderRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo = null;

    @JsonProperty("vendorWorkOrder")
    private VendorWorkOrder vendorWorkOrder;

}
