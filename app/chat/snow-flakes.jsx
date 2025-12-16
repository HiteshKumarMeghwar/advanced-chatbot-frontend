import { useState, useEffect } from "react";

function Snowflakes({ count = 50 }) {
  const [flakes, setFlakes] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: count }).map(() => ({
      size: Math.random() * 3 + 2,
      left: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setFlakes(generated);
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {flakes.map((flake, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            left: `${flake.left}%`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
}


export default Snowflakes