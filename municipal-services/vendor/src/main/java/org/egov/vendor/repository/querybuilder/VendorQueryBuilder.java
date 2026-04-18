package org.egov.vendor.repository.querybuilder;

import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.egov.vendor.config.VendorConfiguration;
import org.egov.vendor.web.model.VendorSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

@Component
public class VendorQueryBuilder {

	@Autowired
	private VendorConfiguration config;

//	private static final String QUERY = "SELECT count(*) OVER() AS full_count, vendor.*,vendor_address.*,vendor_driver.*,vendor_vehicle.*, vendor.id as vendor_id,"
//			+ "  vendor.createdby as vendor_createdby,vendor.lastmodifiedby as vendor_lastmodifiedby,"
//			+ "  vendor.createdtime as vendor_createdtime," + "  vendor.lastmodifiedtime as vendor_lastmodifiedtime,vendor.vendor_idgen as vendor_idgen,"
//			+ "  vendor.additionaldetails as vendor_additionaldetails,"
//			+ "  vendor_address.id as vendor_address_id FROM eg_vendor vendor"
//			+ "  INNER JOIN eg_vendor_address vendor_address on  vendor_address.vendor_id=vendor.id"
//			+ "  LEFT OUTER JOIN eg_vendor_driver vendor_driver on  vendor_driver.vendor_id=vendor_address.id"
//			+ "  LEFT OUTER JOIN eg_vendor_vehicle vendor_vehicle on "
//			+ "  vendor_vehicle.vendor_id=vendor_driver.vendor_id";


	private static final String DRIVER_VEHICLE_QUERY = "SELECT %s FROM %s where %s = ? AND %s = ?";
	private static final String VEHICLE_EXISTS = "SELECT vendor_id FROM eg_vendor_vehicle where vechile_id IN ";
	private static final String DRIVER_EXISTS = "SELECT vendor_id FROM eg_vendor_driver where driver_id IN ";

	private static final String DRIVER_ID = "driver_id";
	private static final String VEHICLE_ID = "vechile_id";
	private static final String VENDOR_ID = "vendor_id";
	private static final String VENDOR_DRIVER_STATUS = "vendorDriverStatus";
	private static final String VENDOR_VEHICLE_STATUS = "vendorVehicleStatus";
	private static final String VENDOR_DRIVER = "eg_vendor_driver";
	private static final String VENDOR_VEHICLE = "eg_vendor_vehicle";

	public static final String VENDOR_COUNT = "select count(*) from eg_vendor where owner_id IN ";

	// ─── NEW: vendor additional details constants ──────────────────────────────────

	private static final String VENDOR_ADDITIONAL_DETAILS_TABLE  = "eg_vendor_additional_details";
	private static final String VENDOR_ADDITIONAL_DETAILS_ALIAS  = "vad";

