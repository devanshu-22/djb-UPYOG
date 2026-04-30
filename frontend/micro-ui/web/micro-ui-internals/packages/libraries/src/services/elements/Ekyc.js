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
    application_review: (data, params) =>
        Request({
            url: Urls.ekyc.application_review,
            data: { ...data, fetchType: "REVIEW" },
            useCache: false,
            method: "POST",
            params: { tenantId: params },
            auth: true,
            userService: true,
        }),
    application_update: (data, tenantId) =>
        Request({
            url: Urls.ekyc.application_update,
            data: data,
            useCache: false,
            method: "POST",
            params: { tenantId },
            auth: true,
            userService: true,
        }),
};
