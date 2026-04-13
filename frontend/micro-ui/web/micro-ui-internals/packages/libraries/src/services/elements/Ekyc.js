import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";

export const EkycService = {
    search_connection: (data, tenantId) =>
        Request({
            url: Urls.ekyc.application_search,
            data: data,
            useCache: false,
            method: "POST",
            params: { tenantId },
            auth: true,
            userService: true,
        }),
    dashboard: (data, params) =>
        Request({
            url: Urls.ekyc.dashboard,
            data: data,
            useCache: false,
            method: "POST",
            params,
            auth: true,
            userService: true,
        }),
};
