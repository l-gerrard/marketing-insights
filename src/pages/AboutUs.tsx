
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Users, 
  Target, 
  CheckCircle, 
  Brain,
  Database,
  Eye,
  Heart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const AboutUs = () => {
  const navigate = useNavigate();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AI Marketing Bestie",
    "description": "AI-powered marketing analytics platform that democratizes data insights for marketers",
    "url": "https://yourdomain.com/about",
    "logo": "https://yourdomain.com/lovable-uploads/82061c48-568f-4d49-a2de-45b67235181e.png",
    "foundingDate": "2024",
    "mission": "To make marketing analytics simple, secure, and actionable for everyone",
    "employees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    }
  };

  return (
    <>
      <SEO
        title="About AI Marketing Bestie - Your AI Marketing Team | Meet the Company Behind Your AI Marketing Bestie"
        description="Learn about AI Marketing Bestie's mission to democratize marketing analytics through AI. Discover our team of experienced marketers and engineers who built your AI Marketing Bestie to make data insights accessible to everyone."
        keywords="about AI Marketing Bestie, AI marketing company, marketing analytics team, data science company, AI marketing platform team, marketing technology company"
        url="https://yourdomain.com/about"
        schema={organizationSchema}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-vivid-sky-blue-50 via-maya-blue-50 to-periwinkle-50">
        <Header />
        
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Your AI Marketing Bestie
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're on a mission to make marketing analytics simple, secure, and actionable for everyone. 
              Your data stays yours, and your insights help you grow.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <article>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Mission: Democratizing Data Insights
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Marketing shouldn't require a PhD in data science. We believe every marketer deserves 
                  to understand their performance and make confident, data-driven decisions.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-6 w-6 text-vivid-sky-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Clear Insights</h3>
                      <p className="text-gray-600">Transform complex analytics into plain-English recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Brain className="h-6 w-6 text-maya-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">AI-Powered</h3>
                      <p className="text-gray-600">Get personalized insights that combine your data with industry trends</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-6 w-6 text-periwinkle-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Actionable Results</h3>
                      <p className="text-gray-600">Every insight comes with specific steps you can take today</p>
                    </div>
                  </div>
                </div>
              </article>
              <aside className="relative">
                <div className="bg-gradient-to-br from-vivid-sky-blue-100 to-maya-blue-100 rounded-2xl p-8">
                  <div className="text-center">
                    <Heart className="h-16 w-16 text-vivid-sky-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Built by Marketers, for Marketers</h3>
                    <p className="text-gray-700">
                      We understand the frustration of drowning in data without clear direction. 
                      That's why we created your AI Marketing Bestie – to be the trusted advisor 
                      you've always needed.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Data Security Section */}
        <section className="py-16 bg-gradient-to-br from-maya-blue-50 to-vivid-sky-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <Shield className="h-12 w-12 text-vivid-sky-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Data Security is Our Priority
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We understand that your analytics data is sensitive. Here's exactly how we protect it and what we do with it.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <Card className="border-maya-blue-200">
                <CardHeader>
                  <Lock className="h-8 w-8 text-vivid-sky-blue-600 mb-2" />
                  <CardTitle className="text-maya-blue-800">Enterprise-Grade Encryption</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    All data is encrypted in transit and at rest using industry-standard AES-256 encryption. 
                    Your connections use OAuth 2.0 for secure authentication.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-maya-blue-200">
                <CardHeader>
                  <Database className="h-8 w-8 text-periwinkle-600 mb-2" />
                  <CardTitle className="text-maya-blue-800">Secure Data Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We process your data only to generate insights. No data is shared with third parties, 
                    and we never use your data to train AI models or for any other purpose.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-maya-blue-200">
                <CardHeader>
                  <Eye className="h-8 w-8 text-maya-blue-600 mb-2" />
                  <CardTitle className="text-maya-blue-800">Full Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    You control your data connections. Disconnect at any time, and we'll immediately 
                    stop accessing your analytics. Your data, your choice, always.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Data Usage Details */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                What We Do (and Don't Do) With Your Data
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-vivid-sky-blue-700 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    What We Do
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Generate personalized insights from your analytics</li>
                    <li>• Provide AI-powered recommendations for optimization</li>
                    <li>• Combine your data with public trend information</li>
                    <li>• Store aggregated metrics securely for your dashboard</li>
                    <li>• Enable you to ask questions about your performance</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    What We Never Do
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Sell or share your data with anyone</li>
                    <li>• Use your data to train AI models</li>
                    <li>• Access data you haven't explicitly connected</li>
                    <li>• Store unnecessary personal information</li>
                    <li>• Keep data after you disconnect your accounts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <Users className="h-12 w-12 text-vivid-sky-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                The Team Behind AI Marketing Bestie
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're a team of experienced marketers and engineers who've felt the pain 
                of complex analytics firsthand.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="text-center border-maya-blue-200">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-vivid-sky-blue-100 to-vivid-sky-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-vivid-sky-blue-600" />
                  </div>
                  <CardTitle className="text-maya-blue-800">Marketing Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our team has managed campaigns worth millions and knows exactly what metrics matter 
                    and what questions keep marketers up at night.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-maya-blue-200">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-maya-blue-100 to-maya-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-maya-blue-600" />
                  </div>
                  <CardTitle className="text-maya-blue-800">Security & Engineering Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our engineering team prioritizes security and privacy in every feature we build, 
                    ensuring your data is always protected while delivering reliable insights.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-vivid-sky-blue-600 to-maya-blue-700">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Meet Your AI Marketing Bestie?
            </h2>
            <p className="text-xl text-vivid-sky-blue-100 mb-8">
              Join thousands of marketers who trust us with their data and rely on us for insights that drive growth.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg" 
              className="bg-white text-vivid-sky-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
            >
              Get Started Securely
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
