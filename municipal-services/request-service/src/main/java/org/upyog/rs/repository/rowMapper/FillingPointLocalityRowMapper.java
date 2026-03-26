package org.upyog.rs.repository.rowMapper;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import org.upyog.rs.web.models.AuditDetails;
import org.upyog.rs.web.models.fillingpointlocality.FillingPointLocality;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class FillingPointLocalityRowMapper implements ResultSetExtractor<List<FillingPointLocality>> {

    @Override
    public List<FillingPointLocality> extractData(ResultSet rs) throws SQLException, DataAccessException {
        List<FillingPointLocality> list = new ArrayList<>();
        while (rs.next()) {
            AuditDetails auditDetails = AuditDetails.builder()
                    .createdBy(rs.getString("createdby"))
                    .createdTime(rs.getLong("createdtime"))
                    .lastModifiedBy(rs.getString("lastmodifiedby"))
                    .lastModifiedTime(rs.getLong("lastmodifiedtime"))
                    .build();

            FillingPointLocality mapping = FillingPointLocality.builder()
                    .fillingPointId(rs.getString("filling_point_id"))
                    .localityCode(rs.getString("locality_code"))
                    .auditDetails(auditDetails)
                    .build();

            list.add(mapping);
        }
        return list;
    }
}
