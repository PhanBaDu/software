import { DATABASES_ID, IMAGE_BUCKET_ID, PROJECTS_ID } from '@/config';
import { getMember } from '@/features/members/utils';
import {
    createProjectSchema,
    updateProjectSchema,
} from '@/features/projects/schema';
import { Project } from '@/features/projects/types';
import { sessionMiddleware } from '@/lib/session-middleware.';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { z } from 'zod';

const app = new Hono()
    .get(
        '/',
        sessionMiddleware,
        zValidator('query', z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases');
            const { workspaceId } = c.req.valid('query');

            if (!workspaceId)
                return c.json({ error: 'Missing workspaceId' }, 400);

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) return c.json({ error: 'Unauthorized' }, 401);

            const projects = await databases.listDocuments(
                DATABASES_ID,
                PROJECTS_ID,
                [
                    Query.equal('workspaceId', workspaceId),
                    Query.orderDesc('$createdAt'),
                ],
            );

            return c.json({ data: projects });
        },
    )
    .post(
        '/',
        sessionMiddleware,
        zValidator('form', createProjectSchema),
        async (c) => {
            const databases = c.get('databases');
            const storage = c.get('storage');
            const user = c.get('user');

            const { name, image, workspaceId } = c.req.valid('form');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGE_BUCKET_ID,
                    ID.unique(),
                    image,
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGE_BUCKET_ID,
                    file.$id,
                );

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(
                    arrayBuffer,
                ).toString('base64')}`;
            }

            const project = await databases.createDocument(
                DATABASES_ID,
                PROJECTS_ID,
                ID.unique(),
                {
                    name,
                    imageUrl: uploadedImageUrl,
                    workspaceId,
                },
            );
            return c.json({ data: project });
        },
    )
    .patch(
        '/:projectId',
        sessionMiddleware,
        zValidator('form', updateProjectSchema),
        async (c) => {
            const databases = c.get('databases');
            const storage = c.get('storage');
            const user = c.get('user');

            const { projectId } = c.req.param();
            const { name, image } = c.req.valid('form');

            const existingProject = await databases.getDocument<Project>(
                DATABASES_ID,
                PROJECTS_ID,
                projectId,
            );

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGE_BUCKET_ID,
                    ID.unique(),
                    image,
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGE_BUCKET_ID,
                    file.$id,
                );

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(
                    arrayBuffer,
                ).toString('base64')}`;
            } else {
                uploadedImageUrl = image;
            }

            const project = await databases.updateDocument(
                DATABASES_ID,
                PROJECTS_ID,
                projectId,
                { name, imageUrl: uploadedImageUrl },
            );

            return c.json({ data: project });
        },
    )
    .delete('/:projectId', sessionMiddleware, async (c) => {
        const databases = c.get('databases');
        const user = c.get('user');
        const { projectId } = c.req.param();

        const existingProject = await databases.getDocument<Project>(
            DATABASES_ID,
            PROJECTS_ID,
            projectId,
        );

        const member = await getMember({
            databases,
            workspaceId: existingProject.workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        await databases.deleteDocument(DATABASES_ID, PROJECTS_ID, projectId);

        return c.json({ data: { $id: existingProject.$id } });
    });

export default app;
