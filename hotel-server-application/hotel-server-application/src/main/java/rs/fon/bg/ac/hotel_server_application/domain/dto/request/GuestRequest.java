package rs.fon.bg.ac.hotel_server_application.domain.dto.request;

import lombok.Data;

@Data
public class GuestRequest {

    private Long id;

    private String jmbg;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private Long cityId;

}
