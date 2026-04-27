import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { EmployeeModuleCard, PropertyHouse } from "@djb25/digit-ui-react-components";

const VENDORCard = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const [total, setTotal] = useState("-");

  const isCitizen = window.location.pathname.toLowerCase().includes("citizen");


  const hasAccess = Digit.Utils.vendorAccess() || Digit.UserService.hasAccess(["WT_VENDOR", "MT_VENDOR"]);
  if (!hasAccess) {
    return null;
  }
  const links = [
    {
      label: t("VENDOR_NEW_REGISTERATION"),
      link: isCitizen ? `/digit-ui/citizen/vendor/registry/new-vendor` : `/digit-ui/employee/vendor/registry/new-vendor`
    },
    {
      label: t("SEARCH_VENDOR"),
      link: isCitizen ? `/digit-ui/citizen/vendor/search-vendor` : `/digit-ui/employee/vendor/search-vendor`
    },
  ]

  const VENDORRole = Digit.UserService.hasAccess(["WT_VENDOR"]);

  const propsForModuleCard = {
    Icon: <PropertyHouse />,
    moduleName: t("TITLE_VENDOR_MANAGEMENT"),
    kpis: [
      {
        count: total?.totalCount,
        label: t("Inbox"),
        link: isCitizen ? `/digit-ui/citizen/vendor/search-vendor` : `/digit-ui/employee/vendor/search-vendor`,
      },
    ],
    links: links.filter(link => !link?.role || VENDORRole),
    ...(isCitizen ? { onDetailsClick: () => history.push("/digit-ui/citizen/vendor/search-vendor") } : {}),
  };


  if (isCitizen) {
    return (
      <div className="wt-citizen-card-premium">
        <EmployeeModuleCard {...propsForModuleCard} />
      </div>
    );
  }

  return <EmployeeModuleCard {...propsForModuleCard} />;
};

export default VENDORCard;
