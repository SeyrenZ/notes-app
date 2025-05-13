import React, { useEffect, useState, useMemo } from "react";
import { Button } from "../../ui/button";
import { PlusIcon, TagIcon, X } from "lucide-react";
import NoteCard from "./note-card";
import DraftNoteCard from "./draft-note-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotesStore } from "@/store/notes-store";
import { useSession } from "next-auth/react";
import { Note } from "@/types/note";
import { Badge } from "@/components/ui/badge";
import { isValidSession } from "@/lib/auth-utils";

interface NotesListProps {
  onCreateNote: () => void;
  draftNote?: Partial<Note>;
  isCreatingNote: boolean;
}

const EmptyNoteList = ({
  isArchived,
  isTagFiltered,
}: {
  isArchived: boolean;
  isTagFiltered: boolean;
}) => {
  return (
    <div className="w-full h-fit flex items-center justify-center bg-accent rounded-md border border-border">
      <div className="text-sm px-4 py-2">
        {isTagFiltered
          ? "No notes with this tag found."
          : isArchived
          ? "You don't have any archived notes."
          : "You don't have any notes yet. Start a new note to capture your thoughts and ideas."}
      </div>
    </div>
  );
};

const NotesList: React.FC<NotesListProps> = ({
  onCreateNote,
  draftNote,
  isCreatingNote,
}) => {
  const { data: session } = useSession();
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const {
    notes,
    fetchNotes,
    isLoading,
    error,
    selectNote,
    showArchived,
    selectedTag,
    selectTag,
  } = useNotesStore();

  useEffect(() => {
    const loadNotes = async () => {
      if (!session || !isValidSession(session)) {
        return;
      }

      try {
        setIsLoadingLocal(true);
        if (session.accessToken) {
          await fetchNotes(session.accessToken);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        // Authentication errors are already handled in the API service
      } finally {
        setIsLoadingLocal(false);
      }
    };

    loadNotes();
  }, [session, fetchNotes, showArchived]);

  const handleNoteClick = (note: Note) => {
    selectNote(note);
  };

  const handleClearTagFilter = () => {
    selectTag(null);
  };

  const isLoadingNotes = isLoading || isLoadingLocal;

  // Memoize the draft note card to prevent unnecessary re-renders
  const draftNoteCard = useMemo(() => {
    if (isCreatingNote && draftNote) {
      return (
        <div className="px-2">
          <DraftNoteCard note={draftNote} onClick={onCreateNote} />
        </div>
      );
    }
    return null;
  }, [isCreatingNote, draftNote, onCreateNote]);

  // Memoize the note cards to prevent unnecessary re-renders
  const noteCards = useMemo(() => {
    if (!isLoadingNotes && !error && notes.length > 0) {
      return notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onClick={() => handleNoteClick(note)}
        />
      ));
    }
    return null;
  }, [notes, isLoadingNotes, error, handleNoteClick]);

  return (
    <div className="w-full max-w-[290px] py-5 h-full border-r border-border flex flex-col">
      <div className="px-4">
        <Button
          className="w-full items-center gap-2 h-[41px]"
          onClick={onCreateNote}
          disabled={isLoadingNotes || isCreatingNote}
        >
          <PlusIcon className="w-4 h-4" />
          <div>{isLoadingNotes ? "Loading..." : "Create New Note"}</div>
        </Button>

        {showArchived && (
          <div className="text-sm text-muted-foreground mt-4">
            All your archived notes are stored here. You can restore or delete
            them anytime.
          </div>
        )}

        {selectedTag && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Filtered by tag:</span>
              <Badge variant="secondary">{selectedTag.name}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearTagFilter}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive text-center px-4 mt-4">
          {error}
        </div>
      )}

      {isLoadingNotes && (
        <div className="flex items-center justify-center h-20 mt-4">
          <div className="text-sm text-muted-foreground">Loading notes...</div>
        </div>
      )}

      {!isLoadingNotes && !error && notes.length === 0 && !isCreatingNote && (
        <div className="px-4 mt-4">
          <EmptyNoteList
            isArchived={showArchived}
            isTagFiltered={!!selectedTag}
          />
        </div>
      )}

      <ScrollArea className="flex-1 px-2 mt-2">
        {draftNoteCard}
        {noteCards}
      </ScrollArea>
    </div>
  );
};

export default NotesList;
