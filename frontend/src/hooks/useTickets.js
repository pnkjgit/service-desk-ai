import { useEffect, useState } from 'react';

import {
  CREATE_TICKET,
  DELETE_TICKET,
  GET_TICKETS,
  UPDATE_TICKET,
} from '../graphql/tickets';

function useTickets(nhost, isAuthenticated) {
  const [tickets, setTickets] = useState([]);
  const [ticketsError, setTicketsError] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const fetchTickets = async () => {
      try {
        const { data, error } = await nhost.graphql.request(GET_TICKETS);

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setTickets(data.tickets);
          setTicketsError('');
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);

        if (!cancelled) {
          setTicketsError('Unable to load tickets.');
        }
      }
    };

    fetchTickets();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, nhost]);

  const createTicket = async ({ title, description, priority }) => {
    try {
      setIsCreating(true);
      setCreateError('');

      const { data, error } = await nhost.graphql.request(CREATE_TICKET, {
        title,
        description,
        priority,
      });

      if (error) {
        throw error;
      }

      setTickets((currentTickets) => [
        data.insert_tickets_one,
        ...currentTickets,
      ]);

      return true;
    } catch (error) {
      console.error('Error creating ticket:', error);
      setCreateError('Unable to create ticket.');
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const updateTicket = async (ticket) => {
    try {
      const { data, error } = await nhost.graphql.request(UPDATE_TICKET, {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
      });

      if (error) {
        throw error;
      }

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) =>
          currentTicket.id === data.update_tickets_by_pk.id
            ? data.update_tickets_by_pk
            : currentTicket
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating ticket:', error);
      return false;
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      const { data, error } = await nhost.graphql.request(DELETE_TICKET, {
        id: ticketId,
      });

      if (error) {
        throw error;
      }

      setTickets((currentTickets) =>
        currentTickets.filter(
          (currentTicket) => currentTicket.id !== data.delete_tickets_by_pk.id
        )
      );

      return true;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return false;
    }
  };

  return {
    tickets,
    ticketsError,
    createError,
    isCreating,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}

export default useTickets;
