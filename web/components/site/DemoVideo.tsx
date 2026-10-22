"use client";

import { useState } from "react";
import { links } from "@/lib/content";

/** Loads the YouTube player only when the visitor presses play. */
export default function DemoVideo() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="demo">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${links.youtubeId}?autoplay=1&rel=0&playsinline=1`}
          title="HydroScan demo video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label="Play the HydroScan demo video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${links.youtubeId}/hqdefault.jpg`} alt="" />
          <span className="demo__play" aria-hidden>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#e6f2f4"><path d="M8 5.5v13l10.5-6.5z" /></svg>
          </span>
          <span className="demo__cap"><b>HydroScan in action</b>The working prototype scanning a sample</span>
        </button>
      )}
    </div>
  );
}
