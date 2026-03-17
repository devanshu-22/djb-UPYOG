import React, { useState, useEffect } from "react";
import { Card, HomeIcon, Toast } from "@djb25/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import SearchConsumer from "../../components/SearchConsumer";
import ConnectionDetailsView from "../../components/ConnectionDetailsView";

const Create = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useState(() => {
        const saved = sessionStorage.getItem("EKYC_CREATE_SEARCH_PARAMS");
        return saved ? JSON.parse(saved) : { kNumber: "", kName: "" };
    });
    const [searchPerformed, setSearchPerformed] = useState(() => {
        return sessionStorage.getItem("EKYC_CREATE_SEARCH_PERFORMED") === "true";
    });
    const [showToast, setShowToast] = useState(null);

    const tenantId = Digit.ULBService.getCurrentTenantId();

    const { isLoading: isSearching, data: connectionDetails, error, revalidate } = Digit.Hooks.ekyc.useGetConnection({
        tenantId,
        details: { kno: searchParams.kNumber }
    }, {
        enabled: searchPerformed && !!searchParams.kNumber
    });

    const { mutate: validateUser, isLoading: isValidating } = Digit.Hooks.ekyc.useValidateUser(tenantId, {
        onSuccess: (data) => {
            if (data?.responseInfo?.status === "successful") {
                // Keep the flow: first validate, then search details is implied by the new UI
            } else {
                setShowToast({ error: true, label: data?.message || t("EKYC_VALIDATION_FAILED") });
                setSearchPerformed(false);
                sessionStorage.removeItem("EKYC_CREATE_SEARCH_PERFORMED");
            }
        },
        onError: (error) => {
            setShowToast({ error: true, label: error?.response?.data?.Errors?.[0]?.message || t("EKYC_VALIDATION_ERROR_PLEASE_ENTER_THE_CORRECT_CREDENTIALS") });
            setSearchPerformed(false);
            sessionStorage.removeItem("EKYC_CREATE_SEARCH_PERFORMED");
        }
    });

    const handleSearch = (params) => {
        if (!params.kNumber && !params.kName) {
            // This is the "Clear" case
            setSearchParams({ kNumber: "", kName: "" });
            setSearchPerformed(false);
            sessionStorage.removeItem("EKYC_CREATE_SEARCH_PARAMS");
            sessionStorage.removeItem("EKYC_CREATE_SEARCH_PERFORMED");
            return;
        }

        if (!params.kNumber || !params.kName) {
            setShowToast({ error: true, label: t("EKYC_FILL_ALL_FIELDS") });
            return;
        }
        setSearchParams(params);
        setSearchPerformed(true);
        sessionStorage.setItem("EKYC_CREATE_SEARCH_PARAMS", JSON.stringify(params));
        sessionStorage.setItem("EKYC_CREATE_SEARCH_PERFORMED", "true");
        // We validate first as per original logic, then the hook useGetConnection will fetch details
        validateUser({ kno: params.kNumber, name: params.kName });
    };

    const closeToast = () => {
        setShowToast(null);
    };

    return (
        <SearchConsumer
            onSearch={handleSearch}
            searchParams={searchParams}
        >
            {searchPerformed && (
                <ConnectionDetailsView
                    kNumber={searchParams.kNumber}
                    kName={searchParams.kName}
                    connectionDetails={connectionDetails}
                    isLoading={isSearching || isValidating}
                />
            )}

            {!searchPerformed && !isSearching && (
                <Card style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ color: "#667085" }}>{t("EKYC_SEARCH_TO_VIEW_DETAILS")}</div>
                </Card>
            )}
            {showToast && <Toast error={showToast.error} label={showToast.label} onClose={closeToast} isDsc={true} />}
        </SearchConsumer>
    );
};

export default Create;
