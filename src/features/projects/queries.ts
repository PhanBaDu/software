import { DATABASES_ID, PROJECTS_ID } from '@/config';
import { getMember } from '@/features/members/utils';
import { Project } from '@/features/projects/types';
import { createSessionClient } from '@/lib/appwrite';

interface GetProjectProps {
    projectId: string;
}

export const getProjectId = async ({ projectId }: GetProjectProps) => {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const project = await databases.getDocument<Project>(
        DATABASES_ID,
        PROJECTS_ID,
        projectId,
    );

    const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: project.workspaceId,
    });

    if (!member) throw new Error('Unauthorized');

    return project;
};
