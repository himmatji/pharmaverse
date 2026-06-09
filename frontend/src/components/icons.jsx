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
    <section className="w-full bg-white pt-12 pb-16 px-6">
      {/* Added pt-12 for extra top padding */}

      <div className="max-w-[1350px] mx-auto">

        {/* HEADING - Extra margin bottom for breathing space */}
        <div className="text-center mb-16">
          <h2 className="text-[42px] font-extrabold bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
            Explore PharmaVerse
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full mt-4 mb-3"></div>
          <p className="text-gray-700 mt-3 text-[17px] font-serif">
            Everything pharmacy students need in one place
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">

          {categories.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                {/* ICON CIRCLE */}
                <div
                  className={`w-[145px] h-[145px] rounded-full ${item.bg}
                  flex items-center justify-center
                  shadow-sm border border-gray-100
                  transition-all duration-500
                  group-hover:scale-105
                  group-hover:shadow-2xl`}
                >
                  <Icon
                    size={62}
                    className={`${item.color} transition-all duration-500 group-hover:scale-110`}
                    strokeWidth={1.8}
                  />
                </div>

                {/* TEXT */}
                <h3 className="mt-5 text-[18px] font-bold text-[#111827]">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-[14px] mt-1">
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