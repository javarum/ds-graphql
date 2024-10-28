# ER Diagram

```mermaid

erDiagram
    Event }o--|| Location : in
    Ticket }|--|| Event : for
    Artist }|--o{ Event : performs
    Guest }|--o{ Event : visits

    Event {
        int eventID
        string eventName
        datetime eventDate
        float ticketPrice
    }

    Location {
        int locationID
        string locationName
        string address
        string city
        string country
        int capacity
    }

    Ticket {
        int ticketID
        int seatNumber
        float price
        datetime purchaseDate
    }

    Artist {
        int artistID
        string artistName
    }

    Guest {
        int guestID
        string guestName
        string email
        string phone
        int age
    }



   ```

1. **Get all guests for an event**

    As an event manager, I would like to see a list of all guests for a particular event, including guest names, email and any other relevant details.
   
2. **Get information about a specific event**

     As an event manager, I want to retrieve detailed information about a specific event, including event name, date, location, artist and ticket price.
   
3. **Create a new event**

    As an event manager, I want to create a new event.
   
4. **Edit ticket**

    As an event manager, I want to change the price of a ticket for an event and retrieve all updated ticket details, including new price and any associated seating information.
