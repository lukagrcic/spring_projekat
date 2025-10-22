package rs.fon.bg.ac.hotel_server_application.domain.dto.response;

import lombok.Data;

@Data
public class GuestResponse {

    private Long id;

    private String jmbg;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private CityResponse city;

}
