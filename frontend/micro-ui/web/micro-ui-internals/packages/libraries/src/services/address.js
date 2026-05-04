import Urls from "./atoms/urls";
import { Request } from "./atoms/Utils/Request";

export const AddressService = {
  create: (details, tenantId) => {
    const ts = new Date().getTime();
    const sessionUser = Digit.UserService.getUser() || Digit.SessionStorage.get("User");
    const localUser = JSON.parse(localStorage.getItem("user-info") || "null") ||
      JSON.parse(localStorage.getItem("Citizen.user-info") || "null");
    const userInfo = sessionUser?.info || localUser?.info || sessionUser || localUser || details?.userInfo;

    const data = {
      ...details,
      RequestInfo: {
        apiId: "Rainmaker",
        authToken: window?.keycloak?.token || null,
        msgId: `${ts}|${Digit.StoreData.getCurrentLanguage()}`,
        plainAccessRequest: {},
        ts: ts,
        userInfo: userInfo,
      },
    };
    return Request({
      url: Urls.UserCreateAddressV2,
      data: data,
      useCache: false,
      setTimeParam: false,
      userService: false,
      method: "POST",
      params: { tenantId },
      auth: true,
    });
  },
  update: (details, tenantId) => {
    const ts = new Date().getTime();
    const sessionUser = Digit.UserService.getUser() || Digit.SessionStorage.get("User");
    const localUser = JSON.parse(localStorage.getItem("user-info") || "null") ||
      JSON.parse(localStorage.getItem("Citizen.user-info") || "null");
    const userInfo = sessionUser?.info || localUser?.info || sessionUser || localUser || details?.userInfo;

    const data = {
      ...details,
      RequestInfo: {
        apiId: "Rainmaker",
        authToken: window?.keycloak?.token || null,
        msgId: `${ts}|${Digit.StoreData.getCurrentLanguage()}`,
        plainAccessRequest: {},
        ts: ts,
        userInfo: userInfo,
      },
    };
    return Request({
      url: Urls.UserUpdateAddressV2,
      data: data,
      useCache: false,
      setTimeParam: false,
      userService: false,
      method: "POST",
      params: { tenantId },
      auth: true,
    });
  },
  getAddress: (details, tenantId) =>
    Request({
      url: Urls.UserSearchNewV2,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: true,
      method: "POST",
      params: { tenantId },
      auth: true,
    }),
};
