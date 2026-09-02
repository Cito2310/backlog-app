import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { projectClosed } from '../projectDetailSlice';
import { fetchProjectDetail } from '../projectDetailThunks';

export const useProjectDetailPage = () => {
    const { projectId } = useParams();
    const dispatch = useAppDispatch();
    const { current, status, error } = useAppSelector((state) => state.projectDetail);

    // Se guardan las cerradas, no las abiertas: así una feature nueva aparece desplegada
    const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

    useEffect(() => {
        if (!projectId) return;

        void dispatch(fetchProjectDetail(projectId));

        return () => {
            dispatch(projectClosed());
        };
    }, [projectId, dispatch]);

    const toggleFeature = (featureId: string) => {
        setCollapsedIds((previous) =>
            previous.includes(featureId)
                ? previous.filter((id) => id !== featureId)
                : [...previous, featureId],
        );
    };

    const isFeatureOpen = (featureId: string) => !collapsedIds.includes(featureId);

    return { project: current, status, error, toggleFeature, isFeatureOpen };
};
