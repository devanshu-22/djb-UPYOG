package org.upyog.rs.repository.querybuilder;

import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocalitySearchCriteria;

import java.util.List;
@Component
public class FillingPointLocalityQueryBuilder {

    private static final String SEARCH_QUERY =
            "SELECT filling_point_id, locality_code, createdby, lastmodifiedby, createdtime, lastmodifiedtime " +
                    "FROM filling_point_locality_mapping ";

    private static final String COUNT_QUERY =
            "SELECT COUNT(*) FROM filling_point_locality_mapping ";

    public String getSearchQuery(FillingPointLocalitySearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder query = new StringBuilder(SEARCH_QUERY);
        query.append(" WHERE 1=1 ");

        applyFilters(query, criteria, preparedStmtList);

        query.append(" ORDER BY createdtime ASC ");

        int limit = (criteria.getLimit() != null && criteria.getLimit() > 0)
                ? Math.min(criteria.getLimit(), 100)
                : 10;
        query.append(" LIMIT ? ");
        preparedStmtList.add(limit);

        int offset = (criteria.getOffset() != null && criteria.getOffset() >= 0)
                ? criteria.getOffset()
                : 0;
        query.append(" OFFSET ? ");
        preparedStmtList.add(offset);

        return query.toString();
    }

    public String getCountQuery(FillingPointLocalitySearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder query = new StringBuilder(COUNT_QUERY);
        query.append(" WHERE 1=1 ");

        applyFilters(query, criteria, preparedStmtList);

        return query.toString();
    }

    private void applyFilters(StringBuilder query,
                              FillingPointLocalitySearchCriteria criteria,
                              List<Object> preparedStmtList) {

        if (!CollectionUtils.isEmpty(criteria.getFillingPointIds())) {
            query.append(" AND filling_point_id IN (")
                    .append(createQuery(criteria.getFillingPointIds()))
                    .append(") ");
            addToStatement(preparedStmtList, criteria.getFillingPointIds());
        }

        if (!CollectionUtils.isEmpty(criteria.getLocalityCodes())) {
            query.append(" AND locality_code IN (")
                    .append(createQuery(criteria.getLocalityCodes()))
                    .append(") ");
            addToStatement(preparedStmtList, criteria.getLocalityCodes());
        }

    }

    private String createQuery(List<String> ids) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < ids.size(); i++) {
            builder.append("?");
            if (i != ids.size() - 1) builder.append(", ");
        }
        return builder.toString();
    }

    private void addToStatement(List<Object> preparedStmtList, List<String> ids) {
        preparedStmtList.addAll(ids);
    }
}