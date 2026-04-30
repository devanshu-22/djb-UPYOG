import React, { useState, useEffect } from "react";
import { Modal, Card, TextInput, CardLabel, LabelFieldPair } from "@djb25/digit-ui-react-components";

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

const WTEditApplicationModal = ({ t, applicationData, closeModal }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (applicationData) {
      setFormData({
        name: applicationData?.applicantDetail?.name || "",
        mobileNumber: applicationData?.applicantDetail?.mobileNumber || "",
        emailId: applicationData?.applicantDetail?.emailId || "",
        alternateNumber: applicationData?.applicantDetail?.alternateNumber || "",
        houseNo: applicationData?.address?.houseNo || "",
        streetName: applicationData?.address?.streetName || "",
        addressLine1: applicationData?.address?.addressLine1 || "",
        addressLine2: applicationData?.address?.addressLine2 || "",
        landmark: applicationData?.address?.landmark || "",
        pincode: applicationData?.address?.pincode || "",
        tankerType: applicationData?.tankerType || "",
        waterType: applicationData?.waterType || "",
        tankerQuantity: applicationData?.tankerQuantity || "",
        waterQuantity: applicationData?.waterQuantity || "",
        description: applicationData?.description || "",
        deliveryDate: applicationData?.deliveryDate || "",
        deliveryTime: applicationData?.deliveryTime || ""
      });
    }
  }, [applicationData]);

  const handleChange = (e, key) => {
    setFormData({
      ...formData,
      [key]: e.target.value
    });
  };

  const handleUpdate = () => {
    console.log("Updated Data:", formData);
    closeModal();
  };

  const fieldGroups = [
    {
      title: "WT_APPLICANT_DETAILS",
      fields: [
        { label: "WT_APPLICANT_NAME", key: "name" },
        { label: "WT_MOBILE_NUMBER", key: "mobileNumber" },
        { label: "WT_ALT_MOBILE_NUMBER", key: "alternateNumber" },
        { label: "WT_EMAIL_ID", key: "emailId" },
      ]
    },
    {
      title: "WT_ADDRESS_DETAILS",
      fields: [
        { label: "WT_HOUSE_NO", key: "houseNo" },
        { label: "WT_STREET_NAME", key: "streetName" },
        { label: "WT_ADDRESS_LINE1", key: "addressLine1" },
        { label: "WT_ADDRESS_LINE2", key: "addressLine2" },
        { label: "WT_LANDMARK", key: "landmark" },
        { label: "WT_PINCODE", key: "pincode" },
      ]
    },
    {
      title: "WT_REQUEST_DETAILS",
      fields: [
        { label: "WT_TANKER_TYPE", key: "tankerType" },
        { label: "WT_WATER_TYPE", key: "waterType" },
        { label: "WT_TANKER_QUANTITY", key: "tankerQuantity" },
        { label: "WT_WATER_QUANTITY", key: "waterQuantity" },
        { label: "WT_DELIVERY_DATE", key: "deliveryDate", type: "date" },
        { label: "WT_DELIVERY_TIME", key: "deliveryTime", type: "time" },
        { label: "WT_DESCRIPTION", key: "description", fullWidth: true },
      ]
    }
  ];

  return (
    <Modal
      headerBarMain={<h1 className="heading-m">{t("WT_EDIT_APPLICATION_DETAILS")}</h1>}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t("CS_COMMON_CANCEL")}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t("CS_COMMON_UPDATE")}
      actionSaveOnSubmit={handleUpdate}
    >
      <Card style={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}>
        {fieldGroups.map((group, index) => (
          <div key={index} style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#0B0C10", borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" }}>
              {t(group.title)}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {group.fields.map((field) => (
                <div key={field.key} style={{ flex: field.fullWidth ? "1 1 100%" : "1 1 200px", maxWidth: "100%" }}>
                  <CardLabel style={{ fontWeight: "600", marginBottom: "4px", fontSize: "14px" }}>{t(field.label)}</CardLabel>
                  <TextInput
                    type={field.type || "text"}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(e, field.key)}
                    style={{ width: "100%", maxWidth: "100%" }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </Modal>
  );
};

export default WTEditApplicationModal;
