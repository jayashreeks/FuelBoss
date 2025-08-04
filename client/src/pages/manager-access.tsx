import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Users, Edit3, Trash2, UserCheck, UserX } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ManagerAccessPageProps {
  onBack: () => void;
}

const managerSchema = z.object({
  name: z.string().min(1, "Manager name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
});

type ManagerForm = z.infer<typeof managerSchema>;

export default function ManagerAccessPage({ onBack }: ManagerAccessPageProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<any>(null);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Filter staff to get only managers
  const managers = staff.filter((member: any) => member.role === "manager");

  const form = useForm<ManagerForm>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ManagerForm) => {
      const staffData = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        role: "manager"
      };
      return apiRequest("/api/staff", "POST", staffData);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("managerAccess.createSuccess"),
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ManagerForm }) => {
      const staffData = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        role: "manager"
      };
      return apiRequest(`/api/staff/${id}`, "PUT", staffData);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("managerAccess.updateSuccess"),
      });
      setIsDialogOpen(false);
      setEditingManager(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/staff/${id}`, "PUT", { isActive });
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("managerAccess.statusUpdateSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/staff/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("managerAccess.deleteSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ManagerForm) => {
    if (editingManager) {
      updateMutation.mutate({ id: editingManager.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (manager: any) => {
    setEditingManager(manager);
    form.reset({
      name: manager.name,
      email: manager.email || "",
      phoneNumber: manager.phoneNumber,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingManager(null);
    form.reset({
      name: "",
      email: "",
      phoneNumber: "",
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (manager: any) => {
    toggleStatusMutation.mutate({
      id: manager.id,
      isActive: !manager.isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-3"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold" data-testid="page-title">
            {t("menu.managerAccess")}
          </h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} data-testid="add-manager-button">
              <Plus className="h-4 w-4 mr-2" />
              {t("managerAccess.addManager")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingManager ? t("managerAccess.editManager") : t("managerAccess.addManager")}
              </DialogTitle>
              <DialogDescription>
                {editingManager ? t("managerAccess.editDescription") : t("managerAccess.addDescription")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("managerAccess.managerName")}</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  data-testid="input-manager-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("managerAccess.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  data-testid="input-manager-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t("managerAccess.phone")}</Label>
                <Input
                  id="phoneNumber"
                  {...form.register("phoneNumber")}
                  data-testid="input-manager-phone"
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>



              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                  data-testid="save-manager-button"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 
                    t("common.saving") : t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  data-testid="cancel-manager-button"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Managers List */}
      {managers.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("managerAccess.noManagers")}</h3>
            <p className="text-gray-600 mb-4">{t("managerAccess.noManagersDescription")}</p>
            <Button onClick={handleAddNew} data-testid="add-first-manager-button">
              <Plus className="h-4 w-4 mr-2" />
              {t("managerAccess.addFirstManager")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {managers.map((manager: any) => (
            <Card key={manager.id} data-testid={`manager-card-${manager.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {manager.isActive ? (
                        <UserCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <UserX className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium" data-testid={`manager-name-${manager.id}`}>
                        {manager.name}
                      </h3>
                      <p className="text-sm text-gray-600">{manager.phoneNumber}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        manager.isActive 
                          ? "text-green-700 bg-green-100" 
                          : "text-gray-700 bg-gray-100"
                      }`}>
                        {manager.isActive ? t("managerAccess.active") : t("managerAccess.inactive")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(manager)}
                        data-testid={`edit-manager-${manager.id}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(manager.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`delete-manager-${manager.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant={manager.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleStatus(manager)}
                      disabled={toggleStatusMutation.isPending}
                      data-testid={`toggle-status-${manager.id}`}
                    >
                      {manager.isActive ? t("managerAccess.deactivate") : t("managerAccess.activate")}
                    </Button>
                  </div>
                </div>


              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}