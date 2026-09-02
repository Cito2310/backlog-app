// Lo que devuelve GET /projects: es un resumen, sin features ni __v
export type ProjectSummary = {
    _id: string;
    name: string;
    description: string;
};

export type ProjectsResponse = { projects: ProjectSummary[] };

// El POST devuelve el proyecto completo, pero la lista solo usa el resumen
export type ProjectResponse = { project: ProjectSummary };

export type CreateProjectBody = {
    name: string;
    description?: string;
};
