import React, { useState, useEffect, useMemo, useRef } from "react";
import { CardLabel, TextInput, Dropdown, Card, CardSubHeader, CollapsibleCardPage } from "@djb25/digit-ui-react-components";
import { useLocation } from "react-router-dom";

const allOptions = [
  { name: "Correspondence", code: "CORRESPONDENCE", i18nKey: "COMMON_ADDRESS_TYPE_CORRESPONDENCE" },
  { name: "Permanent", code: "PERMANENT", i18nKey: "COMMON_ADDRESS_TYPE_PERMANENT" },
  { name: "Other", code: "OTHER", i18nKey: "COMMON_ADDRESS_TYPE_OTHER" },
];

const AddFixFillAddress = ({ t, config, formData, onSelect, isEdit, userDetails }) => {
  const { data: allCities } = Digit.Hooks.useTenants();
  const location = useLocation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const usedAddressTypes = location.state?.usedAddressTypes || [];
  const [pincode, setPincode] = useState(formData?.address?.pincode || "");
  const [city, setCity] = useState(formData?.address?.city || null);
  const [locality, setLocality] = useState(formData?.address?.locality || null);
  const [houseNo, setHouseNo] = useState(formData?.address?.houseNo || "");
  const [streetName, setStreetName] = useState(formData?.address?.streetName || "");
  const [landmark, setLandmark] = useState(formData?.address?.landmark || "");
  const [addressLine1, setAddressLine1] = useState(formData?.address?.addressLine1 || "");
  const [addressLine2, setAddressLine2] = useState(formData?.address?.addressLine2 || "");
  const [addressType, setAddressType] = useState(formData?.address?.addressType || null);
  const [zone, setZone] = useState(formData?.address?.zone || "");
  const [block, setBlock] = useState(formData?.address?.block || "");
  const [latitude, setLatitude] = useState(formData?.address?.latitude || "");
  const [longitude, setLongitude] = useState(formData?.address?.longitude || "");
  const [selectedAddress, setSelectedAddress] = useState("");
  const isInitialized = useRef(!isEdit);
  const lastSyncedAddress = useRef(null);
  const lastBookingId = useRef(null);

  // ✅ Address type filter
  const availableAddressTypeOptions = useMemo(() => {
    if (usedAddressTypes.length === 3) {
      return allOptions.filter((opt) => opt.code === "OTHER");
    }
    return allOptions.filter((opt) => !usedAddressTypes.includes(opt.code));
  }, [usedAddressTypes]);

  const { data: egovLocationData } = Digit.Hooks.useCommonMDMS(tenantId, "egov-location", ["TenantBoundary"]);

  useEffect(() => {
    if (!city && allCities && allCities.length > 0) {
      const defaultCity = allCities.find((c) => c.code === tenantId) || allCities[0];
      setCity(defaultCity);
    }
  }, [allCities, city, tenantId]);

  const boundaryData = useMemo(() => {
    const tenantBoundary = egovLocationData?.["egov-location"]?.TenantBoundary || [];

    const revenueData = tenantBoundary.find((item) => item?.hierarchyType?.code === "REVENUE");

    return revenueData?.boundary || [];
  }, [egovLocationData]);

  const structuredLocality = useMemo(() => {
    let localities = [];
    const boundaries = Array.isArray(boundaryData) ? boundaryData : boundaryData ? [boundaryData] : [];

    const extractLocalities = (node, zone = null, ward = null) => {
      if (!node) return;

      let currentZone = zone;
      let currentWard = ward;

      if (node.label === "Zone" || node.label === "ZONE") {
        currentZone = node.localname || node.code || node.name;
      }
      if (node.label === "Ward" || node.label === "WARD" || node.label === "Block" || node.label === "BLOCK") {
        currentWard = node.code || node.localname || node.name;
      }

      // Specifically target nodes that are officially labeled as Locality
      if (node.label === "Locality" || node.label === "LOCALITY") {
        localities.push({
          ...node,
          name: node.localname || node.name || node.code,
          i18nkey: node.i18nkey || `${tenantId.replace(".", "_")}_REVENUE_${node.code}`.toUpperCase(),
          zone: currentZone,
          ward: currentWard,
        });
      }
      // Always traverse down in case there are nested boundaries underneath
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => extractLocalities(child, currentZone, currentWard));
      }
    };

    boundaries.forEach((rootNode) => extractLocalities(rootNode));

    return localities;
  }, [boundaryData, tenantId]);

  // ✅ Extract Pincodes from ALL structured localities
  const fetchedPincodes = useMemo(() => {
    const pinSet = new Set();

    // First, scan all structured localities to find every valid pincode
    structuredLocality.forEach((loc) => {
      if (loc.pincode) {
        const pins = Array.isArray(loc.pincode) ? loc.pincode : [loc.pincode];
        pins.forEach((p) => pinSet.add(p.toString()));
      }
    });

    // Fallback to city defaults if no pincodes found in localities
    if (pinSet.size === 0 && city?.pincode) {
      const pins = Array.isArray(city.pincode) ? city.pincode : [city.pincode];
      pins.forEach((p) => pinSet.add(p.toString()));
    }

    return Array.from(pinSet)
      .sort()
      .map((pin) => ({
        code: pin,
        name: pin,
        i18nKey: pin,
      }));
  }, [structuredLocality, city]);

  // ✅ Filter Localities based on selected Pincode
  const filteredLocalities = useMemo(() => {
    if (!pincode) return structuredLocality;
    return structuredLocality.filter((loc) => {
      if (!loc.pincode) return false;
      const pins = Array.isArray(loc.pincode) ? loc.pincode : [loc.pincode];
      return pins.some((p) => p.toString() === pincode);
    });
  }, [structuredLocality, pincode]);

  // ✅ Sync with formData if it changes (edit mode) - only run once or when externally changed
  useEffect(() => {
    // Reset if id/bookingId changes
    const currentId = formData?.id || formData?.bookingId || formData?.address?.id;
    if (currentId && lastBookingId.current !== currentId) {
      isInitialized.current = false;
      lastBookingId.current = currentId;
    }

    if (formData?.address && !isInitialized.current && allCities) {
      const addressData = formData.address;

      // Phase 1: Sync basic fields (City must be set for boundaryData to trigger)
      const cityObj =
        allCities.find((c) => c.code === addressData.cityCode || c.code === addressData.city || c.name === addressData.city) || addressData.city;

      if (cityObj && (!city || (city.code !== cityObj.code && city !== cityObj))) {
        setCity(cityObj || null);
      }

      setPincode(addressData.pincode || "");
      setHouseNo(addressData.houseNo || "");
      setStreetName(addressData.streetName || "");
      setLandmark(addressData.landmark || "");
      setAddressLine1(addressData.addressLine1 || "");
      setAddressLine2(addressData.addressLine2 || "");
      setAddressType(allOptions.find((a) => a.code === addressData.addressType) || addressData.addressType || null);
      setZone(addressData.zone || "");
      setBlock(addressData.block || "");
      setLatitude(addressData.latitude || "");
      setLongitude(addressData.longitude || "");

      // Phase 2: Wait for boundaryData or if there is no cityCode to wait for
      if (boundaryData || !addressData.cityCode) {
        if (boundaryData) {
          const localityObj = boundaryData.find(
            (l) => l.code === addressData.localityCode || l.code === addressData.locality || l.i18nkey === addressData.locality
          );
          setLocality(localityObj || addressData.locality || null);
        } else {
          setLocality(addressData.locality || null);
        }

        // Only mark as fully initialized once everything (locality included) is ready
        isInitialized.current = true;
        lastSyncedAddress.current = JSON.stringify(addressData);
      }
    }
  }, [formData?.address, city, allCities, boundaryData]);

  // ✅ Get current location
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      () => {}
    );
  }, []);

  // ✅ Auto-fill from selected address
  useEffect(() => {
    if (selectedAddress && Object.keys(selectedAddress).length) {
      setPincode(selectedAddress.pinCode);
      setCity(allCities?.find((c) => c.name === selectedAddress.city));
      setLocality(boundaryData?.find((l) => l.i18nkey === selectedAddress.locality));
      setHouseNo(selectedAddress.houseNumber);
      setStreetName(selectedAddress.streetName);
      setLandmark(selectedAddress.landmark);
      setAddressLine1(selectedAddress.address);
      setAddressLine2(selectedAddress.address2);
      setZone(selectedAddress.zone);
      setBlock(selectedAddress.block);
      setLatitude(selectedAddress.latitude);
      setLongitude(selectedAddress.longitude);
      setAddressType(allOptions.find((a) => a.code === selectedAddress.addressType));
    }
  }, [selectedAddress]);

  // ✅ 🔥 MAIN SYNC (replaces onSelect)
  useEffect(() => {
    if (!onSelect || !isInitialized.current) return;

    const currentAddress = {
      pincode: pincode || "",
      city: city?.code || city || null,
      locality: locality?.code || locality || null,
      houseNo: houseNo || "",
      landmark: landmark || "",
      addressLine1: addressLine1 || "",
      addressLine2: addressLine2 || "",
      streetName: streetName || "",
      addressType: addressType?.code || addressType || null,
      zone: zone || "",
      block: block || "",
      latitude: latitude || "",
      longitude: longitude || "",
    };

    // Only call onSelect if data has actually changed from what we last received or sent
    const addressString = JSON.stringify(currentAddress);
    if (lastSyncedAddress.current !== addressString) {
      lastSyncedAddress.current = addressString;
      onSelect(config?.key || "address", currentAddress);
    }
  }, [pincode, city, locality, houseNo, landmark, addressLine1, addressLine2, streetName, addressType, zone, block, latitude, longitude]);

  return (
    <CollapsibleCardPage title={t("WT_ADDRESS_DETAILS")} defaultOpen={true}>
      <div className="formcomposer-section-grid">
        {/* Existing Address */}
        {userDetails?.addresses?.length > 0 && (
          <div>
            <CardLabel>{t("COMMON_ADDRESS_TYPE")}</CardLabel>
            <Dropdown
              selected={selectedAddress}
              select={setSelectedAddress}
              option={userDetails.addresses || []}
              optionKey="address"
              t={t}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {/* Address Type */}
        <div>
          <CardLabel>{t("COMMON_ADDRESS_TYPE")}</CardLabel>
          <Dropdown
            selected={addressType}
            select={setAddressType}
            option={availableAddressTypeOptions || []}
            optionKey="i18nKey"
            t={t}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <CardLabel>
            {t("CITY")} <span className="astericColor">*</span>
          </CardLabel>
          <Dropdown selected={city} select={setCity} option={allCities || []} optionKey="i18nKey" t={t} disable={true} />
        </div>

        <div>
          <CardLabel>
            {t("PINCODE")} <span className="astericColor">*</span>
          </CardLabel>
          <Dropdown
            selected={fetchedPincodes?.find((p) => p.code === pincode) || (pincode ? { code: pincode, name: pincode, i18nKey: pincode } : null)}
            select={(val) => {
              const newPin = val?.code;
              if (newPin !== pincode) {
                setLocality(null);
                setZone("");
                setBlock("");
                setLatitude("");
                setLongitude("");
                setAddressLine1("");
                setAddressLine2("");
              }
              setPincode(newPin);
            }}
            option={fetchedPincodes || []}
            optionKey="i18nKey"
            t={t}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <CardLabel>
            {t("LOCALITY")} <span className="astericColor">*</span>
          </CardLabel>
          <Dropdown
            selected={locality}
            select={(val) => {
              setLocality(val);
              if (val?.latitude) setLatitude(val.latitude);
              if (val?.longitude) setLongitude(val.longitude);
              if (val?.localname) setAddressLine1(val.localname);
              if (val?.name) setAddressLine2(val.name);
              if (val?.zone) setZone(val.zone);
              if (val?.ward) setBlock(val.ward);
              if (val?.pincode) {
                const p = Array.isArray(val.pincode) ? val.pincode[0] : val.pincode;
                if (p) setPincode(p.toString());
              }
            }}
            option={filteredLocalities}
            optionKey="i18nkey"
            t={t}
            style={{ width: "100%" }}
          />
        </div>

        {/* House No */}
        <div>
          <CardLabel>
            {t("HOUSE_NO")}
            <span className="astericColor">*</span>
          </CardLabel>
          <TextInput value={houseNo} onChange={(e) => setHouseNo(e.target.value)} style={{ width: "100%" }} />
        </div>

        {/* Street */}
        <div>
          <CardLabel>
            {t("STREET_NAME")} <span className="astericColor">*</span>
          </CardLabel>
          <TextInput value={streetName} onChange={(e) => setStreetName(e.target.value)} style={{ width: "100%" }} />
        </div>

        {/* Address Line 1 */}
        <div>
          <CardLabel>
            {t("ADDRESS_LINE1")} <span className="astericColor">*</span>
          </CardLabel>
          <TextInput value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} style={{ width: "100%" }} />
        </div>

        {/* Address Line 2 */}
        <div>
          <CardLabel>
            {t("ADDRESS_LINE2")} <span className="astericColor">*</span>
          </CardLabel>
          <TextInput value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div>
          <CardLabel>
            {t("BLOCK")} <span className="astericColor">*</span>
          </CardLabel>
          <TextInput value={block} onChange={(e) => setBlock(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div>
          <CardLabel>
            {t("ZONE")} <span className="astericColor">*</span>
          </CardLabel>
          <TextInput value={zone} onChange={(e) => setZone(e.target.value)} style={{ width: "100%" }} />
        </div>

        {/* Latitude */}
        <div>
          <CardLabel>
            {t("LATITUDE")} <span className="astericColor">*</span>
          </CardLabel>
          <TextInput value={latitude} onChange={(e) => setLatitude(e.target.value)} style={{ width: "100%" }} />
        </div>

        {/* Longitude */}
        <div>
          <CardLabel>
            {t("LONGITUDE")} <span className="astericColor">*</span>
          </CardLabel>
          <TextInput value={longitude} onChange={(e) => setLongitude(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <CardLabel>{t("LANDMARK")}</CardLabel>
          <TextInput value={landmark} onChange={(e) => setLandmark(e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>
    </CollapsibleCardPage>
  );
};

export default AddFixFillAddress;
