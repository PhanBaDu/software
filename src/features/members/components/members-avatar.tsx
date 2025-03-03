import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MemberAvatarProps {
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const MemberAvatar = ({
    fallbackClassName,
    name,
    className,
}: MemberAvatarProps) => {
    return (
        <Avatar
            className={cn(
                'size-5 transition border border-neutral-300 rounded-full',
                className,
            )}
        >
            <AvatarFallback
                className={cn(
                    'bg-neutral-200 font-medium to-neutral-500 flex items-center',
                    fallbackClassName,
                )}
            >
                {name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
};
