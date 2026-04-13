import { useQuery, useQueryClient, useMutation } from "react-query";

// search connection
export const useSearchConnection = ({ tenantId, details }, config = {}) => {
    const client = useQueryClient();

    const { isLoading, error, data } = useQuery(
        ["ekycSearchConnection", tenantId, details?.kno, details?.name],
        () => Digit.EkycService.search_connection(details, tenantId),
        config
    );

    return {
        isLoading,
        error,
        data,
        revalidate: () =>
            client.invalidateQueries(["ekycSearchConnection", tenantId, details?.kno, details?.name]),
    };
};

// get connection type
export const useGetPropertyType = (tenantId, config = {}) => {
    return Digit.Hooks.useCustomMDMS(
        tenantId,
        "ws-services-calculation",
        [{ name: "propertyTypeV2" }],
        config
    );
};

// get connection category
export const useGetConnectionTypeV2 = (tenantId, config = {}) => {
    return Digit.Hooks.useCustomMDMS(
        tenantId,
        "ws-services-calculation",
        [{ name: "connectionTypeV2" }],
        config
    );
};

// get user type
export const useGetUserType = (tenantId, config = {}) => {
    return Digit.Hooks.useCustomMDMS(
        tenantId,
        "ws-services-calculation",
        [{ name: "userTypeV2" }],
        config
    );
};

// get floor count
export const useGetFloorCount = (tenantId, config = {}) => {
    return Digit.Hooks.useCustomMDMS(
        tenantId,
        "ws-services-calculation",
        [{ name: "floorCount" }],
        config
    );
};

export const useEkycSurveyorDashboard = (data, params, config = {}) => {
    return useQuery(
        ["useEkycSurveyorDashboard", data, params],
        () => Digit.EkycService.dashboard(data, params),
        config
    );
};

