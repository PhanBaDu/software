import { MobileSideBar } from '@/components/mobile-sidebar';
import { UserButton } from '@/features/auth/components/user-button';

export const Navbar = async () => {
    return (
        <nav className="pt-4 px-6 flex items-center justify-between">
            <div className="lg:flex flex-col hidden">
                <h1 className="text-2xl font-semibold">Home</h1>
                <p className="text-muted-foreground">Monitor all of your projects and tasks here</p>
            </div>
            <MobileSideBar />
            <UserButton />
        </nav>
    );
};
