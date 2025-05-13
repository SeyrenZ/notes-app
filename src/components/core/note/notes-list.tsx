import React, { useEffect } from "react";
import { Button } from "../../ui/button";
import { PlusIcon } from "lucide-react";
import NoteCard from "./note-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotesStore } from "@/store/notes-store";
import { useSession } from "next-auth/react";
import { Note } from "@/types/note";

interface NotesListProps {
  onCreateNote: () => void;
}

const EmptyNoteList = ({ isArchived }: { isArchived: boolean }) => {
  return (
    <div className="w-full h-fit flex items-center justify-center bg-accent rounded-md border border-border">
      <div className="text-sm px-4 py-2">
        {isArchived
          ? "You don't have any archived notes."
          : "You don't have any notes yet. Start a new note to capture your thoughts and ideas."}
      </div>
    </div>
  );
};

const NotesList: React.FC<NotesListProps> = ({ onCreateNote }) => {
  const { data: session } = useSession();
  const { notes, fetchNotes, isLoading, error, selectNote, showArchived } =
    useNotesStore();

  useEffect(() => {
    if (session?.accessToken) {
      fetchNotes(session.accessToken);
    }
  }, [session, fetchNotes, showArchived]); // Refetch when showArchived changes

  const handleNoteClick = (note: Note) => {
    selectNote(note);
  };

  return (
    <div className="w-full max-w-[25%] min-w-[290px]  py-5 h-full border-r border-border flex flex-col">
      <div className="px-4">
        <Button
          className="w-full items-center gap-2 h-[41px]"
          onClick={onCreateNote}
        >
          <PlusIcon className="w-4 h-4" />
          <div>Create New Note</div>
        </Button>
        {showArchived && (
          <div className="text-sm text-muted-foreground mt-4">
            All your archived notes are stored here. You can restore or delete
            them anytime.
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive text-center">{error}</div>
      )}

      <div className="px-4">
        {!isLoading && !error && notes.length === 0 && (
          <EmptyNoteList isArchived={showArchived} />
        )}
      </div>

      {!isLoading && !error && notes.length > 0 && (
        <ScrollArea className="flex flex-col overflow-hidden px-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => handleNoteClick(note)}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default NotesList;
