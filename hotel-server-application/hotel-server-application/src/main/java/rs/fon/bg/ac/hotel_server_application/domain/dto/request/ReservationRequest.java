package rs.fon.bg.ac.hotel_server_application.domain.dto.request;

import lombok.Data;

import java.util.Date;

@Data
public class ReservationRequest {

    private Long id;

    private Date dateFrom;

    private Date dateTo;

    private String status;

    private boolean isBreakfastIncluded;

    private String note;

    private Long employeeId;

    private Long guestId;

    private Long roomId;
}
