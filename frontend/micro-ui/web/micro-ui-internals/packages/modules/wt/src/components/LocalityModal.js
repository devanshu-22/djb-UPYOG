import React, { useState, useMemo } from "react";
import { CardLabel, MultiSelectDropdown, Loader } from "@djb25/digit-ui-react-components";

const LocalityModal = ({ t, closeModal, onSubmit, initialValues, tenantId, modalMode }) => {
  const isView = modalMode === "VIEW";
  const isUpdate = modalMode === "UPDATE";
  const [selectedHierarchy, setSelectedHierarchy] = useState(null);
  const [selectedLocality, setSelectedLocality] = useState([]);

  const { data: mdmsData, isLoading: isMdmsLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-location", "HRMSRolesandDesignation");

  const hierarchyOptions = useMemo(() => {
    const tenantBoundary = (mdmsData?.MdmsRes || mdmsData)?.["egov-location"]?.["TenantBoundary"] || [];
    return tenantBoundary.map((ele) => ({
      i18nKey: ele.hierarchyType.name || ele.hierarchyType.code || ele.hierarchyType,
      code: ele.hierarchyType.code || ele.hierarchyType,
      boundary: ele.boundary,
    }));
  }, [mdmsData]);

  // Automatically select the first available hierarchy once data is loaded
  React.useEffect(() => {
    if (hierarchyOptions.length > 0 && !selectedHierarchy) {
      setSelectedHierarchy(hierarchyOptions[0]);
    }
  }, [hierarchyOptions, selectedHierarchy]);

  // Manual flattening function to extract localities from the nested boundary hierarchy
  const flattenLocalities = (node, localities = []) => {
    if (!node) return localities;
    if (node.label === "Locality" || (node.children && node.children.length === 0 && node.code)) {
      localities.push({
        name: node.localname || node.name,
        code: node.code,
        i18nKey: node.code, // Use code as the localization key as requested
      });
    }
    if (node.children) {
      node.children.forEach((child) => flattenLocalities(child, localities));
    }
    return localities;
  };

  const structuredLocalities = useMemo(() => {
    if (!selectedHierarchy || !selectedHierarchy.boundary) return [];
    return flattenLocalities(selectedHierarchy.boundary);
  }, [selectedHierarchy]);

  // Pre-populate selectedLocality for UPDATE and VIEW modes
  React.useEffect(() => {
    if (
      structuredLocalities.length > 0 &&
      selectedLocality.length === 0 &&
      (initialValues?.fillingPointLocalityCodes?.length > 0 || initialValues?.address?.locality) &&
      (isView || isUpdate)
    ) {
      const currentLocalityCodes =
        initialValues?.fillingPointLocalityCodes?.length > 0
          ? initialValues.fillingPointLocalityCodes
          : typeof initialValues.address.locality === "string"
          ? initialValues.address.locality.split(",").map((s) => s.trim())
          : [];

      const preSelected = structuredLocalities.filter((loc) =>
        currentLocalityCodes.some((c) => c === loc.code || c.toLowerCase() === (loc.name || "").toLowerCase())
      );

      if (preSelected.length > 0) {
        setSelectedLocality(preSelected);
      }
    }
  }, [structuredLocalities, initialValues, isView, isUpdate, selectedLocality]);

  const onFormSubmit = () => {
    onSubmit({
      hierarchyType: selectedHierarchy,
      locality: selectedLocality,
    });
  };

  if (isMdmsLoading) return <Loader />;

  return (
    <div
      className="custom-modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 200000,
      }}
    >
      <style>
        {`
          .custom-modal-content {
            background-color: #fff;
            border-radius: 8px;
            width: 50%;
            max-width: 600px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            position: relative;
          }
          @media (max-width: 768px) {
            .custom-modal-content {
              width: 90%;
            }
          }
        `}
      </style>
      <div className="custom-modal-content">
        {/* Header */}
        <div
          className="custom-modal-header"
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#1D4E7F" }}>
            {isView ? t("WT_VIEW_LOCALITY") : isUpdate ? t("WT_UPDATE_LOCALITY") : t("WT_ADD_TO_LOCALITY")}
          </h1>
          <button
            onClick={closeModal}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <CardLabel>{t("WT_CURRENT_LOCALITY")}</CardLabel>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>
              {initialValues?.fillingPointLocalityCodes?.length > 0
                ? initialValues.fillingPointLocalityCodes.join(", ")
                : initialValues?.address?.locality || "NA"}
            </div>
          </div>

          {!isView && (
            <div style={{ marginBottom: "16px" }}>
              <CardLabel>{t("WT_SELECT_NEW_LOCALITY")}</CardLabel>
              <MultiSelectDropdown
                options={structuredLocalities}
                optionsKey="i18nKey"
                selected={selectedLocality}
                onSelect={(val) => {
                  if (!isView) {
                    const unwrappedSelections = val.map((v) => v[1]);
                    setSelectedLocality(unwrappedSelections);
                  }
                }}
                t={t}
                disabled={!selectedHierarchy || isView}
              />
              {selectedLocality?.length > 0 && (
                <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                  <strong>{t("WT_LOCALITY_CODES")}:</strong> {selectedLocality.map((l) => l.code).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="custom-modal-footer"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={closeModal}
            style={{
              padding: "8px 20px",
              border: "1px solid #ccc",
              background: "#f4f4f4",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {t("CS_COMMON_CANCEL")}
          </button>
          {!isView && (
            <button
              onClick={onFormSubmit}
              style={{
                padding: "8px 20px",
                background: "#1D4E7F",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {t("CS_COMMON_SAVE")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalityModal;
