package org.upyog.rs.web.models.fillingpoint.vendor;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.upyog.rs.web.models.AuditDetails;

import javax.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FillingPointVendorMap {

    private String id;

    @NotNull
    @JsonProperty("tenantId")
    private String tenantId;

    @NotNull
    private String fillingPointId;

    @NotNull
    private String vendorId;

    private AuditDetails auditDetails;
}
