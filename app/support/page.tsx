"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Mail, Code, Rocket, Settings, Smartphone, Cloud } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Need Help Getting Started?
            </h1>
            <p className="text-lg text-gray-600">
              We offer professional services to get you up and running quickly
            </p>
          </div>

          {/* Cloud Hosting Pricing */}
          <Card className="border-blue-200 shadow-lg mb-12 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Cloud Hosted Plans</CardTitle>
                  <p className="text-gray-600 mt-1">Fully managed hosting - we handle everything</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">€39.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-500 mt-1">Paid annually</div>
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold text-gray-900 mb-2">Starter Plan</div>
                    <div className="text-gray-600">100,000 pages scraped/month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Automatic backups</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>SSL certificate included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Email support</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 border-2 border-blue-900">
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">€59.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-500 mt-1">Paid annually</div>
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold text-gray-900 mb-2">Professional Plan</div>
                    <div className="text-gray-600">200,000 pages scraped/month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Everything in Starter</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Monthly reports</span>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                Need more? Bigger plans available for high-traffic operations.
              </p>
            </CardContent>
          </Card>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-gray-200 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-blue-900" />
                </div>
                <CardTitle className="text-xl text-gray-900">Deployment Services</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900">€500</span>
                  <span className="text-sm text-gray-600 ml-2">one-time</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Don't want to deal with servers and hosting? We'll deploy your instance and get you running in hours, not days.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Production-ready deployment on your infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>SSL certificates and security setup</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Database backup configuration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-blue-900" />
                </div>
                <CardTitle className="text-xl text-gray-900">Custom Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Need specific features or modifications? We can customize the platform to fit your workflow.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Brand customization and white-labeling</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Additional integrations and API connections</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Custom reporting and analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Custom Development Section */}
          <Card className="border-gray-200 shadow-lg mb-12">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-blue-900" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Custom Software Development</CardTitle>
                  <p className="text-gray-600 mt-1">Beyond influencer tools, we build complete solutions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-900" />
                    Web Applications
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Internal tools and dashboards</li>
                    <li>• SaaS platforms</li>
                    <li>• E-commerce solutions</li>
                    <li>• CRM and business automation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-900" />
                    Mobile Apps
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• iOS and Android apps</li>
                    <li>• React Native cross-platform</li>
                    <li>• API integration</li>
                    <li>• Full backend development</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Work With Us */}
          <Card className="border-gray-200 shadow-lg mb-12 bg-blue-50">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Work With Us</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fast Turnaround</h4>
                  <p className="text-sm text-gray-700">
                    We ship quickly. Most deployment projects done in 1-3 days.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fixed Pricing</h4>
                  <p className="text-sm text-gray-700">
                    No surprises. We quote upfront and stick to it.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Built This</h4>
                  <p className="text-sm text-gray-700">
                    We built this tool. We know it inside out.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Card className="border-gray-200 shadow-xl bg-white">
              <CardContent className="py-12">
                <Mail className="w-12 h-12 text-blue-900 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Get In Touch
                </h2>
                <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                  Tell us what you need and we'll send you a quote. No lengthy calls required.
                </p>
                <Button
                  asChild
                  className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-lg"
                >
                  <a href="mailto:info@ibasuite.com">
                    Email: info@ibasuite.com
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