	private static final String VAD_ID                   = "vad.vendor_additional_details_id  as vad_id";
	private static final String VAD_VENDOR_ID            = "vad.vendor_id                     as vad_vendor_id";
	private static final String VAD_TENANT_ID            = "vad.tenant_id                     as vad_tenant_id";
	private static final String VAD_CODE                 = "vad.code                          as vad_code";
	private static final String VAD_NAME                 = "vad.name                          as vad_name";
	private static final String VAD_VENDOR_COMPANY       = "vad.vendor_company                as vad_vendor_company";
	private static final String VAD_VENDOR_CATEGORY      = "vad.vendor_category               as vad_vendor_category";
	private static final String VAD_VENDOR_PHONE         = "vad.vendor_phone                  as vad_vendor_phone";
	private static final String VAD_VENDOR_EMAIL         = "vad.vendor_email                  as vad_vendor_email";
	private static final String VAD_CONTACT_PERSON       = "vad.contact_person                as vad_contact_person";
	private static final String VAD_VENDOR_MOBILE_NUMBER = "vad.vendor_mobile_number          as vad_vendor_mobile_number";
	private static final String VAD_IFSC_CODE            = "vad.ifsc_code                     as vad_ifsc_code";
	private static final String VAD_BANK                 = "vad.bank                          as vad_bank";
	private static final String VAD_BANK_BRANCH_NAME     = "vad.bank_branch_name              as vad_bank_branch_name";
	private static final String VAD_MICR_NO              = "vad.micr_no                       as vad_micr_no";
	private static final String VAD_BANK_ACCOUNT_NUMBER  = "vad.bank_account_number           as vad_bank_account_number";
	private static final String VAD_NARRATION            = "vad.narration                     as vad_narration";
	private static final String VAD_PAN_NO               = "vad.pan_no                        as vad_pan_no";
	private static final String VAD_GST_TIN_NO           = "vad.gst_tin_no                    as vad_gst_tin_no";
	private static final String VAD_GST_REGISTERED_STATE = "vad.gst_registered_state          as vad_gst_registered_state";
	private static final String VAD_VENDOR_GROUP         = "vad.vendor_group                  as vad_vendor_group";
	private static final String VAD_VENDOR_TYPE          = "vad.vendor_type                   as vad_vendor_type";
	private static final String VAD_SERVICE_TYPE         = "vad.service_type                  as vad_service_type";
	private static final String VAD_REGISTRATION_NO      = "vad.registration_no               as vad_registration_no";
	private static final String VAD_REGISTRATION_DATE    = "vad.registration_date             as vad_registration_date";
	private static final String VAD_STATUS               = "vad.status                        as vad_status";
	private static final String VAD_ACTIVE               = "vad.active                        as vad_active";
	private static final String VAD_EPF_NO               = "vad.epf_no                        as vad_epf_no";
	private static final String VAD_ESI_NO               = "vad.esi_no                        as vad_esi_no";

	// ─── helper: builds the SELECT fragment for vad columns ───────────────────────
	private static final String VAD_SELECT_COLUMNS = String.join(", ",
			VAD_ID, VAD_VENDOR_ID, VAD_TENANT_ID, VAD_CODE, VAD_NAME,
			VAD_VENDOR_COMPANY, VAD_VENDOR_CATEGORY, VAD_VENDOR_PHONE, VAD_VENDOR_EMAIL,
			VAD_CONTACT_PERSON, VAD_VENDOR_MOBILE_NUMBER, VAD_IFSC_CODE, VAD_BANK,
			VAD_BANK_BRANCH_NAME, VAD_MICR_NO, VAD_BANK_ACCOUNT_NUMBER, VAD_NARRATION,
			VAD_PAN_NO, VAD_GST_TIN_NO, VAD_GST_REGISTERED_STATE, VAD_VENDOR_GROUP,
			VAD_VENDOR_TYPE, VAD_SERVICE_TYPE, VAD_REGISTRATION_NO, VAD_REGISTRATION_DATE,
			VAD_STATUS, VAD_ACTIVE, VAD_EPF_NO, VAD_ESI_NO
	);

	// ─── helper: builds the LEFT JOIN fragment ────────────────────────────────────
	private static final String VAD_JOIN =
			" LEFT JOIN " + VENDOR_ADDITIONAL_DETAILS_TABLE + " " + VENDOR_ADDITIONAL_DETAILS_ALIAS
					+ " ON " + VENDOR_ADDITIONAL_DETAILS_ALIAS + "." + VENDOR_ID + " = vendor.id ";

