"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AvatarUploadField } from "@/components/shared";
import { usersApi } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { Role, Status, User } from "@/lib/types";
import { formatDate, roleBadgeClass, roleLabel } from "@/lib/utils-helpers";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2 } from "lucide-react";

const ROLE_OPTIONS: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "TEACHER",
  "STUDENT",
  "PARENT",
  "STAFF",
];

const STATUS_OPTIONS: Status[] = ["ACTIVE", "INACTIVE", "ARCHIVED", "DELETED"];

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [users, setUsers] = useState<User[]>([]);
  const [draft, setDraft] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "ADMIN" as Role,
    avatarUrl: "",
  });

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await usersApi.list({
        page: 1,
        limit: 50,
        search: search || undefined,
        role: role === "ALL" ? undefined : role,
        status: status === "ALL" ? undefined : status,
      });
      setUsers(response.data);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Foydalanuvchilar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function createUser() {
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.password.trim()) {
      toast.error("Ism, familiya va parol majburiy");
      return;
    }

    try {
      await usersApi.create({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim() || undefined,
        phone: draft.phone.trim() || undefined,
        password: draft.password,
        role: draft.role,
        avatarUrl: draft.avatarUrl.trim() || undefined,
      });
      toast.success("Foydalanuvchi yaratildi");
      setDraft({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "ADMIN",
        avatarUrl: "",
      });
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Foydalanuvchi yaratilmadi");
    }
  }

  async function softDeleteUser(id: string) {
    try {
      await usersApi.remove(id);
      toast.success("Foydalanuvchi delete qilindi");
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Delete amalga oshmadi");
    }
  }

  return (
    <DashboardLayout title="Foydalanuvchilar" description="Backend /users endpointlari bilan boshqaruv">
      <div className="space-y-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Yangi foydalanuvchi</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-7">
            <Input
              placeholder="Ism"
              value={draft.firstName}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, firstName: event.target.value }))
              }
            />
            <Input
              placeholder="Familiya"
              value={draft.lastName}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, lastName: event.target.value }))
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={draft.email}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <Input
              placeholder="Telefon"
              value={draft.phone}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
            <Input
              placeholder="Parol"
              type="password"
              value={draft.password}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, password: event.target.value }))
              }
            />
            <Select
              value={draft.role}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  role: (value ?? "ADMIN") as Role,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {roleLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="gap-2" onClick={createUser}>
              <Plus className="h-4 w-4" />
              Saqlash
            </Button>
            <div className="md:col-span-7">
              <AvatarUploadField
                value={draft.avatarUrl || undefined}
                onChange={(url) =>
                  setDraft((prev) => ({
                    ...prev,
                    avatarUrl: url ?? "",
                  }))
                }
                title="Avatar rasmi"
                hint="Ixtiyoriy: user profile rasmi Cloudinary ga yuklanadi"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-10"
                  placeholder="Qidirish: ism/email/telefon"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <Select value={role} onValueChange={(value) => setRole(value ?? "ALL")}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Role filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Barcha role</SelectItem>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {roleLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(value) => setStatus(value ?? "ACTIVE")}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Barcha status</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={loadUsers} disabled={loading}>
                Yangilash
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>FIO</TableHead>
                    <TableHead>Aloqa</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Yaratilgan</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        {user.email ?? user.phone ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={roleBadgeClass(user.role)}>{roleLabel(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "secondary" : "outline"}>
                          {user.status ?? (user.isActive ? "ACTIVE" : "INACTIVE")}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => softDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
