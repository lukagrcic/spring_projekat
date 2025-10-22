package rs.fon.bg.ac.hotel_server_application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rs.fon.bg.ac.hotel_server_application.domain.dto.request.GuestRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.GuestResponse;
import rs.fon.bg.ac.hotel_server_application.service.GuestService;

import java.util.List;

@RestController
@RequestMapping("/guests")
public class GuestController {

    @Autowired
    private GuestService guestService;

    @GetMapping("/findAll")
    public List<GuestResponse> findAll() {
        return guestService.findAll();
    }

    @GetMapping("/search")
    public List<GuestResponse> seach(@RequestParam String query) {
        return guestService.search(query);
    }

    @GetMapping("/findById")
    public GuestResponse findById(@RequestParam Long id) {
        return guestService.findById(id);
    }

    @PostMapping("/save")
    public GuestResponse save(@RequestBody GuestRequest guestRequest) {
        return guestService.save(guestRequest);
    }

    @PutMapping("/update")
    public GuestResponse update(@RequestBody GuestRequest guestRequest) {
        return guestService.update(guestRequest);
    }

    @DeleteMapping("/deleteById")
    public ResponseEntity<Void> delete(@RequestParam Long id) {
        guestService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
