import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    
    return (
        <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 px-3">
                Menu Utama
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;
                    const isActiveSection = page.url.startsWith(item.href);
                    
                    if (hasSubItems) {
                        return (
                            <Collapsible key={item.title} asChild defaultOpen={isActiveSection}>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton 
                                            tooltip={{ children: item.title }}
                                            className={cn(
                                                "group relative w-full justify-start rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0 before:bg-blue-600 before:rounded-r-full before:transition-all before:duration-200",
                                                isActiveSection ? [
                                                    "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25",
                                                    "before:h-8 before:bg-white/30",
                                                    "hover:from-blue-700 hover:to-blue-600"
                                                ] : [
                                                    "text-slate-700 hover:bg-blue-50 hover:text-blue-700",
                                                    "hover:before:h-6 hover:before:bg-blue-600",
                                                    "data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700"
                                                ]
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className={cn(
                                                    "h-5 w-5 transition-all duration-200",
                                                    isActiveSection ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                                                )} />
                                            )}
                                            <span className="truncate">{item.title}</span>
                                            <ChevronRight className={cn(
                                                "ml-auto h-4 w-4 transition-all duration-300",
                                                "group-data-[state=open]/collapsible:rotate-90",
                                                isActiveSection ? "text-white/80" : "text-slate-400 group-hover:text-blue-500"
                                            )} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-1">
                                        <SidebarMenuSub className="ml-6 space-y-1 border-l-2 border-slate-100 pl-4">
                                            {item.items!.map((subItem) => {
                                                const isActiveSubItem = page.url === subItem.href;
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton 
                                                            asChild 
                                                            className={cn(
                                                                "group relative w-full justify-start rounded-md px-3 py-2 text-sm transition-all duration-200",
                                                                "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:transition-all before:duration-200",
                                                                isActiveSubItem ? [
                                                                    "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md shadow-blue-400/20",
                                                                    "before:bg-white before:scale-110",
                                                                    "hover:from-blue-600 hover:to-blue-500"
                                                                ] : [
                                                                    "text-slate-600 hover:bg-blue-50 hover:text-blue-600",
                                                                    "before:bg-slate-300 before:scale-75 hover:before:bg-blue-500 hover:before:scale-100"
                                                                ]
                                                            )}
                                                        >
                                                            <Link href={subItem.href} prefetch className="flex items-center gap-3 w-full">
                                                                <span className="truncate font-medium">
                                                                    {subItem.title}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }
                    
                    const isActiveItem = page.url === item.href;
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                asChild 
                                tooltip={{ children: item.title }}
                                className={cn(
                                    "group relative w-full justify-start rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0 before:bg-blue-600 before:rounded-r-full before:transition-all before:duration-200",
                                    isActiveItem ? [
                                        "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25",
                                        "before:h-8 before:bg-white/30",
                                        "hover:from-blue-700 hover:to-blue-600"
                                    ] : [
                                        "text-slate-700 hover:bg-blue-50 hover:text-blue-700",
                                        "hover:before:h-6 hover:before:bg-blue-600"
                                    ]
                                )}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-3 w-full">
                                    {item.icon && (
                                        <item.icon className={cn(
                                            "h-5 w-5 transition-all duration-200",
                                            isActiveItem ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                                        )} />
                                    )}
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
