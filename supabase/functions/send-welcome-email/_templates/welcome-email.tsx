
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WelcomeEmailProps {
  firstName: string;
  trialEndDate?: string | null;
  priceAmount?: string;
  currency?: string;
}

export const WelcomeEmail = ({
  firstName = 'Valued User',
  trialEndDate,
  priceAmount = '12.99',
  currency = 'GBP',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to AI Marketing Bestie - Transform your data into actionable insights!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Welcome to AI Marketing Bestie!</Heading>
        
        <Text style={greeting}>Hi {firstName},</Text>
        
        <Text style={text}>
          Welcome to AI Marketing Bestie! We're thrilled to have you join our community of data-driven 
          professionals who are transforming raw data into powerful, actionable insights.
        </Text>

        {trialEndDate && (
          <Section style={trialSection}>
            <Heading style={h2}>🚀 Your Free Trial is Active!</Heading>
            <Text style={text}>
              Your 7-day free trial is now active until <strong>{trialEndDate}</strong>. 
              Explore all premium features and see how AI Marketing Bestie can revolutionize your analytics workflow.
            </Text>
          </Section>
        )}

        <Section style={featuresSection}>
          <Heading style={h2}>🔥 What You Can Do Right Now:</Heading>
          <Text style={featureItem}>📊 <strong>Connect Your Data Sources</strong> - Link Google Analytics, Instagram, and more</Text>
          <Text style={featureItem}>🤖 <strong>AI-Powered Chat</strong> - Ask questions about your data in plain English</Text>
          <Text style={featureItem}>📈 <strong>Real-Time Analytics</strong> - Monitor your performance with live dashboards</Text>
          <Text style={featureItem}>📰 <strong>Marketing Trends</strong> - Stay ahead with the latest industry insights</Text>
          <Text style={featureItem}>📱 <strong>Mobile-Optimized</strong> - Access your data anywhere, anytime</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={ctaButton} href="https://oaeslntqvgbcxhbajmpy.supabase.co">
            🚀 Get Started - Connect Your First Data Source
          </Button>
        </Section>

        <Hr style={hr} />

        <Section style={nextStepsSection}>
          <Heading style={h3}>📋 Quick Start Guide:</Heading>
          <Text style={stepText}><strong>Step 1:</strong> Connect your Google Analytics or Instagram account</Text>
          <Text style={stepText}><strong>Step 2:</strong> Explore your dashboard and key metrics</Text>
          <Text style={stepText}><strong>Step 3:</strong> Try our AI chat to ask questions about your data</Text>
          <Text style={stepText}><strong>Step 4:</strong> Set up automated reports and insights</Text>
        </Section>

        <Hr style={hr} />

        <Section style={supportSection}>
          <Heading style={h3}>💬 Need Help?</Heading>
          <Text style={text}>
            Our team is here to help you succeed! If you have any questions or need assistance:
          </Text>
          <Text style={text}>
            📧 Email us at <Link href="mailto:aimarketingbestie@gmail.com" style={link}>aimarketingbestie@gmail.com</Link>
          </Text>
          <Text style={text}>
            📚 Have questions? <Link href="mailto:aimarketingbestie@gmail.com" style={link}>Contact our support team</Link> for help
          </Text>
        </Section>

        {trialEndDate && (
          <Section style={pricingSection}>
            <Text style={pricingText}>
              After your trial ends, continue with AI Marketing Bestie for just <strong>{currency} £{priceAmount}/month</strong>. 
              Cancel anytime, no strings attached.
            </Text>
          </Section>
        )}

        <Hr style={hr} />

        <Text style={footer}>
          Happy analyzing! 🎯<br />
          The AI Marketing Bestie Team
        </Text>

        <Text style={disclaimer}>
          You're receiving this email because you created an account with AI Marketing Bestie. 
          If you have any questions, please contact us at aimarketingbestie@gmail.com
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a73e8',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0 15px',
  padding: '0',
};

const h3 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '25px 0 15px',
  padding: '0',
};

const greeting = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '20px 0',
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const trialSection = {
  backgroundColor: '#e8f5e8',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const featuresSection = {
  margin: '32px 0',
  padding: '0 20px',
};

const featureItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '12px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: '#1a73e8',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  margin: '0 auto',
};

const nextStepsSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const stepText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const supportSection = {
  margin: '32px 0',
  padding: '0 20px',
};

const pricingSection = {
  backgroundColor: '#fff3cd',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const pricingText = {
  color: '#856404',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const link = {
  color: '#1a73e8',
  textDecoration: 'underline',
};

const footer = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '32px 0 16px',
};

const disclaimer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '16px 0',
};
