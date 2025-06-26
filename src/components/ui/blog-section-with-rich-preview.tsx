
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, Bookmark } from 'lucide-react';

interface Article {
  id: string;
  source: string;
  headline: string;
  summary: string | null;
  url: string | null;
  image_url: string | null;
  published_date: string | null;
  scraped_at: string;
}

interface BlogSectionProps {
  articles: Article[];
  onSaveArticle?: (article: Article) => void;
}

function BlogSection({ articles, onSaveArticle }: BlogSectionProps) {
  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'Marketing Land': 'bg-vivid-sky-blue-100 text-vivid-sky-blue-700 border-vivid-sky-blue-200',
      'Social Media Today': 'bg-maya-blue-100 text-maya-blue-700 border-maya-blue-200',
      'HubSpot Marketing Blog': 'bg-periwinkle-100 text-periwinkle-700 border-periwinkle-200',
      'Social Media Examiner': 'bg-pink-lavender-100 text-pink-lavender-700 border-pink-lavender-200',
      'TechCrunch Marketing': 'bg-puce-100 text-puce-700 border-puce-200',
      'Marketing Dive': 'bg-vivid-sky-blue-100 text-vivid-sky-blue-700 border-vivid-sky-blue-200',
      'Adweek': 'bg-maya-blue-100 text-maya-blue-700 border-maya-blue-200',
      'Search Engine Journal': 'bg-periwinkle-100 text-periwinkle-700 border-periwinkle-200',
      'Moz Blog': 'bg-pink-lavender-100 text-pink-lavender-700 border-pink-lavender-200',
      'Content Marketing Institute': 'bg-puce-100 text-puce-700 border-puce-200',
      'Neil Patel Blog': 'bg-vivid-sky-blue-100 text-vivid-sky-blue-700 border-vivid-sky-blue-200',
      'MarketingProfs': 'bg-maya-blue-100 text-maya-blue-700 border-maya-blue-200',
      'Think with Google': 'bg-periwinkle-100 text-periwinkle-700 border-periwinkle-200',
      'Sprout Social Blog': 'bg-pink-lavender-100 text-pink-lavender-700 border-pink-lavender-200',
      'Later Blog': 'bg-puce-100 text-puce-700 border-puce-200',
      'Influencer Marketing Hub': 'bg-vivid-sky-blue-100 text-vivid-sky-blue-700 border-vivid-sky-blue-200',
      'Campaign US': 'bg-maya-blue-100 text-maya-blue-700 border-maya-blue-200',
      'MarTech Today': 'bg-periwinkle-100 text-periwinkle-700 border-periwinkle-200',
      'Smashing Magazine': 'bg-pink-lavender-100 text-pink-lavender-700 border-pink-lavender-200',
      'Marketing Week': 'bg-puce-100 text-puce-700 border-puce-200',
      'ClickZ': 'bg-vivid-sky-blue-100 text-vivid-sky-blue-700 border-vivid-sky-blue-200',
      'Econsultancy': 'bg-maya-blue-100 text-maya-blue-700 border-maya-blue-200'
    };
    return colors[source] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getFallbackImageForArticle = (article: Article) => {
    // Default marketing image as fallback
    return 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&h=450&fit=crop';
  };

  const getAuthorInitials = (source: string) => {
    return source.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
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
    const readingTime = Math.ceil(words / 200); // Assuming 200 words per minute
    return `${readingTime} min read`;
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-iced-coffee-600 text-lg">No articles found matching your criteria.</p>
        <p className="text-iced-coffee-500 text-sm mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="w-full">
      <div className="container mx-auto flex flex-col gap-8">
        {/* Featured Article */}
        <div className="flex flex-col gap-6 hover:opacity-90 cursor-pointer group transition-all duration-300">
          <div className="bg-gradient-to-br from-iced-coffee-100 to-iced-matcha-100 rounded-xl aspect-video bg-cover bg-center relative overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <img
              src={featuredArticle.image_url || getFallbackImageForArticle(featuredArticle)}
              alt={featuredArticle.headline}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getFallbackImageForArticle(featuredArticle);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-row gap-4 items-center mb-4">
                <Badge className={`text-xs ${getSourceColor(featuredArticle.source)}`}>
                  {featuredArticle.source}
                </Badge>
                <p className="flex flex-row gap-2 text-sm items-center text-white">
                  <span className="text-white/80">By</span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-white/20 text-white border border-white/30">
                      {getAuthorInitials(featuredArticle.source)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{featuredArticle.source}</span>
                  <span className="text-white/60">•</span>
                  <Clock className="h-3 w-3" />
                  <span className="text-white/80">{formatTime(featuredArticle.scraped_at)}</span>
                </p>
              </div>
              <h3 className="text-3xl md:text-4xl tracking-tight text-white font-bold mb-3 line-clamp-2">
                {featuredArticle.headline}
              </h3>
              {featuredArticle.summary && (
                <p className="text-white/90 text-lg leading-relaxed line-clamp-2 mb-4">
                  {featuredArticle.summary}
                </p>
              )}
              <div className="flex items-center gap-4">
                {featuredArticle.url && (
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    <a 
                      href={featuredArticle.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Read Article
                    </a>
                  </Button>
                )}
                {onSaveArticle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSaveArticle(featuredArticle)}
                    className="text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Remaining Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remainingArticles.map((article) => (
            <div key={article.id} className="flex flex-col gap-4 hover:opacity-90 cursor-pointer group transition-all duration-300">
              <div className="bg-gradient-to-br from-iced-coffee-100 to-iced-matcha-100 rounded-lg aspect-video bg-cover bg-center relative overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <img
                  src={article.image_url || getFallbackImageForArticle(article)}
                  alt={article.headline}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackImageForArticle(article);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className="flex flex-row gap-4 items-center">
                <Badge className={`text-xs ${getSourceColor(article.source)}`}>
                  {article.source}
                </Badge>
                <p className="flex flex-row gap-2 text-sm items-center text-iced-coffee-600">
                  <span className="text-iced-coffee-500">By</span>
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-iced-coffee-100 text-iced-coffee-700">
                      {getAuthorInitials(article.source)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-iced-coffee-700 text-xs">{article.source}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl tracking-tight text-iced-coffee-900 line-clamp-2 font-semibold group-hover:text-vivid-sky-blue-700 transition-colors">
                  {article.headline}
                </h3>
                {article.summary && (
                  <p className="text-iced-coffee-700 text-sm leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-xs text-iced-coffee-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(article.scraped_at)}</span>
                    <span>•</span>
                    <span>{getReadingTime(article.summary)}</span>
                  </div>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { BlogSection };
