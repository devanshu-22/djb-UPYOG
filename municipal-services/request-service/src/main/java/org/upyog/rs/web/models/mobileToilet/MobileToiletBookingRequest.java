package org.upyog.rs.web.models.mobileToilet;

import io.swagger.v3.oas.annotations.media.Schema;
import javax.validation.Valid;
import org.egov.common.contract.request.RequestInfo;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.annotation.processing.Generated;

/**
 * Details for new booking of Mobile Toilet
 */
@Schema(description = "Request object for creating new booking of mobile Toilet")
@Validated
@Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2024-04-19T11:17:29.419+05:30")

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class MobileToiletBookingRequest {
	
	@Valid
	@JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

	@Valid
	@JsonProperty("mobileToiletBookingDetail")
	private MobileToiletBookingDetail mobileToiletBookingDetail;
	
}
