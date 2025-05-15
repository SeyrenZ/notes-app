import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";

interface ArchiveDialogProps {
  isOpen: boolean;
  isArchiving: boolean;
  isArchived: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const ArchiveDialog: React.FC<ArchiveDialogProps> = ({
  isOpen,
  isArchiving,
  isArchived,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0" closeButton={false}>
        <div className="flex items-start gap-4 px-5 pt-5">
          <div className="flex items-center justify-center min-w-10 min-h-10 bg-accent dark:bg-[#717784] rounded-md">
            {isArchived ? (
              <ArchiveRestoreIcon className="w-6 h-6" />
            ) : (
              <ArchiveIcon className="w-6 h-6" />
            )}
          </div>
          <DialogHeader>
            <DialogTitle>
              {isArchived ? "Unarchive Note" : "Archive Note"}
            </DialogTitle>
            <DialogDescription>
              {isArchived
                ? "Are you sure you want to restore this note to your active notes?"
                : "Are you sure you want to archive this note? You can find it in the Archived Notes section and restore it anytime."}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="px-5 py-4 border-t border-border dark:border-[#525866]">
          <Button
            variant="outline"
            className="dark:bg-[#717784]"
            onClick={onClose}
            disabled={isArchiving}
          >
            Cancel
          </Button>
          <Button variant="default" onClick={onConfirm} disabled={isArchiving}>
            {isArchiving
              ? isArchived
                ? "Unarchiving..."
                : "Archiving..."
              : isArchived
              ? "Unarchive Note"
              : "Archive Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveDialog;
