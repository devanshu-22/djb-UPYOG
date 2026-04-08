package org.upyog.rs.web.models.events;

import javax.validation.constraints.NotNull;
import lombok.*;
import org.springframework.validation.annotation.Validated;


@Validated
@AllArgsConstructor
@EqualsAndHashCode
@Getter
@NoArgsConstructor
@Setter
@ToString
@Builder
public class ActionItem {

	@NotNull
	private String actionUrl;

	@NotNull
	private String code;

}
