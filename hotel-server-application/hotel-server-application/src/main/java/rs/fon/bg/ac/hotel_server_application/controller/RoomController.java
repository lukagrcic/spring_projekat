package rs.fon.bg.ac.hotel_server_application.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.RoomResponse;
import rs.fon.bg.ac.hotel_server_application.service.RoomService;

import java.util.List;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping("/findAll")
    public List<RoomResponse> findAll(){
        return roomService.findAll();
    };

    @GetMapping("/search")
    public List<RoomResponse> search(@RequestParam String query) {
        return roomService.search(query);
    }

    @GetMapping("/findById")
    public RoomResponse findById(@RequestParam long id){
        return roomService.findById(id);
    };


}
