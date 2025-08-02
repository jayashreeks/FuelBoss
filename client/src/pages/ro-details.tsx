import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, MapPin, Phone, Mail, Building } from "lucide-react";

interface RODetailsPageProps {
  onBack: () => void;
}

export default function RODetailsPage({ onBack }: RODetailsPageProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: retailOutlet, isLoading } = useQuery({
    queryKey: ["/api/retail-outlet"],
  });

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
    licenseNumber: "",
    gstNumber: "",
  });

  // Update form data when retail outlet data is loaded
  useState(() => {
    if (retailOutlet) {
      setFormData({
        name: retailOutlet.name || "",
        address: retailOutlet.address || "",
        contactNumber: retailOutlet.contactNumber || "",
        email: retailOutlet.email || "",
        licenseNumber: retailOutlet.licenseNumber || "",
        gstNumber: retailOutlet.gstNumber || "",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/retail-outlet/${retailOutlet.id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("roDetails.updateSuccess"),
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/retail-outlet"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (retailOutlet) {
      setFormData({
        name: retailOutlet.name || "",
        address: retailOutlet.address || "",
        contactNumber: retailOutlet.contactNumber || "",
        email: retailOutlet.email || "",
        licenseNumber: retailOutlet.licenseNumber || "",
        gstNumber: retailOutlet.gstNumber || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-6">
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
          {t("menu.roDetails")}
        </h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-primary" />
            {t("roDetails.title")}
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              data-testid="edit-button"
            >
              {t("common.edit")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("roDetails.name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("roDetails.address")}</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                rows={3}
                data-testid="input-address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">{t("roDetails.contactNumber")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                    data-testid="input-contact"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("roDetails.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                    data-testid="input-email"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">{t("roDetails.licenseNumber")}</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  disabled={!isEditing}
                  data-testid="input-license"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">{t("roDetails.gstNumber")}</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  disabled={!isEditing}
                  data-testid="input-gst"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                  data-testid="save-button"
                >
                  {updateMutation.isPending ? t("common.saving") : t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  data-testid="cancel-button"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}