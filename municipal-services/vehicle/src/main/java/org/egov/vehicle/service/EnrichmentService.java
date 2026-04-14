package org.egov.vehicle.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.egov.vehicle.repository.VehicleRepository;
import org.egov.vehicle.util.VehicleUtil;
import org.egov.vehicle.web.model.AuditDetails;
import org.egov.vehicle.web.model.Vehicle;
import org.egov.vehicle.web.model.VehicleRequest;
import org.egov.vehicle.web.model.VehicleSearchCriteria;
import org.egov.vehicle.web.model.driver.Driver;
import org.egov.vehicle.web.model.user.User;
import org.egov.vehicle.web.model.user.UserDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EnrichmentService {

	@Autowired
	VehicleUtil util;

	@Autowired
	UserService userService;

	@Autowired
	private VehicleRepository vehicleRepository;

	public void enrichVehicleCreateRequest(VehicleRequest vehicleRequest) {
		RequestInfo requestInfo = vehicleRequest.getRequestInfo();

		AuditDetails auditDetails = util.getAuditDetails(requestInfo.getUserInfo().getUuid(), true, null);
		vehicleRequest.getVehicle().setAuditDetails(auditDetails);
		vehicleRequest.getVehicle().setStatus(Vehicle.StatusEnum.ACTIVE);

		vehicleRequest.getVehicle().setId(UUID.randomUUID().toString());
		if (vehicleRequest.getVehicle().getOwner().getId() == null) {
			vehicleRequest.getVehicle().getOwner().setId(Long.parseLong(UUID.randomUUID().toString()));
		}

	}

	public void enrichVehicleUpdateRequest(VehicleRequest vehicleRequest) {
		RequestInfo requestInfo = vehicleRequest.getRequestInfo();

		AuditDetails auditDetails = util.getAuditDetails(requestInfo.getUserInfo().getUuid(), false,
				vehicleRequest.getVehicle().getAuditDetails());
		vehicleRequest.getVehicle().setAuditDetails(auditDetails);
		if (vehicleRequest.getVehicle().getDriver() != null) {
			vehicleRequest.getVehicle().getDriver().setStatus(Driver.StatusEnum.ACTIVE);
			if (vehicleRequest.getVehicle().getDriver().getId() == null) {
				vehicleRequest.getVehicle().getDriver().setId(UUID.randomUUID().toString());
			}
		}
		if (vehicleRequest.getVehicle().getOwner().getId() == null) {
			vehicleRequest.getVehicle().getOwner().setId(Long.parseLong(UUID.randomUUID().toString()));
		}
		if (vehicleRequest.getVehicle().getFillingPoint() != null) {
			String fillingPointId = vehicleRequest.getVehicle().getFillingPoint().getId();
			vehicleRequest.getVehicle().getFillingPoint().setId(fillingPointId);
		}
	}

	public void enrichSearchData(List<Vehicle> vehicleList, RequestInfo requestInfo) {

		List<String> accountIds = vehicleList.stream().map(Vehicle::getOwnerId).collect(Collectors.toList());
		VehicleSearchCriteria searchcriteria = VehicleSearchCriteria.builder().ownerId(accountIds).build();
		UserDetailResponse userDetailResponse = userService.getOwner(searchcriteria, requestInfo);
		encrichOwner(userDetailResponse, vehicleList);
		enrichDriverData(vehicleList);
	}
	private void enrichDriverData(List<Vehicle> vehicles) {

		List<String> vehicleIds = vehicles.stream()
				.map(Vehicle::getId)
				.collect(Collectors.toList());

		// NOW returns Map<vehicleId, Driver> with full driver data
		Map<String, Driver> driverMappings =
				vehicleRepository.fetchDriverMappings(vehicleIds);

		vehicles.forEach(vehicle -> {
			Driver driver = driverMappings.get(vehicle.getId());

			if (driver != null) {
				// Set full driver object on vehicle
				vehicle.setDriver(driver);
				log.info("Driver mapped for vehicle {}: {} ({})",
						vehicle.getId(), driver.getId(), driver.getName());
			} else {
				// No active driver mapped — null, shown as-is
				vehicle.setDriver(null);
				log.info("No driver mapped for vehicle {}", vehicle.getId());
			}
		});
	}
	/**
	 * enrich the applicant information in FSM
	 * 
	 * @param userDetailResponse
	 * @param fsms
	 */
	private void encrichOwner(UserDetailResponse userDetailResponse, List<Vehicle> vehicles) {

		List<User> users = userDetailResponse.getUser();
		Map<String, User> userIdToApplicantMap = new HashMap<>();
		users.forEach(user -> userIdToApplicantMap.put(user.getUuid(), user));
		vehicles.forEach(vehicle -> {
			vehicle.setOwner(userIdToApplicantMap.get(vehicle.getOwnerId()));
		});
	}

}
