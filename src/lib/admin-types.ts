export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  instructor: string;
  thumbnail_url: string | null;
  level: string;
  estimated_duration: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content_type: string;
  duration: string | null;
  sort_order: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseMaterial {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}
