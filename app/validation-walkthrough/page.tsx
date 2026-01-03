"use client";

import { useState, useEffect, useCallback } from "react";

// =============================================================================
// VALIDATION WALKTHROUGH PAGE
// =============================================================================
// PURPOSE: Visual walkthrough displaying validation images for tech-focused
// student profile demonstration. Easily extensible for additional images.
// =============================================================================

// Image data configuration - add new images here
const WALKTHROUGH_IMAGES = [
  {
    src: "/validation_images/1.png",
    caption: "Home page with action buttons and project name",
    alt: "Home page showing SkillBridge AI action buttons and project name",
  },
  {
    src: "/validation_images/2.png",
    caption: "Student first input stage",
    alt: "First input stage where student enters initial information",
  },
  {
    src: "/validation_images/3.png",
    caption: "Student second input stage (part 1)",
    alt: "Second input stage part 1 with additional questions",
  },
  {
    src: "/validation_images/4.png",
    caption: "Student second input stage (remaining questions)",
    alt: "Second input stage showing remaining questions",
  },
  {
    src: "/validation_images/5.png",
    caption: "Third input stage: past experiences",
    alt: "Third input stage where student enters past experiences",
  },
  {
    src: "/validation_images/6.png",
    caption: "Results page with skill snapshot uncollapsed",
    alt: "Results page displaying uncollapsed skill snapshot overview",
  },
  {
    src: "/validation_images/7.png",
    caption: "Skill snapshot with one skill expanded",
    alt: "Skill snapshot showing detailed view of one expanded skill",
  },
  {
    src: "/validation_images/8.png",
    caption: "Skill gap analysis view",
    alt: "Skill gap analysis showing areas for improvement",
  },
  {
    src: "/validation_images/9.png",
    caption: "Personalized recommendations view",
    alt: "Personalized recommendations tailored to student profile",
  },
  {
    src: "/validation_images/10.png",
    caption: "30-Day Plan: Part 1",
    alt: "First part of the personalized 30-day learning plan",
  },
  {
    src: "/validation_images/11.png",
    caption: "30-Day Plan: Part 2",
    alt: "Second part of the personalized 30-day learning plan",
  },
  {
    src: "/validation_images/12.png",
    caption: "30-Day Plan: Part 3",
    alt: "Third part of the personalized 30-day learning plan",
  },
  {
    src: "/validation_images/13.png",
    caption: "SkillBridge AI Pipeline overview",
    alt: "Overview diagram of the SkillBridge AI processing pipeline",
  },
];

