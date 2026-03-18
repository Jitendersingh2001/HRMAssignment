import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ROUTES } from '../constants/routes';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Employees', href: ROUTES.EMPLOYEES, icon: Users },
    { name: 'Attendance', href: ROUTES.ATTENDANCE, icon: CalendarCheck },
  ];

  return (
    <div className="flex h-screen bg-background dark:bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 transform bg-sidebar border-r border-sidebar-border transition-all duration-300 lg:static lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className={cn(
          "flex shrink-0 h-16 items-center border-b border-border transition-all",
          isCollapsed ? "justify-center px-0" : "px-6"
        )}>
          {!isCollapsed ? (
            <h1 className="text-xl font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              HRMS LITE
            </h1>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
              HL
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-x-hidden overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) => cn(
                  "flex items-center rounded-lg text-sm font-medium transition-colors",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={cn("shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop Collapse Button */}
        <div className="hidden lg:flex p-4 border-t border-border">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center w-full rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer",
              isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2 justify-start"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-6 h-6" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-muted-foreground hover:bg-muted rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-4 text-lg font-semibold text-foreground">HRMS LITE</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex h-16 items-center justify-end border-b border-border bg-card px-6 gap-4">
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
