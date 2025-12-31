import Link from "next/link";
import { Button } from "@/components/ui";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";

// Feature data
const features = [
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: "Skill Analysis",
    description:
      "AI-powered assessment that identifies your strengths and unique abilities based on your experiences.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "Opportunity Matching",
    description:
      "Get matched with courses, projects, competitions, and internships tailored to your profile.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    title: "Personalized Action Plan",
    description:
      "Receive a step-by-step 30-day plan to develop new skills and achieve your goals.",
  },
];

// Stats data
const stats = [
  { value: "10K+", label: "Students Helped" },
  { value: "500+", label: "Opportunities" },
  { value: "95%", label: "Satisfaction Rate" },
  { value: "50+", label: "Skills Tracked" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/5 via-white to-[var(--accent)]/5">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--primary)]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              AI-Powered Career Guidance for Students
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] mb-6 animate-fade-in stagger-1">
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                SkillBridge AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-[var(--primary)] font-semibold mb-4 animate-fade-in stagger-2">
              Turn Your Skills Into Real Opportunities
            </p>

            {/* Description */}
            <p className="text-lg md:text-xl text-[var(--muted)] mb-10 max-w-2xl mx-auto animate-fade-in stagger-3">
              Our AI analyzes your unique skills and experiences to recommend
              personalized courses, projects, competitions, and internships —
              helping you become job-ready before graduation.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-4">
              <Link href="/analyze">
                <Button size="lg" className="group">
                  Analyze My Skills
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="mt-16 relative animate-fade-in stagger-5">
            <div className="bg-white rounded-2xl shadow-2xl border border-[var(--card-border)] p-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <img src="hero-image-2.png" alt="Hero illustration" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[var(--foreground)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              How SkillBridge AI Helps You
            </h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              Our intelligent platform guides you through every step of your
              skill development journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover padding="lg">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
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

      {/* How It Works Preview */}
      <section className="py-20 md:py-28 bg-[var(--secondary)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">
                Simple Steps to Unlock Your Potential
              </h2>
              <p className="text-lg text-[var(--muted)] mb-8">
                Getting started with SkillBridge AI takes just minutes. Answer a
                few questions, and let our AI do the rest.
              </p>

              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Enter Your Information",
                    desc: "Share your grade, interests, and experiences",
                  },
                  {
                    step: "2",
                    title: "AI Analyzes Your Profile",
                    desc: "Our AI evaluates your unique skill set",
                  },
                  {
                    step: "3",
                    title: "Get Personalized Results",
                    desc: "Receive matched opportunities and action plan",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {item.title}
                      </h3>
                      <p className="text-[var(--muted)] text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/how-it-works" className="inline-block mt-8">
                <Button variant="outline">
                  Learn More
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl border border-[var(--card-border)] p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-[var(--primary)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Sarah, Grade 11</p>
                      <p className="text-sm text-[var(--muted)]">
                        Aspiring Software Developer
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-[var(--card-border)] pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-[var(--muted)] mb-1">
                        Top Skills
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {["Problem Solving", "Creativity", "Technical"].map(
                          (skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-[var(--success)]/10 text-[var(--success)] text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--muted)] mb-1">
                        Recommended
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {["Web Dev Course", "Hackathon", "Internship"].map(
                          (opp) => (
                            <span
                              key={opp}
                              className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-sm rounded-full"
                            >
                              {opp}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[var(--accent)]/20 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[var(--primary)]/20 rounded-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Discover Your Potential?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have already unlocked their career
            path with SkillBridge AI. It only takes 5 minutes to get started.
          </p>
          <Link href="/analyze">
            <Button
              size="lg"
              className="bg-white text-[var(--primary)] hover:bg-gray-100 hover:shadow-xl"
            >
              Start Your Free Analysis
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
