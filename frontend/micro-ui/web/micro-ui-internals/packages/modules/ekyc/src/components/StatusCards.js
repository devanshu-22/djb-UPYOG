import React from "react";
import { Card } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const StatusCards = ({ countData }) => {
    const { t } = useTranslation();

    return (
        <div className="ekyc-status-container">
            <div className="ekyc-status-card">
                <div className="count">{countData?.total || 0}</div>
                <div className="label">{t("EKYC_TOTAL")}</div>
            </div>
            <div className="ekyc-status-card">
                <div className="count pending">{countData?.pending || 0}</div>
                <div className="label">{t("EKYC_PENDING")}</div>
            </div>
            <div className="ekyc-status-card">
                <div className="count completed">{countData?.completed || 0}</div>
                <div className="label">{t("EKYC_COMPLETED")}</div>
            </div>
        </div>
    );
};

export default StatusCards;
