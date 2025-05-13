import { TagIcon, ClockIcon, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { useSession } from "next-auth/react";
import { useNotesStore } from "@/store/notes-store";
import { toast } from "sonner";

interface CreateNewNoteProps {
  onClose: () => void;
}

const CreateNewNote: React.FC<CreateNewNoteProps> = ({ onClose }) => {
  const { data: session } = useSession();
  const { createNote, createAndProcessTags } = useNotesStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNote = async () => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to create notes");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    try {
      setIsSaving(true);
      // Create the note first
      const newNote = await createNote(
        {
          title: title.trim(),
          content: content.trim(),
          is_archived: false,
        },
        session.accessToken
      );

      // If tags were added, process them
      if (tags.trim()) {
        await createAndProcessTags(newNote.id, tags, session.accessToken);
      }

      toast.success("Note created successfully");
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full px-6 py-5 flex flex-col gap-4">
      <input
        type="text"
        placeholder="Enter a title..."
        className="text-2xl font-bold placeholder:text-foreground focus:outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center gap-2">
          <div className="flex items-center gap-2 w-full max-w-[107px]">
            <TagIcon className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Tags</div>
          </div>
          <input
            type="text"
            placeholder="Add tags separated by commas (e.g. Work, Planning)"
            className="text-sm w-full px-2 py-0.5 focus:outline-border rounded-md"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div className="w-full flex items-center gap-2">
          <div className="flex items-center gap-2 w-full max-w-[115px]">
            <ClockIcon className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Last Edited</div>
          </div>
          <div className="text-sm text-muted-foreground">Not yet saved</div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-border" />
      <textarea
        placeholder="Start typing your note here..."
        className="w-full h-full focus:outline-none text-sm placeholder:text-foreground/70"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="w-full pt-4 border-t border-border flex items-center gap-2">
        <Button onClick={handleSaveNote} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Note"}
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          className="text-muted-foreground"
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreateNewNote;
