import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { mockApi } from "../services/mockData";
import { formatDateTime } from "../utils/helpers";
import type { UserData } from "../types";
import { Search, Ban, CheckCircle } from "lucide-react";
import { useToast } from "../components/ui/use-toast";

export function UsersManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserData["role"] | "ALL">("ALL");
    const { toast } = useToast();

    useEffect(() => {
        loadUsers();
    }, [roleFilter]);

    async function loadUsers() {
        setLoading(true);
        try {
            const params = {
                role: roleFilter === "ALL" ? undefined : roleFilter,
            };
            const response = await mockApi.getUsers(params);
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredUsers = users.filter((user) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    });

    const toggleSuspend = async (user: UserData) => {
        try {
            await mockApi.suspendUser(user.id, !user.suspended);
            toast({
                title: user.suspended ? "User Suspended" : "User Activated",
                description: `${user.name} has been ${user.suspended ? "suspended" : "activated"}.`,
            });
            loadUsers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-slate-500">Manage platform users by role</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>{filteredUsers.length} users</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
                        <TabsList>
                            <TabsTrigger value="ALL">All</TabsTrigger>
                            <TabsTrigger value="CUSTOMER">Customers</TabsTrigger>
                            <TabsTrigger value="RESTAURANT">Restaurants</TabsTrigger>
                            <TabsTrigger value="RIDER">Riders</TabsTrigger>
                            <TabsTrigger value="ADMIN">Admins</TabsTrigger>
                        </TabsList>

                        <TabsContent value={roleFilter} className="mt-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <p className="text-slate-500">Loading...</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Orders</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{user.role}</Badge>
                                                </TableCell>
                                                <TableCell>{user.ordersCount || 0}</TableCell>
                                                <TableCell>
                                                    {user.suspended ? (
                                                        <Badge variant="destructive">Suspended</Badge>
                                                    ) : (
                                                        <Badge variant="success">Active</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-slate-500">
                                                    {formatDateTime(user.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => toggleSuspend(user)}
                                                    >
                                                        {user.suspended ? (
                                                            <>
                                                                <CheckCircle className="mr-1 h-4 w-4" />
                                                                Activate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Ban className="mr-1 h-4 w-4" />
                                                                Suspend
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
