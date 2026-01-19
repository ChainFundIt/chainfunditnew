import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Heart,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { careerOpenings } from "@/lib/schema";
import { asc, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Salary",
    description:
      "We offer competitive compensation packages based on experience and location.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "Comprehensive health insurance and wellness programs to keep you healthy.",
  },
  {
    icon: Zap,
    title: "Flexible Work",
    description:
      "Remote work options and flexible hours to support work-life balance.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description:
      "Opportunities for professional development and career advancement.",
  },
  {
    icon: Users,
    title: "Great Team",
    description:
      "Work with a passionate, diverse team committed to making a difference.",
  },
  {
    icon: Shield,
    title: "Impact",
    description:
      "Be part of a platform that helps people achieve their fundraising goals.",
  },
];

const values = [
  "Transparency and honesty in everything we do",
  "Commitment to making a positive impact",
  "Innovation and continuous improvement",
  "Diversity and inclusion",
  "Work-life balance and employee wellbeing",
];

export default async function CareersPage() {
  const openings = await db
    .select()
    .from(careerOpenings)
    .where(eq(careerOpenings.isActive, true))
    .orderBy(asc(careerOpenings.sortOrder), desc(careerOpenings.createdAt));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Careers</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Join our mission to democratize fundraising and make a positive
            impact on the world.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Why Work With Us */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Work at ChainFundIt?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of crowdfunding, and we need talented
              people like you to help us get there.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our current job openings and find the perfect role for
              you.
            </p>
          </div>

          <div className="space-y-6">
            {openings.length === 0 ? (
              <p className="text-xl text-gray-600 text-center">
                There are no open positions at the moment. Check back soon!
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {openings.map((opening) => {
                  const responsibilities = Array.isArray(
                    opening.responsibilities
                  )
                    ? opening.responsibilities
                    : [];
                  const requirements = Array.isArray(opening.requirements)
                    ? opening.requirements
                    : [];

                  return (
                    <Card
                      key={opening.id}
                      className="border border-gray-200 hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-900">
                              {opening.title}
                            </h3>
                            {opening.department && (
                              <p className="text-sm text-gray-600">
                                {opening.department}
                              </p>
                            )}
                          </div>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                            Open
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {opening.location && (
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              {opening.location}
                            </span>
                          )}
                          {opening.employmentType && (
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              {opening.employmentType}
                            </span>
                          )}
                        </div>

                        {opening.summary && (
                          <p className="text-gray-700">{opening.summary}</p>
                        )}

                        {responsibilities.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                              What you'll do
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {responsibilities.map((item, index) => (
                                <li key={index} className="flex gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {requirements.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                              What we're looking for
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {requirements.map((item, index) => (
                                <li key={index} className="flex gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <Button asChild>
                            <a
                              href={
                                opening.applyUrl ||
                                "mailto:careers@chainfundit.com"
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              Apply now
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Ambassador Program */}
        <div className="mb-16">
          <Card className="bg-[#FDFBF7] border border-[#F5F5F4]">
            <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-[#A16207] text-xs font-bold">
                  AMBASSADOR PROGRAM
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  ChainFundIt Ambassador
                </h3>
                <p className="text-gray-700 max-w-2xl">
                  Meet the storytellers behind the Doing Good Series. Learn more
                  about the role, responsibilities, and how to apply.
                </p>
              </div>
              <Button asChild className="bg-[#104109] px-6 py-3 rounded-full">
                <Link href="/ambassadors">View Ambassador Role</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* No Open Positions Message */}
        <div className="mb-16">
          <Card className="bg-gray-50 border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Don't see a role that fits?
              </h3>
              <p className="text-gray-600 mb-6">
                We're always looking for talented individuals. Send us your
                resume and we'll keep you in mind for future opportunities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Users className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our team and help us build the future of crowdfunding. We'd
            love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:careers@chainfundit.com">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Contact Us
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
