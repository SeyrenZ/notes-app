"use client";

import { useSession, signOut } from "next-auth/react";
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
import { Note } from "@/types/note";
import SettingsList, {
  SettingType,
} from "@/components/core/settings/settings-list";
import ColorThemeSetting from "@/components/core/settings/color-theme-setting";
import FontThemeSetting from "@/components/core/settings/font-theme-setting";
import ChangePasswordSetting from "@/components/core/settings/change-password-setting";
import { useUserStore } from "@/store/user-store";

export default function Home() {
  const { data: session, status } = useSession();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [draftNote, setDraftNote] = useState<Partial<Note> | undefined>(
    undefined
  );
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSetting, setSelectedSetting] =
    useState<SettingType>("color-theme");
  const { selectedNote, showArchived, fetchNotes } = useNotesStore();
  const { fetchUserInfo } = useUserStore();
  const router = useRouter();
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Check if session token is valid and fetch user information
  useEffect(() => {
    if (status === "authenticated") {
      if (!isValidSession(session)) {
        // If session exists but token is invalid or missing
        signOut({ callbackUrl: "/login" });
      } else {
        setIsTokenChecked(true);
        // Fetch user information for settings
        if (session?.accessToken) {
          fetchUserInfo(session.accessToken);
        }
      }
    }
  }, [session, status, fetchUserInfo]);

  // Close create note when a note is selected
  useEffect(() => {
    if (selectedNote) {
      setIsCreatingNote(false);
      setDraftNote(undefined);
      setShowSettings(false);
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

  const handleCreateNoteClick = () => {
    setIsCreatingNote(true);
    setShowSettings(false);
    if (!draftNote) {
      setDraftNote({
        title: "Untitled Note",
        content: "",
        updated_at: new Date().toISOString(),
      });
    }
  };

  const handleDraftChange = (updatedDraft: Partial<Note>) => {
    // Use functional update to avoid potential stale state references
    setDraftNote(updatedDraft);
  };

  const handleCloseCreateNote = () => {
    setIsCreatingNote(false);
    setDraftNote(undefined);
  };

  const handleToggleSettings = (show: boolean) => {
    setShowSettings(show);
    if (show) {
      setIsCreatingNote(false);
    } else {
      setSelectedSetting(null);
    }
  };

  const handleSelectSetting = (setting: SettingType) => {
    setSelectedSetting(setting);
  };

  // Render the appropriate settings content based on the selected setting
  const renderSettingsContent = () => {
    switch (selectedSetting) {
      case "color-theme":
        return <ColorThemeSetting />;
      case "font-theme":
        return <FontThemeSetting />;
      case "change-password":
        return <ChangePasswordSetting />;
      default:
        return <ColorThemeSetting />;
    }
  };

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
      <Sidebar
        onSettingsClose={() => setShowSettings(false)}
        showSettings={showSettings}
      />
      <div className="flex-1 flex-col">
        <Navbar
          onToggleSettings={handleToggleSettings}
          showSettings={showSettings}
        />
        <div className="flex-1">
          <div className="w-full h-[calc(100dvh-81px)] bg-background flex">
            {showSettings ? (
              <>
                <SettingsList
                  onSelectSetting={handleSelectSetting}
                  selectedSetting={selectedSetting}
                />
                {renderSettingsContent()}
              </>
            ) : (
              <NotesList
                onCreateNote={handleCreateNoteClick}
                draftNote={draftNote}
                isCreatingNote={isCreatingNote}
              />
            )}
            {isCreatingNote && !showSettings && (
              <CreateNewNote
                onClose={handleCloseCreateNote}
                onDraftChange={handleDraftChange}
              />
            )}
            {!isCreatingNote && !showSettings && selectedNote && (
              <NoteView note={selectedNote} />
            )}
            {selectedNote && !showSettings && (
              <NoteSidebar note={selectedNote} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
