import Link from "next/link";
import { Button, Card, CardContent } from "@/components/ui";

const steps = [
  {
    number: "01",
    title: "Enter Your Information",
    description:
      "Share your grade level, interests, past activities, and self-rate your skills. The more information you provide, the better our AI can understand your unique profile.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
    details: [
      "Grade level (9th-12th)",
      "Personal interests and passions",
      "School clubs and extracurriculars",
      "Optional skill self-assessment",
    ],
  },
  {
    number: "02",
    title: "AI Analyzes Your Skills",
    description:
      "Our advanced AI engine processes your information to identify your strengths, natural abilities, and unique skill combinations that set you apart.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    details: [
      "Pattern recognition across experiences",
      "Skill level assessment",
      "Strength identification",
      "Comparison with success profiles",
    ],
  },
  {
    number: "03",
    title: "Skill Gaps Identified",
    description:
      "We identify areas where you have room for growth—skills that, once developed, will significantly boost your career readiness and opportunities.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    details: [
      "Gap analysis vs. career goals",
      "Priority ranking of improvements",
      "Actionable growth areas",
      "Realistic development timeline",
    ],
  },
  {
    number: "04",
    title: "Personalized Opportunities",
    description:
      "Receive tailored recommendations for courses, projects, competitions, and internships that match your skills, interests, and growth areas.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
    details: [
      "Curated online courses",
      "Hands-on project ideas",
      "Relevant competitions",
      "Internship opportunities",
    ],
  },
];

const benefits = [
  {
    icon: "🎯",
    title: "Personalized for You",
    description: "Every recommendation is tailored to your unique profile and goals.",
  },
  {
    icon: "⚡",
    title: "Quick & Easy",
    description: "Get comprehensive results in just 5 minutes of your time.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description: "Your data is never shared and used only for your recommendations.",
  },
  {
    icon: "🚀",
    title: "Actionable Results",
    description: "Receive a concrete 30-day plan to start improving immediately.",
  },
];

const faqs = [
  {
    question: "How accurate is the skill analysis?",
    answer:
      "Our AI uses advanced pattern recognition and has been trained on successful student profiles. The more detailed information you provide, the more accurate your results will be.",
  },
  {
    question: "Is SkillBridge AI free to use?",
    answer:
      "Yes! The skill analysis and personalized recommendations are completely free for all students.",
  },
  {
    question: "How long does the analysis take?",
    answer:
      "The input form takes about 5 minutes to complete, and you'll receive your results instantly after submission.",
  },
  {
    question: "Can I retake the analysis?",
    answer:
      "Absolutely! We encourage you to retake the analysis every few months as your skills and experiences grow.",
  },
  {
    question: "What data do you collect?",
    answer:
      "We collect only the information you provide in the form (grade, interests, activities, skill ratings). We never share this data with third parties.",
  },
];

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

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} padding="md">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="font-semibold text-[var(--foreground)] pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className="w-5 h-5 text-[var(--muted)] transform group-open:rotate-180 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p className="mt-4 text-[var(--muted)] pt-4 border-t border-[var(--card-border)]">
                    {faq.answer}
                  </p>
                </details>
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
