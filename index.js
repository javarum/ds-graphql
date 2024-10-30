import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
const now = new Date();
const formatDate = (date) => date.toISOString();

const typeDefs = `type Event {
    eventID: ID!
    eventName: String!
    eventDate: String!
    ticketPrice: Float!
    location: Location!
    tickets: [Ticket!]!
    artists: [Artist!]!
    guests: [Guest!]!
}

type Location {
    locationID: ID!
    locationName: String!
    address: String!
    city: String!
    country: String!
    capacity: Int!
    events: [Event!]!
}

type Ticket {
    ticketID: ID!
    seatNumber: Int!
    price: Float!
    purchaseDate: String
    event: Event!
}

type Artist {
    artistID: ID!
    artistName: String!
    events: [Event!]!
}

type Guest {
    guestID: ID!
    guestName: String!
    email: String!
    phone: String
    age: Int
    events: [Event!]!
}

type Query {
    guestsForEvent(eventID: ID!): [Guest!]!

    event(eventID: ID!): Event
}

type Mutation {
    createEvent(
        eventName: String!,
        eventDate: String!,
        ticketPrice: Float!,
        locationID: ID!,
        artistIDs: [ID!]!,
        guestIDs: [ID!]!
    ): Event!

    editTicketPrice(
        ticketID: ID!,
        newPrice: Float!
    ): Ticket!
}
`;

const dataset = {
    locations: [
        {
            locationID: "1",
            locationName: "Stadthalle",
            address: "Beispielstraße 22",
            city: "Heilbronn",
            country: "Deutschland",
            capacity: 500,
        },
        {
            locationID: "2",
            locationName: "Konzerthalle",
            address: "Konzertstraße 3",
            city: "Neckarsulm",
            country: "Deutschland",
            capacity: 1000,
        },
    ],
    events: [
        {
            eventID: "1",
            eventName: "Irgendein Metal Konzert",
            eventDate: formatDate(new Date(now.setMonth(now.getMonth() + 1))),
            ticketPrice: 49.99,
            location: "1",
            tickets: ["1", "2"],
            artists: ["1"],
            guests: ["1", "2"],
        },
        {
            eventID: "2",
            eventName: "Jazz Nacht",
            eventDate: formatDate(new Date(now.setMonth(now.getMonth() + 2))),
            ticketPrice: 29.99,
            location: "2",
            tickets: ["3"],
            artists: ["2"],
            guests: ["2", "3"],
        },
    ],
    tickets: [
        {
            ticketID: "1",
            seatNumber: 134,
            price: 49.99,
            purchaseDate: formatDate(new Date(now.setDate(now.getDate() - 10))),
            event: "1",
        },
        {
            ticketID: "2",
            seatNumber: 193,
            price: 49.99,
            purchaseDate: formatDate(new Date(now.setDate(now.getDate() - 5))),
            event: "1",
        },
        {
            ticketID: "3",
            seatNumber: 42,
            price: 29.99,
            purchaseDate: formatDate(new Date(now.setDate(now.getDate() - 3))),
            event: "2",
        },
    ],
    artists: [
        {
            artistID: "1",
            artistName: "Mantar",
            events: ["1"],
        },
        {
            artistID: "2",
            artistName: "Armstrong Jr.",
            events: ["2"],
        },
    ],
    guests: [
        {
            guestID: "1",
            guestName: "Jeanna",
            email: "jeanna@example.com",
            phone: "123-456-7890",
            age: 23,
            events: ["1"],
        },
        {
            guestID: "2",
            guestName: "Ulf",
            email: "ulf@example.com",
            phone: "987-654-3210",
            age: 35,
            events: ["1", "2"],
        },
        {
            guestID: "3",
            guestName: "Chamzat",
            email: "chamzat@example.com",
            phone: "321-123-231",
            age: 42,
            events: ["2"],
        },
    ],
};

const resolvers = {
    Query: {
        guestsForEvent: (_, { eventID }) => {
            const event = dataset.events.find(e => e.eventID === eventID);
            if (!event) return [];
            return event.guests.map(guestID => dataset.guests.find(g => g.guestID === guestID));
        },
        event: (_, { eventID }) => {
            const event = dataset.events.find(e => e.eventID === eventID);
            if (!event) return null;
            return {
                ...event
            };
        },
    },
    Mutation: {
        createEvent: (_, { eventName, eventDate, ticketPrice, locationID, artistIDs, guestIDs }) => {
            const newEventID = (dataset.events.length + 1).toString();
            const newEvent = {
                eventID: newEventID,
                eventName,
                eventDate,
                ticketPrice,
                location: locationID,
                tickets: [],
                artists: artistIDs,
                guests: guestIDs,
            };
            dataset.events.push(newEvent);
            return {
                ...newEvent
            };
        },
        editTicketPrice: (_, { ticketID, newPrice }) => {
            const ticket = dataset.tickets.find(t => t.ticketID === ticketID);
            if (!ticket) return null;
            ticket.price = newPrice;
            return ticket;
        },
    },
    Event: {
        location: (event) => dataset.locations.find(l => l.locationID === event.location),
        tickets: (event) => event.tickets.map(ticketID => dataset.tickets.find(t => t.ticketID === ticketID)),
        artists: (event) => event.artists.map(artistID => dataset.artists.find(a => a.artistID === artistID)),
        guests: (event) => event.guests.map(guestID => dataset.guests.find(g => g.guestID === guestID)),
    },
    Location: {
        events: (location) => dataset.events.filter(e => e.location === location.locationID),
    },
    Ticket: {
        event: (ticket) => dataset.events.find(e => e.eventID === ticket.event),
    },
    Artist: {
        events: (artist) => dataset.events.filter(e => e.artists.includes(artist.artistID)),
    },
    Guest: {
        events: (guest) => dataset.events.filter(e => e.guests.includes(guest.guestID)),
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

await startStandaloneServer(server, {
    listen: { port: 4000 },
});