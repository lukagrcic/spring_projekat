package rs.fon.bg.ac.hotel_server_application.domain;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "room_types")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long roomTypeId;

    private String category;

    private double pricePerNight;

    private String description;

}
