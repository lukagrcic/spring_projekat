package rs.fon.bg.ac.hotel_server_application.service;

import rs.fon.bg.ac.hotel_server_application.domain.dto.response.RoomResponse;

import java.util.List;

public interface RoomService {

    List<RoomResponse> findAll();

    List<RoomResponse> search(String query);

    RoomResponse findById(long id);
}
