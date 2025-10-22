package rs.fon.bg.ac.hotel_server_application.domain.dto.response;

import lombok.Data;

@Data
public class RoomTypeResponse {

    private Long roomTypeId;

    private String category;

    private double pricePerNight;

    private String description;
}
