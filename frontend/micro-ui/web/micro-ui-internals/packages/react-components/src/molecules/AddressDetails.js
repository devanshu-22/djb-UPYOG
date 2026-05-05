import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import CardLabel from "../atoms/CardLabel";
import TextInput from "../atoms/TextInput";
import Dropdown from "../atoms/Dropdown";
import UploadFile from "../atoms/UploadFile";
import Toast from "../atoms/Toast";
import FormStep from "./FormStep";
import { useLocation } from "react-router-dom";
import LabelFieldPair from "../atoms/LabelFieldPair";
import CardLabelError from "../atoms/CardLabelError";

const allOptions = [
  { name: "Correspondence", code: "CORRESPONDENCE", i18nKey: "COMMON_ADDRESS_TYPE_CORRESPONDENCE" },
  { name: "Permanent", code: "PERMANENT", i18nKey: "COMMON_ADDRESS_TYPE_PERMANENT" },
  { name: "Other", code: "OTHER", i18nKey: "COMMON_ADDRESS_TYPE_OTHER" },
];

const AddressDetails = ({ t, config, onSelect, formData, isEdit, userDetails, ...props }) => {
  const { showZRO: configShowZRO, mappedZROLocation: configMappedZROLocation, hideNextButton: configHideNextButton } = config || {};
  const showZRO = props.showZRO !== undefined ? props.showZRO : configShowZRO;
  const mappedZROLocation = props.mappedZROLocation !== undefined ? props.mappedZROLocation : configMappedZROLocation;
  const hideNextButton = props.hideNextButton !== undefined ? props.hideNextButton : configHideNextButton;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: zroLocationsData } = Digit.Hooks.ws.useWSConfigMDMS.ZROLocation(tenantId, { enabled: !!showZRO && !mappedZROLocation });

  const _mappedZROLocation = useMemo(() => {
    if (mappedZROLocation) return mappedZROLocation;
    return zroLocationsData?.map((item) => ({
      ...item,
      i18nKey: item?.i18nKey || item?.name || item?.code,
    }));
  }, [mappedZROLocation, zroLocationsData]);

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
    formData?.addressLine1 ||
      formData?.subLocality ||
      formData?.address?.addressLine1 ||
      formData?.address?.subLocality ||
      formData?.infodetails?.existingDataSet?.address?.addressline1 ||
      ""
  );
  const [addressLine2, setAddressLine2] = useState(
    formData?.addressLine2 || formData?.address?.addressLine2 || formData?.infodetails?.existingDataSet?.address?.addressline2 || ""
  );
  const [doorImage, setDoorImage] = useState(formData?.doorImage || null);
  const [doorImageId, setDoorImageId] = useState(formData?.doorImageId || null);
  const [toast, setToast] = useState(null);
  const [addressType, setAddressType] = useState(
    convertToObject(formData?.addressType) || formData?.address?.addressType || formData?.infodetails?.existingDataSet?.address?.addressType
      ? allOptions.find(
          (a) =>
            a.code ===
            (formData?.addressType?.code ||
              formData?.addressType ||
              formData?.address?.addressType ||
              formData?.infodetails?.existingDataSet?.address?.addressType)
        ) ||
          convertToObject(formData?.addressType) ||
          formData?.address?.addressType ||
          formData?.infodetails?.existingDataSet?.address?.addressType
      : allOptions.find((a) => a.code === "PERMANENT")
  );
  const [showPincodeSuggestions, setShowPincodeSuggestions] = useState(false);
  const [latitude, setLatitude] = useState(
    formData?.latitude || formData?.address?.latitude || formData?.infodetails?.existingDataSet?.address?.latitude || ""
  );
  const [longitude, setLongitude] = useState(
    formData?.longitude || formData?.address?.longitude || formData?.infodetails?.existingDataSet?.address?.longitude || ""
  );
  const [zone, setZone] = useState(formData?.zone || formData?.address?.zone || "");
  const [block, setBlock] = useState(formData?.block || formData?.address?.block || "");
  const [assembly, setAssembly] = useState(formData?.assembly || formData?.address?.assembly || "");
  const [zro, setZro] = useState(formData?.zro || formData?.address?.zro || formData?.infodetails?.existingDataSet?.address?.zro || "");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState(null);
  const [error, setError] = useState(null);
  const {
    control,
    formState: { errors },
  } = useForm();

  const resolveNestedValue = (value, path) =>
    path.split(".").reduce((accumulator, currentKey) => {
      if (accumulator === null || accumulator === undefined) return undefined;
      return accumulator[currentKey];
    }, value);

  const getFieldError = (fieldName) => resolveNestedValue(errors, fieldName);
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
  const { data: egovLocationData } = Digit.Hooks.useCommonMDMS("dl.djb", "egov-location", ["TenantBoundary"]);

  const boundaryData = useMemo(() => {
    const tenantBoundary = egovLocationData?.["egov-location"]?.TenantBoundary || [];
    const revenueData = tenantBoundary.find((item) => item?.hierarchyType?.code === "REVENUE");
    const boundary = revenueData?.boundary || [];
    return Array.isArray(boundary) ? boundary : [boundary];
  }, [egovLocationData]);

  const structuredLocalityData = useMemo(() => {
    let localities = [];
    const boundaries = Array.isArray(boundaryData) ? boundaryData : boundaryData ? [boundaryData] : [];

    const extractLocalities = (node, zone = null, ward = null, assembly = null) => {
      if (!node) return;

      let currentZone = zone;
      let currentWard = ward;
      let currentAssembly = assembly;

      if (node.label === "Zone" || node.label === "ZONE") {
        currentZone = node.localname || node.code || node.name;
      }
      if (node.label === "Ward" || node.label === "WARD" || node.label === "Block" || node.label === "BLOCK") {
        currentWard = node.code || node.localname || node.name;
      }
      if (node.label === "Assembly Constituency" || node.label === "ASSEMBLY_CONSTITUENCY") {
        currentAssembly = node.code || node.localname || node.name;
      }

      // Specifically target nodes that are officially labeled as Locality
      if (node.label === "Locality" || node.label === "LOCALITY") {
        localities.push({
          ...node,
          name: node.localname || node.name || node.code,
          i18nKey: node.i18nKey || `${tenantId.replace(".", "_")}_REVENUE_${node.code}`.toUpperCase(),
          zone: currentZone,
          ward: currentWard,
          assembly: currentAssembly,
        });
      }
      // Always traverse down in case there are nested boundaries underneath
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => extractLocalities(child, currentZone, currentWard, currentAssembly));
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
    // If pincode is not provided, show all localities
    if (!pincode) return structuredLocalityData;

    // Check if the entered pincode exists in our data
    const pincodeExists = structuredLocalityData.some((loc) => {
      if (!loc.pincode) return false;
      const pins = Array.isArray(loc.pincode) ? loc.pincode : [loc.pincode];
      return pins.some((p) => p.toString() === pincode);
    });

    // If pincode exists in data, filter localities. If not (manual entry), show all localities.
    if (pincodeExists) {
      return structuredLocalityData.filter((loc) => {
        if (!loc.pincode) return false;
        const pins = Array.isArray(loc.pincode) ? loc.pincode : [loc.pincode];
        return pins.some((p) => p.toString() === pincode);
      });
    }

    return structuredLocalityData;
  }, [structuredLocalityData, pincode]);

  useEffect(() => {
    handleGetLocation();
  }, []);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await Digit.UploadServices.Filestorage("EKYC", file);
      const id = res?.data?.files?.[0]?.fileStoreId;
      if (id) {
        setDoorImage(file.name);
        setDoorImageId(id);
      }
    } catch (err) {
      setToast({ type: "error", message: "Upload failed" });
    }
  };

  useEffect(() => {
    if (formData?.address && structuredLocalityData?.length > 0) {
      const addressData = formData.address;

      const cityObj =
        allCities?.find((c) => c.code === addressData.cityCode || c.code === addressData.city || c.name === addressData.city) || addressData.city;
      if (cityObj) setCity(cityObj);

      setPincode(addressData.pincode?.toString().split(".")[0] || "");
      setHouseNo(addressData.houseNo || "");
      setstreetName(addressData.streetName || "");
      setLandmark(addressData.landmark || "");
      setAddressLine1(addressData.addressLine1 || addressData.subLocality || "");
      setAddressLine2(addressData.addressLine2 || "");
      setLatitude(addressData.latitude || "");
      setLongitude(addressData.longitude || "");
      setZro(addressData.zro || "");
      if (addressData.doorImageId) {
        setDoorImage(addressData.doorImage);
        setDoorImageId(addressData.doorImageId);
      }

      const localityObj = structuredLocalityData.find(
        (l) => l.code === addressData.localityCode || l.code === addressData.locality || l.i18nKey === addressData.locality
      );
      setLocality(localityObj || addressData.locality || null);

      // Derive Zone/Block/Assembly from Locality if missing
      setZone(addressData.zone || localityObj?.zone || "");
      setBlock(addressData.block || localityObj?.ward || "");
      setAssembly(addressData.assembly || localityObj?.assembly || "");

      const typeObj = allOptions.find((a) => a.code === addressData.addressType);
      if (typeObj) setAddressType(typeObj);
    }
  }, [formData?.address, allCities, structuredLocalityData]);

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
      assembly,
      zone,
      block,
      zro,
      ...(config?.doorImage ? { doorImage, doorImageId } : {}),
    };
    onSelect(config.key, { ...formData[config.key], ...addressStep }, false);
    if (config === undefined) {
      onSelect(addressStep);
    }
  };
  /* If `config` is undefined and all required address fields are filled, it creates an `addressStep` object
    containing the address details and calls the `onSelect` function with it.
   **/
  useEffect(() => {
    const isEkyc = config?.doorImage;
    const addressStep = {
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
      assembly,
      zone,
      block,
      zro,
      ...(isEkyc ? { doorImage, doorImageId } : {}),
    };

    if (config === undefined) {
      const mandatoryFields = isEkyc
        ? houseNo && locality && pincode && addressLine1 && streetName && latitude && longitude && doorImageId
        : houseNo && city && locality && pincode && addressLine1 && streetName && addressLine2 && latitude && longitude;

      if (mandatoryFields) {
        onSelect(addressStep);
      }
    }
  }, [
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
    assembly,
    zro,
    doorImageId,
  ]);

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
      setAssembly(selectedAddress.assembly);
      setZone(selectedAddress.zone);
      setBlock(selectedAddress.block);
      setAddressType(allOptions?.find((ele) => ele.code === selectedAddress.addressType));
      setZro(selectedAddress.zro);
      if (config?.doorImage) {
        setDoorImage(selectedAddress.doorImage);
        setDoorImageId(selectedAddress.doorImageId);
      }
    }
  }, [selectedAddress]);

  const lastErrorState = React.useRef(null);
  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (lastErrorState.current !== hasErrors) {
      lastErrorState.current = hasErrors;
      if (hasErrors && props.setError) {
        props.setError(config.key, { type: "custom", message: "Validation failed" });
      } else if (props.clearErrors) {
        props.clearErrors(config.key);
      }
    }
  }, [errors, config.key, props.setError, props.clearErrors]);

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

  const geocodeAddress = async (address) => {
    if (!address || !address.trim()) return null;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Digit-UI-AddressDetails",
        },
      });
      if (!response.ok) throw new Error(`Geocoding failed: ${response.statusText}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in geocodeAddress:", error);
      return null;
    }
  };

  const getLatLng = async () => {
    try {
      setLoading(true);
      setError(null);

      const parts = [
        houseNo,
        streetName,
        addressLine1,
        addressLine2,
        locality?.name || (typeof locality === "string" ? locality : ""),
        city?.name || (typeof city === "string" ? city : ""),
        pincode,
      ].filter(Boolean);

      const fullAddress = parts.join(", ");

      if (!fullAddress.trim()) {
        setError(t("WT_ENTER_ADDRESS_DETAILS_FIRST"));
        setLoading(false);
        return;
      }

      const data = await geocodeAddress(fullAddress);

      if (data && data.length > 0) {
        setLatitude(data[0].lat);
        setLongitude(data[0].lon);
        setGeocodedAddress(data[0].display_name);
      } else {
        setError(t("WT_LOCATION_NOT_FOUND"));
      }
    } catch (err) {
      setError(t("WT_GEOCODING_ERROR"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!addressLine1 || addressLine1.trim().length < 5) return;

    const timer = setTimeout(() => {
      getLatLng();
    }, 1000);

    return () => clearTimeout(timer);
  }, [addressLine1]);

  return (
    <React.Fragment>
      <FormStep
        config={hideNextButton ? { ...config, texts: { ...config?.texts, submitBarLabel: null } } : config}
        onSelect={goNext}
        t={t}
        isDisabled={
          config?.doorImage
            ? !houseNo || !locality || !pincode || !addressLine1 || !streetName || !doorImageId
            : !houseNo || !city || !locality || !pincode || !addressLine1 || !streetName || !addressLine2 || (showZRO && !zro)
        }
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

        {showZRO && (
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("WS_ZRO_LOCATION")} <span className="check-page-link-button">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"zro"}
                defaultValue={zro}
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={zro}
                    disable={false}
                    option={_mappedZROLocation}
                    errorStyle={!!getFieldError("zro")}
                    select={setZro}
                    optionKey="i18nKey"
                    t={t}
                    placeholder={"Select ZRO Location"}
                  />
                )}
              />
              {getFieldError("zro") && <CardLabelError>{getFieldError("zro")?.message}</CardLabelError>}
            </div>
          </LabelFieldPair>
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
        {!config?.doorImage && (
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
        )}
        <div style={{ position: "relative" }}>
          <CardLabel>
            {`${t("PINCODE")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            value={pincode}
            onChange={(e) => {
              const newPin = e.target.value.replace(/\D/g, "").slice(0, 6);
              if (newPin !== pincode) {
                setLocality(null);
                setAssembly("");
                setZone("");
                setBlock("");
                setLatitude("");
                setLongitude("");
                setAddressLine1("");
                setAddressLine2("");
              }
              setPincode(newPin);
              setShowPincodeSuggestions(true);
            }}
            onFocus={() => setShowPincodeSuggestions(true)}
            onBlur={() => {
              // Small delay to allow click on suggestion list items
              setTimeout(() => setShowPincodeSuggestions(false), 200);
            }}
            style={{ width: "100%" }}
            maxlength={6}
          />
          {showPincodeSuggestions && fetchedPincodes?.length > 0 && (
            <div
              className="options-card"
              style={{
                position: "absolute",
                zIndex: 100,
                width: "100%",
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "white",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              {fetchedPincodes
                .filter((p) => !pincode || p.code.toLowerCase().includes(pincode.toLowerCase()))
                .map((p, index) => (
                  <div
                    key={index}
                    className="cp profile-dropdown--item"
                    style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }}
                    onClick={() => {
                      setPincode(p.code);
                      setShowPincodeSuggestions(false);
                    }}
                  >
                    {p.code}
                  </div>
                ))}
            </div>
          )}
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
                  if (val?.assembly) setAssembly(val.assembly);
                  if (val?.zone) setZone(val.zone);
                  if (val?.ward) {
                    setBlock(val.ward);
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
            {`${t(config?.doorImage ? "EKYC_SUB_LOCALITY" : "ADDRESS_LINE1")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="addressLine1"
            value={addressLine1}
            style={{ width: "100%" }}
            placeholder={config?.doorImage ? "Enter Sub-locality" : "Enter Address"}
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
        {!config?.doorImage && (
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
        )}
        {config?.doorImage && (
          <div>
            <CardLabel>
              {`${t("EKYC_DOOR_IMAGE")}`} <span className="check-page-link-button">*</span>
            </CardLabel>
            <UploadFile
              onUpload={uploadFile}
              onDelete={() => {
                setDoorImage(null);
                setDoorImageId(null);
              }}
              id={"doorImage"}
              message={doorImage ? `1 ${t("COMMON_FILE_ADDED")}` : t("CS_COMMON_NO_FILE_SELECTED")}
              accept="image/*"
              buttonProps={{ label: t("CS_COMMON_CHOOSE_FILE") }}
            />
          </div>
        )}

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
            {`${t("ASSEMBLY")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            name="assembly"
            value={assembly}
            style={{ width: "100%" }}
            placeholder={"Enter Assembly"}
            onChange={(e) => setAssembly(e.target.value)}
          />
        </div>
        {/* <div>
          <CardLabel>
            {`${t("WARD")}`} <span className="check-page-link-button">*</span>
          </CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            name="ward"
            value={ward}
            style={{ width: "100%" }}
            placeholder={"Enter Ward"}
            onChange={(e) => setWard(e.target.value)}
          />
        </div> */}
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
        <div></div>
      </FormStep>
      {toast && <Toast label={t(toast.message)} error={toast.type === "error"} onClose={() => setToast(null)} />}
    </React.Fragment>
  );
};

export default AddressDetails;
