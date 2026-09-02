// Los enums de la API. Van como arrays para poder recorrerlos en los selects, y el tipo
// sale del array: si mañana la API suma un valor, se agrega en un solo lugar
export const TICKET_TYPES = ['feature', 'bug', 'task', 'enhancement', 'refactor', 'spike'] as const;
export const TICKET_PRIORITIES = ['must', 'should', 'could', 'wont'] as const;
export const TICKET_STATUSES = ['todo', 'in_progress', 'blocked', 'done', 'cancelled'] as const;

export type TicketType = (typeof TICKET_TYPES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

// _id es opcional al enviar: sin él la API crea el subdocumento, con él lo edita
export type Ticket = {
    _id?: string;
    title: string;
    description?: string;
    type: TicketType;
    priority: TicketPriority;
    status: TicketStatus;
    estimate: number | null;
    closedAt: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type Feature = {
    _id?: string;
    name: string;
    description?: string;
    tickets: Ticket[];
};

// El árbol completo de GET /projects/:id. __v hace falta para poder editar
export type Project = {
    _id: string;
    ownerId: string;
    name: string;
    description: string;
    features: Feature[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

// Lo que devuelve GET /projects: es un resumen, sin features ni __v
export type ProjectSummary = {
    _id: string;
    name: string;
    description: string;
};

export type ProjectsResponse = { projects: ProjectSummary[] };
export type ProjectResponse = { project: Project };

export type CreateProjectBody = {
    name: string;
    description?: string;
};
