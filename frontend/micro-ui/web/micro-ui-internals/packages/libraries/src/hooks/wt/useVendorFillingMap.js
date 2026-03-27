import { useMutation, useQueryClient } from "react-query";
import { WTService } from "../../services/elements/WT";

const useVendorFillingMap = (tenantId, config = {}) => {
  const queryClient = useQueryClient();
  return useMutation((details) => WTService.VendorFillingMap(details, tenantId), {
    ...config,
    onSuccess: () => {
      queryClient.invalidateQueries(["FIXED_POINT_SEARCH", tenantId]);
    },
  });
};

export default useVendorFillingMap;
