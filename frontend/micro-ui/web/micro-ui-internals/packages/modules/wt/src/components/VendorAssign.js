import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Label, DatePicker, SubmitBar, Toast, Dropdown, UploadFile, CollapsibleCardPage } from "@djb25/digit-ui-react-components";
import VerticalTimeline from "./VerticalTimeline";
import SelectServiceType from "../pageComponents/SelectServiceType";

const VendorAssign = ({ parentUrl, heading }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  const history = useHistory();

  const [showToast, setShowToast] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [error, setError] = useState(null);

  const { data: vendorOptions, isLoading: isVendorLoading } = Digit.Hooks.fsm.useVendorSearch({
    tenantId,
    filters: { status: "ACTIVE" },
    config: {
      select: (data) => data?.vendor || [],
    },
  });

  const { mutate: createWorkOrder } = Digit.Hooks.wt.useVendorWorkOrderCreate(tenantId);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 2000000) {
          setError(t("WT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage("WT", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("WT_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setError(t("WT_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  const onServiceTypeSelect = (key, value) => {
    setSelectedServiceType(value);
  };

  const handleSubmit = () => {
    const payload = {
      vendorWorkOrder: {
        tenantId,
        vendorId: vendor?.code || vendor?.id,
        validFrom: new Date(validFrom).getTime(),
        validTo: new Date(validTo).getTime(),
        serviceType: selectedServiceType?.code || "WT",
        fileStoreId: uploadedFile,
      },
    };

    createWorkOrder(payload, {
      onSuccess: (result) => {
        setShowToast({ isError: false, label: t("ES_COMMON_SAVE_SUCCESS") });
        setTimeout(() => {
          history.push("/digit-ui/employee/vendor/search-vendor");
        }, 3000);
      },
      onError: (err) => {
        setShowToast({ isError: true, label: err?.response?.data?.Errors?.[0]?.message || t("ES_COMMON_ERROR_SAVING") });
      },
    });
  };

  const isMobile = window.Digit.Utils.browser.isMobile();
  const userType = Digit.UserService.getUser().info.type;

  function selectfile(e) {
    setUploadedFile(null);
    setFile(e.target.files[0]);
  }

  const isFormDisabled = !vendor || !validFrom || !validTo || !selectedServiceType;

  return (
    <div className="employee-form-section-wrapper">
      {/* <Timeline steps={["Vendor Assign"]} currentStep={1} /> */}
      <VerticalTimeline config={[{ timeLine: [{ actions: "Vendor Assign", currentStep: 1 }] }]} showFinalStep={false} />

      <div style={{ flex: 1 }}>
        <CollapsibleCardPage title={t("WT_VENDOR_ASSIGN")} defaultOpen={true}>
          <div className="formcomposer-section-grid">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Label>
                {`${t("WT_VENDOR_NAME")}`} <span className="astericColor">*</span>
              </Label>
              <Dropdown t={t} option={vendorOptions} optionKey="name" select={setVendor} selected={vendor} placeholder={t("WT_SELECT_VENDOR")} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Label>
                {`${t("COMMON_VALID_FROM_DATE")}`} <span className="astericColor">*</span>
              </Label>
              <DatePicker date={validFrom} onChange={(date) => setValidFrom(date)} style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Label>
                {`${t("COMMON_VALID_TO_DATE")}`} <span className="astericColor">*</span>
              </Label>
              <DatePicker date={validTo} min={validFrom} onChange={(date) => setValidTo(date)} style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Label>{`${t("WT_UPLOAD_DOCUMENT")}`}</Label>
              <UploadFile
                id={"wt-doc"}
                extraStyleName={"propertyCreate"}
                accept=".jpg,.png,.pdf,.jpeg"
                onUpload={selectfile}
                onDelete={() => {
                  setUploadedFile(null);
                }}
                message={uploadedFile ? `1 ${t(`WT_ACTION_FILEUPLOADED`)}` : t(`WT_ACTION_NO_FILEUPLOADED`)}
                error={error}
              />
            </div>
            <SelectServiceType
              t={t}
              config={{ key: "serviceType", label: t("WT_SELECT_SERVICE_TYPE") }}
              onSelect={onServiceTypeSelect}
              userType={userType}
              formData={{ serviceType: selectedServiceType }}
            />
          </div>
        </CollapsibleCardPage>

        <div style={{ display: "flex", marginTop: "24px", justifyContent: isMobile ? "center" : "flex-end" }}>
          <SubmitBar label={t("ES_COMMON_SAVE")} onSubmit={isFormDisabled ? null : handleSubmit} disabled={isFormDisabled} />
        </div>
      </div>
      {showToast && <Toast error={showToast.isError} label={showToast.label} onClose={() => setShowToast(null)} />}
    </div>
  );
};

export default VendorAssign;
