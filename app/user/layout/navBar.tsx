import { NavigationItems, navigationItems } from "./navigation-items";
import { MobileMenu } from "./mobile-menu";
import { UserMenu } from "./user-menu-wrapper";

export default function NavBar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 左侧导航菜单 - 桌面端 */}
                    <NavigationItems />

                    {/* 移动端菜单 */}
                    <MobileMenu items={navigationItems} />

                    {/* 右侧用户菜单 */}
                    <div className="flex items-center gap-2">
                        <UserMenu />
                    </div>
                </div>
            </div>
        </nav>
    );
}