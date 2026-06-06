import { useEffect, useRef } from "react";

export default function DotGridBg() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 1. Resizing Handler to fit screen boundaries perfectly
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 2. Track Mouse Position on the viewport canvas
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 3. Grid Settings
    const spacing = 35; // Space between each dot in pixels

    // 4. Master Animation Paint Loop Loop
    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cols = Math.floor(canvas.width / spacing) + 1;
      const rows = Math.floor(canvas.height / spacing) + 1;
      const mouse = mouseRef.current;

      // Loop through the 2D grid matrix columns and rows
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          // Current dot coordinate position
          const x = c * spacing;
          const y = r * spacing;

          // Calculate distance from cursor to this dot using Pythagorean theorem: d = sqrt(dx^2 + dy^2)
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // DRAW THE RESTING DOT (Radius scaled from 1.2 up to 2.2 for structural readability)
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(148, 163, 184, 0.35)"; // Slightly deeper alpha for cleaner visualization
          ctx.fill();

          // Interactive Magic: If mouse is close, look forward to the next dots to form a square
          if (distance < 90 && c < cols - 1 && r < rows - 1) {
            // Calculate a soft fade intensity opacity scaling based on proximity range
            const opacity = (1 - distance / 90) * 0.12; 

            ctx.fillStyle = `rgba(13, 148, 136, ${opacity})`; 
            ctx.fillRect(x, y, spacing, spacing);

            ctx.strokeStyle = `rgba(13, 148, 136, ${opacity * 1.5})`;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, spacing, spacing);
          }
        }
      }

      requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none bg-slate-50"
    />
  );
}