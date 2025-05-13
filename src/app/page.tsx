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
import { Loader2 } from "lucide-react";

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
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Redirecting to dashboard...
          </h2>
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
            {selectedNote && <NoteSidebar note={selectedNote} />}
          </div>
        </div>
      </div>
    </div>
  );
}
