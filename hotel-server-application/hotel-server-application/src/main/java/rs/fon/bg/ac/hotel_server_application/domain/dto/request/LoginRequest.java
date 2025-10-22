package rs.fon.bg.ac.hotel_server_application.domain.dto.request;

import lombok.Data;

@Data
public class LoginRequest {

    private String username;

    private String password;

}
