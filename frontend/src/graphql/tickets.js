export const GET_TICKETS = `
  query GetTickets {
    tickets(order_by: { created_at: desc }) {
      id
      title
      description
      status
      priority
      user_id
      created_at
    }
  }
`;

export const CREATE_TICKET = `
  mutation CreateTicket(
    $title: String!
    $description: String
    $priority: String!
  ) {
    insert_tickets_one(
      object: {
        title: $title
        description: $description
        priority: $priority
      }
    ) {
      id
      title
      description
      status
      priority
      user_id
      created_at
    }
  }
`;

export const UPDATE_TICKET = `
  mutation UpdateTicket(
    $id: uuid!
    $title: String!
    $description: String
    $status: String!
    $priority: String!
  ) {
    update_tickets_by_pk(
      pk_columns: { id: $id }
      _set: {
        title: $title
        description: $description
        status: $status
        priority: $priority
      }
    ) {
      id
      title
      description
      status
      priority
      user_id
      created_at
    }
  }
`;

export const DELETE_TICKET = `
  mutation DeleteTicket($id: uuid!) {
    delete_tickets_by_pk(id: $id) {
      id
    }
  }
`;
