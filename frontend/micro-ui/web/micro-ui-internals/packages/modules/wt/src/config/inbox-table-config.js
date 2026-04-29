import React from "react";
import { Link } from "react-router-dom";

const GetCell = (value) => <span className="cell-text">{value}</span>;
const getCreatedTime = (row) => row?.searchData?.auditDetails?.createdTime || row?.workflowData?.auditDetails?.createdTime;
const getFormattedCreatedAt = (row) => {
  const createdTime = getCreatedTime(row);
  if (!createdTime) return "";
  return `${Digit.DateUtils.ConvertEpochToDate(createdTime)} ${Digit.DateUtils.ConvertEpochToTimeInHours(createdTime)}`;
};

const GetSlaCell = (value) => {
  if (isNaN(value)) return <span className="sla-cell-success">0</span>;
  return value < 0 ? <span className="sla-cell-error">{value}</span> : <span className="sla-cell-success">{value}</span>;
};

const GetMobCell = (value) => <span className="sla-cell">{value}</span>;

export const TableConfig = (t) => ({
   WT: {
    inboxColumns: (props) => [
      {
        Header: t("WT_BOOKING_NO"),
        id: "bookingNo",
        accessor: (row) => row?.searchData?.["bookingNo"] || "",
        Cell: ({ row }) => {
          return (
            <div>
              <span className="link">
                
                <Link to={`${props.detailRoute || `${props.parentRoute}/booking-details`}/${row?.original?.searchData?.["bookingNo"]}`}>

                  {row.original?.searchData?.["bookingNo"]}
                </Link>
              </span>
            </div>
          );
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.["bookingNo"]),
      },
      
      {
        Header: t("WT_APPLICANT_NAME"),
        id: "applicantName",
        accessor: (row) => row?.searchData?.applicantDetail?.["name"] || "",
        Cell: ( row ) => {
        
          return GetCell(`${row?.cell?.row?.original?.searchData?.applicantDetail?.["name"]}`)
          
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.applicantDetail?.["name"]),
        
      },
      {
        Header: t("WT_MOBILE_NUMBER"),
        id: "mobileNumber",
        accessor: (row) => row?.searchData?.applicantDetail?.["mobileNumber"] || "",
        Cell: ( row ) => {
        
          return GetCell(`${row?.cell?.row?.original?.searchData?.applicantDetail?.["mobileNumber"]}`)
          
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.applicantDetail?.["mobileNumber"]),
        
      },
      {
        Header: t("LOCALITY"),
        id: "localityCode",
        accessor: (row) => row?.searchData?.["localityCode"] || "",
        Cell: ({ row }) => {
          return GetCell(t(`${row.original?.searchData?.["localityCode"]}`));
        },
        mobileCell: (original) => GetMobCell(t(`${original?.searchData?.["localityCode"]}`)),
    
      },
      {
        Header: t("CREATED_AT"),
        id: "createdTime",
        accessor: (row) => getFormattedCreatedAt(row),
        Cell: ({ row }) => {
          return GetCell(getFormattedCreatedAt(row?.original));
        },
        mobileCell: (original) => GetMobCell(getFormattedCreatedAt(original)),
        
      },
      {
        Header: t("WT_STATUS"),
        id: "applicationStatus",
        accessor: (row) => row?.workflowData?.state?.["applicationStatus"] || "",
        Cell: ({ row }) => {
          
          const wf = row.original?.workflowData;
          return GetCell(t(`${row?.original?.workflowData?.state?.["applicationStatus"]}`));

        },
        mobileCell: (original) => GetMobCell(t(`ES_WT_COMMON_STATUS_${original?.workflowData?.state?.["applicationStatus"]}`)),
    
      },
      
    ],
    serviceRequestIdKey: (original) => original?.[t("WT_INBOX_UNIQUE_BOOKING_NO")]?.props?.children,

    
  },

  MT: {
    inboxColumns: (props) => [
      {
        Header: t("MT_BOOKING_NO"),
        id: "bookingNo",
        accessor: (row) => row?.searchData?.["bookingNo"] || "",
        Cell: ({ row }) => {
          return (
            <div>
              <span className="link">
                
                <Link to={`${props.parentRoute}/booking-details/` + `${row?.original?.searchData?.["bookingNo"]}`}>

                  {row.original?.searchData?.["bookingNo"]}
                </Link>
              </span>
            </div>
          );
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.["bookingNo"]),
      },
      
      {
        Header: t("MT_APPLICANT_NAME"),
        id: "applicantName",
        accessor: (row) => row?.searchData?.applicantDetail?.["name"] || "",
        Cell: ( row ) => {
        
          return GetCell(`${row?.cell?.row?.original?.searchData?.applicantDetail?.["name"]}`)
          
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.applicantDetail?.["name"]),
        
      },
      {
        Header: t("MT_MOBILE_NUMBER"),
        id: "mobileNumber",
        accessor: (row) => row?.searchData?.applicantDetail?.["mobileNumber"] || "",
        Cell: ( row ) => {
        
          return GetCell(`${row?.cell?.row?.original?.searchData?.applicantDetail?.["mobileNumber"]}`)
          
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.applicantDetail?.["mobileNumber"]),
        
      },
      {
        Header: t("LOCALITY"),
        id: "localityCode",
        accessor: (row) => row?.searchData?.["localityCode"] || "",
        Cell: ({ row }) => {
          return GetCell(t(`${row.original?.searchData?.["localityCode"]}`));
        },
        mobileCell: (original) => GetMobCell(t(`${original?.searchData?.["localityCode"]}`)),
    
      },
      {
        Header: t("MT_STATUS"),
        id: "applicationStatus",
        accessor: (row) => row?.workflowData?.state?.["applicationStatus"] || "",
        Cell: ({ row }) => {
          
          const wf = row.original?.workflowData;
          return GetCell(t(`${row?.original?.workflowData?.state?.["applicationStatus"]}`));


        },
        mobileCell: (original) => GetMobCell(t(`ES_WT_COMMON_STATUS_${original?.workflowData?.state?.["applicationStatus"]}`)),
      

      },
      
    ],
    serviceRequestIdKey: (original) => original?.[t("WT_INBOX_UNIQUE_BOOKING_NO")]?.props?.children,

    
  },
  TP: {
    inboxColumns: (props) => [
      {
        Header: t("MT_BOOKING_NO"),
        id: "bookingNo",
        accessor: (row) => row?.searchData?.["bookingNo"] || "",
        Cell: ({ row }) => {
          return (
            <div>
              <span className="link">
                
                <Link to={`${props.parentRoute}/booking-details/` + `${row?.original?.searchData?.["bookingNo"]}`}>

                  {row.original?.searchData?.["bookingNo"]}
                </Link>
              </span>
            </div>
          );
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.["bookingNo"]),
      },
      
      {
        Header: t("MT_APPLICANT_NAME"),
        id: "applicantName",
        accessor: (row) => row?.searchData?.applicantDetail?.["name"] || "",
        Cell: ( row ) => {
        
          return GetCell(`${row?.cell?.row?.original?.searchData?.applicantDetail?.["name"]}`)
          
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.applicantDetail?.["name"]),
        
      },
      {
        Header: t("MT_MOBILE_NUMBER"),
        id: "mobileNumber",
        accessor: (row) => row?.searchData?.applicantDetail?.["mobileNumber"] || "",
        Cell: ( row ) => {
        
          return GetCell(`${row?.cell?.row?.original?.searchData?.applicantDetail?.["mobileNumber"]}`)
          
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.applicantDetail?.["mobileNumber"]),
        
      },
      {
        Header: t("LOCALITY"),
        id: "localityCode",
        accessor: (row) => row?.searchData?.["localityCode"] || "",
        Cell: ({ row }) => {
          return GetCell(t(`${row.original?.searchData?.["localityCode"]}`));
        },
        mobileCell: (original) => GetMobCell(t(`${original?.searchData?.["localityCode"]}`)),
    
      },
      {
        Header: t("MT_STATUS"),
        id: "applicationStatus",
        accessor: (row) => row?.workflowData?.state?.["applicationStatus"] || "",
        Cell: ({ row }) => {
          
          const wf = row.original?.workflowData;
          return GetCell(t(`${row?.original?.workflowData?.state?.["applicationStatus"]}`));


        },
        mobileCell: (original) => GetMobCell(t(`ES_WT_COMMON_STATUS_${original?.workflowData?.state?.["applicationStatus"]}`)),
      

      },
      
    ],
    serviceRequestIdKey: (original) => original?.[t("WT_INBOX_UNIQUE_BOOKING_NO")]?.props?.children,

    
  },
});
