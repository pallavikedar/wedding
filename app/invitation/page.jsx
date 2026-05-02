"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// ─────────────────────────────────────────────────────────────────────────────
// ASSET MANIFEST
// ─────────────────────────────────────────────────────────────────────────────
const ALL_ASSETS = [
    "/openup.svg", "/openbottom.svg", "/1st bg imjage.svg", "/1st front.svg",
    "/Monogram.svg", "/1stbottom.svg", "/slidesecond.svg", "/3rd slide bg.svg",
    "/3rd slide top.svg", "/3rd slide second.svg", "/3rd slide4.svg",
    "/3rd slide3.svg", "/3rd slide bottom.svg", "/bg 4 section.svg",
    "/section 4 1.svg", "/section 4 2.svg", "/section 4 3.svg",
    "/Yellow BG.svg", "/Car BG.svg", "/Car.svg", "/wedding-11.svg", "/final.svg",
];

function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 5000);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────────────────────
function ConfettiBurst({ active }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#A78BFA", "#F97316", "#22D3EE", "#EC4899", "#84CC16", "#FFF", "#C9A96E"];

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const cx = canvas.width / 2;
        const cy = canvas.height * 0.52;

        const particles = Array.from({ length: 140 }, () => ({
            x: cx + (Math.random() - 0.5) * 60,
            y: cy,
            vx: (Math.random() - 0.5) * 20,
            vy: -(Math.random() * 16 + 5),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            w: Math.random() * 16 + 6,
            h: Math.random() > 0.7 ? Math.random() * 16 + 6 : Math.random() * 8 + 3,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 14,
            gravity: 0.5,
            life: 1,
            decay: Math.random() * 0.013 + 0.007,
            isCircle: Math.random() > 0.7,
        }));

        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            for (const p of particles) {
                if (p.life <= 0) continue;
                alive = true;
                p.x += p.vx; p.y += p.vy;
                p.vy += p.gravity; p.vx *= 0.985;
                p.rot += p.rotSpeed; p.life -= p.decay;
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rot * Math.PI) / 180);
                if (p.isCircle) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
                else { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
                ctx.restore();
            }
            if (alive) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [active]);

    return (
        <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, display: active ? "block" : "none" }} />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRATCH CARD
