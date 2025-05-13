import React, { useState } from "react";
import { Note } from "@/types/note";
import { Button } from "@/components/ui/button";
import {
  Edit2Icon,
  Trash2Icon,
  ArchiveIcon,
  ArchiveRestoreIcon,
} from "lucide-react";
import { useNotesStore } from "@/store/notes-store";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import DeleteDialog from "./dialog/delete-dialog";
import ArchiveDialog from "./dialog/archive-dialog";

interface NoteSidebarProps {
  note: Note;
}

const NoteSidebar: React.FC<NoteSidebarProps> = ({ note }) => {
  const { data: session } = useSession();
  const {
    deleteNote,
    selectNote,
    setIsEditing,
    isEditing,
    archiveNote,
    unarchiveNote,
    showArchived,
  } = useNotesStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(note.updated_at), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to delete notes");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteNote(note.id, session.accessToken);
      selectNote(null);
      toast.success("Note deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleArchiveToggle = async () => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to archive notes");
      return;
    }

    try {
      setIsArchiving(true);

      if (note.is_archived) {
        await unarchiveNote(note.id, session.accessToken);
        toast.success("Note unarchived successfully");
      } else {
        await archiveNote(note.id, session.accessToken);
        toast.success("Note archived successfully");
      }
      setShowArchiveDialog(false);
    } catch (error) {
      console.error("Failed to archive/unarchive note:", error);
      toast.error("Failed to change archive status. Please try again.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="w-full max-w-[290px] border-l border-border px-4 py-5 h-full flex flex-col gap-4">
      <div className="text-lg font-semibold">Note Actions</div>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-2 justify-start h-10"
          onClick={handleEdit}
          disabled={isEditing}
        >
          <Edit2Icon className="w-4 h-4" />
          <span>{isEditing ? "Currently Editing..." : "Edit Note"}</span>
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2 justify-start h-10"
          onClick={() => setShowArchiveDialog(true)}
          disabled={isArchiving || isEditing}
        >
          {note.is_archived ? (
            <>
              <ArchiveRestoreIcon className="w-4 h-4" />
              <span>{isArchiving ? "Unarchiving..." : "Unarchive Note"}</span>
            </>
          ) : (
            <>
              <ArchiveIcon className="w-4 h-4" />
              <span>{isArchiving ? "Archiving..." : "Archive Note"}</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2 justify-start h-10 border-destructive text-destructive hover:bg-destructive hover:text-background"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting || isEditing}
        >
          <Trash2Icon className="w-4 h-4" />
          <span>{isDeleting ? "Deleting..." : "Delete Note"}</span>
        </Button>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium mb-2">Note Information</div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div>
            Created:{" "}
            {formatDistanceToNow(new Date(note.created_at), {
              addSuffix: true,
            })}
          </div>
          <div>Last Updated: {formattedDate}</div>
          <div>Status: {note.is_archived ? "Archived" : "Not Archived"}</div>
        </div>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Tags</div>
          <div className="flex flex-wrap gap-1 text-sm">
            {note.tags.map((tag) => (
              <div
                key={tag.id}
                className="px-2 py-1 bg-accent rounded-md text-xs"
              >
                {tag.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />

      {/* Archive Confirmation Dialog */}
      <ArchiveDialog
        isOpen={showArchiveDialog}
        isArchiving={isArchiving}
        isArchived={note.is_archived}
        onClose={() => setShowArchiveDialog(false)}
        onConfirm={handleArchiveToggle}
      />
    </div>
  );
};

export default NoteSidebar;
