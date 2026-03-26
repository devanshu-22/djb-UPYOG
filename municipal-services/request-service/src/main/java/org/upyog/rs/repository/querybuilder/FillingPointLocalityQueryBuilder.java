package org.upyog.rs.repository.querybuilder;

import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalitySearchCriteria;

import java.util.List;

@Component
public class FillingPointLocalityQueryBuilder {

    private static final String SEARCH_QUERY = "SELECT filling_point_id, locality_code, createdby, lastmodifiedby, createdtime, lastmodifiedtime FROM filling_point_locality_mapping ";

    public String getSearchQuery(FillingPointLocalitySearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder query = new StringBuilder(SEARCH_QUERY);

        // Standard: Always start with a 1=1 or a mandatory field like tenantId
        query.append(" WHERE 1=1 ");

        if (!CollectionUtils.isEmpty(criteria.getFillingPointIds())) {
            query.append(" AND filling_point_id IN ( ").append(createQuery(criteria.getFillingPointIds())).append(" ) ");
            addToStatement(preparedStmtList, criteria.getFillingPointIds());
        }

        if (!CollectionUtils.isEmpty(criteria.getLocalityCodes())) {
            query.append(" AND locality_code IN ( ").append(createQuery(criteria.getLocalityCodes())).append(" ) ");
            addToStatement(preparedStmtList, criteria.getLocalityCodes());
        }

        return query.toString();
    }

    private String createQuery(List<String> ids) {
        StringBuilder builder = new StringBuilder();
        int length = ids.size();
        for (int i = 0; i < length; i++) {
            builder.append(" ? ");
            if (i != length - 1) builder.append(",");
        }
        return builder.toString();
    }

    private void addToStatement(List<Object> preparedStmtList, List<String> ids) {
        preparedStmtList.addAll(ids);
    }
}