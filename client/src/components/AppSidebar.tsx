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
      <SidebarContent className="bg-black/40 backdrop-blur-xl">
        <SidebarGroup>
          <div className="px-6 py-8">
            <h1 className="text-2xl font-extralight text-foreground tracking-wide">
              Athena
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              AI Investment Platform
            </p>
          </div>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.url)}
                    isActive={location === item.url}
                    className="hover-elevate active-elevate-2"
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem className="mt-8">
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
