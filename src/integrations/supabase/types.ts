export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_data: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          campaign_name: string | null
          comparison_period: string | null
          conversion_rate: number | null
          created_at: string | null
          data_type: string
          date_range_end: string | null
          date_range_start: string | null
          dimensions: Json | null
          engagement_rate: number | null
          goal_completions: number | null
          id: string
          metric_name: string
          metric_value: number | null
          new_users_percentage: number | null
          pages_per_session: number | null
          period_type: string | null
          provider: string
          returning_users_percentage: number | null
          traffic_medium: string | null
          traffic_source: string | null
          user_id: string | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          campaign_name?: string | null
          comparison_period?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          data_type: string
          date_range_end?: string | null
          date_range_start?: string | null
          dimensions?: Json | null
          engagement_rate?: number | null
          goal_completions?: number | null
          id?: string
          metric_name: string
          metric_value?: number | null
          new_users_percentage?: number | null
          pages_per_session?: number | null
          period_type?: string | null
          provider: string
          returning_users_percentage?: number | null
          traffic_medium?: string | null
          traffic_source?: string | null
          user_id?: string | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          campaign_name?: string | null
          comparison_period?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          data_type?: string
          date_range_end?: string | null
          date_range_start?: string | null
          dimensions?: Json | null
          engagement_rate?: number | null
          goal_completions?: number | null
          id?: string
          metric_name?: string
          metric_value?: number | null
          new_users_percentage?: number | null
          pages_per_session?: number | null
          period_type?: string | null
          provider?: string
          returning_users_percentage?: number | null
          traffic_medium?: string | null
          traffic_source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_connections: {
        Row: {
          access_token: string
          configuration: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          configuration?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          configuration?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_article_tags: {
        Row: {
          article_id: string | null
          id: string
          tag_id: string | null
        }
        Insert: {
          article_id?: string | null
          id?: string
          tag_id?: string | null
        }
        Update: {
          article_id?: string | null
          id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          title?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_analytics: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          entrances: number | null
          exit_page: string | null
          exits: number | null
          id: string
          landing_page: string | null
          page_path: string | null
          page_title: string | null
          page_views: number | null
          unique_page_views: number | null
          user_id: string | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          entrances?: number | null
          exit_page?: string | null
          exits?: number | null
          id?: string
          landing_page?: string | null
          page_path?: string | null
          page_title?: string | null
          page_views?: number | null
          unique_page_views?: number | null
          user_id?: string | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          entrances?: number | null
          exit_page?: string | null
          exits?: number | null
          id?: string
          landing_page?: string | null
          page_path?: string | null
          page_title?: string | null
          page_views?: number | null
          unique_page_views?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      device_analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          browser: string | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          device_category: string
          id: string
          operating_system: string | null
          page_views: number | null
          sessions: number | null
          user_id: string | null
          users: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          browser?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          device_category: string
          id?: string
          operating_system?: string | null
          page_views?: number | null
          sessions?: number | null
          user_id?: string | null
          users?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          browser?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          device_category?: string
          id?: string
          operating_system?: string | null
          page_views?: number | null
          sessions?: number | null
          user_id?: string | null
          users?: number | null
        }
        Relationships: []
      }
      geographic_analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          city: string | null
          country: string
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          id: string
          page_views: number | null
          region: string | null
          sessions: number | null
          user_id: string | null
          users: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          city?: string | null
          country: string
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          page_views?: number | null
          region?: string | null
          sessions?: number | null
          user_id?: string | null
          users?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          city?: string | null
          country?: string
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          page_views?: number | null
          region?: string | null
          sessions?: number | null
          user_id?: string | null
          users?: number | null
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          batch_id: string
          created_at: string | null
          id: string
          import_type: string
          metadata: Json | null
          products_count: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          id?: string
          import_type: string
          metadata?: Json | null
          products_count?: number | null
          status: string
          user_id?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          id?: string
          import_type?: string
          metadata?: Json | null
          products_count?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      instagram_account_insights: {
        Row: {
          created_at: string
          date_range_end: string
          date_range_start: string
          id: string
          metric_name: string
          metric_value: number
          period: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_range_end: string
          date_range_start: string
          id?: string
          metric_name: string
          metric_value?: number
          period: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_range_end?: string
          date_range_start?: string
          id?: string
          metric_name?: string
          metric_value?: number
          period?: string
          user_id?: string
        }
        Relationships: []
      }
      instagram_audience: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          recorded_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: number
          recorded_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_date?: string
          user_id?: string
        }
        Relationships: []
      }
      instagram_demographics: {
        Row: {
          count: number | null
          created_at: string
          demographic_type: string
          demographic_value: string
          id: string
          percentage: number | null
          recorded_date: string
          user_id: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          demographic_type: string
          demographic_value: string
          id?: string
          percentage?: number | null
          recorded_date?: string
          user_id: string
        }
        Update: {
          count?: number | null
          created_at?: string
          demographic_type?: string
          demographic_value?: string
          id?: string
          percentage?: number | null
          recorded_date?: string
          user_id?: string
        }
        Relationships: []
      }
      instagram_insights: {
        Row: {
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          id: string
          instagram_post_id: string | null
          metric_name: string
          metric_value: number
          period: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          instagram_post_id?: string | null
          metric_name: string
          metric_value?: number
          period?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          instagram_post_id?: string | null
          metric_name?: string
          metric_value?: number
          period?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_insights_instagram_post_id_fkey"
            columns: ["instagram_post_id"]
            isOneToOne: false
            referencedRelation: "instagram_posts"
            referencedColumns: ["instagram_post_id"]
          },
        ]
      }
      instagram_posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          instagram_post_id: string
          media_type: string
          media_url: string | null
          permalink: string | null
          timestamp: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          instagram_post_id: string
          media_type: string
          media_url?: string | null
          permalink?: string | null
          timestamp?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          instagram_post_id?: string
          media_type?: string
          media_url?: string | null
          permalink?: string | null
          timestamp?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      instagram_stories: {
        Row: {
          created_at: string
          exits: number | null
          id: string
          impressions: number | null
          instagram_story_id: string
          media_type: string
          media_url: string | null
          reach: number | null
          replies: number | null
          timestamp: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exits?: number | null
          id?: string
          impressions?: number | null
          instagram_story_id: string
          media_type: string
          media_url?: string | null
          reach?: number | null
          replies?: number | null
          timestamp?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exits?: number | null
          id?: string
          impressions?: number | null
          instagram_story_id?: string
          media_type?: string
          media_url?: string | null
          reach?: number | null
          replies?: number | null
          timestamp?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ocr_scans: {
        Row: {
          analyzed: boolean | null
          created_at: string | null
          extracted_text: string | null
          id: string
          image_url: string | null
          product_name: string | null
          user_id: string | null
        }
        Insert: {
          analyzed?: boolean | null
          created_at?: string | null
          extracted_text?: string | null
          id?: string
          image_url?: string | null
          product_name?: string | null
          user_id?: string | null
        }
        Update: {
          analyzed?: boolean | null
          created_at?: string | null
          extracted_text?: string | null
          id?: string
          image_url?: string | null
          product_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_performance_metrics: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          comparison_period: string | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          entrances: number | null
          exit_rate: number | null
          id: string
          page_path: string
          page_title: string | null
          page_views: number | null
          period_type: string | null
          unique_page_views: number | null
          user_id: string | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          comparison_period?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          entrances?: number | null
          exit_rate?: number | null
          id?: string
          page_path: string
          page_title?: string | null
          page_views?: number | null
          period_type?: string | null
          unique_page_views?: number | null
          user_id?: string | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          comparison_period?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          entrances?: number | null
          exit_rate?: number | null
          id?: string
          page_path?: string
          page_title?: string | null
          page_views?: number | null
          period_type?: string | null
          unique_page_views?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_cache: {
        Row: {
          barcode: string
          brands: string | null
          categories: string | null
          cleaned_ingredients: Json | null
          confidence_score: number | null
          countries_tags: Json | null
          created_at: string | null
          has_english: boolean | null
          id: string
          image_ingredients_url: string | null
          image_url: string | null
          import_batch_id: string | null
          ingredients_text: string | null
          is_uk_product: boolean | null
          languages_tags: Json | null
          last_fetched: string | null
          product_name: string | null
          safety_analyzed: boolean | null
          safety_rating: string | null
          search_count: number | null
          unsafe_ingredient_list: string[] | null
        }
        Insert: {
          barcode: string
          brands?: string | null
          categories?: string | null
          cleaned_ingredients?: Json | null
          confidence_score?: number | null
          countries_tags?: Json | null
          created_at?: string | null
          has_english?: boolean | null
          id?: string
          image_ingredients_url?: string | null
          image_url?: string | null
          import_batch_id?: string | null
          ingredients_text?: string | null
          is_uk_product?: boolean | null
          languages_tags?: Json | null
          last_fetched?: string | null
          product_name?: string | null
          safety_analyzed?: boolean | null
          safety_rating?: string | null
          search_count?: number | null
          unsafe_ingredient_list?: string[] | null
        }
        Update: {
          barcode?: string
          brands?: string | null
          categories?: string | null
          cleaned_ingredients?: Json | null
          confidence_score?: number | null
          countries_tags?: Json | null
          created_at?: string | null
          has_english?: boolean | null
          id?: string
          image_ingredients_url?: string | null
          image_url?: string | null
          import_batch_id?: string | null
          ingredients_text?: string | null
          is_uk_product?: boolean | null
          languages_tags?: Json | null
          last_fetched?: string | null
          product_name?: string | null
          safety_analyzed?: boolean | null
          safety_rating?: string | null
          search_count?: number | null
          unsafe_ingredient_list?: string[] | null
        }
        Relationships: []
      }
      products: {
        Row: {
          asin: string
          brand: string | null
          category: string | null
          concerns: string[] | null
          description: string | null
          id: string
          image_url: string | null
          ingredients: string | null
          price: string | null
          safe_for_pregnancy: boolean | null
          scanned_at: string | null
          title: string
          unsafe_ingredients: string[] | null
        }
        Insert: {
          asin: string
          brand?: string | null
          category?: string | null
          concerns?: string[] | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          price?: string | null
          safe_for_pregnancy?: boolean | null
          scanned_at?: string | null
          title: string
          unsafe_ingredients?: string[] | null
        }
        Update: {
          asin?: string
          brand?: string | null
          category?: string | null
          concerns?: string[] | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          price?: string | null
          safe_for_pregnancy?: boolean | null
          scanned_at?: string | null
          title?: string
          unsafe_ingredients?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          is_premium: boolean
          last_name: string | null
          scan_count: number
          skin_concerns: string[] | null
          skincare_routine: Json | null
          trimester: string | null
          updated_at: string
          welcome_email_sent: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          is_premium?: boolean
          last_name?: string | null
          scan_count?: number
          skin_concerns?: string[] | null
          skincare_routine?: Json | null
          trimester?: string | null
          updated_at?: string
          welcome_email_sent?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_premium?: boolean
          last_name?: string | null
          scan_count?: number
          skin_concerns?: string[] | null
          skincare_routine?: Json | null
          trimester?: string | null
          updated_at?: string
          welcome_email_sent?: boolean
        }
        Relationships: []
      }
      saved_articles: {
        Row: {
          article_id: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          currency: string | null
          email: string
          id: string
          is_trial_active: boolean
          legacy_pricing: boolean
          price_amount: number | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          email: string
          id?: string
          is_trial_active?: boolean
          legacy_pricing?: boolean
          price_amount?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          email?: string
          id?: string
          is_trial_active?: boolean
          legacy_pricing?: boolean
          price_amount?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      time_analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          day_of_week: number | null
          hour_of_day: number | null
          id: string
          month_of_year: number | null
          page_views: number | null
          sessions: number | null
          user_id: string | null
          users: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          day_of_week?: number | null
          hour_of_day?: number | null
          id?: string
          month_of_year?: number | null
          page_views?: number | null
          sessions?: number | null
          user_id?: string | null
          users?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          day_of_week?: number | null
          hour_of_day?: number | null
          id?: string
          month_of_year?: number | null
          page_views?: number | null
          sessions?: number | null
          user_id?: string | null
          users?: number | null
        }
        Relationships: []
      }
      traffic_source_metrics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          campaign: string | null
          comparison_period: string | null
          conversion_rate: number | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          goal_completions: number | null
          id: string
          medium: string | null
          new_users: number | null
          period_type: string | null
          sessions: number | null
          source: string
          user_id: string | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          campaign?: string | null
          comparison_period?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          goal_completions?: number | null
          id?: string
          medium?: string | null
          new_users?: number | null
          period_type?: string | null
          sessions?: number | null
          source: string
          user_id?: string | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          campaign?: string | null
          comparison_period?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          goal_completions?: number | null
          id?: string
          medium?: string | null
          new_users?: number | null
          period_type?: string | null
          sessions?: number | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_analytics_properties: {
        Row: {
          account_id: string | null
          account_name: string | null
          created_at: string | null
          id: string
          is_selected: boolean | null
          property_id: string
          property_name: string | null
          provider: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          id?: string
          is_selected?: boolean | null
          property_id: string
          property_name?: string | null
          provider: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          id?: string
          is_selected?: boolean | null
          property_id?: string
          property_name?: string | null
          provider?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_product_search_count: {
        Args: { product_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
