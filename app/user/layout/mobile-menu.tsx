"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon } from "lucide-react";
import { NavigationItem } from "./navigation-items";

interface MobileMenuProps {
    items: NavigationItem[];
}

export function MobileMenu({ items }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const onToggle = () => setIsOpen(!isOpen);
    return (
        <>
            {/* 移动端汉堡菜单按钮 */}
            <div className="md:hidden">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                >
                    {isOpen ? (
                        <XIcon className="h-5 w-5" />
                    ) : (
                        <MenuIcon className="h-5 w-5" />
                    )}
                </Button>
            </div>

            {/* 移动端菜单 */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-t border-border/40">
                        {items.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                                onClick={onToggle}
                            >
                                <item.icon className="w-4 h-4 mr-3" />
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
} 