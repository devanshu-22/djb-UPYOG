import { useQuery } from "react-query"

const combineResponse = (data, users) => {
  const usersArray = Array.isArray(users) ? users : [];
  data.events = data?.events?.map(event => {
    const user = usersArray.find(u => u?.uuid === event?.auditDetails?.lastModifiedBy);
    return { ...event, user };
  });
  return data;
}


const useInbox = (tenantId, data, filter = {}, config = {}) => {
  return useQuery(["EVENT_INBOX", tenantId, data, filter], async () => {
    const eventData = await Digit.EventsServices.Search({ tenantId, data, filter });
    if (!eventData?.events || eventData?.events?.length === 0) {
      return eventData;
    }
    
    const uuids = Object.keys(
      eventData?.events?.reduce((acc, event) => {
        if (event?.auditDetails?.lastModifiedBy) acc[event.auditDetails.lastModifiedBy] = true;
        return acc;
      }, {})
    );

    if (uuids.length === 0) {
      return eventData;
    }

    let usersResponse = {};
    try {
      usersResponse = await Digit.UserService.userSearch(tenantId, { uuid: uuids }, {});
    } catch (e) {
      console.error("User search failed:", e);
    }
    return combineResponse(eventData, usersResponse?.user);
  }, 
  config);
}

export default useInbox;