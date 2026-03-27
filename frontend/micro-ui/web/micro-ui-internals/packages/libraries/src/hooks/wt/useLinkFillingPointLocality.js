import { useMutation } from "react-query";
import { WTService } from "../../services/elements/WT";

export const useLinkFillingPointLocality = (tenantId) => {
  return useMutation((data) => WTService.CreateFillPointLocality(data, tenantId));
};

export default useLinkFillingPointLocality;
