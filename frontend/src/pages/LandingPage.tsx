import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown, UserCircle, BarChart3 } from 'lucide-react';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
  type?: 'reveal' | 'reveal-zoom' | 'reveal-left' | 'reveal-right';
}

const Reveal: React.FC<RevealProps> = ({ children, className = "", delay = 0, style = {}, type = "reveal" }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${type} ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(easeOut * end));
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  let formattedCount = count.toString();
  if (end >= 1000) {
    if (end % 1000 === 0) formattedCount = (count / 1000).toFixed(0) + "k";
    else formattedCount = count.toLocaleString();
  }

  return <span ref={ref}>{prefix}{formattedCount}{suffix}</span>;
};

const Ticker: React.FC = () => {
  const [mockPairs, setMockPairs] = useState([
    { pair: 'BTC/USD', price: 64320.50, change: 2.4 },
    { pair: 'ETH/USD', price: 3450.15, change: 1.8 },
    { pair: 'SOL/USD', price: 145.20, change: -0.5 },
    { pair: 'NVDA', price: 890.55, change: 4.2 },
    { pair: 'AAPL', price: 172.10, change: 0.3 },
    { pair: 'BNB/USD', price: 412.30, change: 1.1 },
    { pair: 'ADA/USD', price: 0.65, change: -1.2 },
    { pair: 'XRP/USD', price: 0.55, change: 0.8 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMockPairs(prevPairs => prevPairs.map(data => {
        if (Math.random() > 0.8) {
          const fluctuation = data.price * (Math.random() * 0.002 - 0.001);
          return { ...data, price: data.price + fluctuation };
        }
        return data;
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const displayPairs = [...mockPairs, ...mockPairs, ...mockPairs];

  return (
    <Reveal type="reveal" delay={200} className="ticker-wrapper">
      <div className="ticker-track">
        {displayPairs.map((data, idx) => {
          const isPositive = data.change >= 0;
          const changeClass = isPositive ? 'success' : 'danger';
          const changeSymbol = isPositive ? '+' : '';
          return (
            <div key={idx} className="ticker-item">
              <span className="pair">{data.pair}</span>
              <span className="price">${data.price.toFixed(2)}</span>
              <span className={changeClass}>{changeSymbol}{data.change}%</span>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  text: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, text, delay = 0 }) => {
  return (
    <Reveal type="reveal-zoom" delay={delay} className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </Reveal>
  );
};

const BasicChart: React.FC = () => (
  <div style={{ padding: '2.5rem', width: '100%', height: '100%', boxSizing: 'border-box', background: 'var(--bg-glass)' }}>
    <div className="chart-header">
      <span className="pair">BTC / USD</span>
      <span className="price success">$64,320.50 <span className="change">+2.4%</span></span>
    </div>
    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '1rem' }}>
      <div style={{ width: '15%', background: 'var(--success)', height: '40%', borderRadius: '4px' }}></div>
      <div style={{ width: '15%', background: 'var(--danger)', height: '30%', borderRadius: '4px' }}></div>
      <div style={{ width: '15%', background: 'var(--success)', height: '60%', borderRadius: '4px' }}></div>
      <div style={{ width: '15%', background: 'var(--success)', height: '85%', borderRadius: '4px' }}></div>
      <div style={{ width: '15%', background: 'var(--danger)', height: '70%', borderRadius: '4px' }}></div>
      <div style={{ width: '15%', background: 'var(--success)', height: '100%', borderRadius: '4px', boxShadow: '0 0 15px var(--success)' }}></div>
    </div>
  </div>
);

const AdvancedChart: React.FC = () => (
  <div style={{ padding: '2.5rem', width: '100%', height: '100%', boxSizing: 'border-box', background: 'var(--bg-glass-hover)' }}>
    <div className="chart-header">
      <span className="pair" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        BTC / USD
        <span style={{ fontSize: '0.7rem', border: '1px solid var(--accent-primary)', padding: '2px 6px', borderRadius: '12px', color: 'var(--accent-primary)' }}>PRO</span>
      </span>
      <span className="price success">$64,320.50 <span className="change">+2.4%</span></span>
    </div>
    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '1rem', position: 'relative' }}>
      {/* Grid lines */}
      <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--border-glass)', top: '20%' }} />
      <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--border-glass)', top: '50%' }} />
      <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--border-glass)', top: '80%' }} />

      {/* Candlesticks */}
      {[
        { h: '50%', win: 'var(--success)', top: '-10%', body: '60%', bodyTop: '10%' },
        { h: '40%', win: 'var(--danger)', top: '-5%', body: '70%', bodyTop: '5%' },
        { h: '70%', win: 'var(--success)', top: '-20%', body: '50%', bodyTop: '0%' },
        { h: '95%', win: 'var(--success)', top: '-5%', body: '40%', bodyTop: '10%' },
        { h: '80%', win: 'var(--danger)', top: '-20%', body: '50%', bodyTop: '10%' },
        { h: '100%', win: 'var(--success)', top: '-25%', body: '60%', bodyTop: '-15%', shadow: true }
      ].map((c, i) => (
        <div key={i} style={{ position: 'relative', width: '12%', height: c.h, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: '2px', height: '110%', background: c.win, top: c.top }} />
          <div style={{ position: 'absolute', width: '100%', height: c.body, background: c.win, top: c.bodyTop, borderRadius: '2px', boxShadow: c.shadow ? `0 0 10px ${c.win}` : 'none' }} />
        </div>
      ))}
    </div>
  </div>
);

const DraggableHeroGraphic: React.FC = () => {
  const [isDraggable, setIsDraggable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const [sliderPos, setSliderPos] = useState(50);
  const [isSliding, setIsSliding] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const dragInfo = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const activePointers = useRef(new Map<number, { x: number, y: number }>());
  const initialPinchDistance = useRef<number | null>(null);
  const initialScale = useRef(1);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventBrowserGestures = (e: Event) => {
      if (isDraggable) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', preventBrowserGestures, { passive: false });
    el.addEventListener('touchmove', preventBrowserGestures, { passive: false });

    return () => {
      el.removeEventListener('wheel', preventBrowserGestures);
      el.removeEventListener('touchmove', preventBrowserGestures);
    };
  }, [isDraggable]);

  const handleDoubleClick = () => setIsDraggable(!isDraggable);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isDraggable) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 1) {
      setIsDragging(true);
      dragInfo.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: position.x,
        initialY: position.y
      };
    } else if (activePointers.current.size === 2) {
      setIsDragging(false);
      const pointers = Array.from(activePointers.current.values());
      const dist = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
      initialPinchDistance.current = dist;
      initialScale.current = scale;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggable) return;

    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointers.current.size === 1 && isDragging) {
      const dx = e.clientX - dragInfo.current.startX;
      const dy = e.clientY - dragInfo.current.startY;
      setPosition({
        x: dragInfo.current.initialX + dx,
        y: dragInfo.current.initialY + dy
      });
    } else if (activePointers.current.size === 2) {
      const pointers = Array.from(activePointers.current.values());
      const dist = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);

      if (initialPinchDistance.current) {
        const delta = dist / initialPinchDistance.current;
        const newScale = Math.min(Math.max(0.5, initialScale.current * delta), 3);
        setScale(newScale);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (activePointers.current.size < 2) {
      initialPinchDistance.current = null;
    }

    if (activePointers.current.size === 0) {
      setIsDragging(false);
    } else if (activePointers.current.size === 1) {
      const remainingPointer = Array.from(activePointers.current.values())[0];
      setIsDragging(true);
      dragInfo.current = {
        startX: remainingPointer.x,
        startY: remainingPointer.y,
        initialX: position.x,
        initialY: position.y
      };
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isDraggable) return;
    const zoomSpeed = 0.005;
    setScale(prev => Math.min(Math.max(0.5, prev - (e.deltaY * zoomSpeed)), 3));
  };

  const handleSliderPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsSliding(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleSliderPointerMove = (e: React.PointerEvent) => {
    if (!isSliding || !chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    let newX = e.clientX - rect.left;
    let newPos = (newX / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, newPos)));
  };

  const handleSliderPointerUp = (e: React.PointerEvent) => {
    if (!isSliding) return;
    setIsSliding(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <Reveal type="reveal-left" delay={300} className="hero-graphic" style={{ zIndex: isDraggable ? 50 : 1 }}>
      <div
        ref={containerRef}
        className="graphics-container"
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
          touchAction: isDraggable ? 'none' : 'auto',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          boxShadow: isDraggable ? '0 0 0 2px var(--accent-secondary)' : 'none',
          borderRadius: '16px',
          userSelect: 'none'
        }}
      >
        {isDraggable && (
          <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-secondary)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(0, 187, 255, 0.4)', zIndex: 10 }}>
            🔓 Unlocked! (Drag or Pinch/Scroll to zoom)
          </div>
        )}

        <div
          ref={chartContainerRef}
          className={`glass-panel main-chart ${!isDraggable ? 'float-1' : ''}`}
          style={{ position: 'relative', padding: 0, overflow: 'hidden', touchAction: 'none', width: '100%', height: '320px', willChange: 'transform' }}
        >
          <div style={{ width: '100%', height: '100%' }}>
            <BasicChart />
          </div>

          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
            pointerEvents: 'none'
          }}>
            <AdvancedChart />
          </div>

          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${sliderPos}%`, width: '4px',
            background: 'var(--accent-secondary)',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            zIndex: 10
          }}></div>

          <div
            onPointerDown={handleSliderPointerDown}
            onPointerMove={handleSliderPointerMove}
            onPointerUp={handleSliderPointerUp}
            onPointerCancel={handleSliderPointerUp}
            style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${sliderPos}%`, width: '40px',
              transform: 'translateX(-50%)',
              cursor: 'ew-resize',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 11, touchAction: 'none'
            }}
          >
            <div style={{
              width: '28px', height: '28px',
              background: 'var(--accent-secondary)',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(0,0,0,0.8)',
              display: 'flex', gap: '3px',
              justifyContent: 'center', alignItems: 'center'
            }}>
              <div style={{ width: '2px', height: '12px', background: '#fff', opacity: 0.8 }} />
              <div style={{ width: '2px', height: '12px', background: '#fff', opacity: 0.8 }} />
            </div>
          </div>
        </div>

        <div className={`glass-panel ${!isDraggable ? 'float-2' : ''}`} style={{ position: 'absolute', top: '-10%', right: '-5%', padding: '1rem', borderRadius: '50%', background: 'var(--bg-glass-hover)', pointerEvents: 'none', willChange: 'transform' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
        </div>

        <div className={`glass-panel ${!isDraggable ? 'float-3' : ''}`} style={{ position: 'absolute', bottom: '10%', left: '-10%', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-glass-hover)', pointerEvents: 'none', willChange: 'transform' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
          <span className="success" style={{ fontWeight: 'bold' }}>+12.4%</span>
        </div>
      </div>
    </Reveal>
  );
};

const MeteorScrollSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=3500", // Increased distance for a better experience
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });

    tl.fromTo(starRef.current,
      { scale: 1, opacity: 1 },
      { 
        scale: 100, 
        duration: 2, 
        ease: "power2.in"
      }
    )
      .to(bgRef.current, { autoAlpha: 1, duration: 0.5 }, "-=0.2")
      .to(starRef.current, { autoAlpha: 0, duration: 0.5 }, "-=0.5")
      .fromTo(contentRef.current,
        { autoAlpha: 0, scale: 0.8, y: '10vh' },
        { autoAlpha: 1, scale: 1, y: '0vh', duration: 1 }, "-=0.2"
      )
      // Stay pinned for a while to allow interaction/viewing
      .to({}, { duration: 1.5 }) 
      // Exit through the meteor to the next section
      .to(contentRef.current, { y: '-20vh', autoAlpha: 0, duration: 1.5, ease: "power1.in" })
      .to(bgRef.current, { autoAlpha: 0, duration: 1 }, "-=0.8")
      .to(starRef.current, { scale: 1, autoAlpha: 1, duration: 0.1 });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ height: '100vh', position: 'relative', marginTop: '2rem' }}>
      <div style={{ position: 'absolute', inset: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
        <div ref={bgRef} style={{ position: 'absolute', inset: 0, background: 'var(--meteor-bg)', zIndex: 1, visibility: 'hidden', opacity: 0 }} />
        <div ref={starRef} className="shooting-star" style={{ position: 'absolute', willChange: 'transform, opacity', zIndex: 2 }}>
          <div className="star-orbit"></div>
        </div>
        <div ref={contentRef} style={{ position: 'absolute', zIndex: 3, width: '80%', maxWidth: '1200px', height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', visibility: 'hidden', opacity: 0 }}>
          <DraggableHeroGraphic />
          <button className="btn primary" style={{
            padding: '1.25rem 3.5rem',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--bg-base)',
            background: 'var(--accent-secondary)',
            borderRadius: '3rem',
            boxShadow: '0 0 20px var(--accent-secondary)',
            cursor: 'pointer',
            border: 'none'
          }}>Start Here</button>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showFlash, setShowFlash] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    // Theme toggle logic scoped to the component's container if possible, 
    // but since we use global body classes in the CSS, we keep it for now.
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);

  useEffect(() => {
    if (searchParams.get('flash') === 'true') {
      setShowFlash(true);
      const timer = setTimeout(() => {
        setShowFlash(false);
        const element = document.getElementById('features');
        if (element) {
          element.scrollIntoView({ behavior: 'instant' as any });
        }
      }, 400); // Cinematic flash duration
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className={`landing-page-root ${isLightMode ? 'light-mode' : ''}`}>
      {showFlash && <div className="flash-overlay" />}
      <nav className="navbar">
        <div className="nav-container">
          <a href="/home" className="brand">TRADE<span className="accent">SHIFT</span></a>
          <div className="nav-links">
            <a href="#simulator">Simulator</a>
            <a href="#learn">Learn</a>
            <a href="#features">Features</a>
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className="theme-toggle"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {isLightMode ? '🌙' : '☀️'}
            </button>

            {user ? (
              <div className="relative" style={{ marginLeft: '0.5rem' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <div className="w-8 h-8 rounded-full bg-tv-primary flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0055ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} style={{ transition: 'transform 0.3s', transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', opacity: 0.7 }} />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-[#1A1E29] border border-white/10 rounded-xl shadow-2xl py-2 z-50" style={{ position: 'absolute', right: 0, marginTop: '0.5rem', width: '224px', background: '#1A1E29', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 50, padding: '0.5rem 0' }}>
                      <div className="px-4 py-3 border-b border-white/5 mb-1" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.25rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Signed in as</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                      </div>

                      <Link
                        to="/trade"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#d1d5db', textDecoration: 'none' }}
                      >
                        <BarChart3 size={18} />
                        Go to Terminal
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#d1d5db', textDecoration: 'none' }}
                      >
                        <UserCircle size={18} />
                        Profile Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn btn-outline">Log in</button>
                <button onClick={() => navigate('/signup')} className="btn btn-primary">Sign up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <Reveal type="reveal" delay={100}>
            <div className="badge">🎓 The Ultimate Trading Simulator</div>
          </Reveal>
          <Reveal type="reveal" delay={200}>
            <h1 className="hero-title">Master the Markets with <span className="gradient-text">Zero Risk</span></h1>
          </Reveal>
          <Reveal type="reveal" delay={300}>
            <p className="hero-subtitle">Learn to trade crypto, stocks, and forex with real-time data, comprehensive educational modules, and a risk-free simulated environment.</p>
          </Reveal>

          <Reveal type="reveal" delay={400} className="hero-actions">
            <button onClick={() => navigate('/signup')} className="btn btn-primary btn-large">Start Learning Free</button>
            <button className="btn btn-outline btn-large">View Curriculum</button>
          </Reveal>

          <Reveal type="reveal" delay={500} className="hero-stats">
            <div className="stat">
              <span className="stat-value"><CountUp end={100} prefix="$" suffix="k" /></span>
              <span className="stat-label">Virtual Starting Capital</span>
            </div>
            <div className="stat">
              <span className="stat-value"><CountUp end={150} suffix="+" /></span>
              <span className="stat-label">Interactive Lessons</span>
            </div>
            <div className="stat">
              <span className="stat-value">Real-time</span>
              <span className="stat-label">Live Market Data</span>
            </div>
          </Reveal>
        </div>

        <DraggableHeroGraphic />
      </header>

      <MeteorScrollSection />

      <Ticker />

      <section id="features" className="features">
        <Reveal type="reveal" delay={100}>
          <h2 className="section-title">Learn to Trade <span className="accent">Like a Pro</span></h2>
        </Reveal>
        <Reveal type="reveal" delay={200}>
          <p className="section-subtitle">Everything you need to go from beginner to profitable trader.</p>
        </Reveal>

        <div className="features-grid">
          <FeatureCard
            delay={300}
            icon="🎮"
            title="Risk-Free Simulator"
            text="Practice trading with $100,000 in virtual funds. Test your strategies in real-world market conditions safely."
          />
          <FeatureCard
            delay={400}
            icon="📚"
            title="Interactive Curriculum"
            text="Progress through structured lessons covering everything from technical analysis to advanced trading psychology."
          />
          <FeatureCard
            delay={500}
            icon="📈"
            title="Professional Charting"
            text="Access the same powerful charts, indicators, and drawing tools used by professional traders worldwide."
          />
          <FeatureCard
            delay={600}
            icon="🏆"
            title="Trading Tournaments"
            text="Compete against other learners in risk-free tournaments and prove your trading edge on the leaderboards."
          />
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <Reveal type="reveal" delay={100} className="footer-brand">
            <a href="/home" className="brand">TRADE<span className="accent">SHIFT</span></a>
            <p>The #1 educational platform for mastering the financial markets.</p>
          </Reveal>
          <Reveal type="reveal" delay={200} className="footer-links">
            <h4>Simulator</h4>
            <a href="#">Crypto Simulator</a>
            <a href="#">Stock Simulator</a>
            <a href="#">Forex Simulator</a>
            <a href="#">Trading Competitions</a>
          </Reveal>
          <Reveal type="reveal" delay={300} className="footer-links">
            <h4>Education</h4>
            <a href="#">Beginner Courses</a>
            <a href="#">Technical Analysis</a>
            <a href="#">Trading Psychology</a>
            <a href="#">Video Library</a>
          </Reveal>
          <Reveal type="reveal" delay={400} className="footer-links">
            <h4>Legal</h4>
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Disclaimer</a>
          </Reveal>
        </div>
        <Reveal type="reveal" delay={500} className="footer-bottom">
          <p>&copy; 2026 TRADE SHIFT Education. All rights reserved. Simulated trading only. No real money involved.</p>
        </Reveal>
      </footer>
    </div>
  );
}