// ─────────────────────────────────────────────────────────────────────────────
function ScratchCard({ weddingDate = "05/05/26", onFullReveal }) {
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const isDrawing = useRef(false);
    const revealed = useRef(false);
    const hasTriggered = useRef(false);
    const lastCheck = useRef(0);
    const pointsQueue = useRef([]);
    const rafPending = useRef(false);
    const lastPoint = useRef(null);
    const [showDate, setShowDate] = useState(false);

    const CW = 640, CH = 320;

    const buildOverlay = useCallback(() => {
        const oc = document.createElement("canvas");
        oc.width = CW; oc.height = CH;
        const ctx = oc.getContext("2d");

        const grad = ctx.createLinearGradient(0, 0, CW, CH);
        grad.addColorStop(0, "#7a5400");
        grad.addColorStop(0.12, "#e6c231");
        grad.addColorStop(0.28, "#c9940a");
        grad.addColorStop(0.45, "#fff0a0");
        grad.addColorStop(0.6, "#b8860b");
        grad.addColorStop(0.78, "#f5d060");
        grad.addColorStop(1, "#7a5400");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CW, CH);

        for (let y = 0; y < CH; y += 2) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
            ctx.lineWidth = 1;
            ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
        }
        for (let i = 0; i < 80; i++) {
            const x1 = Math.random() * CW, y1 = Math.random() * CH;
            const len = Math.random() * 40 + 10, angle = (Math.random() - 0.5) * 0.4;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
            ctx.lineWidth = Math.random() * 1.5 + 0.5;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
            ctx.stroke();
        }

        const glare = ctx.createLinearGradient(0, 0, CW * 0.6, CH);
        glare.addColorStop(0, "rgba(255,255,255,0)");
        glare.addColorStop(0.4, "rgba(255,255,255,0.18)");
        glare.addColorStop(0.5, "rgba(255,255,255,0.35)");
        glare.addColorStop(0.6, "rgba(255,255,255,0.18)");
        glare.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glare;
        ctx.fillRect(0, 0, CW, CH);

        ctx.strokeStyle = "rgba(255,220,80,0.7)"; ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, CW - 12, CH - 12);
        ctx.strokeStyle = "rgba(100,60,0,0.25)"; ctx.lineWidth = 1.5;
        ctx.strokeRect(12, 12, CW - 24, CH - 24);

        overlayRef.current = oc;
        const vc = canvasRef.current;
        if (vc) vc.getContext("2d").drawImage(oc, 0, 0);
    }, []);

    useEffect(() => { buildOverlay(); }, [buildOverlay]);

    const getPoint = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        return {
            x: ((src.clientX - rect.left) / rect.width) * CW,
            y: ((src.clientY - rect.top) / rect.height) * CH,
        };
    }, []);

    const interpolate = (a, b) => {
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(1, Math.ceil(dist / 3));
        return Array.from({ length: steps }, (_, i) => ({
            x: a.x + (b.x - a.x) * ((i + 1) / steps),
            y: a.y + (b.y - a.y) * ((i + 1) / steps),
        }));
    };

    const drawScratch = useCallback((ctx, x, y) => {
        ctx.globalCompositeOperation = "destination-out";
        const rg = ctx.createRadialGradient(x, y, 0, x, y, 38);
        rg.addColorStop(0, "rgba(0,0,0,1)");
        rg.addColorStop(0.5, "rgba(0,0,0,0.85)");
        rg.addColorStop(0.8, "rgba(0,0,0,0.4)");
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(x, y, 38, 0, Math.PI * 2); ctx.fill();

        for (let i = 0; i < 7; i++) {
            const angle = Math.random() * Math.PI * 2;
            const length = Math.random() * 28 + 12;
            const x2 = x + Math.cos(angle) * length + (Math.random() - 0.5) * 10;
            const y2 = y + Math.sin(angle) * length + (Math.random() - 0.5) * 10;
            const lg = ctx.createLinearGradient(x, y, x2, y2);
            lg.addColorStop(0, "rgba(0,0,0,0.9)"); lg.addColorStop(1, "rgba(0,0,0,0)");
            ctx.strokeStyle = lg; ctx.lineWidth = Math.random() * 6 + 3; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + (x2 - x) * 0.5 + (Math.random() - 0.5) * 12,
                y + (y2 - y) * 0.5 + (Math.random() - 0.5) * 12,
                x2, y2
            );
            ctx.stroke();
        }
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60, Math.random() * 5 + 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.6 + 0.3})`; ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
    }, []);

    const flushPoints = useCallback(() => {
        rafPending.current = false;
        const canvas = canvasRef.current;
        if (!canvas || revealed.current) return;
        const ctx = canvas.getContext("2d");
        const pts = pointsQueue.current.splice(0);
        if (!pts.length) return;
        pts.forEach(pt => drawScratch(ctx, pt.x, pt.y));

        const now = performance.now();
        if (!hasTriggered.current && now - lastCheck.current > 400) {
            lastCheck.current = now;
            const data = ctx.getImageData(0, 0, CW, CH).data;
            let transparent = 0, total = 0;
            for (let i = 3; i < data.length; i += 32) { total++; if (data[i] < 128) transparent++; }
            if (total > 0 && (transparent / total) * 100 > 55) {
                hasTriggered.current = true; revealed.current = true;
                let alpha = 1;
                const wipe = () => {
                    alpha -= 0.055;
                    if (alpha <= 0) { ctx.clearRect(0, 0, CW, CH); setShowDate(true); onFullReveal?.(); return; }
                    ctx.clearRect(0, 0, CW, CH);
                    if (overlayRef.current) { ctx.globalAlpha = alpha; ctx.drawImage(overlayRef.current, 0, 0); ctx.globalAlpha = 1; }
                    requestAnimationFrame(wipe);
                };
                requestAnimationFrame(wipe);
            }
        }
    }, [drawScratch, onFullReveal]);

    const onStart = useCallback((e) => {
        e.preventDefault(); isDrawing.current = true;
        const pt = getPoint(e); if (pt) lastPoint.current = pt;
    }, [getPoint]);

    const onMove = useCallback((e) => {
        if (!isDrawing.current || revealed.current) return;
        e.preventDefault();
        const pt = getPoint(e); if (!pt) return;
        if (lastPoint.current) pointsQueue.current.push(...interpolate(lastPoint.current, pt));
        else pointsQueue.current.push(pt);
        lastPoint.current = pt;
        if (!rafPending.current) { rafPending.current = true; requestAnimationFrame(flushPoints); }
    }, [getPoint, flushPoints]);

    const onEnd = useCallback(() => { isDrawing.current = false; lastPoint.current = null; }, []);

    return (
        <div style={{ position: "relative", width: "92%", maxWidth: 380, margin: "0 auto", userSelect: "none", WebkitUserSelect: "none" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, pointerEvents: "none" }}>
                <img src="/wedding-11.svg" className="absolute h-[526px] w-full object-contain top-[-204px]" alt="" />
                <span style={{
                    fontFamily: "'Georgia','Times New Roman',serif",
                    fontSize: "clamp(1.4rem,5.5vw,2.4rem)",
                    fontWeight: 700, position: "absolute", top: "40px",
                    color: "#ffc55a", letterSpacing: "0.15em",
                    textShadow: "0 2px 16px rgba(0,0,0,0.6)",
                    transform: showDate ? "scale(1) translateY(0)" : "scale(0.75) translateY(10px)",
                    transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                    {weddingDate}
                </span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <canvas
                    ref={canvasRef} width={CW} height={CH}
                    style={{
                        display: "block", width: "80%", height: "68px",
                        position: "relative", top: "17px", zIndex: 2,
                        borderRadius: 14, touchAction: "none",
                        cursor: showDate ? "default" : "crosshair",
                        opacity: showDate ? 0 : 1,
                        transition: "opacity 0.4s ease", willChange: "opacity",
                        boxShadow: showDate ? "none" : "0 8px 32px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,220,80,0.3)",
                    }}
                    onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
                    onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Open() {
    const sectionRef = useRef(null);
    const section3Ref = useRef(null);
    const imageRef = useRef(null);
    const section1SentinelRef = useRef(null);
    const venueRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [envelopeAnimDone, setEnvelopeAnimDone] = useState(false);
    const [section2Loaded, setSection2Loaded] = useState(false);
    const [confettiActive, setConfettiActive] = useState(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);

    // ── Countdown
    const targetDate = new Date("2026-05-05T00:00:00").getTime();
    const getTimeRemaining = useCallback(() => {
        const d = targetDate - Date.now();
        return {
            days: Math.max(0, Math.floor(d / 86400000)),
            hours: Math.max(0, Math.floor((d % 86400000) / 3600000)),
            minutes: Math.max(0, Math.floor((d % 3600000) / 60000)),
        };
    }, [targetDate]);
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining);
    useEffect(() => {
        const t = setInterval(() => setTimeLeft(getTimeRemaining()), 1000);
        return () => clearInterval(t);
    }, [getTimeRemaining]);

    // ── Asset preloading
    useEffect(() => {
        // Lock scroll during loading — works on iPhone too
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        let loaded = 0;
        const total = ALL_ASSETS.length;
        Promise.all(
            ALL_ASSETS.map(src =>
                preloadImage(src).then(() => {
                    loaded++;
                    setProgress(Math.round((loaded / total) * 100));
                })
            )
        ).then(() => {
            setProgress(100);
            setTimeout(() => {
                // Restore scroll
                document.body.style.overflow = "";
                document.body.style.position = "";
                document.body.style.width = "";
                document.body.style.overflow = "hidden"; // re-lock until envelope opens
                setAssetsLoaded(true);
                setWindowHeight(window.visualViewport?.height ?? window.innerHeight);
            }, 300);
        });
        return () => {
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
        };
    }, []);

    // ── Scroll + resize — use visualViewport for iPhone dynamic toolbar
    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => { setScrollY(window.scrollY); ticking = false; });
                ticking = true;
            }
        };
        const onResize = () => {
            setWindowHeight(window.visualViewport?.height ?? window.innerHeight);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });
        window.visualViewport?.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            window.visualViewport?.removeEventListener("resize", onResize);
        };
    }, []);

    // ── Parallax (imperative, no state)
    useEffect(() => {
        let current = 0, target = 0, isVis = false;
        const observer = new IntersectionObserver(
            ([entry]) => { isVis = entry.isIntersecting; },
            { threshold: 0.3 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        const handleScroll = () => {
            if (!sectionRef.current || !isVis) return;
            const rect = sectionRef.current.getBoundingClientRect();
            target = Math.max(0, Math.min((window.innerHeight - rect.top) / window.innerHeight, 1)) * 40;
        };
        let raf;
        const animate = () => {
            if (isVis) {
                current += (target - current) * 0.08;
                if (imageRef.current) imageRef.current.style.transform = `translateY(${current}px)`;
            }
            raf = requestAnimationFrame(animate);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        animate();
        return () => {
            window.removeEventListener("scroll", handleScroll);
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, []);

    // ── AOS
    useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);

    // ── Envelope open
    const handleOpen = useCallback(() => {
        if (open) return;
        setOpen(true);
        setTimeout(() => {
            setEnvelopeAnimDone(true);
            document.body.style.overflow = "auto";
            document.body.style.position = "";
            document.body.style.width = "";
        }, 1700);
    }, [open]);

    const handleScratchReveal = useCallback(() => {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3500);
    }, []);

    const fadeUp = (delay) => ({
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0px)" : "translateY(40px)",
        transition: "opacity 1s ease, transform 1s ease",
        transitionDelay: `${delay}s`,
        willChange: "opacity, transform",
    });

    // ── Section 3 scroll
    const section3Start = section3Ref.current?.offsetTop || 0;
    const section3Progress = Math.max(0, Math.min((scrollY - section3Start) / windowHeight, 1));
    const getSection3Style = (index) => {
        if (scrollY < section3Start) return { transform: "translateY(0px)" };
        if (index === 0) return { transform: `translateY(${-section3Progress * windowHeight}px)`, willChange: "transform" };
        if (index === 1) return { transform: `translateY(${windowHeight - section3Progress * windowHeight}px)`, willChange: "transform" };
        return { transform: "translateY(0px)" };
    };

    // ── Section 4 scroll
    const scrollClamped = Math.max(0, Math.min(scrollY - windowHeight * 3, windowHeight * 4));
    const activeIndex = Math.floor(scrollClamped / windowHeight);
    const progressVal = (scrollClamped % windowHeight) / windowHeight;
    const getStyle = (index) => {
        if (index === activeIndex) return { transform: `translateY(${-progressVal * windowHeight}px)`, willChange: "transform" };
        if (index === activeIndex + 1) return { transform: `translateY(${windowHeight - progressVal * windowHeight}px)`, willChange: "transform" };
        if (index < activeIndex) return { transform: `translateY(${-windowHeight}px)` };
        return { transform: `translateY(${windowHeight}px)` };
    };

    // ── LOADER
    if (!assetsLoaded) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
                style={{ background: "linear-gradient(160deg,#fff8f0,#fdecd8,#f9dfc8)" }}>
                <p className="text-[#b68d33] font-bold text-2xl mb-8 tracking-[4px] uppercase">Wedding Loading</p>
                <div className="w-64 h-1.5 bg-[#f8e4d0] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg,#b68d33,#e8b56d)",
                        transition: "width 0.3s ease-out",
                    }} />
                </div>
                <p className="mt-3 text-[#b68d33] font-medium text-lg">{progress}%</p>
                <p className="absolute bottom-10 text-[#c4a06a] text-xs tracking-widest uppercase">Please Wait…</p>
            </div>
        );
    }

    // ── Derived scroll values
    const firstSectionScroll = Math.min(scrollY, windowHeight);
    const topProgress = Math.max(0, Math.min((scrollY - windowHeight) / (windowHeight * 0.9), 1));
    const topTransform = -(topProgress * topProgress) * 200;
    const sec3BotEnd = (section3Ref.current?.offsetTop || windowHeight * 2.2) + windowHeight * 0.4;
    const botProgress = Math.max(0, Math.min((scrollY - windowHeight) / (sec3BotEnd - windowHeight), 1));
    const botTransform = -(botProgress * botProgress) * 120;

    // ── Car animation
    const venueTop = venueRef.current?.offsetTop || 0;
    let carX = 110;
    if (scrollY >= venueTop) {
        carX = 10 - (Math.min((scrollY - venueTop) / (windowHeight * 0.6), 1) ** 2) * 130;
    } else if (scrollY >= venueTop - windowHeight) {
        const p = Math.min((scrollY - (venueTop - windowHeight)) / (windowHeight * 0.5), 1);
        carX = 110 - (1 - (1 - p) ** 3) * 100;
    }

    // ── Scroll down indicator
    const isLastSection = scrollY > windowHeight * 7 - windowHeight * 1.2;
    const showScrollDown = envelopeAnimDone && !isLastSection;

    return (
        <>
            <style>{`
        /* ── iPhone / iOS Safari fixes ── */
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-text-size-adjust: 100%; height: -webkit-fill-available; }
        body {
          min-height: -webkit-fill-available;
          background: #fff8f0;
          overscroll-behavior-y: none;
          /* Prevent momentum scroll bounce exposing white */
          -webkit-overflow-scrolling: touch;
        }
        * { -webkit-tap-highlight-color: transparent; }

        /* Prevent image drag on iOS */
        img { -webkit-user-drag: none; pointer-events: none; }
        /* Re-enable pointer events only where needed */
        canvas, a, button, [role="button"] { pointer-events: auto !important; }

        /* ── Envelope ── */
        .env-stage {
          perspective: 1000px;
          perspective-origin: 50% 0%;
          transform-style: preserve-3d;
        }
        .env-flap {
          position: absolute; inset: 0; width: 100%; height: 100%;
          transform-origin: top center;
          transform: rotateX(0deg);
          transition: transform 2500ms cubic-bezier(0.4,0,0.2,1);
          -webkit-backface-visibility: hidden; backface-visibility: hidden;
          will-change: transform; cursor: pointer; z-index: 30;
        }
        .env-flap.opened { transform: rotateX(175deg); }
        .env-body {
          position: absolute; inset: 0; width: 100%; height: 100%;
          transform-origin: bottom center; transform: rotateX(0deg);
          transition: transform 3500ms cubic-bezier(0.4,0,0.2,1);
          -webkit-backface-visibility: hidden; backface-visibility: hidden;
          will-change: transform; z-index: 20; pointer-events: none;
        }
        .env-body.opened { transform: rotateX(-175deg); }
        .env-flap::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(105deg,transparent 38%,rgba(255,255,255,0.22) 50%,transparent 62%);
          background-size: 220% 100%;
          animation: shimmer-move 3.2s linear infinite;
        }
        @keyframes shimmer-move { 0%,100% { background-position: 220% center; } }

        /* ── Tap hint ── */
        .tap-hint {
          position: absolute; top: 65%; left: 50%;
          transform: translateX(-50%);
          z-index: 40; pointer-events: none;
          text-align: center; width: max-content;
        }
        @media (max-height: 667px)                        { .tap-hint { top: 59%; } }
        @media (max-width: 320px)                         { .tap-hint { top: 60%; } }
        @media (min-width: 321px) and (max-width: 375px)  { .tap-hint { top: 63%; } }
        @media (min-width: 376px) and (max-width: 425px)  { .tap-hint { top: 64%; } }
        @media (min-width: 426px) and (max-width: 768px)  { .tap-hint { top: 66%; } }
        @media (min-width: 769px)                         { .tap-hint { top: 65%; } }

        .tap-hint-label {
          display: block; color: #b68d33; font-size: 10px;
          letter-spacing: 3.5px; font-weight: 900;
          text-transform: uppercase; white-space: nowrap;
        }

        /* ── Scratch ── */
        .scratch-overlay {
          position: absolute; top: 53%; left: 50%;
          transform: translate(-50%,-50%);
          width: 100%; z-index: 20;
          display: flex; flex-direction: column;
          align-items: center; gap: 8px; padding: 0 16px;
        }
        .scratch-title {
          font-family: 'Georgia', serif;
          font-size: clamp(2rem, 5vw, 2.2rem);
          color: #ffc55a; font-weight: 700;
          letter-spacing: 0.04em;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
          text-align: center; margin-bottom: 2px;
        }
        .scratch-subtitle {
          font-family: 'Georgia', serif;
          font-size: clamp(0.85rem, 2.4vw, 0.98rem);
          color: #671d02; text-align: center;
          letter-spacing: 0.03em; margin-bottom: 14px; line-height: 1.5;
        }

        /* GPU hints */
        .scroll-layer { will-change: transform; transform: translateZ(0); }

        /* ── Animations ── */
        @keyframes chevronFade { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
        @keyframes scrollFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* ── Car ── */
        .car-img { width: 294px; height: 531px; }

        /* ── Section heights use svh for iPhone dynamic toolbar ── */
        .full-h { height: 100svh; }
        @supports not (height: 100svh) {
          .full-h { height: 100vh; }
        }
      `}</style>

            <ConfettiBurst active={confettiActive} />

            {/* ── SCROLL DOWN — fixed, white, visible all sections except last ── */}
            {showScrollDown && (
                <div style={{
                    position: "fixed",
                    bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 9998,
                    pointerEvents: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    animation: "scrollFadeIn 0.8s ease both",
                }}>
                    <span style={{
                        color: "#ffffff",
                        fontSize: "11px",
                        letterSpacing: "3px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontFamily: "Georgia, serif",
                        textShadow: "0 1px 8px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.9)",
                        whiteSpace: "nowrap",
                    }}>
                        Scroll Down
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                        {[0, 1, 2].map((i) => (
                            <svg key={i} width="14" height="8" viewBox="0 0 14 8" fill="none"
                                style={{ animation: `chevronFade 1.6s ease-in-out ${i * 0.18}s infinite` }}>
                                <path d="M1 1L7 7L13 1" stroke="#ffffff" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round"
                                    style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" }} />
                            </svg>
                        ))}
                    </div>
                </div>
            )}

            <div className={`relative ${open && envelopeAnimDone ? "min-h-[700vh]" : "full-h overflow-hidden"}`}>

                {/* ── SECTION 1 — Envelope ── */}
                <div
                    ref={sectionRef}
                    className="sticky top-0 w-full overflow-hidden full-h"
                    style={{ background: "linear-gradient(160deg,#fff8f0 0%,#fdecd8 55%,#f5d5b8 100%)" }}
                >
                    <img src="/1st bg imjage.svg"
                        className="absolute inset-0 w-full h-full object-cover scroll-layer"
                        style={{ ...fadeUp(0), opacity: open ? 1 : 0 }} alt="" />

                    <div className="absolute inset-0 w-full h-full scroll-layer" style={{
                        opacity: open ? 1 : 0,
                        transform: open ? "translateY(-7px)" : "translateY(100%)",
                        transition: open
                            ? "opacity 0.9s cubic-bezier(0.22,1,0.36,1),transform 1.4s cubic-bezier(0.22,1,0.36,1)"
                            : "transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.3s ease",
                        transitionDelay: open ? "0.9s" : "0s",
                        willChange: "transform, opacity",
                    }}>
                        <img src="/1st front.svg" className="w-full h-full object-cover" alt=""
                            style={{
                                transform: open ? `translateY(-${firstSectionScroll}px)` : "translateY(100%)",
                                opacity: open ? 1 : 0,
                                transition: open ? "none" : "transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.3s ease",
                            }} />
                    </div>

                    <div className="absolute inset-0 w-full h-full scroll-layer" style={{
                        transform: open ? `translateY(-${firstSectionScroll}px)` : "translateY(0)",
                        opacity: open ? 1 : 0,
                    }}>
                        <img src="/Monogram.svg" className="absolute object-contain" alt="Logo"
                            style={{
                                width: "clamp(180px,22vw,122px)", height: "auto",
                                top: "50%", left: "50%",
                                transform: open
                                    ? "translate(-50%,-50%) translateY(0)"
                                    : "translate(-50%,-50%) translateY(40px)",
                                opacity: open ? 1 : 0,
                                transition: "opacity 1.4s ease, transform 1.5s ease",
                                transitionDelay: "1.5s",
                                willChange: "opacity, transform",
                            }} />
                    </div>

                    <div className="env-stage absolute inset-0 w-full h-full"
                        style={{ pointerEvents: open ? "none" : "auto" }}>
                        <div className={`env-body${open ? " opened" : ""}`}>
                            <img src="/openbottom.svg" className="w-full h-full object-cover" alt="" />
                        </div>
                        <div
                            className={`env-flap${open ? " opened" : ""}`}
                            onClick={handleOpen}
                            role="button" aria-label="Open invitation" tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && handleOpen()}
                        >
                            <img src="/openup.svg" className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>

                    {!open && (
                        <div className="tap-hint">
                            <span className="tap-hint-label">Tap to Open</span>
                        </div>
                    )}
                </div>

                {open && envelopeAnimDone && (
                    <>
                        <div className="relative">
                            <img src="/1stbottom.svg"
                                className="absolute w-full object-cover scroll-layer"
                                style={{
                                    bottom: "-14px", opacity: open ? 1 : 0, transform: open
                                        ? "translate(0%,0%) translateY(0)"
                                        : "translate(0%,0%) translateY(40px)", transition: "opacity 1.8s ease, transform 1.8s ease",
                                    transitionDelay: "1.8s",
                                    willChange: "opacity, transform",
                                }} alt="" />
                        </div>

                        {/* ── SECTION 2 — Names ── */}
                    <div className="w-full">
    <div className="w-full bg-[#5b3525] relative overflow-hidden full-h">
        {!section2Loaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">Loading…</div>
        )}
        <img src="/slidesecond.svg"
            onLoad={() => setSection2Loaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${section2Loaded ? "opacity-100" : "opacity-0"}`}
            alt="" />
        <div
            className="relative w-full max-w-sm overflow-hidden rounded-xl"
            style={{
                // background: "linear-gradient(160deg, #1a0a00 0%, #2d1200 40%, #1a0800 100%)",
                minHeight: 820,
            }}
        >
            {/* diagonal lattice texture */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    opacity: 0.04,
                    backgroundImage:
                        "repeating-linear-gradient(45deg, #c9922a 0px, #c9922a 1px, transparent 1px, transparent 24px)",
                }}
            />

            {/* radial glow top */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: -80, left: "50%", transform: "translateX(-50%)",
                    width: 300, height: 300,
                    background: "radial-gradient(circle, #c9922a18 0%, transparent 70%)",
                    borderRadius: "50%",
                }}
            />
            {/* radial glow bottom */}
            <div
                className="absolute pointer-events-none"
                style={{
                    bottom: -80, left: "50%", transform: "translateX(-50%)",
                    width: 300, height: 300,
                    background: "radial-gradient(circle, #c9922a12 0%, transparent 70%)",
                    borderRadius: "50%",
                }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col items-center text-center px-10 py-19">

                {/* Sanskrit invocations */}
                <p
                    className="mb-1 tracking-widest"
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "8px",
                        color: "#ddc58a",
                        letterSpacing: "0.08em",
                    }}
                >
                    ॥ श्री गणेशाय नमः ॥
                </p>
                <p
                    className="mb-1"
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "8px",
                       color: "#d2bc86",
                        letterSpacing: "0.08em",
                    }}
                >
                    ॥ ॐ गंगनाथ देवताय नमः ॥
                </p>

                {/* Blessings */}
                <p
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "12px",
                        color: "#e8c57a99",
                        letterSpacing: "0.04em",
                        margin: "0 0 4px",
                        lineHeight: 1.6,
                    }}
                >
                    With the blessings of
                </p>
                <p
                    style={{
                        fontFamily: "'Cinzel', Georgia, serif",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "#e8c57a",
                        letterSpacing: "0.1em",
                        margin: 0,
                    }}
                >
                    Smt. Saraswati{" "}
                    <span style={{ color: "#c9922a" }}>&amp;</span>{" "}
                    Shri. Govardhan Joshi
                </p>

                <div className="mt-3" />

                {/* Host */}
                <p
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "13px",
                        color: "#e8c57a99",
                        margin: "0 0 2px",
                    }}
                >
                    Mrs.
                </p>
                <p
                    style={{
                        fontFamily: "'Cinzel', Georgia, serif",
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#f5d788",
                        letterSpacing: "0.1em",
                        margin: 0,
                    }}
                >
                    Kamlesh Joshi
                </p>

                {/* Invite prose */}
                <p
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "12px",
                        color: "#e8c57a88",
                        lineHeight: 1.8,
                        margin: 0,
                    }}
                >
                    Awaits your presence for<br />
                    the wedding celebrations<br />
                    of her son
                </p>

                <div className="mt-3" />

                {/* Groom name */}
                <p
                    style={{
                        fontFamily: "'Cinzel', Georgia, serif",
                        fontSize: "32px",
                        fontWeight: 600,
                        color: "#f5d788",
                        letterSpacing: "0.12em",
                        lineHeight: 1.1,
                        textShadow: "0 0 40px #c9922a55",
                        margin: "6px 0 0",
                    }}
                >
                    Naivedya
                </p>

                {/* With */}
                <p
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "16px",
                        color: "#c9922a",
                        letterSpacing: "0.2em",
                        margin: "10px 0",
                    }}
                >
                    — with —
                </p>

                {/* Bride name */}
                <p
                    style={{
                        fontFamily: "'Cinzel', Georgia, serif",
                        fontSize: "32px",
                        fontWeight: 600,
                        color: "#f5d788",
                        letterSpacing: "0.12em",
                        lineHeight: 1.1,
                        textShadow: "0 0 40px #c9922a55",
                        margin: "0 0 6px",
                    }}
                >
                    Shreya
                </p>

                {/* Bride's parents */}
                <p
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: 14,
                        color: "#e8c57a66",
                        letterSpacing: "0.06em",
                        margin: 0,
                    }}
                >
                    Daughter of
                </p>
                <p
                    style={{
                        fontFamily: "'Cinzel', Georgia, serif",
                        fontSize: 14,
                        fontWeight: 400,
                     color: "#f5d788",
                        letterSpacing: "0.08em",
                        lineHeight: 1.9,
                        margin: "4px 0 0",
                    }}
                >
                    Mrs. Sandhya Bahadure
                    <br />
                    <span style={{  color: "#f5d788",}}>&amp;</span>
                    <br />
                    Mr. Anil Bahadure
                </p>
            </div>
        </div>
    </div>
