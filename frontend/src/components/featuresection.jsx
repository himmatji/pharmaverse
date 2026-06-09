import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import videoFile from "../assets/teacher-video.mp4";

import {
  ScrollText,
  Clapperboard,
  FileSpreadsheet,
  BellRing,
} from "lucide-react";

const featuredData = [
  {
    icon: ScrollText,
    title: "Latest Notes",
    desc: "Get beautifully organized handwritten notes for every pharmacy subject.",
    navigateTo: "/bpharm",
    scrollTo: "notes",
  },
  {
    icon: Clapperboard,
    title: "Trending Practical Videos",
    desc: "Watch high-quality practical demonstrations and visual learning content.",
    navigateTo: "/bpharm",
    scrollTo: "videos",
  },
  {
    icon: FileSpreadsheet,
    title: "Upcoming Exam Question Papers",
    desc: "Prepare smarter with important exam-focused question papers and PYQs.",
    navigateTo: "/bpharm",
    scrollTo: "papers",
  },
  {
    icon: BellRing,
    title: "Latest Pharmacy Update",
    desc: "Stay updated with the latest pharmacy news, jobs, exams, and notifications.",
    navigateTo: "/bpharm",
    scrollTo: "notes",
  },
];

const FeatureSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  const [visibleItems, setVisibleItems] = useState(1);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const rect = sectionRef.current.getBoundingClientRect();
          const scrolled = -rect.top;

          let newVisible = 1;

          if (scrolled >= 150 && scrolled < 350) {
            newVisible = 2;
          } else if (scrolled >= 350 && scrolled < 550) {
            newVisible = 3;
          } else if (scrolled >= 550) {
            newVisible = 4;
          }

          setVisibleItems(newVisible);
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Navigation handlers for buttons
  const handleExploreNotes = () => {
    navigate('/bpharm', { state: { scrollTo: 'notes' } });
  };

  const handleWatchVideos = () => {
    navigate('/bpharm', { state: { scrollTo: 'videos' } });
  };

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white px-6 relative"
      style={{ minHeight: "320vh" }}
    >
      {/* STICKY SECTION */}
      <div className="sticky top-0 min-h-screen flex flex-col justify-center py-16 overflow-hidden">

        {/* HEADING */}
        <div className="text-center mb-12">
          <h2 className="text-[42px] font-extrabold bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
            Featured Sections
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full mt-4 mb-3"></div>
          <p className="text-gray-700 mt-3 text-[17px] font-serif">
            Explore the most useful pharmacy resources
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-[1350px] mx-auto w-full flex items-start justify-between gap-16">

          {/* LEFT SIDE */}
          <div className="flex flex-col gap-14 ml-4 flex-1">
            {featuredData.map((item, index) => {
              const Icon = item.icon;
              const isVisible = index < visibleItems;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-7 transition-all duration-700 ease-out cursor-pointer group
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-16"
                  }`}
                  style={{
                    transitionDelay: `${index * 120}ms`,
                  }}
                  onClick={() => navigate(item.navigateTo, { state: { scrollTo: item.scrollTo } })}
                >
                  {/* ICON */}
                  <div
                    className="
                    w-[92px]
                    h-[92px]
                    rounded-full
                    border-[4px]
                    border-[#d4a017]
                    flex
                    items-center
                    justify-center
                    shadow-[0_0_25px_rgba(212,160,23,0.35)]
                    flex-shrink-0
                    transition-all duration-300
                    group-hover:shadow-[0_0_35px_rgba(212,160,23,0.5)]
                    group-hover:scale-105
                  "
                  >
                    <Icon
                      size={44}
                      className="text-[#d4a017] transition-all duration-300 group-hover:scale-110"
                      strokeWidth={2.2}
                    />
                  </div>

                  {/* TEXT */}
                  <div className="max-w-[430px]">
                    <h3 className="text-[28px] font-bold text-[#111827] group-hover:text-[#d4a017] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-[18px] leading-9 mt-4">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE - Properly adjusted */}
          <div className="flex flex-col items-center mr-4 mt-8">

            {/* VIDEO */}
            <div className="w-[560px] xl:w-[620px] rounded-[30px] overflow-hidden shadow-2xl">
              <video
                src={videoFile}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[340px] object-cover"
              />
            </div>

            {/* BUTTONS - Properly aligned and positioned */}
            <div className="flex items-center justify-center gap-6 mt-8 w-full">

              {/* EXPLORE NOTES BUTTON */}
              <button
                onClick={handleExploreNotes}
                className="
                px-10
                py-4
                rounded-full
                bg-gradient-to-r
                from-sky-500
                to-blue-600
                text-white
                font-bold
                text-[16px]
                shadow-xl
                transition-all
                duration-300
                hover:scale-105
                hover:shadow-blue-300/50
                flex
                items-center
                gap-2
              "
              >
                <ScrollText size={20} />
                Explore Notes
              </button>

              {/* WATCH VIDEOS BUTTON */}
              <button
                onClick={handleWatchVideos}
                className="
                px-10
                py-4
                rounded-full
                bg-gradient-to-r
                from-[#0f172a]
                to-[#1e3a8a]
                text-white
                font-bold
                text-[16px]
                shadow-xl
                transition-all
                duration-300
                hover:scale-105
                hover:shadow-indigo-400/40
                flex
                items-center
                gap-2
              "
              >
                <Clapperboard size={20} />
                Watch Videos
              </button>

            </div>

           

          </div>

        </div>
      </div>
    </section>
  );
};

export default FeatureSection;