import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StaffCard } from "@/components/ui/staff-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Staff } from "@shared/schema";

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  loginId: z.string().optional(),
  password: z.string().optional(),
}).refine((data) => {
  // If role is manager, require loginId and password
  if (data.role === "manager") {
    return data.loginId && data.loginId.length > 0 && data.password && data.password.length > 0;
  }
  return true;
}, {
  message: "Login ID and Password are required for managers",
  path: ["loginId"],
});

type StaffForm = z.infer<typeof staffSchema>;

export default function StaffManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const { data: staff = [], isLoading, error } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const form = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      role: "",
      loginId: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: StaffForm) => {
      return apiRequest("/api/staff", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Staff member added successfully",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("common.error"),
        description: "Failed to add staff member",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StaffForm }) => {
      return apiRequest(`/api/staff/${id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Staff member updated successfully",
      });
      form.reset();
      setIsDialogOpen(false);
      setEditingStaff(null);
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("common.error"),
        description: "Failed to update staff member",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting isActive to false
      return apiRequest(`/api/staff/${id}`, "PUT", { isActive: false });
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Staff member removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("common.error"),
        description: "Failed to remove staff member",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.reset({
      name: staff.name,
      phoneNumber: staff.phoneNumber || "",
      role: staff.role,
      loginId: staff.loginId || "",
      password: staff.password || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (staff: Staff) => {
    if (confirm(`Are you sure you want to remove ${staff.name}?`)) {
      deleteMutation.mutate(staff.id);
    }
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    form.reset({
      name: "",
      phoneNumber: "",
      role: "",
      loginId: "",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: StaffForm) => {
    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff.id, data });
    } else {
      mutation.mutate(data);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load staff data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg" data-testid="staff-title">
          {t("staff.title")}
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary text-white px-4 py-2 text-sm" 
              data-testid="button-add-staff"
              onClick={handleAddNew}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("staff.addStaff")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? "Edit Staff Member" : t("staff.addStaff")}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter staff name" {...field} data-testid="input-staff-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} data-testid="input-staff-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-staff-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="attendant">Attendant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Login credentials - only show for managers */}
                {form.watch("role") === "manager" && (
                  <>
                    <FormField
                      control={form.control}
                      name="loginId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Login ID (User ID)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter login ID for manager" {...field} data-testid="input-staff-login-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter password for manager" 
                              {...field} 
                              data-testid="input-staff-password" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                    data-testid="button-cancel-staff"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 bg-primary text-white"
                    data-testid="button-save-staff"
                  >
                    {mutation.isPending ? t("common.loading") : t("common.save")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No staff members added yet. Click "Add Staff" to get started.
            </AlertDescription>
          </Alert>
        ) : (
          staff
            .filter((member) => member.isActive) // Only show active staff
            .map((member) => (
              <StaffCard 
                key={member.id} 
                staffMember={member}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
        )}
      </div>
    </div>
  );
}
