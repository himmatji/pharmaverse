import React from "react";

import {
  FileText,
  ClipboardCheck,
  BookOpen,
  PlayCircle,
  Video,
} from "lucide-react";

const categories = [
  {
    icon: FileText,
    title: "Notes",
    subtitle: "Smart study notes",
    bg: "bg-[#eef4ff]",
    color: "text-[#2563eb]",
  },
  {
    icon: ClipboardCheck,
    title: "MCQ Practice",
    subtitle: "Daily MCQs",
    bg: "bg-[#fff4ec]",
    color: "text-[#f97316]",
  },
  {
    icon: BookOpen,
    title: "PYQ",
    subtitle: "Previous papers",
    bg: "bg-[#f4f0ff]",
    color: "text-[#7c3aed]",
  },
  {
    icon: PlayCircle,
    title: "Video Lectures",
    subtitle: "Learn visually",
    bg: "bg-[#ecfeff]",
    color: "text-[#0891b2]",
  },
  {
    icon: Video,
    title: "Live Classes",
    subtitle: "Interactive sessions",
    bg: "bg-[#fff1f2]",
    color: "text-[#e11d48]",
  },
];

const Icons = () => {
  return (
    <section className="w-full bg-white pt-8 sm:pt-12 pb-10 sm:pb-16 px-4 sm:px-6">

      <div className="max-w-[1350px] mx-auto">

        {/* HEADING */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
            Explore PharmaVerse
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full mt-3 sm:mt-4 mb-2 sm:mb-3"></div>
          <p className="text-gray-700 mt-2 sm:mt-3 text-sm sm:text-[17px] font-serif px-4">
            Everything pharmacy students need in one place
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-8 sm:gap-y-12">

          {categories.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                {/* ICON CIRCLE */}
                <div
                  className={`w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] md:w-[130px] md:h-[130px] lg:w-[145px] lg:h-[145px] rounded-full ${item.bg}
                  flex items-center justify-center
                  shadow-sm border border-gray-100
                  transition-all duration-500
                  group-hover:scale-105
                  group-hover:shadow-2xl`}
                >
                  <Icon
                    size={38}
                    className={`sm:w-[44px] sm:h-[44px] md:w-[54px] md:h-[54px] lg:w-[62px] lg:h-[62px] ${item.color} transition-all duration-500 group-hover:scale-110`}
                    strokeWidth={1.8}
                  />
                </div>

                {/* TEXT */}
                <h3 className="mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base md:text-[18px] font-bold text-[#111827]">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-[11px] sm:text-[12px] md:text-[14px] mt-0.5 sm:mt-1">
                  {item.subtitle}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default Icons;