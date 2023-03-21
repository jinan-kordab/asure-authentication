import React, { useState, useEffect, useRef } from "react";

const WaveAnimation = () => {
  const canvasRef = useRef(null);
  const [waves, setWaves] = useState([]);

  useEffect(() => {
    const generateWaves = () => {
      const newWaves = [];

      for (let i = 0; i < 3; i++) {
        const wave = {
          amplitude: Math.random() * 40 + 30, // random amplitude between 20 and 60
          wavelength: Math.random() * 150 + 100, // random wavelength between 100 and 250
          phase: Math.random() * Math.PI * 2, // random phase between 0 and 2pi
          speed: Math.random() * 0.05 + 0.02, // random speed between 0.02 and 0.07
          offset: Math.random() * 100 + 400, // random offset between 50 and 150
          color: i === 0 ? "green" : i === 1 ? "blue" : "red", // set different colors for each wave
        };
        newWaves.push(wave);
      }

      setWaves(newWaves);
    };

    generateWaves();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const drawWave = (wave, time) => {
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < width; x += 1) {
        const y =
          wave.amplitude *
            Math.sin(
              (x / wave.wavelength) * 2 * Math.PI -
                wave.phase -
                time * wave.speed
            ) +
          wave.offset +
          (Math.random() * 10 - 5); // add random height changes
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    let time = 0;
    const animationFrame = () => {
      ctx.clearRect(0, 0, width, height);
      for (const wave of waves) {
        drawWave(wave, time);
      }
      time += 1;
      requestAnimationFrame(animationFrame);
    };
    animationFrame();
  }, [waves]);

  return (
    <canvas
      ref={canvasRef}
      width="1000"
      height="1000"
      style={{ backgroundColor: "#0D2235" }}
    ></canvas>
  );
};

export default WaveAnimation;
