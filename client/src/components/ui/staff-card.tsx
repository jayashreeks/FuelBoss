import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, User, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Staff } from "@shared/schema";

interface StaffCardProps {
  staffMember: Staff;
  onEdit?: (staff: Staff) => void;
  onDelete?: (staff: Staff) => void;
}

export function StaffCard({ staffMember, onEdit, onDelete }: StaffCardProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="shadow-sm border border-gray-200" data-testid={`staff-card-${staffMember.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm" data-testid={`staff-name-${staffMember.id}`}>
                {staffMember.name}
              </p>
              <p className="text-xs text-gray-500" data-testid={`staff-role-${staffMember.id}`}>
                {staffMember.role}
              </p>
              {staffMember.phoneNumber && (
                <p className="text-xs text-gray-500" data-testid={`staff-phone-${staffMember.id}`}>
                  {staffMember.phoneNumber}
                </p>
              )}
              {staffMember.role === "manager" && staffMember.loginId && (
                <div className="space-y-1">
                  <p className="text-xs text-blue-600 font-medium" data-testid={`staff-login-${staffMember.id}`}>
                    Login ID: {staffMember.loginId}
                  </p>
                  {staffMember.password && (
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-blue-600 font-medium" data-testid={`staff-password-${staffMember.id}`}>
                        Password: {showPassword ? staffMember.password : "••••••••"}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid={`toggle-password-${staffMember.id}`}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={staffMember.isActive ? "default" : "secondary"}
              className="text-xs"
              data-testid={`staff-status-${staffMember.id}`}
            >
              {staffMember.isActive ? t("staff.active") : t("staff.inactive")}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-400 h-8 w-8"
                  data-testid={`staff-menu-${staffMember.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onEdit?.(staffMember)}
                  data-testid={`edit-staff-${staffMember.id}`}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(staffMember)}
                  className="text-red-600"
                  data-testid={`delete-staff-${staffMember.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
