import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, TrendingUp, AlertTriangle, Crosshair, Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// A simple local typewriter component for the cinematic intro
const GSAPTypewriter: React.FC<{ text: string; delay?: number; onComplete?: () => void }> = ({ text, delay = 0, onComplete }) => {
  const textRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!textRef.current) return;
    
    const chars = text.split("");
    textRef.current.innerHTML = "";
    chars.forEach((char) => {
      const span = document.createElement("span");
      span.innerText = char;
      span.style.opacity = "0";
      textRef.current?.appendChild(span);
    });

    gsap.to(textRef.current.children, {
      opacity: 1,
      duration: 0.05,
      stagger: 0.05,
      delay: delay,
      ease: "power2.inOut",
      onComplete: onComplete
    });
  }, { scope: textRef });

  return <div ref={textRef} style={{ display: 'inline-block' }} />;
};

export const MarketJourneyInteractive: React.FC<{ canStart: boolean }> = ({ canStart }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Orchestrator Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // Scene 1 Refs (Ignition)
  const introLayerRef = useRef<HTMLDivElement>(null);
  const meteorShipRef = useRef<HTMLDivElement>(null);

  // Scene 2 Refs (Price Action Tunnel)
  const tunnelLayerRef = useRef<HTMLDivElement>(null);
  const floatingChartsRef = useRef<HTMLDivElement>(null);

  // Scene 3 Refs (Indicator Chamber)
  const indicatorLayerRef = useRef<HTMLDivElement>(null);

  const [introStarted, setIntroStarted] = useState(false);

  useGSAP(() => {
    if (!canStart || !containerRef.current) return;

    // SCENE 0: Initial Mount Animations (Before user scrolls deep)
    gsap.set(meteorShipRef.current, { y: '50vh', scale: 0, opacity: 0 });
    gsap.set(introLayerRef.current, { opacity: 0 });
    gsap.set(tunnelLayerRef.current, { opacity: 0, scale: 0.8, z: -500 });
    gsap.set(indicatorLayerRef.current, { opacity: 0, y: '20vh' });

    // Let the component settle, then animate ship entering "camera"
    const entryTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => setIntroStarted(true)
      }
    });

    entryTl
      .to(meteorShipRef.current, { scale: 1, opacity: 1, duration: 2, ease: "power3.out" })
      .to(introLayerRef.current, { opacity: 1, duration: 1 }, "-=1");

    // ============================================
    // THE MASTER SCROLLTIMELINE (Scrollytelling)
    // ============================================
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=8000', // Massive 8000px scroll depth journey
        scrub: 1, // Smooth dampening
        pin: true, // Keep the viewport frozen while traveling
      }
    });

    // --- PHASE 1: Leaving Ignition & Entering Tunnel (0% -> 25%) ---
    masterTl
      // Fade out intro text
      .to(introLayerRef.current, { opacity: 0, scale: 1.1, duration: 1 })
      // Accelerate the ship "forward" visually by making it smaller/centered
      .to(meteorShipRef.current, { scale: 0.5, y: '-10vh', duration: 2 }, "<")
      // Bring in the glowing charts tunnel
      .to(tunnelLayerRef.current, { opacity: 1, scale: 1, duration: 2 }, "-=1.5");

    // --- PHASE 2: Flying Through Tunnel (25% -> 50%) ---
    masterTl
      // Charts fly past the camera (scale up drastically)
      .to(floatingChartsRef.current, { scale: 3, opacity: 0, duration: 3, ease: 'power1.in' })
      // Ship glows red/green mapping to the market
      .to(meteorShipRef.current, { filter: 'drop-shadow(0 0 30px #ef4444)', duration: 1 }, "-=2")
      .to(meteorShipRef.current, { filter: 'drop-shadow(0 0 30px #10b981)', duration: 1 }, "-=1");

    // --- PHASE 3: Entering Indicator Chamber (50% -> 75%) ---
    masterTl
      // Fade out tunnel, fade in clean technical chamber
      .to(tunnelLayerRef.current, { opacity: 0, duration: 1 })
      .to(indicatorLayerRef.current, { opacity: 1, y: '0vh', duration: 1.5 }, "<")
      // Ship parks into a scanning/focus state
      .to(meteorShipRef.current, { scale: 0.8, y: '30vh', filter: 'drop-shadow(0 0 10px #00ccff)', duration: 1.5 }, "<");

    // --- PHASE 4: The Exit (75% -> 100%) ---
    masterTl
      .to(indicatorLayerRef.current, { opacity: 0, y: '-20vh', duration: 2 })
      // Meteor blasts off into warp
      .to(meteorShipRef.current, { scale: 0, y: '-100vh', duration: 2, ease: "power3.in" })
      // Show final success layer
      .to('.final-success-layer', { opacity: 1, duration: 1 });

  }, { scope: containerRef, dependencies: [canStart] });

  return (
    <div ref={containerRef} className="market-journey-root" style={{
      height: '100vh',
      background: 'radial-gradient(ellipse at bottom, #020617 0%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden',
      color: '#fff',
      // Keep z-index relatively high to obscure overlaps upon pin
      zIndex: 40
    }}>
      
      {/* Dynamic Starfield Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'url("/assets/stars.png") repeat', opacity: 0.3, zIndex: 0 }} />

      <div ref={scrollWrapperRef} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1200px' }}>
        
        {/* =========================================
            SCENE 1: IGNITION ZONE 
            ========================================= */}
        <div ref={introLayerRef} style={{ position: 'absolute', zIndex: 10, textAlign: 'center', top: '25%' }}>
           <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--accent-secondary)', textShadow: '0 0 20px rgba(0,204,255,0.4)', marginBottom: '1rem' }}>
              {introStarted && <GSAPTypewriter text="Welcome to the Market Universe..." />}
           </h2>
           <p style={{ fontSize: '1.25rem', color: '#9ca3af', opacity: 0.8, animation: 'pulse 3s infinite' }}>
             Scroll to ignite your trading journey ↓
           </p>
        </div>


        {/* =========================================
            SCENE 2: PRICE ACTION TUNNEL 
            ========================================= */}
        <div ref={tunnelLayerRef} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
           <div ref={floatingChartsRef} style={{ width: '80%', height: '60%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)' }}>
              {/* Abstract Chart Representation */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '50%', width: '80%' }}>
                 <div style={{ width: '10%', height: '30%', background: 'linear-gradient(to top, rgba(16,185,129,0.1), #10b981)', borderRadius: '4px' }} />
                 <div style={{ width: '10%', height: '60%', background: 'linear-gradient(to top, rgba(16,185,129,0.1), #10b981)', borderRadius: '4px' }} />
                 <div style={{ width: '10%', height: '40%', background: 'linear-gradient(to top, rgba(239,68,68,0.1), #ef4444)', borderRadius: '4px' }} />
                 <div style={{ width: '10%', height: '80%', background: 'linear-gradient(to top, rgba(16,185,129,0.1), #10b981)', borderRadius: '4px' }} />
                 <div style={{ width: '10%', height: '20%', background: 'linear-gradient(to top, rgba(239,68,68,0.1), #ef4444)', borderRadius: '4px' }} />
                 <div style={{ width: '10%', height: '100%', background: 'linear-gradient(to top, rgba(16,185,129,0.1), #10b981)', borderRadius: '4px', boxShadow: '0 0 20px #10b981' }} />
              </div>
           </div>
        </div>


        {/* =========================================
            SCENE 3: INDICATOR CHAMBER
            ========================================= */}
         <div ref={indicatorLayerRef} style={{ position: 'absolute', top: '20%', width: '90%', maxWidth: '1000px', zIndex: 12, display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
            {/* Left Pod */}
            <div style={{ flex: 1, background: 'rgba(4,12,32,0.8)', border: '1px solid var(--accent-primary)', padding: '2rem', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
               <Activity size={32} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} />
               <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>RSI Analysis</h3>
               <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>The Relative Strength Index identifies overbought and oversold zones. When reading the market, momentum is your compass.</p>
            </div>
            
            {/* Right Pod */}
             <div style={{ flex: 1, background: 'rgba(4,12,32,0.8)', border: '1px solid var(--success)', padding: '2rem', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
               <TrendingUp size={32} color="var(--success)" style={{ marginBottom: '1rem' }} />
               <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>Trend Detection</h3>
               <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>Moving averages smooth out price action. Crossovers signal early warnings of impending shifts in global sentiment.</p>
            </div>
         </div>


        {/* =========================================
            SCENE 4: FINAL CTA (EXIT)
            ========================================= */}
         <div className="final-success-layer" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15, opacity: 0, pointerEvents: 'none' }}>
            <h2 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '2rem', background: 'linear-gradient(45deg, #0055ff, #00ccff)', backgroundClip: 'text', WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }}>
               Journey Complete
            </h2>
            <button 
              onClick={() => navigate(user ? '/trade' : '/signup')}
              style={{ padding: '1.5rem 4rem', fontSize: '1.5rem', fontWeight: 'bold', borderRadius: '50px', background: 'var(--accent-secondary)', color: 'var(--bg-base)', border: 'none', cursor: 'pointer', pointerEvents: 'auto', boxShadow: '0 10px 30px rgba(0, 204, 255, 0.4)', transition: 'transform 0.2s ease' }}
            >
               Enter The Terminal
            </button>
         </div>


        {/* =========================================
            THE METEOR/SHIP (User's Avatar) 
            ========================================= */}
        <div ref={meteorShipRef} style={{ position: 'absolute', zIndex: 20, pointerEvents: 'none', filter: 'drop-shadow(0 0 15px rgba(0, 204, 255, 0.6))' }}>
           <div style={{ width: '60px', height: '60px', background: 'var(--accent-secondary)', borderRadius: '50%', position: 'relative' }}>
              <div style={{ position: 'absolute', width: '30px', height: '100px', background: 'linear-gradient(to top, transparent, var(--accent-secondary))', bottom: '100%', left: '15px', borderRadius: '50%', transform: 'rotate(180deg)' }} />
              <Cpu size={30} color="#000" style={{ position: 'absolute', top: '15px', left: '15px' }} />
           </div>
        </div>

      </div>
    </div>
  );
};
