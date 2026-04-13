import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import CardLabel from "../atoms/CardLabel";
import TextInput from "../atoms/TextInput";
import Dropdown from "../atoms/Dropdown";
import FormStep from "./FormStep";
import { useLocation } from "react-router-dom";

const allOptions = [
  { name: "Correspondence", code: "CORRESPONDENCE", i18nKey: "COMMON_ADDRESS_TYPE_CORRESPONDENCE" },
  { name: "Permanent", code: "PERMANENT", i18nKey: "COMMON_ADDRESS_TYPE_PERMANENT" },
  { name: "Other", code: "OTHER", i18nKey: "COMMON_ADDRESS_TYPE_OTHER" },
];

const AddressDetails = ({ t, config, onSelect, formData, isEdit, userDetails }) => {
  const { data: allCities, isLoading } = Digit.Hooks.useTenants();
  let validation = {};
  const convertToObject = (String) => (String ? { i18nKey: String, code: String, value: String } : null);
  const user = Digit.UserService.getUser().info;
  const [pincode, setPincode] = useState(
    (formData?.pincode || formData?.address?.pincode || formData?.infodetails?.existingDataSet?.address?.pincode)?.toString().split(".")[0] || ""
  );
  const [city, setCity] = useState(
    convertToObject(formData?.city) || formData?.address?.city || formData?.infodetails?.existingDataSet?.address?.cityValue || ""
  );
  const [locality, setLocality] = useState(
    convertToObject(formData?.locality) || formData?.address?.locality || formData?.infodetails?.existingDataSet?.address?.locality || ""
  );
  const [houseNo, setHouseNo] = useState(
    formData?.houseNo || formData?.address?.houseNo || formData?.infodetails?.existingDataSet?.address?.houseNo || ""
  );
  const [streetName, setstreetName] = useState(
    formData?.streetName || formData?.address?.streetName || formData?.infodetails?.existingDataSet?.address?.streetName || ""
  );
  const [landmark, setLandmark] = useState(
    formData?.landmark || formData?.address?.landmark || formData?.infodetails?.existingDataSet?.address?.landmark || ""
  );
  const [addressLine1, setAddressLine1] = useState(
    formData?.addressLine1 || formData?.address?.addressLine1 || formData?.infodetails?.existingDataSet?.address?.addressline1 || ""
  );
  const [addressLine2, setAddressLine2] = useState(
    formData?.addressLine2 || formData?.address?.addressLine2 || formData?.infodetails?.existingDataSet?.address?.addressline2 || ""
  );
  const [addressType, setAddressType] = useState(
    convertToObject(formData?.addressType) || formData?.address?.addressType || formData?.infodetails?.existingDataSet?.address?.addressType || ""
  );
  const [latitude, setLatitude] = useState(
    formData?.latitude || formData?.address?.latitude || formData?.infodetails?.existingDataSet?.address?.latitude || ""
  );
  const [longitude, setLongitude] = useState(
    formData?.longitude || formData?.address?.longitude || formData?.infodetails?.existingDataSet?.address?.longitude || ""
  );
  const [zone, setZone] = useState(formData?.zone || formData?.address?.zone || "");
  const [block, setBlock] = useState(formData?.block || formData?.address?.block || "");
  const [selectedAddress, setSelectedAddress] = useState("");
  const { control } = useForm();
  const location = useLocation();
  const usedAddressTypes = location.state?.usedAddressTypes || [];

  const inputStyles = { width: user.type === "EMPLOYEE" ? "50%" : "86%" };

  const availableAddressTypeOptions = useMemo(() => {
    if (usedAddressTypes.length === 3) {
      // If all are available → show only "Other"
      return allOptions.filter((opt) => opt.code === "OTHER");
    }
    // Otherwise, show whatever is not used
    return allOptions.filter((opt) => !usedAddressTypes.includes(opt.code));
  }, [usedAddressTypes]);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: egovLocationData } = Digit.Hooks.useCommonMDMS(tenantId, "egov-location", ["TenantBoundary"]);

  const boundaryData = useMemo(() => {
    const tenantBoundary = egovLocationData?.["egov-location"]?.TenantBoundary || [];
    const revenueData = tenantBoundary.find((item) => item?.hierarchyType?.code === "REVENUE");
    const boundary = revenueData?.boundary || [];
    return Array.isArray(boundary) ? boundary : [boundary];
  }, [egovLocationData]);

  const structuredLocalityData = useMemo(() => {
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
          i18nKey: node.i18nKey || `${tenantId.replace(".", "_")}_REVENUE_${node.code}`.toUpperCase(),
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

  const fetchedPincodes = useMemo(() => {
    const pinSet = new Set();

    structuredLocalityData.forEach((loc) => {
      if (loc.pincode) {
        const pins = Array.isArray(loc.pincode) ? loc.pincode : [loc.pincode];
        pins.forEach((p) => {
          if (p) {
            const sanitizedPin = p.toString().split(".")[0];
            pinSet.add(sanitizedPin);
          }
        });
      }
    });

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
  }, [structuredLocalityData, city]);

  const filteredLocalities = useMemo(() => {
    if (!pincode) return structuredLocalityData;
    return structuredLocalityData.filter((loc) => {
      if (!loc.pincode) return false;
      const pins = Array.isArray(loc.pincode) ? loc.pincode : [loc.pincode];
      return pins.some((p) => p.toString() === pincode);
    });
  }, [structuredLocalityData, pincode]);

  useEffect(() => {
    handleGetLocation();
  }, []);

  const goNext = () => {
    let ownerAddress = formData.address;
    let addressStep = {
      ...ownerAddress,
      pincode,
      city,
      locality,
      houseNo,
      landmark,
      addressLine1,
      addressLine2,
      streetName,
      addressType,
      latitude,
      longitude,
      zone,
      block,
    };
    onSelect(config.key, { ...formData[config.key], ...addressStep }, false);
    // Checks if the `config` is undefined, and if so, calls the `onSelect` function with the `addressStep` object.
    // This ensures that the address step is selected when no specific configuration is provided.
    if (config === undefined) {
      onSelect(addressStep);
    }
  };
  /* If `config` is undefined and all required address fields are filled, it creates an `addressStep` object
    containing the address details and calls the `onSelect` function with it.
   **/
  useEffect(() => {
    if (config === undefined && houseNo && city && locality && pincode && addressLine1 && streetName && addressLine2 && latitude && longitude) {
      let addressStep = {
        pincode,
        city,
        locality,
        houseNo,
        landmark,
        addressLine1,
        addressLine2,
        streetName,
        addressType,
        latitude,
        longitude,
        zone,
        block,
      };
      onSelect(addressStep);
    }
  }, [pincode, city, locality, houseNo, landmark, addressLine1, addressLine2, streetName, addressType, latitude, longitude, zone, block]);

  useEffect(() => {
    if (selectedAddress && Object.keys(selectedAddress).length) {
      setPincode(selectedAddress.pinCode?.toString().split(".")[0]);
      setCity(allCities?.find((ele) => ele.name === selectedAddress.city));
      setLocality(structuredLocalityData?.find((ele) => ele.i18nKey === selectedAddress.locality));
      setHouseNo(selectedAddress.houseNumber);
      setstreetName(selectedAddress.streetName);
      setLandmark(selectedAddress.landmark);
      setAddressLine1(selectedAddress.address);
      setAddressLine2(selectedAddress.address2);
      setLatitude(selectedAddress.latitude);
      setLongitude(selectedAddress.longitude);
      setZone(selectedAddress.zone);
      setBlock(selectedAddress.block);
      setAddressType(allOptions?.find((ele) => ele.code === selectedAddress.addressType));
    }
  }, [selectedAddress]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);
      },
      (error) => {
        console.error(error);
        alert("Unable to fetch location");
      }
    );
  };

  return (
    <React.Fragment>
      <FormStep
        config={config}
        onSelect={goNext}
        t={t}
        isDisabled={!houseNo || !city || !locality || !pincode || !addressLine1 || !streetName || !addressLine2}
      >
        {userDetails?.addresses?.length && (
          <div style={{ gridColumn: "span 2" }}>
            <CardLabel>{t("FORM_SELECT_ADDRESS_FROM_LIST")}</CardLabel>
            <Dropdown
              className="form-field"
              selected={selectedAddress}
              select={setSelectedAddress}
              disable={isEdit}
              option={userDetails?.addresses}
              optionKey="address"
              optionCardStyles={{ overflowY: "auto", maxHeight: "300px" }}
              t={t}
              style={{ width: "100%" }}
              placeholder={"Select Address Type"}
            />
          </div>
        )}
        <div>
          <CardLabel>
            {`${t("COMMON_ADDRESS_TYPE")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <Dropdown
            className="form-field"
            selected={addressType}
            select={setAddressType}
            disable={isEdit}
            option={availableAddressTypeOptions}
            optionCardStyles={{ overflowY: "auto", maxHeight: "300px" }}
            optionKey="i18nKey"
            t={t}
            style={{ width: "100%" }}
            placeholder={"Select Address Type"}
          />
        </div>
        <div>
          <CardLabel>
            {`${t("CITY")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <Controller
            control={control}
            name={"city"}
            defaultValue={city}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={city}
                select={setCity}
                option={allCities}
                optionCardStyles={{ overflowY: "auto", maxHeight: "300px" }}
                optionKey="i18nKey"
                t={t}
                style={{ width: "100%" }}
                placeholder={"Select"}
              />
            )}
          />
        </div>
        <div>
          <CardLabel>
            {`${t("PINCODE")}`} <span className="check-page-link-button">*</span>
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
            placeholder={"Select or enter pincode"}
          />
        </div>
        <div>
          <CardLabel>
            {`${t("LOCALITY")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <Controller
            control={control}
            name={"locality"}
            defaultValue={locality}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
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
                  if (p) {
                    const sanitizedPin = p.toString().split(".")[0];
                    setPincode(sanitizedPin);
                  }
                  }
                }}
                option={filteredLocalities}
                optionCardStyles={{ overflowY: "auto", maxHeight: "300px" }}
                optionKey="i18nKey"
                t={t}
                style={{ width: "100%" }}
                placeholder={"Select"}
              />
            )}
          />
        </div>
        <div>
          <CardLabel>
            {`${t("HOUSE_NO")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="houseNo"
            value={houseNo}
            style={{ width: "100%" }}
            placeholder={"Enter House No"}
            onChange={(e) => {
              setHouseNo(e.target.value);
            }}
            ValidationRequired={true}
            validation={{
              isRequired: true,
              pattern: "^[a-zA-Z0-9 ,\\-]+$",
              type: "text",
              title: t("HOUSE_NO_ERROR_MESSAGE"),
            }}
          />
        </div>
        <div>
          <CardLabel>
            {`${t("STREET_NAME")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="streetName"
            value={streetName}
            style={{ width: "100%" }}
            placeholder={"Enter Street Name"}
            onChange={(e) => {
              setstreetName(e.target.value);
            }}
            ValidationRequired={true}
            validation={{
              pattern: "^[a-zA-Z0-9 ,\\-]+$",
              type: "text",
              title: t("STREET_NAME_ERROR_MESSAGE"),
            }}
          />
        </div>
        <div>
          <CardLabel>
            {`${t("ADDRESS_LINE1")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="addressLine1"
            value={addressLine1}
            style={{ width: "100%" }}
            placeholder={"Enter Address"}
            onChange={(e) => {
              setAddressLine1(e.target.value);
            }}
            ValidationRequired={false}
            {...(validation = {
              isRequired: false,
              pattern: "^[a-zA-Z,-/ ]*$",
              type: "textarea",
              title: t("ADDRESS_ERROR_MESSAGE"),
            })}
          />
        </div>
        <div>
          <CardLabel>
            {`${t("ADDRESS_LINE2")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="addressLine2"
            value={addressLine2}
            style={{ width: "100%" }}
            placeholder={"Enter Address"}
            onChange={(e) => {
              setAddressLine2(e.target.value);
            }}
            ValidationRequired={false}
            {...(validation = {
              isRequired: false,
              pattern: "^[a-zA-Z,-/ ]*$",
              type: "textarea",
              title: t("ADDRESS_ERROR_MESSAGE"),
            })}
          />
        </div>

        <div>
          <CardLabel>
            {`${t("LATITUDE")}`} <span className="check-page-link-button">*</span>
          </CardLabel>

          <TextInput
            t={t}
            type="text"
            isMandatory={false}
            name="latitude"
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
            }}
            style={{ width: "100%" }}
            placeholder="Enter latitude (e.g. 28.6139)"
            ValidationRequired={true}
            validation={{
              required: true,
              pattern: "^[0-9]{6}$",
              type: "number",
              title: t("SV_ADDRESS_PINCODE_INVALID"),
            }}
            step="any"
            className="form-field"
          />
        </div>

        <div>
          <CardLabel>
            {`${t("LONGITUDE")}`} <span className="check-page-link-button">*</span>
          </CardLabel>

          <TextInput
            t={t}
            type="text"
            isMandatory={false}
            name="longitude"
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
            }}
            style={{ width: "100%" }}
            placeholder="Enter longitude (e.g. 28.6139)"
            ValidationRequired={true}
            validation={{
              required: true,
              pattern: "^[0-9]{6}$",
              type: "number",
              title: t("SV_ADDRESS_PINCODE_INVALID"),
            }}
            step="any"
            className="form-field"
          />
        </div>
        <div>
          <CardLabel>
            {`${t("BLOCK")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            name="block"
            value={block}
            style={{ width: "100%" }}
            placeholder={"Enter Block"}
            onChange={(e) => setBlock(e.target.value)}
          />
        </div>
        <div>
          <CardLabel>
            {`${t("ZONE")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            name="zone"
            value={zone}
            style={{ width: "100%" }}
            placeholder={"Enter Zone"}
            onChange={(e) => setZone(e.target.value)}
          />
        </div>
        <div>
          <CardLabel>{`${t("LANDMARK")}`}</CardLabel>
          <TextInput
            t={t}
            type={"textarea"}
            isMandatory={false}
            optionKey="i18nKey"
            name="landmark"
            value={landmark}
            style={{ width: "100%" }}
            placeholder={"Enter Landmark"}
            onChange={(e) => {
              setLandmark(e.target.value);
            }}
            ValidationRequired={true}
            validation={{
              isRequired: false,
              pattern: "^[a-zA-Z0-9 ]+$",
              type: "textarea",
              title: t("LANDMARK_ERROR_MESSAGE"),
            }}
          />
        </div>
      </FormStep>
    </React.Fragment>
  );
};

export default AddressDetails;
