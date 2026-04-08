import { useMutation } from "react-query";
import { WTService } from "../../services/elements/WT";

export const useUpdateFixedPointSchedule = (tenantId) => {
  return useMutation((data) => WTService.UpdateFixedPointSchedule(data, tenantId));
};

export default useUpdateFixedPointSchedule;
