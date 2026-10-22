"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { links } from "@/lib/content";

/** Loads the YouTube player only when the visitor presses play. */
export default function DemoVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="glass-strong overflow-hidden rounded-[28px] p-2 sm:p-3">
      <div className="relative aspect-video overflow-hidden rounded-[20px] bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${links.youtubeId}?autoplay=1&rel=0`}
            title="HydroScan demo video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label="Play the HydroScan demo video"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${links.youtubeId}/hqdefault.jpg`}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 transition duration-700 group-hover:scale-100 group-hover:opacity-90"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-abyss/80 via-abyss/10 to-transparent" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white/15 ring-1 ring-white/40 backdrop-blur-xl transition duration-300 group-hover:scale-110 group-hover:bg-white/25">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/10 motion-reduce:animate-none" />
                <Play className="ml-1 h-8 w-8 fill-white text-white" />
              </span>
            </span>
            <span className="absolute bottom-5 left-6 text-left">
              <span className="block font-display text-xl font-semibold">HydroScan in action</span>
              <span className="block text-sm text-mist">Watch the working prototype scan a sample</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