	private static final String QUERY = "SELECT count(*) OVER() AS full_count, vendor.*, vendor_address.*, vendor_driver.*, vendor_vehicle.*, "
			+ " vwo.id as vwo_id, vwo.name as vwo_name, vwo.vendor_id as vwo_vendor_id, vwo.tenant_id as vwo_tenantid, "
			+ " vwo.valid_from as vwo_valid_from, vwo.valid_to as vwo_valid_to, vwo.mobileNumber as vwo_mobileNumber, "
			+ " vwo.alternateNumber as vwo_alternateNumber, vwo.emailId as vwo_emailId, vwo.servicetype as vwo_servicetype, "
			+ " vendor.id as vendor_id, vendor.createdby as vendor_createdby, vendor.lastmodifiedby as vendor_lastmodifiedby, "
			+ " vendor.createdtime as vendor_createdtime, vendor.lastmodifiedtime as vendor_lastmodifiedtime, "
			+ " vendor.vendor_idgen as vendor_idgen, vendor.additionaldetails as vendor_additionaldetails, vendor_address.id as vendor_address_id, "
			+ " fp.id as fp_id, fp.filling_point_id as fp_filling_point_id, "
			+ " fp.tenant_id as fp_tenant_id, fp.filling_point_name,  fp.emergency_name,  fp.ee_name, fp.ee_email, fp.ee_mobile, "
			+ " fp.ae_name, fp.ae_email, fp.ae_mobile,  fp.je_name, fp.je_email, fp.je_mobile,  fp.createdby as fp_createdby, fp.lastmodifiedby as fp_lastmodifiedby, "
	        + " fp.createdtime as fp_createdtime, fp.lastmodifiedtime as fp_lastmodifiedtime, "
			+  VAD_SELECT_COLUMNS
		    + " FROM eg_vendor vendor "
			+ " INNER JOIN eg_vendor_address vendor_address on  vendor_address.vendor_id=vendor.id "
			+ " LEFT OUTER JOIN eg_vendor_driver vendor_driver on  vendor_driver.vendor_id=vendor_address.id "
			+ " LEFT OUTER JOIN eg_vendor_vehicle vendor_vehicle on vendor_vehicle.vendor_id=vendor_driver.vendor_id "
			+ " LEFT OUTER JOIN eg_vendor_work_order vwo ON vwo.vendor_id = vendor.id"
			+ " LEFT JOIN eg_wt_fillingpoint_vendor_map fvm ON fvm.vendor_id::varchar = vendor.id "
			+ " LEFT JOIN upyog_rs_water_tanker_filling_point fp ON fp.id = fvm.filling_point_id::varchar "
			+ VAD_JOIN;

	private static final String PAGINATION_WRAPPER = "SELECT * FROM "
			+ "(SELECT *, DENSE_RANK() OVER (ORDER BY SORT_BY SORT_ORDER) offset_ FROM " + "({})"
			+ " result) result_offset " + " limit ? offset ?";

	private static final String COUNT_QUERY =
			"SELECT COUNT(DISTINCT vendor.id) FROM eg_vendor vendor ";

	public String getDriverSearchQuery() {
		return String.format(DRIVER_VEHICLE_QUERY, DRIVER_ID, VENDOR_DRIVER, VENDOR_ID, VENDOR_DRIVER_STATUS);
	}

	public String getVehicleSearchQuery() {
		return String.format(DRIVER_VEHICLE_QUERY, VEHICLE_ID, VENDOR_VEHICLE, VENDOR_ID, VENDOR_VEHICLE_STATUS);
	}

	public String vendorsForVehicles(VendorSearchCriteria vendorSearchCriteria, List<Object> preparedStmtList) {

		StringBuilder builder = new StringBuilder(VEHICLE_EXISTS);
		builder.append("(").append(createQuery(vendorSearchCriteria.getVehicleIds())).append(")");
		addToPreparedStatement(preparedStmtList, vendorSearchCriteria.getVehicleIds());

		List<String> status = vendorSearchCriteria.getStatus();
		if (!CollectionUtils.isEmpty(status)) {
			addClauseIfRequired(preparedStmtList, builder);
			builder.append(" vendorVehicleStatus IN (").append(createQuery(status)).append(")");
			addToPreparedStatement(preparedStmtList, status);
		}

		return builder.toString();
	}

	public String vendorsForDrivers(VendorSearchCriteria vendorSearchCriteria, List<Object> preparedStmtList) {

		StringBuilder builder = new StringBuilder(DRIVER_EXISTS);
		builder.append("(").append(createQuery(vendorSearchCriteria.getDriverIds())).append(")");
		addToPreparedStatement(preparedStmtList, vendorSearchCriteria.getDriverIds());

		List<String> status = vendorSearchCriteria.getStatus();
		if (!CollectionUtils.isEmpty(status)) {
			addClauseIfRequired(preparedStmtList, builder);
			builder.append(" vendordriverstatus IN (").append(createQuery(status)).append(")");
			addToPreparedStatement(preparedStmtList, status);
		}

		return builder.toString();
	}

