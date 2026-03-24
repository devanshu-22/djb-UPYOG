package org.egov.vendor.web.models.vendorcontract.workorder;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.egov.vendor.web.models.AuditDetails;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VendorWorkOrder {

    @JsonProperty("id")
    private String id;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("vendorId")
    private String vendorId;

    @JsonProperty("validFrom")
    private Long validFrom;

    @JsonProperty("validTo")
    private Long validTo;

    @JsonProperty("mobileNumber")
    private String mobileNumber;

    @JsonProperty("alternateNumber")
    private String alternateNumber;

    @JsonProperty("emailId")
    private String emailId;

    @JsonProperty("serviceType")
    private String serviceType;

    @JsonProperty("auditDetails")
    private AuditDetails auditDetails;
}