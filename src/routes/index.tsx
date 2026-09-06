import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import heroStrip from "../assets/booth-strip-hero.jpg";
import strip1 from "../assets/booth-strip-1.jpg";
import strip2 from "../assets/booth-strip-2.jpg";
import strip3 from "../assets/booth-strip-3.jpg";
import strip4 from "../assets/booth-strip-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixelbooth — your photobooth, live on the web" },
      {
        name: "description",
        content:
          "Pixelbooth is a cute Y2K photobooth that publishes every photo strip to the web the moment you take it. Watch the live gallery or add your own.",
      },
      { property: "og:title", content: "Pixelbooth — your photobooth, live on the web" },
      {
        property: "og:description",
        content:
          "Every photo strip from the booth appears online instantly. Peek the live gallery or add your own photo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PixelboothPage,
});

type Frame = {
  id: string;
  src: string;
  title: string;
  time: string;
  source: "booth" | "you";
};

const seedFrames: Frame[] = [
  { id: "s1", src: strip1, title: "Peace sign gang", time: "14:02", source: "booth" },
  { id: "s2", src: strip2, title: "Star shades crew", time: "14:37", source: "booth" },
  { id: "s3", src: strip3, title: "Very good pup", time: "15:10", source: "booth" },
  { id: "s4", src: strip4, title: "The jump squad", time: "15:48", source: "booth" },
];

const upcomingFrames: Omit<Frame, "id" | "time">[] = [
  { src: strip4, title: "One more jump!", source: "booth" },
  { src: strip1, title: "Back for round two", source: "booth" },
  { src: strip3, title: "Pup, encore", source: "booth" },
  { src: strip2, title: "Star shades, again", source: "booth" },
];

const STORAGE_KEY = "pixelbooth-uploads";