</div>

                        <div ref={section1SentinelRef} style={{ height: "1px" }} />

                        {/* Top overlay */}
                        <div style={{
                            position: "relative", top: "-82px", zIndex: 30,
                            pointerEvents: "none", marginBottom: "-332px", height: "320px",
                            transform: `translateY(${topTransform}px)`,
                            transition: "transform 0.1s linear", willChange: "transform",
                        }}>
                            <img src="/3rd slide top.svg" className="w-full object-cover"
                                style={{ height: "300px", display: "block", position: "relative", zIndex: 30 }} alt="" />
                        </div>

                        {/* ── SECTION 3 — Scratch Card ── */}
                        <div ref={section3Ref} className="w-full relative overflow-hidden full-h" style={{ zIndex: 10 }}>
                            <div className="sticky top-0 w-full overflow-hidden full-h">
                                <img src="/3rd slide bg.svg" className="absolute inset-0 w-full h-full object-cover" alt="" />

                                <img src="/3rd slide second.svg"
                                    className="absolute w-full h-full object-cover top-[40px] scroll-layer"
                                    style={getSection3Style(0)} alt="" />

                                <div className="scratch-overlay">
                                    <p className="scratch-title">Reveal</p>
                                    <p className="scratch-subtitle">Scratch to discover<br />the wedding date</p>
                                    <ScratchCard weddingDate="05/05/26" onFullReveal={handleScratchReveal} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom overlay */}
                        <div style={{
                            position: "relative", top: "-82px", zIndex: 30,
                            pointerEvents: "none", marginBottom: "-332px", height: "320px",
                            transform: `translateY(${botTransform}px)`,
                            transition: "transform 1s linear", willChange: "transform",
                        }}>
                            <img src="/3rd slide bottom.svg" className="w-full object-cover"
                                style={{ height: "300px", display: "block", position: "relative", zIndex: 30 }} alt="" />
                        </div>

                        {/* ── SECTION 4 — Events ── */}
                        <div className="relative h-[300vh] w-full">
                            <div className="sticky top-0 w-full overflow-hidden full-h"
                                style={{ fontFamily: "'Georgia','Times New Roman',serif" }}>
                                <img src="/bg 4 section.svg" className="absolute inset-0 w-full h-full object-cover" alt="" />
                                <h2 className="absolute top-[71px] left-1/2 -translate-x-1/2 text-[#f3c53c] text-3xl font-bold z-10">Events</h2>
                                <img src="/wedding-11.svg"
                                    className="absolute h-[526px] w-full object-contain top-[-172px]"
                                    style={{ zIndex: 9 }} alt="" />

                                {[
                                    {
                                        img: "/Day 1.svg",
                                        node: (
                                            <div className="max-w-[300px] w-full text-center z-10 mt-[18px]">
                                                <p className="text-base font-medium text-[#5c3a1e]">Day 1<br />04/05/26</p>
                                                <h2 className="text-l font-semibold text-[#c200b9] mt-1">Carnival Haldi</h2>
                                                <h2 className="text-xs font-semibold text-[#5a1e57]">Followed By Lunch</h2>
                                                <p className="text-sm text-[#c200b9]">12 pm</p>
                                                <h2 className="text-l font-semibold text-green-700 mt-2">High Tea</h2>
                                                <p className="text-sm text-green-700">4.30 pm</p>
                                                <p className="text-sm text-[#5c3a1e] mt-2">Mangli Lake Farm</p>
                                            </div>
                                        ),
                                    },
                                    {
                                        img: "/Day 2 A.svg",
                                        node: (
                                            <div className="max-w-[300px] w-full text-center z-10 mt-[18px]">
                                                <p className="text-base font-medium text-[#5c3a1e]">Day 2<br />05/05/26</p>
                                                <h2 className="text-l font-bold text-[#cc4949]">Maharashtrian<br />Lagna</h2>
                                                <p className="text-base text-orange-700">12 pm</p>
                                                <h2 className="text-l font-semibold text-green-700">High Tea</h2>
                                                <p className="text-sm text-green-700">5 pm</p>
                                                <p className="text-sm text-[#5c3a1e]">Mangli Lake Farm</p>
                                            </div>
                                        ),
                                    },
                                    {
                                        img: "/Day 2 B.svg",
                                        node: (
                                            <div className="max-w-[300px] w-full text-center mt-6 z-10">
                                                <p className="text-base font-medium text-[#5c3a1e]">Day 2<br />05/05/26</p>
                                                <h2 className="text-l font-semibold text-orange-700">Barat</h2>
                                                <p className="text-sm text-orange-700">6 pm</p>
                                                <h2 className="text-l font-semibold text-green-700">Varmala &amp;<br />Reception</h2>
                                                <p className="text-sm text-green-700">7 pm onwards</p>
                                                <h2 className="text-l font-semibold text-[#c200b9]">Pahadi Shadi</h2>
                                                <p className="text-sm text-[#5c3a1e]">Mangli Lake Farm</p>
                                            </div>
                                        ),
                                    },
                                ].map((slide, i) => (
                                    <div key={i}
                                        className="absolute inset-0 flex items-center justify-center scroll-layer top-[133px]"
                                        style={getStyle(i)}>
                                        <img src={slide.img} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                        {/* <div className="relative flex items-center justify-center w-full h-full px-6">
                      {slide.node}
                    </div> */}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── SECTION 5 — Venue ── */}
                        <div ref={venueRef}
                            className="w-full relative flex flex-col items-center justify-center text-center full-h"
                            style={{ fontFamily: "Georgia,'Times New Roman',Times,serif", overflow: "clip" }}>
                            <img src="/Yellow BG.svg" className="absolute inset-0 w-full h-full object-cover"
                                style={{ opacity: 0.7, zIndex: 0 }} alt="" />
                            <img src="/Car BG.svg" className="absolute inset-0 w-full h-full object-cover"
                                style={{ zIndex: 1 }} alt="" />
                            <img src="/Car.svg" className="absolute object-contain scroll-layer car-img"
                                style={{ transform: `translateX(${carX}vw)`, transition: "transform 0.05s linear", zIndex: 2, bottom: "-2%" }}
                                alt="Car" />

                            <div className="relative flex flex-col items-center w-full px-4"
                                style={{ marginTop: "-242px", zIndex: 10 }}>
                                <h2 className="text-4xl font-bold text-[#1f2a5a] mb-2" data-aos="fade-up">Venue</h2>
                                <p className="text-base text-[#1f2a5a] leading-relaxed mb-6" data-aos="fade-up">
                                    Mangli Lake Farm,<br />
                                    Near Champa (2km), Umred Road,<br />
                                    Nagpur, Maharashtra 441204
                                </p>
                                <div className="w-full max-w-[320px] rounded-xl shadow-xl mb-6"
                                    style={{ height: "130px", overflow: "hidden", position: "relative", zIndex: 10 }}
                                    data-aos="fade-up">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.1813833139236!2d79.21359369999999!3d20.985365100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4b06250837d09%3A0x1e737c4de53c6add!2sMangli%20Lake%20Farm!5e0!3m2!1sen!2sin!4v1772619329004!5m2!1sen!2sin"
                                        width="100%" height="100%"
                                        style={{ border: 0, display: "block", pointerEvents: "auto" }}
                                        allowFullScreen="" loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Mangli Lake Farm Location"
                                    />
                                </div>
                                <img src="/wedding-11.svg" className="absolute"
                                    style={{ height: "502px", top: "77px", left: "50%", transform: "translateX(-50%)", zIndex: 3 }} alt="" />
                                <a href="https://maps.google.com/?q=Mangli+Lake+Farm+Nagpur"
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-white px-8 py-3 rounded-full text-base font-semibold active:scale-95 transition-transform"
                                    style={{ position: "relative", zIndex: 10, background: "transparent" }}
                                    data-aos="fade-up">
                                    Get Directions
                                </a>
                            </div>
                        </div>

                        {/* ── SECTION 6 — Countdown ── */}
                        <div className="w-full relative flex items-center justify-center text-center overflow-hidden full-h"
                            style={{ fontFamily: "Georgia,'Times New Roman',Times,serif" }}>
                            <img src="/Blue BG.svg" className="absolute inset-0 w-full h-full object-cover" alt="" />
                            <img src="/blue 2.svg" className="absolute inset-0 w-full h-full object-cover" alt="" />
                            <img src="/blue bottom.svg" className="absolute inset-0 w-full h-full object-cover" alt="" />
                            <div className="relative z-10 flex flex-col items-center px-4" style={{ marginTop: "-113px" }}>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#f3c178] mb-6" data-aos="fade-up">
                                    The<br />Countdown<br />Begins
                                </h2>
                                <div className="bg-[#1e2250] text-white px-6 py-2 rounded-full text-lg font-semibold shadow-lg mb-6 tracking-widest"
                                    data-aos="fade-up">
                                    {timeLeft.days}D &nbsp;{timeLeft.hours}H &nbsp;{timeLeft.minutes}M
                                </div>
                                <p className="text-white text-sm max-w-xs leading-relaxed" data-aos="fade-up">
                                    One love, one promise,<br />one celebration — with you.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default Open;