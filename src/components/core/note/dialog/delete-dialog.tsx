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
import { Trash2Icon } from "lucide-react";

interface DeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0" closeButton={false}>
        <div className="flex items-start gap-4 px-5 pt-5">
          <div className="flex items-center justify-center min-w-10 min-h-10 bg-accent rounded-md">
            <Trash2Icon className="w-6 h-6" />
          </div>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="px-5 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