function loadUploads(): Frame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Frame[];
  } catch {
    return [];
  }
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function PixelboothPage() {
  const [frames, setFrames] = useState<Frame[]>(() => [
    ...loadUploads().map((f) => ({ ...f, source: "you" as const })),
    ...seedFrames,
  ]);
  const [lastDrop, setLastDrop] = useState("just now");
  const counter = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  // Simulated booth: a new strip drops every 40 seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      const next = upcomingFrames[counter.current % upcomingFrames.length]!;
      counter.current += 1;
      setFrames((prev) => [
        { ...next, id: `auto-${Date.now()}`, time: nowTime() },
        ...prev,
      ]);
      setLastDrop("just now");
    }, 40000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ticker = setInterval(() => setLastDrop("a moment ago"), 45000);
    return () => clearInterval(ticker);
  }, []);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const frame: Frame = {
        id: `you-${Date.now()}`,
        src,
        title: file.name.replace(/\.[^.]+$/, "").slice(0, 32) || "My moment",
        time: nowTime(),
        source: "you",
      };
      setFrames((prev) => [frame, ...prev]);
      const saved = loadUploads();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([frame, ...saved].slice(0, 12)));
      } catch {
        // storage full — keep it in memory only
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const openPicker = () => fileInput.current?.click();

  return (
    <div className="min-h-screen bg-chrome font-body text-ink selection:bg-blush/40">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-24 pixel-grid" />
      <div className="pointer-events-none fixed bottom-0 left-0 h-24 w-40 pixel-grid" />

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <header className="relative z-10 mx-auto max-w-6xl px-5 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl chrome shadow-[0_6px_0_rgba(150,163,188,0.5)]">
              <span className="font-display text-xl font-extrabold text-ink">P</span>
            </div>
            <div className="leading-none">
              <p className="font-display text-2xl font-extrabold tracking-tight">Pixelbooth</p>
              <p className="-mt-0.5 font-pixel text-lg text-silver">photo strips · live</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 font-pixel text-lg text-ink outline-1 outline-ink/10 sm:flex">
              <span className="size-2 animate-pulse rounded-full bg-emerald-400" /> booth online
            </span>
            <button
              onClick={openPicker}
              className="rounded-full brushed px-4 py-2 text-sm font-bold shadow-[0_4px_0_rgba(150,163,188,0.5)] transition active:translate-y-0.5 active:shadow-none"
            >
              + Upload
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5">
        <section className="grid items-start gap-8 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-14">
          <div className="relative">
            <span className="absolute -top-3 -left-1 rotate-[-6deg] rounded-lg bg-white/80 px-2 py-0.5 font-pixel text-xl text-blush outline-1 outline-blush/40">
              new!
            </span>
            <h1 className="font-display text-[3.4rem] font-extrabold leading-[0.92] tracking-tight sm:text-6xl">
              The booth
              <br />
              <span className="relative inline-block px-2">
                <span className="absolute inset-0 -z-10 rotate-1 rounded-2xl chrome" />
                <span className="relative">posts itself</span>
              </span>
              <br />
              to the web.
            </h1>
            <p className="mt-5 max-w-md text-lg font-medium text-ink/70">
              Step into Pixelbooth, strike a pose, and your strip appears on this page
              the second it prints. Share the link with friends and watch the day fill up.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#strips"
                className="inline-block rounded-full chrome px-6 py-3 font-bold shadow-[0_6px_0_rgba(150,163,188,0.55)] transition active:translate-y-1 active:shadow-none"
              >
                See the live strips
              </a>
              <button
                onClick={openPicker}
                className="rounded-full bg-white px-6 py-3 font-bold outline-2 outline-ink shadow-[0_6px_0_rgba(35,36,58,0.9)] transition active:translate-y-1 active:shadow-none"
              >
                + Upload your own
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="font-display text-3xl font-extrabold">{frames.length}</p>
                <p className="font-pixel text-lg text-silver">strips so far</p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold">auto</p>
                <p className="font-pixel text-lg text-silver">publish on print</p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold">4-cut</p>
                <p className="font-pixel text-lg text-silver">strip style</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <span className="absolute -top-4 -right-2 z-10 rotate-6 rounded-lg bg-white/80 px-2 py-0.5 font-pixel text-xl text-sky outline-1 outline-sky/40">
              auto*
            </span>
            <div className="rounded-[28px] chrome p-3 shadow-[0_14px_0_rgba(150,163,188,0.45)]">
              <img
                src={heroStrip}
                alt="A Pixelbooth photo strip with cute sticker doodles"
                width={1024}
                height={1280}
                className="aspect-[4/5] w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-ink/10"
              />
              <div className="flex items-center justify-between px-2 pt-3 pb-1">
                <div>
                  <p className="font-display text-lg font-bold leading-none">
                    Fresh from the booth · 09:42
                  </p>
                  <p className="font-pixel text-lg text-silver">booth: main-street-01</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 font-pixel text-lg text-ink outline-1 outline-ink/10">
                  <span className="size-2 animate-pulse rounded-full bg-emerald-400" /> live
                </span>
              </div>
            </div>
            <div className="-mx-1 mt-3 flex gap-3">
              <img
                src={strip3}
                alt="Photo strip of a fluffy dog"
                loading="lazy"
                width={512}
                height={512}
                className="aspect-square w-24 rotate-[-3deg] rounded-xl object-cover outline-1 -outline-offset-1 outline-ink/10"
              />
              <img
                src={strip2}
                alt="Photo strip with star-shaped sunglasses"
                loading="lazy"
                width={512}
                height={512}
                className="aspect-square w-24 rotate-2 rounded-xl object-cover outline-1 -outline-offset-1 outline-ink/10"
              />
            </div>
          </div>
        </section>

        <section id="strips" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-pixel text-xl text-silver">{"// the wall"}</p>
              <h2 className="font-display text-4xl font-extrabold tracking-tight">
                Just now, from the booth
              </h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-2 font-pixel text-lg text-ink outline-1 outline-ink/10">
              <span className="size-2 animate-pulse rounded-full bg-emerald-400" /> updating · last
              strip {lastDrop}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {frames.map((frame, i) => (
              <figure key={frame.id} className="relative">
                <span
                  className={`absolute -top-2 -left-1 z-10 rounded-md px-1.5 py-0.5 font-pixel text-lg ${
                    frame.source === "booth"
                      ? i % 3 === 0
                        ? "rotate-[-5deg] bg-blush/90 text-ink"
                        : i % 3 === 1
                          ? "rotate-3 bg-sky/90 text-ink"
                          : "rotate-[-4deg] bg-mint/90 text-ink"
                      : "rotate-2 bg-ink text-white"
                  }`}
                >
                  {frame.source === "booth" ? "booth" : "you"}
                </span>
                <img
                  src={frame.src}
                  alt={frame.title}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-square w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-ink/10"
                />
                <figcaption className="mt-2">
                  <p className="font-display text-base font-bold leading-tight">{frame.title}</p>
                  <p className="font-pixel text-lg text-silver">
                    {frame.source === "booth" ? "main-street-01" : "manual"} · {frame.time}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="grid items-center gap-6 rounded-[32px] chrome p-6 shadow-[0_12px_0_rgba(150,163,188,0.4)] md:grid-cols-[auto_1fr] md:p-8">
            <div className="grid size-24 rotate-[-4deg] place-items-center rounded-2xl brushed p-4">
              <span className="font-display text-3xl font-extrabold">+</span>
            </div>
            <div>
              <p className="font-pixel text-xl text-silver">{"// add your own"}</p>
              <h3 className="font-display text-3xl font-extrabold tracking-tight">
                Not at the booth? Drop a photo in anyway.
              </h3>
              <p className="mt-2 max-w-lg font-medium text-ink/70">
                Upload a picture from your phone and it lands right beside the booth
                strips — sticker tag and all.
              </p>
              <button
                onClick={openPicker}
                className="mt-4 rounded-full bg-white px-6 py-3 font-bold outline-2 outline-ink shadow-[0_6px_0_rgba(35,36,58,0.9)] transition active:translate-y-1 active:shadow-none"
              >
                Upload a photo
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-ink/10 pt-6 pb-10 sm:flex-row sm:items-center">
          <p className="font-pixel text-xl text-silver">pixelbooth · every strip, posted ✦</p>
          <p className="font-body text-sm font-semibold text-ink/60">
            Cute booth, classy web. © 2026 Pixelbooth
          </p>
        </footer>
      </main>
    </div>
  );
}