	public String getvendorCount(List<String> ownerList, List<Object> preparedStmtList) {
		StringBuilder builder = new StringBuilder(VENDOR_COUNT);
		builder.append("(").append(createQuery(ownerList)).append(")");
		addToPreparedStatement(preparedStmtList, ownerList);
		return builder.toString();

	}

	public String getSearchCountQuery(VendorSearchCriteria criteria, List<Object> preparedStmtList) {
		// Start with the base: SELECT COUNT(DISTINCT vendor.id) FROM eg_vendor vendor
		StringBuilder builder = new StringBuilder(COUNT_QUERY);

		if (criteria.getTenantId() != null) {
			// Tenant Filter
			if (criteria.getTenantId().split("\\.").length == 1) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.tenantid like ?");
				preparedStmtList.add('%' + criteria.getTenantId() + '%');
			} else {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.tenantid=? ");
				preparedStmtList.add(criteria.getTenantId());
			}

			// Name Filter
			List<String> vendorNames = criteria.getName();
			if (!CollectionUtils.isEmpty(vendorNames)) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" ( ");
				boolean flag = false;
				for (String name : vendorNames) {
					if (flag) builder.append(" OR ");
					builder.append(" LOWER(vendor.name) like ?");
					preparedStmtList.add('%' + name.toLowerCase() + '%');
					builder.append(" ESCAPE '_' ");
					flag = true;
				}
				builder.append(" ) ");
			}

			// Owner IDs Filter
			if (!CollectionUtils.isEmpty(criteria.getOwnerIds())) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.owner_id IN (").append(createQuery(criteria.getOwnerIds())).append(")");
				addToPreparedStatement(preparedStmtList, criteria.getOwnerIds());
			}

			// Vendor IDs Filter
			if (!CollectionUtils.isEmpty(criteria.getIds())) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.id IN (").append(createQuery(criteria.getIds())).append(")");
				addToPreparedStatement(preparedStmtList, criteria.getIds());
			}

			// Status Filter
			if (!CollectionUtils.isEmpty(criteria.getStatus())) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.status IN (").append(createQuery(criteria.getStatus())).append(")");
				addToPreparedStatement(preparedStmtList, criteria.getStatus());
			}
		}

		return builder.toString();
	}

	public String getVendorSearchQuery(VendorSearchCriteria criteria, List<Object> preparedStmtList) {
		StringBuilder builder = new StringBuilder(QUERY);
		if (criteria.getTenantId() != null) {
			if (criteria.getTenantId().split("\\.").length == 1) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.tenantid like ?");
				preparedStmtList.add('%' + criteria.getTenantId() + '%');
			} else {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.tenantid=? ");
				preparedStmtList.add(criteria.getTenantId());
			}

			/*
			 * Enable part search with VendorName
			 */

			List<String> vendorName = criteria.getName();
			if (!CollectionUtils.isEmpty(vendorName)
					&& (vendorName.stream().filter(name -> name.length() > 0).findFirst().orElse(null) != null)) {
				List<String> vendorNametoLowerCase = criteria.getName().stream().map(String::toLowerCase)
						.collect(Collectors.toList());
				boolean flag = false;
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" ( ");
				for (String vendorname : vendorNametoLowerCase) {
					if (flag)
						builder.append(" OR ");
					builder.append(" LOWER(vendor.name) like ?");
					preparedStmtList.add('%' + StringUtils.lowerCase(vendorname) + '%');
					builder.append(" ESCAPE '_' ");

					flag = true;
				}
				builder.append(" ) ");
			}
			List<String> ownerIds = criteria.getOwnerIds();
			if (!CollectionUtils.isEmpty(ownerIds)) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.owner_id IN (").append(createQuery(ownerIds)).append(")");
				addToPreparedStatement(preparedStmtList, ownerIds);
			}

			// Don't know to which coloum need to map mean while mapping to vendor_id
			List<String> ids = criteria.getIds();
			if (!CollectionUtils.isEmpty(ids)) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.id IN (").append(createQuery(ids)).append(")");
				addToPreparedStatement(preparedStmtList, ids);
			}
			List<String> status = criteria.getStatus();
			if (!CollectionUtils.isEmpty(status)) {
				addClauseIfRequired(preparedStmtList, builder);
				builder.append(" vendor.status IN (").append(createQuery(status)).append(")");
				addToPreparedStatement(preparedStmtList, status);
			}

		}
		return addPaginationWrapper(builder.toString(), preparedStmtList, criteria);
	}

	private String addPaginationWrapper(String query, List<Object> preparedStmtList, VendorSearchCriteria criteria) {
		int limit = config.getDefaultLimit();
		int offset = config.getDefaultOffset();
		String finalQuery = PAGINATION_WRAPPER.replace("{}", query);
		
		if (criteria.getSortBy() != null && criteria.getSortBy().toString() == "createdTime") {
			finalQuery = finalQuery.replace("SORT_BY", "vendor_createdTime");
		} else if (criteria.getSortBy() != null) {
			finalQuery = finalQuery.replace("SORT_BY", criteria.getSortBy().toString());
		} else {
			finalQuery = finalQuery.replace("SORT_BY", "vendor_createdTime");
		}
		if (criteria.getSortOrder() != null) {
			finalQuery = finalQuery.replace("SORT_ORDER", criteria.getSortOrder().toString());
		} else {
			finalQuery = finalQuery.replace("SORT_ORDER", " DESC ");
		}
		if (criteria.getLimit() != null && criteria.getLimit() <= config.getMaxSearchLimit())
			limit = criteria.getLimit();

		if (criteria.getLimit() != null && criteria.getLimit() > config.getMaxSearchLimit()) {
			limit = config.getMaxSearchLimit();
		}

		if (criteria.getOffset() != null)
			offset = criteria.getOffset();

		if (limit == -1) {
			finalQuery = finalQuery.replace("limit ? offset ?", "");
		} else {
			preparedStmtList.add(limit);
			preparedStmtList.add(offset);
		}

		return finalQuery;

	}

	private void addClauseIfRequired(List<Object> values, StringBuilder queryString) {
		if (values.isEmpty())
			queryString.append(" WHERE ");
		else {
			queryString.append(" AND");
		}
	}

	private void addToPreparedStatement(List<Object> preparedStmtList, List<String> ids) {
		ids.forEach(id -> {
			preparedStmtList.add(id);
		});

	}

	private Object createQuery(List<String> ids) {
		StringBuilder builder = new StringBuilder();
		int length = ids.size();
		for (int i = 0; i < length; i++) {
			builder.append(" ?");
			if (i != length - 1)
				builder.append(",");
		}
		return builder.toString();
	}

	public String getVendorLikeQuery(VendorSearchCriteria criteria, List<Object> preparedStmtList) {

		StringBuilder builder = new StringBuilder(QUERY);

		List<String> ids = criteria.getIds();
		if (!CollectionUtils.isEmpty(ids)) {

			addClauseIfRequired(preparedStmtList, builder);
			builder.append(" vendor.id IN (").append(createQuery(ids)).append(")");
			addToPreparedStatement(preparedStmtList, ids);
		}

		return addPaginationClause(builder, preparedStmtList, criteria);

	}

	private String addPaginationClause(StringBuilder builder, List<Object> preparedStmtList,
			VendorSearchCriteria criteria) {

		if (criteria.getLimit() != null && criteria.getLimit() != 0) {
			builder.append(
					"and vendor.id in (select id from eg_vendor where tenantid like ? order by id offset ? limit ?)");
			if (criteria.getTenantId() != null) {
				if (criteria.getTenantId().split("\\.").length == 1) {

					preparedStmtList.add('%' + criteria.getTenantId() + '%');
				} else {

					preparedStmtList.add(criteria.getTenantId());
				}
			}
			preparedStmtList.add(criteria.getOffset());
			preparedStmtList.add(criteria.getLimit());

			addOrderByClause(builder);

		} else {
			addOrderByClause(builder);
		}
		return builder.toString();
	}

	private void addOrderByClause(StringBuilder builder) {
		builder.append(" ORDER BY vendor.id DESC ").toString();
	}

}