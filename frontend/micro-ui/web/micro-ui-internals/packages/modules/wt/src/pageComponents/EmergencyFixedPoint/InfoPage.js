import { Card, CardHeader, CardText, SubmitBar } from "@djb25/digit-ui-react-components";
import React, { useState } from "react";
import BookingPopup from "../../components/BookingPopup";

const EmergencyFixedPointInfoPage = ({ t, onSelect, formData, config, userType }) => {
  const [existingDataSet, setExistingDataSet] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isExistingPopupRequired, setIsExistingPopupRequired] = useState(false);
  const emergencyRequestLabel =
    t("WT_EMERGENCY_WATER_TANKER_REQUEST") !== "WT_EMERGENCY_WATER_TANKER_REQUEST"
      ? t("WT_EMERGENCY_WATER_TANKER_REQUEST")
      : "Emergency Water Tanker Request";

  const handleOpenModal = () => {
    isExistingPopupRequired ? setShowModal(true) : goNext();
  };

  const goNext = () => {
    const owner = formData.infodetails || {};
    const ownerStep = { ...owner, existingDataSet };
    onSelect(config.key, { ...formData[config.key], ...ownerStep });
  };

  return (
    <React.Fragment>
      <Card className="search-form-wrapper" style={{ flexDirection: "column", gap: "12px", justifyContent: "flex-start" }}>
        <CardHeader>{emergencyRequestLabel}</CardHeader>
        <div>
          <p className="primaryColor">{t("SV_DOC_REQ_SCREEN_SUB_HEADER")}</p>
          <p className="primaryColor">{t("SV_DOC_REQ_SCREEN_TEXT")}</p>
          <p className="primaryColor">{t("SV_DOC_REQ_SCREEN_SUB_TEXT")}</p>
        </div>
        <span>
          <SubmitBar label={t("COMMON_NEXT")} onSubmit={handleOpenModal} />
        </span>
      </Card>

      {showModal && (
        <BookingPopup
          t={t}
          closeModal={() => setShowModal(false)}
          actionCancelOnSubmit={() => setShowModal(false)}
          onSubmit={() => {
            goNext();
            setShowModal(false);
          }}
          setExistingDataSet={setExistingDataSet}
        />
      )}
    </React.Fragment>
  );
};

export default EmergencyFixedPointInfoPage;
