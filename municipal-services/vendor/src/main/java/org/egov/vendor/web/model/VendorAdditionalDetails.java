package org.egov.vendor.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorAdditionalDetails {

    @JsonProperty("vendor_additional_details_id")
    private String vendorAdditionalDetailsId;

    @JsonProperty("vendor_id")
    private String vendorId;

    @JsonProperty("tenant_Id")
    private String tenantId;

    @JsonProperty("code")
    private String code;

    @JsonProperty("name")
    private String name;

    @JsonProperty("vendor_company")
    private String vendorCompany;

    @JsonProperty("vendor_category")
    private String vendorCategory;

    @JsonProperty("vendor_phone")
    private String vendorPhone;

    @JsonProperty("vendor_email")
    private String vendorEmail;

    @JsonProperty("contact_person")
    private String contactPerson;

    @JsonProperty("vendor_mobile_number")
    private String vendorMobileNumber;

    @JsonProperty("ifsc_code")
    private String ifscCode;

    @JsonProperty("bank")
    private String bank;

    @JsonProperty("bank_branch_name")
    private String bankBranchName;

    @JsonProperty("micr_no")
    private String micrNo;

    @JsonProperty("bank_account_number")
    private String bankAccountNumber;

    @JsonProperty("narration")
    private String narration;

    @JsonProperty("pan_no")
    private String panNo;

    @JsonProperty("gst_tin_no")
    private String gstTinNo;

    @JsonProperty("gst_registered_state")
    private String gstRegisteredState;

    @JsonProperty("vendor_group")
    private String vendorGroup;

    @JsonProperty("vendor_type")
    private String vendorType;

    @JsonProperty("service_type")
    private String serviceType;

    @JsonProperty("registration_no")
    private String registrationNo;

    @JsonProperty("registration_date")
    private Long registrationDate;

    @JsonProperty("status")
    private String status;

    @JsonProperty("active")
    private boolean active;

    @JsonProperty("epf_no")
    private String epfNo;

    @JsonProperty("esi_no")
    private String esiNo;
}