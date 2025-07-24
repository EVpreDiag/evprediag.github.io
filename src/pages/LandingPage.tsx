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
    <div className="min-h-screen subtle-gradient">
      {/* Header */}
      <header className="border-b electric-border tech-blur bg-background/70">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 animate-fade-in-up">
            <Zap className="h-8 w-8 text-primary animate-electric-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              EVPreDiag
            </span>
          </div>
          <Link to="/auth">
            <Button variant="outline" className="electric-border hover:electric-glow transition-all duration-300">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 tech-gradient opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Badge variant="secondary" className="mb-4 electric-border electric-glow animate-fade-in-up">
            ⚡ Professional Vehicle Diagnostics Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight animate-fade-in-up [animation-delay:0.1s]">
            Streamline Your Vehicle
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary-dark bg-clip-text text-transparent animate-tech-glow">
              {" "}Diagnostic Process
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.2s]">
            Complete solution for EV, ICE, and PHEV diagnostics with advanced reporting, 
            user management, and analytics for service stations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up [animation-delay:0.3s]">
            <Link to="/register-station">
              <Button size="lg" className="text-lg px-8 py-6 electric-gradient tech-shadow hover:scale-105 transition-all duration-300">
                Start 6-Month Free Trial
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 electric-border hover:electric-glow hover:scale-105 transition-all duration-300">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4 animate-fade-in-up [animation-delay:0.4s]">
            No credit card required • Full access for 6 months
          </p>
        </div>
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full animate-float [animation-delay:0s]"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-primary-glow/20 rounded-full animate-float [animation-delay:1s]"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-primary/30 rounded-full animate-float [animation-delay:2s]"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-accent/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
              Everything You Need for Professional Diagnostics
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.1s]">
              Built specifically for automotive service stations with advanced features 
              and intuitive design.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center electric-border tech-shadow bg-background/80 tech-blur hover:electric-glow hover:scale-105 transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:animate-electric-pulse">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
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
      <section className="py-20 relative">
        <div className="absolute inset-0 tech-gradient opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.1s]">
              Start with our free 6-month trial, then choose the plan that fits your needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative group hover:scale-105 transition-all duration-300 animate-fade-in-up ${
                  plan.popular 
                    ? 'electric-border tech-shadow electric-glow scale-105' 
                    : 'border-border hover:electric-border hover:tech-shadow'
                }`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 electric-gradient text-white animate-electric-pulse">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                      {plan.price}
                    </span>
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
                        <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0 group-hover:animate-electric-pulse" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register-station" className="w-full">
                    <Button 
                      className={`w-full transition-all duration-300 ${
                        plan.popular 
                          ? 'electric-gradient tech-shadow hover:scale-105' 
                          : 'electric-border hover:electric-gradient hover:text-white'
                      }`}
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 electric-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary-glow/80 to-primary-dark/90"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white animate-fade-in-up">
            Ready to Transform Your Diagnostic Process?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.1s]">
            Join hundreds of service stations already using EVPreDiag to streamline 
            their operations and improve customer satisfaction.
          </p>
          <Link to="/register-station">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 tech-shadow hover:scale-105 transition-all duration-300 animate-fade-in-up [animation-delay:0.2s]"
            >
              Start Your Free Trial Today
            </Button>
          </Link>
        </div>
        {/* Floating Tech Elements */}
        <div className="absolute top-10 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float [animation-delay:0s]"></div>
        <div className="absolute bottom-10 right-1/3 w-3 h-3 bg-white/30 rounded-full animate-float [animation-delay:1s]"></div>
        <div className="absolute top-1/2 right-10 w-4 h-4 bg-white/20 rounded-full animate-float [animation-delay:2s]"></div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-br from-secondary/20 via-background to-accent/10 electric-border border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="h-6 w-6 text-primary animate-electric-pulse" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                EVPreDiag
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors duration-300">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t electric-border text-center text-sm text-muted-foreground">
            © 2024 EVPreDiag. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}