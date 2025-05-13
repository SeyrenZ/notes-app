"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/core/sidebar";
import Navbar from "@/components/core/navbar";
import NotesList from "@/components/core/note/notes-list";
import CreateNewNote from "@/components/core/note/create-new-note";
import { useState, useEffect } from "react";
import { useNotesStore } from "@/store/notes-store";
import NoteView from "@/components/core/note/note-view";
import { useRouter } from "next/navigation";
import NoteSidebar from "@/components/core/note/note-sidebar";
import { isValidSession } from "@/lib/auth-utils";

export default function Home() {
  const { data: session, status } = useSession();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const { selectedNote, showArchived, fetchNotes } = useNotesStore();
  const router = useRouter();
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Check if session token is valid
  useEffect(() => {
    if (status === "authenticated") {
      if (!isValidSession(session)) {
        // If session exists but token is invalid or missing
        signOut({ callbackUrl: "/login" });
      } else {
        setIsTokenChecked(true);
      }
    }
  }, [session, status]);

  // Close create note when a note is selected
  useEffect(() => {
    if (selectedNote) {
      setIsCreatingNote(false);
    }
  }, [selectedNote]);

  // Fetch notes when session is ready or archive status changes
  useEffect(() => {
    if (isTokenChecked && session?.accessToken) {
      fetchNotes(session.accessToken).catch((error) => {
        console.error("Error fetching notes:", error);
        if (error.message === "Authentication failed") {
          // Will be handled by the API service
        }
      });
    }
  }, [session, fetchNotes, showArchived, isTokenChecked]);

  if (status === "loading" || !isTokenChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex-col">
        <Navbar />
        <div className="flex-1">
          <div className="w-full h-[calc(100dvh-81px)] bg-background flex">
            <NotesList onCreateNote={() => setIsCreatingNote(true)} />
            {isCreatingNote && (
              <CreateNewNote onClose={() => setIsCreatingNote(false)} />
            )}
            {!isCreatingNote && selectedNote && (
              <NoteView note={selectedNote} />
            )}
            {!isCreatingNote && !selectedNote && (
              <div className="w-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <h3 className="text-xl font-semibold mb-2">
                    {showArchived ? "Archived Notes" : "Welcome to Notes App"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {showArchived
                      ? "Select an archived note from the sidebar to view it."
                      : "Select a note from the sidebar or create a new one to get started."}
                  </p>
                  {!showArchived && (
                    <Button onClick={() => setIsCreatingNote(true)}>
                      Create Your First Note
                    </Button>
                  )}
                </div>
              </div>
            )}
            {selectedNote ? (
              <NoteSidebar note={selectedNote} />
            ) : (
              <div className="w-full max-w-[290px] border-l border-border px-4 py-5"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
