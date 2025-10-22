package rs.fon.bg.ac.hotel_server_application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import rs.fon.bg.ac.hotel_server_application.domain.RoomType;
import rs.fon.bg.ac.hotel_server_application.repository.RoomTypeRepository;

import java.util.List;

@RestController
@RequestMapping("/room_types")
public class RoomTypeController {

//    @Autowired
//    private RoomTypeRepository roomTypeRepository;
//
//    @GetMapping("/findAll")
//    public List<RoomType> findAll() {
//        return roomTypeRepository.findAll();
//    }
//
//    @GetMapping("/findByCategory")
//    public RoomType findByCategory(@RequestParam String category) {
//        return roomTypeRepository.findByCategory(category);
//    }
//
//    @PostMapping("/save")
//    public void save(@RequestBody RoomType roomType) {
//        roomTypeRepository.save(roomType);
//    }
}
