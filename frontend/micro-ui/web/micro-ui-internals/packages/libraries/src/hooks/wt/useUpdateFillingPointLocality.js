import { useMutation } from "react-query";
import { WTService } from "../../services/elements/WT";

export const useUpdateFillingPointLocality = (tenantId) => {
  return useMutation((data) => WTService.UpdateFillPointLocality(data, tenantId));
};

export default useUpdateFillingPointLocality;
