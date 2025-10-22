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
import rs.fon.bg.ac.hotel_server_application.domain.dto.request.ReservationRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.ReservationResponse;
import rs.fon.bg.ac.hotel_server_application.service.ReservationService;

import java.util.List;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @GetMapping("/findAll")
    public List<ReservationResponse> findAll(){
        return reservationService.findAll();
    }

    @GetMapping("/search")
    public List<ReservationResponse> search(@RequestParam String query) {
        return reservationService.search(query);
    }

    @GetMapping("/findById")
    public ReservationResponse findById(@RequestParam long id){
        return reservationService.findById(id);
    }

    @PostMapping("/save")
    public ReservationResponse save(@RequestBody ReservationRequest reservationRequest){
        return reservationService.save(reservationRequest);
    }

    @PutMapping("/update")
    public ResponseEntity<Void> update(@RequestBody ReservationRequest reservationRequest){
        reservationService.update(reservationRequest);
//        Eksplicitno kažemo: vrati 204 No Content
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/deleteById")
    public ResponseEntity<Void> delete(@RequestParam long id){
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }

//  204 No Content = "Uspešno obrisano, nema sadržaja za vraćanje"
//
//  200 OK = "Uspešno obrisano, evo ti neki sadržaj" (ali nema sadržaja!)
//
//  404 Not Found = "ID ne postoji" (možeš da kontrolišeš)
}
