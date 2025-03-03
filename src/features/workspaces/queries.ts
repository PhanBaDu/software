import { DATABASES_ID, MEMBERS_ID, WORKSPACE_ID } from '@/config';
import { AUTH_COOKIE } from '@/features/auth/constants';
import { getMember } from '@/features/members/utils';
import { Workspace } from '@/features/workspaces/types';
import { createSessionClient } from '@/lib/appwrite';
import { cookies } from 'next/headers';
import { Account, Client, Databases, Query } from 'node-appwrite';

export const getWorkspaces = async () => {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const members = await databases.listDocuments(DATABASES_ID, MEMBERS_ID, [
        Query.equal('userId', user.$id),
    ]);

    if (members.total === 0) {
        return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
        DATABASES_ID,
        WORKSPACE_ID,
        [Query.orderDesc('$createdAt'), Query.contains('$id', workspaceIds)],
    );

    return workspaces;
};

interface GetWorkspaceProps {
    workspaceId: string;
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
    });

    if (!member) throw new Error('Unauthorized');

    const workspace = await databases.getDocument<Workspace>(
        DATABASES_ID,
        WORKSPACE_ID,
        workspaceId,
    );

    return workspace;
};

interface GetWorkspaceInfoProps {
    workspaceId: string;
}

export const getWorkspaceInfo = async ({
    workspaceId,
}: GetWorkspaceInfoProps) => {
    const { databases } = await createSessionClient();

    const workspace = await databases.getDocument<Workspace>(
        DATABASES_ID,
        WORKSPACE_ID,
        workspaceId,
    );

    return {
        name: workspace.name,
    };
};
