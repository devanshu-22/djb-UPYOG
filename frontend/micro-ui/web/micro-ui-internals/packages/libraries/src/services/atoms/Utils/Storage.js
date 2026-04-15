const localStoreSupport = () => {
  try {
    return "sessionStorage" in window && window["sessionStorage"] !== null;
  } catch (e) {
    return false;
  }
};

const k = (key) => `Digit.${key}`;
const getStorage = (storageClass) => ({
  get: (key) => {
    if (localStoreSupport() && key) {
      let valueInStorage = storageClass.getItem(k(key));
      if (!valueInStorage || valueInStorage === "undefined") {
        // Check in-memory fallback (used when localStorage quota was exceeded)
        const memItem = window?.eGov?.Storage?.[k(key)];
        if (memItem && Date.now() <= memItem.expiry) return memItem.value;
        return null;
      }
      const item = JSON.parse(valueInStorage);
      if (Date.now() > item.expiry) {
        storageClass.removeItem(k(key));
        return null;
      }
      return item.value;
    } else if (typeof window !== "undefined") {
      const memItem = window?.eGov?.Storage?.[k(key)];
      return memItem && Date.now() <= memItem.expiry ? memItem.value : null;
    } else {
      return null;
    }
  },
  set: (key, value, ttl = 86400) => {
    const item = {
      value,
      ttl,
      expiry: Date.now() + ttl * 1000,
    };
    if (localStoreSupport()) {
      try {
        storageClass.setItem(k(key), JSON.stringify(item));
      } catch (e) {
        // QuotaExceededError: fall back to in-memory storage so the app doesn't crash
        if (typeof window !== "undefined") {
          window.eGov = window.eGov || {};
          window.eGov.Storage = window.eGov.Storage || {};
          window.eGov.Storage[k(key)] = item;
        }
      }
    } else if (typeof window !== "undefined") {
      window.eGov = window.eGov || {};
      window.eGov.Storage = window.eGov.Storage || {};
      window.eGov.Storage[k(key)] = item;
    }
  },
  del: (key) => {
    if (localStoreSupport()) {
      storageClass.removeItem(k(key));
    } else if (typeof window !== "undefined") {
      window.eGov = window.eGov || {};
      window.eGov.Storage = window.eGov.Storage || {};
      delete window.eGov.Storage[k(key)];
    }
  },
});

export const Storage = getStorage(window.sessionStorage);
export const PersistantStorage = getStorage(window.localStorage);
