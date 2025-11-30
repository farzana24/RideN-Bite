import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toaster } from "../ui/toaster";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [darkMode, setDarkMode] = useState(() =>
        document.documentElement.classList.contains("dark")
    );

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
        setDarkMode(!darkMode);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-900">
                    {children}
                </main>
            </div>
            <Toaster />
        </div>
    );
}

// Simple cn utility for this file
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
