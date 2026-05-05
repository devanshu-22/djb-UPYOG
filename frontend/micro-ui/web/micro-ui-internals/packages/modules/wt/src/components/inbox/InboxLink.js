import React from "react";
import { Card, HomeIcon } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";

/*
   Renders a card displaying dynamic links related to the Water Tanker.
   Links are filtered based on the provided businessService and the user's roles.
 */
const InboxLinks = ({ parentRoute, businessService }) => {
  const { t } = useTranslation();

  const GetLogo = () => (
    <div className="header">
      <span className="logo">
        <HomeIcon />
      </span>{" "}
      <span className="text">{t(businessService + "_REQUEST")}</span>
    </div>
  );

  return (
    // <Card style={{ paddingRight: 0, marginTop: 0 }} className="employeeCard filter inboxLinks">
    <Card className="filter inboxLinks">
      <div className="complaint-links-container">{Digit.UserService.getUser().info.type !== "CITIZEN" && GetLogo()}</div>
    </Card>
  );
};

export default InboxLinks;
