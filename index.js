import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPathSchema = path.join(__dirname, 'schema.graphql');
const dataPathDataSet = path.join(__dirname, 'data.json')
const typeDefs = fs.readFileSync(dataPathSchema, 'utf-8');
let dataset = JSON.parse(fs.readFileSync(dataPathDataSet));

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