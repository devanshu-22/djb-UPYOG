import { useQuery, useMutation, useQueryClient } from "react-query";
import { AddressService } from "../services/address";

const useAddress = (details, tenantId, config = {}) => {
  const queryClient = useQueryClient();

  // 🔹 GET Address
  const { isLoading, error, data } = useQuery(["address", details], () => AddressService.getAddress(details, tenantId), {
    enabled: !!details, // prevents unnecessary API calls
    ...config,
  });

  // 🔹 CREATE Address
  const createAddress = useMutation((payload) => AddressService.create(payload, tenantId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["address"]);
    },
  });

  // 🔹 UPDATE Address
  const updateAddress = useMutation((payload) => AddressService.update(payload, tenantId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["address"]);
    },
  });

  return {
    isLoading,
    error,
    data,
    createAddress,
    updateAddress,
  };
};

export default useAddress;
