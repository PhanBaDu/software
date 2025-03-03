'use client';

import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useJoinWorkspace } from '@/features/workspaces/api/use-join-workspace';
import { useInviteCode } from '@/features/workspaces/hooks/use-invite-code';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string;
    };
}

export const JoinWorkspaceForm = ({
    initialValues,
}: JoinWorkspaceFormProps) => {
    const router = useRouter();
    const { mutate, isPending } = useJoinWorkspace();
    const inviteCode = useInviteCode();
    const workspaceId = useWorkspaceId();

    const onSubmit = () => {
        console.log(inviteCode, workspaceId);
        mutate(
            {
                param: { workspaceId },
                json: { code: inviteCode },
            },
            {
                onSuccess: ({ data }) => {
                    router.push(`/workspaces/${data.$id}`);
                },
            },
        );
    };

    return (
        <div className="w-full h-full border-none shadow-none">
            <Card className="p-7">
                <CardHeader>
                    <CardTitle>Join workspace</CardTitle>
                    <CardDescription>
                        You&apos;ve been invited to join{' '}
                        <strong>{initialValues.name}</strong> workspace
                    </CardDescription>
                </CardHeader>
                <div className="px-7">
                    <DottedSeparator />
                </div>
                <CardContent className="p-7">
                    <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
                        <Button
                            size={'lg'}
                            variant={'secondary'}
                            type="button"
                            asChild
                            className="w-full lg:w-fit"
                        >
                            <Link href={'/'}>Cancel</Link>
                        </Button>

                        <Button
                            type="button"
                            size={'lg'}
                            className="w-full lg:w-fit"
                            onClick={onSubmit}
                            disabled={isPending}
                        >
                            Join Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
