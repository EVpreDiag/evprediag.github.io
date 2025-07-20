import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Shield, Users, BarChart, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <Wrench className="h-6 w-6" />,
    title: "Advanced Diagnostics",
    description: "Comprehensive EV, ICE, and PHEV diagnostic forms with detailed reporting"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Multi-User Management",
    description: "Role-based access control for technicians, front desk, and administrators"
  },
  {
    icon: <BarChart className="h-6 w-6" />,
    title: "Analytics & Reports",
    description: "Detailed insights and reports to track performance and efficiency"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with role-based permissions and data protection"
  }
];

const plans = [
  {
    name: "6-Month Trial",
    price: "Free",
    period: "for 6 months",
    description: "Perfect for getting started with full platform access",
    features: [
      "Complete diagnostic forms",
      "Unlimited user accounts",
      "Basic reporting",
      "Email support",
      "All core features"
    ],
    popular: true,
    cta: "Start Free Trial"
  },
  {
    name: "Basic Plan",
    price: "$49.99",
    period: "per month",
    description: "Ideal for small to medium service stations",
    features: [
      "Everything in trial",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access"
    ],
    popular: false,
    cta: "Get Started"
  },
  {
    name: "Annual Plan",
    price: "$499.99",
    period: "per year",
    description: "Best value with 2 months free",
    features: [
      "Everything in Basic",
      "Premium support",
      "Advanced integrations",
      "Custom training",
      "Dedicated account manager"
    ],
    popular: false,
    cta: "Save 17%"
  }
];

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">EVPreDiag</span>
          </div>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="secondary" className="mb-4">
            🚀 Professional Vehicle Diagnostics Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Streamline Your Vehicle
            <span className="text-primary"> Diagnostic Process</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete solution for EV, ICE, and PHEV diagnostics with advanced reporting, 
            user management, and analytics for service stations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register-station">
              <Button size="lg" className="text-lg px-8 py-6">
                Start 6-Month Free Trial
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Full access for 6 months
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Professional Diagnostics
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for automotive service stations with advanced features 
              and intuitive design.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg bg-background/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with our free 6-month trial, then choose the plan that fits your needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register-station" className="w-full">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      disabled={isLoading}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Diagnostic Process?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of service stations already using EVPreDiag to streamline 
            their operations and improve customer satisfaction.
          </p>
          <Link to="/register-station">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Your Free Trial Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">EVPreDiag</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 EVPreDiag. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}