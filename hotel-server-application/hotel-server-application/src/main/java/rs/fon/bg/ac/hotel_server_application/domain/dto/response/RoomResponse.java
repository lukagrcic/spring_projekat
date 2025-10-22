package rs.fon.bg.ac.hotel_server_application.domain.dto.response;

import lombok.Data;

@Data
public class RoomResponse {

    private Long roomId;

    private String roomNumber;

    private int floor;

    private String status;

    private RoomTypeResponse roomType;
}
