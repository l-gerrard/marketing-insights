
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Clock, Bookmark, TrendingUp } from 'lucide-react';

interface Article {
  id: string;
  source: string;
  headline: string;
  summary: string | null;
  url: string | null;
  published_date: string | null;
  scraped_at: string;
}

interface BlogSectionProps {
  articles: Article[];
  onSaveArticle?: (article: Article) => void;
}

function BlogSectionTextOnly({ articles, onSaveArticle }: BlogSectionProps) {
  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'Marketing Land': 'bg-blue-100 text-blue-800 border-blue-200',
      'Social Media Today': 'bg-green-100 text-green-800 border-green-200',
      'HubSpot Marketing Blog': 'bg-purple-100 text-purple-800 border-purple-200',
      'Social Media Examiner': 'bg-pink-100 text-pink-800 border-pink-200',
      'TechCrunch Marketing': 'bg-orange-100 text-orange-800 border-orange-200',
      'Marketing Dive': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Adweek': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Search Engine Journal': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Moz Blog': 'bg-violet-100 text-violet-800 border-violet-200',
      'Content Marketing Institute': 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return colors[source] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadingTime = (summary: string | null) => {
    if (!summary) return '2 min read';
    const words = summary.split(' ').length;
    const readingTime = Math.ceil(words / 200);
    return `${readingTime} min read`;
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-iced-coffee-400" />
        <p className="text-iced-coffee-600 text-lg">No articles found matching your criteria.</p>
        <p className="text-iced-coffee-500 text-sm mt-2">New articles are automatically fetched every 30 minutes.</p>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="w-full space-y-8">
      {/* Featured Article */}
      <Card className="border-2 border-iced-coffee-200 bg-gradient-to-br from-iced-coffee-50 to-iced-matcha-50 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge className={`text-sm font-medium ${getSourceColor(featuredArticle.source)}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {featuredArticle.source}
            </Badge>
            <div className="flex items-center gap-2 text-iced-coffee-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{formatTime(featuredArticle.scraped_at)}</span>
              <span className="text-iced-coffee-400">•</span>
              <span className="text-sm">{getReadingTime(featuredArticle.summary)}</span>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-iced-coffee-900 mb-4 leading-tight">
            {featuredArticle.headline}
          </h2>
          
          {featuredArticle.summary && (
            <p className="text-lg text-iced-coffee-700 leading-relaxed mb-6 line-clamp-3">
              {featuredArticle.summary}
            </p>
          )}
          
          <div className="flex items-center gap-4">
            {featuredArticle.url && (
              <Button
                asChild
                className="bg-iced-coffee-700 hover:bg-iced-coffee-800 text-white"
              >
                <a 
                  href={featuredArticle.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read Full Article
                </a>
              </Button>
            )}
            {onSaveArticle && (
              <Button
                variant="outline"
                onClick={() => onSaveArticle(featuredArticle)}
                className="border-iced-coffee-300 text-iced-coffee-700 hover:bg-iced-coffee-50"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid of Remaining Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {remainingArticles.map((article) => (
          <Card key={article.id} className="border border-iced-coffee-200 hover:shadow-md hover:border-iced-coffee-300 transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={`text-xs ${getSourceColor(article.source)}`}>
                  {article.source}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-iced-coffee-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(article.scraped_at)}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-iced-coffee-900 mb-3 line-clamp-2 leading-snug hover:text-iced-coffee-700 transition-colors">
                {article.headline}
              </h3>
              
              {article.summary && (
                <p className="text-sm text-iced-coffee-600 leading-relaxed mb-4 line-clamp-3">
                  {article.summary}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-iced-coffee-500">
                  {getReadingTime(article.summary)}
                </span>
                
                <div className="flex items-center gap-2">
                  {article.url && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs border-iced-coffee-300 text-iced-coffee-700 hover:bg-iced-coffee-50"
                    >
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Read
                      </a>
                    </Button>
                  )}
                  {onSaveArticle && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSaveArticle(article)}
                      className="h-8 w-8 p-0 text-iced-coffee-500 hover:text-iced-coffee-700 hover:bg-iced-coffee-50"
                    >
                      <Bookmark className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { BlogSectionTextOnly };
