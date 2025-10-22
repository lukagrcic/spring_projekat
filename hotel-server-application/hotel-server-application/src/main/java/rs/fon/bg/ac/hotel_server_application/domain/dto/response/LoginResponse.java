package rs.fon.bg.ac.hotel_server_application.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String id;

    private String username;

    private String token;

}
