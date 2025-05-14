import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  LockIcon,
  LogOutIcon,
  SunIcon,
  TypeIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import React, { useState } from "react";
import LogoutDialog from "../note/dialog/logout-dialog";

const SettingsMenuItem = ({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="ghost"
      className="w-full flex items-center justify-start gap-2 h-[41px] group text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      {icon}
      <div>{title}</div>
      <ChevronRight className="w-4 h-4 ml-auto group-hover:visible invisible" />
    </Button>
  );
};

const SettingsList = () => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="w-full max-w-[290px] py-5 h-full border-r border-border flex flex-col">
      <div className="px-4 space-y-1">
        <SettingsMenuItem
          icon={<SunIcon className="w-4 h-4" />}
          title="Color Theme"
          onClick={() => {}}
        />
        <SettingsMenuItem
          icon={<TypeIcon className="w-4 h-4" />}
          title="Font Theme"
          onClick={() => {}}
        />
        <SettingsMenuItem
          icon={<LockIcon className="w-4 h-4" />}
          title="Change Password"
          onClick={() => {}}
        />
        <Separator />
        <SettingsMenuItem
          icon={<LogOutIcon className="w-4 h-4" />}
          title="Logout"
          onClick={() => setIsLogoutDialogOpen(true)}
        />
      </div>
      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default SettingsList;
