import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const page = usePage();
    
    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 px-3 py-2 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                    {items.map((item) => {
                        const isActiveItem = page.url === item.href;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className={cn(
                                        "group relative w-full justify-start rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0 before:bg-slate-600 before:rounded-r-full before:transition-all before:duration-200",
                                        isActiveItem ? [
                                            "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md shadow-slate-500/20",
                                            "before:h-6 before:bg-white/30",
                                            "hover:from-slate-700 hover:to-slate-600"
                                        ] : [
                                            "text-slate-600 hover:bg-slate-50 hover:text-slate-700",
                                            "hover:before:h-4 hover:before:bg-slate-600"
                                        ]
                                    )}
                                >
                                    <Link href={item.href} prefetch className="flex items-center gap-3 w-full">
                                        {item.icon && (
                                            <Icon 
                                                iconNode={item.icon} 
                                                className={cn(
                                                    "h-4 w-4 transition-all duration-200",
                                                    isActiveItem ? "text-white" : "text-slate-500 group-hover:text-slate-600"
                                                )} 
                                            />
                                        )}
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
