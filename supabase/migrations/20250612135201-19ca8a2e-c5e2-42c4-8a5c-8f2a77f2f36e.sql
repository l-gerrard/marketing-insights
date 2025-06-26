
-- Create Instagram posts table to store post content and metadata
CREATE TABLE public.instagram_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  instagram_post_id TEXT NOT NULL UNIQUE,
  caption TEXT,
  media_type TEXT NOT NULL, -- 'IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'
  media_url TEXT,
  permalink TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Instagram insights table for post performance metrics
CREATE TABLE public.instagram_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  instagram_post_id TEXT REFERENCES public.instagram_posts(instagram_post_id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'impressions', 'reach', 'likes', 'comments', 'saves', 'shares'
  metric_value INTEGER NOT NULL DEFAULT 0,
  period TEXT DEFAULT 'lifetime', -- 'day', 'week', 'days_28', 'lifetime'
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(instagram_post_id, metric_name, period)
);

-- Create Instagram audience analytics table
CREATE TABLE public.instagram_audience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  metric_name TEXT NOT NULL, -- 'follower_count', 'following_count', 'media_count'
  metric_value INTEGER NOT NULL DEFAULT 0,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_name, recorded_date)
);

-- Create Instagram audience demographics table
CREATE TABLE public.instagram_demographics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  demographic_type TEXT NOT NULL, -- 'age', 'gender', 'country', 'city'
  demographic_value TEXT NOT NULL, -- '25-34', 'male', 'US', 'New York'
  percentage NUMERIC(5,2), -- percentage of audience
  count INTEGER DEFAULT 0,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, demographic_type, demographic_value, recorded_date)
);

-- Create Instagram stories table (for business accounts)
CREATE TABLE public.instagram_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  instagram_story_id TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL, -- 'IMAGE', 'VIDEO'
  media_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  exits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Instagram account insights for overall account metrics
CREATE TABLE public.instagram_account_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  metric_name TEXT NOT NULL, -- 'impressions', 'reach', 'profile_views', 'website_clicks'
  metric_value INTEGER NOT NULL DEFAULT 0,
  period TEXT NOT NULL, -- 'day', 'week', 'days_28'
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_name, period, date_range_start)
);

-- Enable Row Level Security on all Instagram tables
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_account_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for instagram_posts
CREATE POLICY "Users can view their own Instagram posts" 
  ON public.instagram_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram posts" 
  ON public.instagram_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram posts" 
  ON public.instagram_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Instagram posts" 
  ON public.instagram_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for instagram_insights
CREATE POLICY "Users can view their own Instagram insights" 
  ON public.instagram_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram insights" 
  ON public.instagram_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram insights" 
  ON public.instagram_insights 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for instagram_audience
CREATE POLICY "Users can view their own Instagram audience data" 
  ON public.instagram_audience 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram audience data" 
  ON public.instagram_audience 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram audience data" 
  ON public.instagram_audience 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for instagram_demographics
CREATE POLICY "Users can view their own Instagram demographics" 
  ON public.instagram_demographics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram demographics" 
  ON public.instagram_demographics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram demographics" 
  ON public.instagram_demographics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for instagram_stories
CREATE POLICY "Users can view their own Instagram stories" 
  ON public.instagram_stories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram stories" 
  ON public.instagram_stories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram stories" 
  ON public.instagram_stories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for instagram_account_insights
CREATE POLICY "Users can view their own Instagram account insights" 
  ON public.instagram_account_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram account insights" 
  ON public.instagram_account_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram account insights" 
  ON public.instagram_account_insights 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_instagram_posts_user_id ON public.instagram_posts(user_id);
CREATE INDEX idx_instagram_posts_timestamp ON public.instagram_posts(timestamp DESC);
CREATE INDEX idx_instagram_insights_post_id ON public.instagram_insights(instagram_post_id);
CREATE INDEX idx_instagram_insights_user_id ON public.instagram_insights(user_id);
CREATE INDEX idx_instagram_audience_user_date ON public.instagram_audience(user_id, recorded_date DESC);
CREATE INDEX idx_instagram_demographics_user_date ON public.instagram_demographics(user_id, recorded_date DESC);
CREATE INDEX idx_instagram_stories_user_id ON public.instagram_stories(user_id);
CREATE INDEX idx_instagram_account_insights_user_period ON public.instagram_account_insights(user_id, period, date_range_start DESC);

-- Create triggers to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instagram_posts_updated_at 
    BEFORE UPDATE ON public.instagram_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_stories_updated_at 
    BEFORE UPDATE ON public.instagram_stories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
