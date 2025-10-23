import { Home, MessageSquare, Briefcase, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: Briefcase,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar className="border-r border-white/10">
      <SidebarContent className="bg-black">
        <SidebarGroup>
          <div className="px-8 py-12">
            <h1 className="text-3xl font-extralight text-foreground tracking-wide">
              Athena
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-light">
              AI Investment Platform
            </p>
          </div>
          
          <SidebarGroupContent className="px-4">
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.url)}
                    isActive={location === item.url}
                    className={`
                      rounded-[28px] py-6 px-6
                      transition-all duration-300
                      ${location === item.url 
                        ? 'bg-primary text-primary-foreground' 
                        : 'glass glass-hover'}
                    `}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <div className="h-8" />
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="rounded-[28px] py-6 px-6 glass glass-hover transition-all duration-300"
                  data-testid="button-logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
