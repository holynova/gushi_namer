export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string
          user_id: string
          name: string
          family_name: string
          book: string
          author: string | null
          title: string
          sentence: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          family_name: string
          book: string
          author?: string | null
          title: string
          sentence: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          family_name?: string
          book?: string
          author?: string | null
          title?: string
          sentence?: string
          created_at?: string
        }
      }
    }
  }
}
