'use client';
import { ResponsiveModal } from '@/components/responsive-modal';
import { CreateProjectForm } from '@/features/projects/components/create-project-form';
import { useCreateProjectModal } from '@/features/projects/hook/use-create-project-modal';

export const CreateProjectModal = () => {
    const { isOpen, close, setIsOpen } = useCreateProjectModal();
    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            <CreateProjectForm onCancel={close} />
        </ResponsiveModal>
    );
};
