package rs.fon.bg.ac.hotel_server_application.domain.dto.response;

import lombok.Data;

import java.util.Date;

@Data
public class ReservationResponse {

    private long id;

    private Date dateFrom;

    private Date dateTo;

    private String status;

    private boolean isBreakfastIncluded;

    private String note;

    private EmployeeResponse employee;

    private GuestResponse guest;

    private RoomResponse room;

    private double totalPrice;

}