// Arrow Component
function Arrow({ direction = "down" }: { direction?: "down" | "right" }) {
  if (direction === "right") {
    return (
      <div className="hidden md:flex items-center justify-center px-4">
        <svg
          className="w-8 h-8 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex md:hidden items-center justify-center py-4">
      <svg
        className="w-8 h-8 text-indigo-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 13l-5 5m0 0l-5-5m5 5V6"
        />
      </svg>
    </div>
  );
}

// Image Card Component
function ImageCard({
  src,
  caption,
  alt,
  index,
  onClick,
}: {
  src: string;
  caption: string;
  alt: string;
  index: number;
  onClick: () => void;
}) {
  return (
    <div className="flex-shrink-0 w-full md:w-auto">
      <div
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-md mx-auto md:mx-0 cursor-pointer transition-all hover:shadow-lg hover:border-indigo-300 group"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
      >
        {/* Image Number Badge */}
        <div className="relative">
          <span className="absolute top-3 left-3 z-10 inline-flex items-center justify-center w-8 h-8 bg-indigo-600 text-white text-sm font-bold rounded-full shadow-md">
            {index + 1}
          </span>
          {/* Fullscreen hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              View fullscreen
            </span>
          </div>
          {/* Image */}
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-contain bg-gray-50"
            loading="lazy"
          />
        </div>
        {/* Caption */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-700 text-center font-medium">
            {caption}
          </p>
        </div>
      </div>
    </div>
  );
}

// Fullscreen Modal Component
function FullscreenModal({
  image,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalImages,
}: {
  image: { src: string; caption: string; alt: string } | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  totalImages: number;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close fullscreen"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/10 rounded-full text-white text-sm font-medium">
        {currentIndex + 1} / {totalImages}
      </div>

      {/* Previous Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={currentIndex === 0}
        aria-label="Previous image"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={currentIndex === totalImages - 1}
        aria-label="Next image"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main Image */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
        />
        <p className="mt-4 text-white text-center font-medium text-lg px-4">
          {image.caption}
        </p>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs flex items-center gap-4">
        <span>← → Navigate</span>
        <span>ESC Close</span>
      </div>
    </div>
  );
}

export default function ValidationWalkthroughPage() {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  const openFullscreen = (index: number) => setFullscreenIndex(index);
  const closeFullscreen = useCallback(() => setFullscreenIndex(null), []);
  const goToPrev = useCallback(
    () => setFullscreenIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev)),
    []
  );
  const goToNext = useCallback(
    () =>
      setFullscreenIndex((prev) =>
        prev !== null && prev < WALKTHROUGH_IMAGES.length - 1 ? prev + 1 : prev
      ),
    []
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenIndex === null) return;
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenIndex, closeFullscreen, goToPrev, goToNext]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Fullscreen Modal */}
      <FullscreenModal
        image={fullscreenIndex !== null ? WALKTHROUGH_IMAGES[fullscreenIndex] : null}
        onClose={closeFullscreen}
        onPrev={goToPrev}
        onNext={goToNext}
        currentIndex={fullscreenIndex ?? 0}
        totalImages={WALKTHROUGH_IMAGES.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============================================================= */}
        {/* SECTION 1: PAGE HEADER */}
        {/* ============================================================= */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-300 rounded-full text-xs font-medium text-indigo-700 mb-4">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Visual Walkthrough • Tech-Focused Profile
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Validation Walkthrough for Tech-Focused Student Profile
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This walkthrough demonstrates the complete SkillBridge AI user flow,
            from initial input to personalized 30-day plan generation.
          </p>
        </header>

        {/* ============================================================= */}
        {/* SECTION 2: INSTRUCTIONS */}
        {/* ============================================================= */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">💡</span>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-800">How to navigate:</strong> Scroll
                down on mobile or scroll horizontally on desktop to follow the
                complete user journey through SkillBridge AI.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🔍</span>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-800">Fullscreen view:</strong> Click
                on any image to view it in fullscreen mode. Use arrow keys or
                buttons to navigate between images.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION 3: VERTICAL LAYOUT (Mobile) */}
        {/* ============================================================= */}
        <div className="md:hidden">
          {WALKTHROUGH_IMAGES.map((image, index) => (
            <div key={index}>
              <ImageCard
                src={image.src}
                caption={image.caption}
                alt={image.alt}
                index={index}
                onClick={() => openFullscreen(index)}
              />
              {/* Arrow between images (not after last) */}
              {index < WALKTHROUGH_IMAGES.length - 1 && <Arrow direction="down" />}
            </div>
          ))}
        </div>

        {/* ============================================================= */}
        {/* SECTION 4: HORIZONTAL SCROLLABLE LAYOUT (Desktop) */}
        {/* ============================================================= */}
        <div className="hidden md:block overflow-x-auto pb-4">
          <div className="flex items-start gap-2 min-w-max px-4">
            {WALKTHROUGH_IMAGES.map((image, index) => (
              <div key={index} className="flex items-center">
                <ImageCard
                  src={image.src}
                  caption={image.caption}
                  alt={image.alt}
                  index={index}
                  onClick={() => openFullscreen(index)}
                />
                {/* Arrow between images (not after last) */}
                {index < WALKTHROUGH_IMAGES.length - 1 && <Arrow direction="right" />}
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION 5: SCROLL INDICATOR (Desktop) */}
        {/* ============================================================= */}
        <div className="hidden md:flex justify-center mt-6">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <svg
              className="w-4 h-4 animate-bounce-x"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            <span>Scroll horizontally to view all steps</span>
            <svg
              className="w-4 h-4 animate-bounce-x"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION 6: SUMMARY */}
        {/* ============================================================= */}
        <div className="mt-10 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📋</span> Walkthrough Summary
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">1-5:</span>
              <span>User input stages capturing student profile data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">6-7:</span>
              <span>Skill snapshot results with expandable details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">8:</span>
              <span>AI-powered skill gap analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">9:</span>
              <span>Personalized recommendations for growth</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">10-12:</span>
              <span>Complete 30-day personalized learning plan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">13:</span>
              <span>Technical pipeline architecture overview</span>
            </li>
          </ul>
        </div>

        {/* ============================================================= */}
        {/* SECTION 7: FOOTER */}
        {/* ============================================================= */}
        <footer className="text-center py-8 mt-8 border-t border-gray-200">
          <p className="text-gray-400 text-xs">
            SkillBridge AI • Validation Walkthrough • Presidential AI Challenge
            Submission • January 2026
          </p>
        </footer>
      </div>

      {/* Custom Animation Style */}
      <style jsx>{`
        @keyframes bounce-x {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(4px);
          }
        }
        .animate-bounce-x {
          animation: bounce-x 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
