"use client"

import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { FerrisWheelIcon, HomeIcon, SparklesIcon } from "lucide-react";
import { usePathname } from "next/navigation";

// 导航菜单项类型
export interface NavigationItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

// 导航菜单项配置
export const navigationItems: NavigationItem[] = [
    {
        title: "首页",
        href: "/",
        icon: HomeIcon,
    }
];

interface NavigationItemsProps {
    items?: NavigationItem[];
}

export function NavigationItems({ items = navigationItems }: NavigationItemsProps) {
    const pathname = usePathname();
    return (
        <div className="hidden md:flex items-center">
            <NavigationMenu>
                <NavigationMenuList className="flex items-center space-x-1">
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <NavigationMenuItem key={item.title}>
                                <NavigationMenuLink asChild>
                                    <Link 
                                        href={item.href}
                                        className="flex flex-row items-center px-3 py-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                                    >
                                        <item.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                        {item.title}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
} 