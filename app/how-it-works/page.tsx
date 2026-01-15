import Link from "next/link";
import { Button, Card, CardContent } from "@/components/ui";
import { steps, benefits, faqs } from "./data";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--primary)]/5 via-white to-[var(--accent)]/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
            How{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              SkillBridge AI
            </span>{" "}
            Works
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-3xl mx-auto mb-8">
            Our AI-powered platform analyzes your unique profile to help you
            discover your strengths, identify growth areas, and find the perfect
            opportunities to become job-ready.
          </p>
          <Link href="/analyze">
            <Button size="lg">
              Try It Now — It&apos;s Free
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

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Four Simple Steps
            </h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              From input to personalized action plan in minutes.
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                } gap-8 lg:gap-16 items-center`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl font-bold text-[var(--primary)]/20">
                      {step.number}
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--foreground)]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-[var(--muted)] text-lg mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-[var(--success)] flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-[var(--foreground)]">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Icon Card */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-3xl flex items-center justify-center text-white shadow-xl">
                    {step.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[var(--secondary)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Why Students Love SkillBridge AI
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} padding="lg" hover className="text-center">
                <CardContent>
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Discover Your Path?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of high school students who have already discovered
            their strengths and found personalized opportunities.
          </p>
          <Link href="/analyze">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 hover:shadow-xl"
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
