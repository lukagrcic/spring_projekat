package rs.fon.bg.ac.hotel_server_application.service;

import rs.fon.bg.ac.hotel_server_application.domain.dto.request.GuestRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.GuestResponse;

import java.util.List;

public interface GuestService {

    List<GuestResponse> findAll();

    List<GuestResponse> search(String query);

    GuestResponse findById(Long id);

    GuestResponse save(GuestRequest guestRequest);

    GuestResponse update(GuestRequest guestRequest);

    void delete(Long id);

}
