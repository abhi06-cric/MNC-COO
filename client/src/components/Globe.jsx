import { useEffect, useRef } from "react";

export default function Globe() {
  const imgRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!imgRef.current) return;
      const { innerWidth, innerHeight } = window;
      const { clientX, clientY } = e;
      
      // Calculate mouse position relative to the center of the screen
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;
      
      // Apply a 3D tilt and slight translation (parallax)
      const tiltX = y * -12; 
      const tiltY = x * 12;
      const translateX = x * -25;
      const translateY = y * -25;

      imgRef.current.style.transform = `
        translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) 
        scale(1.15) 
        perspective(1200px) 
        rotateX(${tiltX}deg) 
        rotateY(${tiltY}deg)
      `;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      maxWidth: '100%',
      height: '100%', 
      overflow: 'hidden',
      perspective: '1200px',
      pointerEvents: 'none'
    }}>
      <img 
        ref={imgRef}
        src="/background.jpg" 
        alt="3D Swaying Globe"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '110vw',
          height: '110vh',
          objectFit: 'cover',
          transform: 'translate(-50%, -50%) scale(1.15) perspective(1200px) rotateX(0deg) rotateY(0deg)',
          transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transformOrigin: 'center center',
          opacity: 0.28,
          filter: 'contrast(105%) grayscale(20%)',
          pointerEvents: 'none'
        }}
      />
      {/* Subtle overlay gradient to blend into the duschool.org light palette */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at center, rgba(248, 250, 252, 0.1) 20%, rgba(248, 250, 252, 0.8) 70%, #f8fafc 100%)',
        pointerEvents: 'none'
      }}></div>
    </div>
  );
}
