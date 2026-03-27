package org.upyog.rs.web.models.fillingpoint.vendor;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.common.contract.response.ResponseInfo;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FillingPointVendorMapResponse {
    private ResponseInfo responseInfo;
    private List<FillingPointVendorMap> mappings;
}
