export type TemplateType = "fish" | "bird" | "pagoda" | "halong";

export type TabType = "color-scan" | "ar-studio" | "games" | "gallery3d" | "teacher-ai";

export interface StudentSubmission {
  id: string;
  name: string;
  className: string;
  artworkType: string;
  timeAgo: string;
  sampleImg: string; // fallback base64 or pre-set graphic
  analyzed: boolean;
  aiComment?: string;
}

export interface SavedArtwork {
  dataUrl: string;
  template: TemplateType;
  title: string;
  timestamp: string;
}
