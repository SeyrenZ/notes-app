"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps, toast as sonnerToast } from "sonner";
import CheckCircleIcon from "../icon/check-circle";
import { X } from "lucide-react";
import { useNotesStore } from "@/store/notes-store";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: true,
      }}
      closeButton
      {...props}
    />
  );
};

// Save Note Toast
const saveNote = () => {
  sonnerToast.custom((t) => (
    <div className="sm:w-[390px] bg-background flex items-center gap-3 border border-border rounded-md p-4">
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
      <div className="flex-1 text-xs">Note saved successfully!</div>
      <button
        onClick={() => sonnerToast.dismiss(t)}
        className="text-foreground/50 hover:text-foreground hover:cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ));
};

// Archive Note Toast with View Archived Notes button
const archiveNote = () => {
  sonnerToast.custom((t) => {
    // Get access to the notes store inside the component
    const setShowArchived = useNotesStore.getState().setShowArchived;

    return (
      <div className="sm:w-[390px] bg-background flex items-center gap-3 border border-border rounded-md p-4">
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
        <div className="flex-1 text-xs">Note archived.</div>
        <button
          onClick={() => {
            setShowArchived(true);
            sonnerToast.dismiss(t);
          }}
          className="text-xs text-foreground underline mr-2 hover:cursor-pointer"
        >
          Archived Notes
        </button>
        <button
          onClick={() => sonnerToast.dismiss(t)}
          className="text-foreground/50 hover:text-foreground hover:cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  });
};

// Delete Note Toast
const deleteNote = () => {
  sonnerToast.custom((t) => (
    <div className="sm:w-[390px] bg-background flex items-center gap-3 border border-border rounded-md p-4">
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
      <div className="flex-1 text-xs">Note permanently deleted.</div>
      <button
        onClick={() => sonnerToast.dismiss(t)}
        className="text-foreground/50 hover:text-foreground hover:cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ));
};

// Restore Note Toast with View All Notes button
const restoreNote = () => {
  sonnerToast.custom((t) => {
    // Get access to the notes store inside the component
    const setShowArchived = useNotesStore.getState().setShowArchived;

    return (
      <div className="sm:w-[390px] bg-background flex items-center gap-3 border border-border rounded-md p-4">
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
        <div className="flex-1 text-xs">Note restored to active notes.</div>
        <button
          onClick={() => {
            setShowArchived(false);
            sonnerToast.dismiss(t);
          }}
          className="text-foreground text-xs underline mr-2 hover:cursor-pointer"
        >
          All Notes
        </button>
        <button
          onClick={() => sonnerToast.dismiss(t)}
          className="text-foreground/50 hover:text-foreground hover:cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  });
};

// Update Settings Toast
const updateSettings = () => {
  sonnerToast.custom((t) => (
    <div className="sm:w-[390px] bg-background flex items-center gap-3 border border-border rounded-md p-4">
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
      <div className="flex-1 text-xs">Settings updated successfully!</div>
      <button
        onClick={() => sonnerToast.dismiss(t)}
        className="text-foreground/50 hover:text-foreground hover:cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ));
};

// Change Password Toast
const changePassword = () => {
  sonnerToast.custom((t) => (
    <div className="sm:w-[390px] bg-background flex items-center gap-3 border border-border rounded-md p-4">
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
      <div className="flex-1 text-xs">Password changed successfully!</div>
      <button
        onClick={() => sonnerToast.dismiss(t)}
        className="text-foreground/50 hover:text-foreground hover:cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ));
};

// Add Tag Toast
const addTag = () => {
  sonnerToast.custom((t) => (
    <div className="sm:w-[390px] bg-background flex items-center gap-3 border border-border rounded-md p-4">
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
      <div className="flex-1 text-xs">Tag added successfully!</div>
      <button
        onClick={() => sonnerToast.dismiss(t)}
        className="text-foreground/50 hover:text-foreground hover:cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ));
};

// Remove Tag Toast
const removeTag = () => {
  sonnerToast.custom((t) => (
    <div className="sm:w-[390px] bg-background flex items-center gap-3 border border-border rounded-md p-4">
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
      <div className="flex-1 text-xs">Tag removed successfully!</div>
      <button
        onClick={() => sonnerToast.dismiss(t)}
        className="text-foreground/50 hover:text-foreground hover:cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ));
};

// Custom toast object with all specialized toast functions
const toast = {
  ...sonnerToast,
  saveNote,
  archiveNote,
  deleteNote,
  restoreNote,
  updateSettings,
  changePassword,
  addTag,
  removeTag,
};

export { Toaster, toast };
