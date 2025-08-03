import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import emailjs from 'emailjs-com';

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsSubmitting(true);

    try {
      const now = new Date();
      const timestamp = now.toLocaleString();
      const year = now.getFullYear().toString();
      
      const priorityColors = {
        low: '#10B981',
        medium: '#F59E0B',
        high: '#F97316',
        urgent: '#EF4444',
      };

      const priorityColor =
        priorityColors[formData.priority as keyof typeof priorityColors] ||
        priorityColors.medium;

      const templateParams = {
        ...formData,
        timestamp,
        year,
        submitted_at: timestamp,
        body_html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${priorityColor}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Support Request - ${formData.priority.toUpperCase()}</h2>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px;">
            <h3>From: ${formData.name} (${formData.email})</h3>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <div style="padding: 15px; background: white; border-left: 4px solid ${priorityColor}; margin-top: 10px;">
              ${formData.message.replace(/\n/g, '<br>')}
            </div>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              Sent at: ${timestamp} <br />
              Year: ${year}
            </p>
          </div>
        </div>
        `,
      };

     await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );

      toast({
        title: 'Message sent successfully!',
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: "How do I create a diagnostic report?",
      answer: "Navigate to the Dashboard and select the appropriate diagnostic form (EV, PHEV, or ICE) based on your vehicle type. Fill out the form with the required information and submit."
    },
    {
      question: "Can I edit a submitted diagnostic report?",
      answer: "Yes, you can modify reports through the 'Modify Reports' section if you have the appropriate permissions (Admin, Station Admin, or Super Admin)."
    },
    {
      question: "How do I search for existing records?",
      answer: "Use the 'Search Records' feature from your dashboard. You can search by VIN, RO number, customer name, or other criteria."
    },
    {
      question: "What are the different user roles?",
      answer: "The system has several roles: Super Admin (full access), Station Admin (station management), Technician (create/edit reports), and Front Desk (limited access)."
    },
    {
      question: "How do I register a new station?",
      answer: "Use the 'Register Station' option from the landing page. A Super Admin will need to approve your registration request."
    },
    {
      question: "I forgot my password. How can I reset it?",
      answer: "Use the 'Forgot Password' link on the login page to receive a password reset email."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/landing" 
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Support Center
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Get help with your diagnostic platform. We're here to assist you with any questions or issues.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>Email Support</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Get help via email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">support@diagnosticplatform.com</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Response within 24 hours</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-green-400" />
                  <span>Phone Support</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Speak with our team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">+1 (555) 123-4567</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Mon-Fri, 9 AM - 6 PM EST</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <span>Live Chat</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Real-time assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                  Available
                </Badge>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Mon-Fri, 9 AM - 6 PM EST</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Send us a message</CardTitle>
                <CardDescription className="text-slate-400">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                        Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      placeholder="Please describe your issue or question in detail..."
                      rows={6}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqItems.map((faq, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-green-400" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-white">Platform</p>
                <p className="text-xs text-slate-400">Operational</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-white">Database</p>
                <p className="text-xs text-slate-400">Operational</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-white">API</p>
                <p className="text-xs text-slate-400">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
