import { MdmsService } from "../../services/elements/MDMS";
import { useQuery } from "react-query";

const useWTMDMS = (tenantId, moduleCode, type, config = {}) => {

  const queryConfig = { staleTime: Infinity, ...config };

  const vehicleTypeQuery = useQuery(
    "WT_VEHICLE_TYPE",
    () => MdmsService.getVehicleType(tenantId, moduleCode, type),
    queryConfig
  );

  switch (type) {
    case "VehicleMakeModel":
      return vehicleTypeQuery;

    case "VehicleType":
      return vehicleTypeQuery;

    default:
      return null;
  }
};

export default useWTMDMS;