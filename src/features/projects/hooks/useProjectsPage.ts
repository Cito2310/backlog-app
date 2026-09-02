import { useAppDispatch, useAppSelector } from '@/store/store';
// import { useNavigate } from "react-router";

import type { ProjectSummary } from '@/types/project';
import { useEffect, useState } from 'react';
import { deleteProject, fetchProjects } from '../projectsThunks';

export const useProjectsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<null | ProjectSummary>(null);
    const dispatch = useAppDispatch();
    const { list, error, status } = useAppSelector((state) => state.projects);

    useEffect(() => {
        if (status === 'uninitialized') void dispatch(fetchProjects());
    }, [status, dispatch]);

    const askDeleteProject = (project: ProjectSummary) => {
        setProjectToDelete(project);
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            await dispatch(deleteProject(projectToDelete._id));
            setProjectToDelete(null);
        } catch {
            // El thunk relanza para que los formularios mapeen errors[]; acá no hay
            // formulario, así que el modal queda abierto y el mensaje sale de projects.error
        }
    };

    const cancelDeleteProject = () => {
        setProjectToDelete(null);
    };

    const openCreateProject = () => {
        setIsCreateOpen(true);
    };

    const closeCreateProject = () => {
        setIsCreateOpen(false);
    };

    return {
        askDeleteProject,
        confirmDeleteProject,
        cancelDeleteProject,
        openCreateProject,
        closeCreateProject,
        isCreateOpen,
        projectToDelete,
        status,
        error,
        list,
    };
};
