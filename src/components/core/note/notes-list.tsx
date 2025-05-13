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

const EmptyNoteList = () => {
  return (
    <div className="w-full h-fit flex items-center justify-center bg-accent rounded-md border border-border">
      <div className="text-sm px-4 py-2">
        You don't have any notes yet. Start a new note to capture your thoughts
        and ideas.
      </div>
    </div>
  );
};

const NotesList: React.FC<NotesListProps> = ({ onCreateNote }) => {
  const { data: session } = useSession();
  const { notes, fetchNotes, isLoading, error, selectNote } = useNotesStore();

  useEffect(() => {
    if (session?.accessToken) {
      fetchNotes(session.accessToken);
    }
  }, [session, fetchNotes]);

  const handleNoteClick = (note: Note) => {
    selectNote(note);
  };

  return (
    <div className="w-full max-w-[25%] min-w-[290px] pl-8 pr-4 py-5 h-full border-r border-border flex flex-col gap-4">
      <Button
        className="w-full items-center gap-2 h-[41px]"
        onClick={onCreateNote}
      >
        <PlusIcon className="w-4 h-4" />
        <div>Create New Note</div>
      </Button>

      {isLoading && <div className="text-sm text-center">Loading notes...</div>}

      {error && (
        <div className="text-sm text-destructive text-center">{error}</div>
      )}

      {!isLoading && !error && notes.length === 0 && <EmptyNoteList />}

      {!isLoading && !error && notes.length > 0 && (
        <ScrollArea className="flex flex-col gap-2 overflow-hidden">
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
