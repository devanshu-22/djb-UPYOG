import { CardText, CloseSvg, Modal } from "@djb25/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";

const Heading = (props) => {
  return <h1 className="heading-m">{props.label}</h1>;
};
const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);
const CloseBtn = (props) => {
  return (
    <div onClick={props?.onClick} style={ props?.isMobileView ? { padding: 5} : null}>
      {
        props?.isMobileView
          ? (<CloseSvg />)
          : (<div className={"icon-bg-secondary"} style={{ backgroundColor: '#505A5F'}}> <Close /> </div>)
      }
    </div>
  )
};
const LogoutDialog = ({ onSelect, onCancel, onDismiss }) => {
  const { t } = useTranslation();
  const mobileDeviceWidth = 780;
  const [isMobileView, setIsMobileView] = React.useState(window.innerWidth <= mobileDeviceWidth);

  React.useEffect(() => {
    const onResize = () => {
      setIsMobileView(window.innerWidth <= mobileDeviceWidth);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const modalStyles = isMobileView
    ? {
        height: "auto",
        minHeight: "180px",
        width: "90%",
        maxWidth: "400px",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        padding: "20px",
        zIndex: "10001",
      }
    : {
        width: "100%",
        maxWidth: "480px",
        margin: "auto",
        borderRadius: "12px",
        overflow: "hidden",
      };

  return (
    <Modal
      popupStyles={modalStyles}
      popupModuleMianStyles={{
        paddingTop: isMobileView ? "10px" : "30px",
        paddingBottom: isMobileView ? "80px" : "20px",
      }}
      headerBarMain={<Heading label={t("CORE_LOGOUT_WEB_HEADER")} />}
      headerBarEnd={<CloseBtn onClick={onDismiss} isMobileView={isMobileView} />}
      actionCancelLabel={isMobileView ? t("TL_COMMON_NO") : t("CORE_LOGOUT_CANCEL")}
      actionCancelOnSubmit={onCancel}
      actionSaveLabel={isMobileView ? t("TL_COMMON_YES") : t("CORE_LOGOUT_WEB_YES")}
      actionSaveOnSubmit={onSelect}
      formId="modal-action"
      popupModuleActionBarStyles={
        isMobileView
          ? {
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              position: "absolute",
              left: 0,
              bottom: 0,
              padding: "18px",
              borderTop: "1px solid #eee",
            }
          : {}
      }
    >
      <div style={{ padding: isMobileView ? "0" : "0 8px" }}>
        <CardText style={{ margin: 0, fontSize: "16px", color: "#505A5F" }}>
          {isMobileView
            ? t("CORE_LOGOUT_MOBILE_CONFIRMATION_MESSAGE")
            : t("CORE_LOGOUT_WEB_CONFIRMATION_MESSAGE")}
          {" "}
          <strong>{t("CORE_LOGOUT_MESSAGE")}?</strong>
        </CardText>
      </div>
    </Modal>
  );
};

export default LogoutDialog;