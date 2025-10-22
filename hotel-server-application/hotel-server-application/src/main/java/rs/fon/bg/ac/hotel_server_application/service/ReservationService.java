package rs.fon.bg.ac.hotel_server_application.service;

import rs.fon.bg.ac.hotel_server_application.domain.dto.request.ReservationRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.ReservationResponse;

import java.util.List;

public interface ReservationService {

    List<ReservationResponse> findAll();

    List<ReservationResponse> search(String query);

    ReservationResponse findById(long id);

    ReservationResponse save(ReservationRequest reservationRequest);

    void update(ReservationRequest reservationRequest);

    void delete(long id);


}
