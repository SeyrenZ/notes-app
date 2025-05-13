export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  is_archived: boolean;
  theme_color: string;
  font_family: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  tags?: Tag[];
}

export interface NoteCreate {
  title: string;
  content: string;
  is_archived?: boolean;
  theme_color?: string;
  font_family?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  is_archived?: boolean;
  theme_color?: string;
  font_family?: string;
}

export interface TagCreate {
  name: string;
}
