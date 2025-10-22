package rs.fon.bg.ac.hotel_server_application.service.impl;

import org.indigo.dtomapper.providers.specification.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rs.fon.bg.ac.hotel_server_application.domain.Room;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.RoomResponse;
import rs.fon.bg.ac.hotel_server_application.repository.RoomRepository;
import rs.fon.bg.ac.hotel_server_application.service.RoomService;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private Mapper mapper;

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public List<RoomResponse> findAll() {
        List<RoomResponse> responses = new ArrayList<>();
        for(Room room : roomRepository.findAll()){
            responses.add(mapper.map(room, RoomResponse.class));
        }
        return responses;
    }

    @Override
    public List<RoomResponse> search(String query) {
        List<Room> rooms = roomRepository.search(query);
        List<RoomResponse> responses = new ArrayList<>();
        for (Room room : rooms) {
            responses.add(mapper.map(room, RoomResponse.class));
        }
        return responses;
    }

    @Override
    public RoomResponse findById(long id) {
        RoomResponse response = new RoomResponse();
        Room room = roomRepository.findById(id).orElse(null);
        response =  mapper.map(room, RoomResponse.class);
        return response;
    }
}
