import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Sliders,
  ChevronRight,
  Send,
  MessageSquare,
} from 'lucide-react';
import { generateSimulationCode } from '../../services/geminiService';

interface SimulationLabViewProps {
  onExplainWithTutor: (concept: string) => void;
}

type SimulationCategory = 'physics' | 'math' | 'chemistry' | 'custom_ai';

export const SimulationLabView: React.FC<SimulationLabViewProps> = ({ onExplainWithTutor }) => {
  const [category, setCategory] = useState<SimulationCategory>('physics');
  const [activePreset, setActivePreset] = useState<string>('projectile');

  // Physics Simulation: Projectile Motion State
  const [projAngle, setProjAngle] = useState(45);
  const [projVelocity, setProjVelocity] = useState(25);
  const [projGravity, setProjGravity] = useState(9.8);
  const [projAnimationRunning, setProjAnimationRunning] = useState(true);

  // Math Simulation: Function Grapher ($y = a x^2 + b x + c$)
  const [quadA, setQuadA] = useState(1);
  const [quadB, setQuadB] = useState(0);
  const [quadC, setQuadC] = useState(-4);

  // Chemistry Simulation: Gas Laws ($PV = nRT$)
  const [gasTemp, setGasTemp] = useState(300); // Kelvin
  const [gasVolume, setGasVolume] = useState(10); // Liters
  const [gasMoles, setGasMoles] = useState(1); // mol

  // Custom AI Simulation Generator State
  const [customPrompt, setCustomPrompt] = useState('Show how light refracts through a triangular prism');
  const [customSimulation, setCustomSimulation] = useState<any | null>(null);
  const [loadingAiSim, setLoadingAiSim] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Projectile Motion Canvas Render Loop
  useEffect(() => {
    if (category !== 'physics' || activePreset !== 'projectile') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const theta = (projAngle * Math.PI) / 180;
    const ux = projVelocity * Math.cos(theta);
    const uy = projVelocity * Math.sin(theta);
    const totalTime = (2 * uy) / projGravity;

    const render = () => {
      ctx.fillStyle = '#070b16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const groundY = canvas.height - 40;
      const originX = 50;

      // Draw Ground & Grid
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // Full Trajectory Parabola
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      const scale = 5; // pixels per meter
      for (let timeStep = 0; timeStep <= totalTime; timeStep += 0.05) {
        const px = originX + ux * timeStep * scale;
        const py = groundY - (uy * timeStep - 0.5 * projGravity * timeStep * timeStep) * scale;
        if (timeStep === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Animated Ball
      if (projAnimationRunning) {
        t += 0.03;
        if (t > totalTime) t = 0;
      }

      const ballX = originX + ux * t * scale;
      const ballY = groundY - (uy * t - 0.5 * projGravity * t * t) * scale;

      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#22D3EE';
      ctx.shadowColor = '#22D3EE';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [category, activePreset, projAngle, projVelocity, projGravity, projAnimationRunning]);

  // Handle AI Custom Simulation Generation
  const handleGenerateCustomSim = async () => {
    if (!customPrompt.trim()) return;
    setLoadingAiSim(true);
    try {
      const res = await generateSimulationCode('STEM Interactive Visualization', customPrompt);
      setCustomSimulation(res);
    } catch (err) {
      console.error('Custom sim error:', err);
    } finally {
      setLoadingAiSim(false);
    }
  };

  // Telemetry computations
  const maxRange = ((projVelocity * projVelocity * Math.sin((2 * projAngle * Math.PI) / 180)) / projGravity).toFixed(2);
  const maxHeight = ((projVelocity * projVelocity * Math.pow(Math.sin((projAngle * Math.PI) / 180), 2)) / (2 * projGravity)).toFixed(2);
  const timeOfFlight = ((2 * projVelocity * Math.sin((projAngle * Math.PI) / 180)) / projGravity).toFixed(2);

  // Chemistry Gas Law: P = nRT / V (R = 0.0821 L atm / mol K)
  const gasPressure = ((gasMoles * 0.0821 * gasTemp) / (gasVolume || 1)).toFixed(2);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white font-heading flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-pink-400" /> Visual Simulation Lab
          </h1>
          <p className="text-xs text-slate-400">
            Interactive, real-time physics, mathematics, and chemistry simulations with live parameter sliders and AI generator.
          </p>
        </div>

        {/* Category selector */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setCategory('physics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              category === 'physics' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Physics
          </button>
          <button
            onClick={() => setCategory('math')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              category === 'math' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Maths
          </button>
          <button
            onClick={() => setCategory('chemistry')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              category === 'chemistry' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Chemistry
          </button>
          <button
            onClick={() => setCategory('custom_ai')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              category === 'custom_ai' ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            ✨ AI Generator
          </button>
        </div>
      </div>

      {/* 1. PHYSICS LAB (Projectile Motion) */}
      {category === 'physics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Viewport (2 cols) */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-5 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <span>Projectile Motion & Trajectory Parabola</span>
                <span className="text-cyan-400">{"(y = x·tan θ − gx² / 2u²cos²θ)"}</span>
              </div>
              <button
                onClick={() => setProjAnimationRunning(!projAnimationRunning)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {projAnimationRunning ? 'Pause' : 'Resume'}
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={650}
              height={320}
              className="w-full h-80 rounded-2xl bg-[#070b16] border border-slate-800"
            />

            {/* Live Telemetry Bar */}
            <div className="mt-4 grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center font-mono">
              <div>
                <div className="text-[10px] text-slate-400">Horizontal Range (R)</div>
                <div className="text-base font-bold text-cyan-300">{maxRange} m</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Maximum Height (H)</div>
                <div className="text-base font-bold text-indigo-300">{maxHeight} m</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Time of Flight (T)</div>
                <div className="text-base font-bold text-emerald-300">{timeOfFlight} s</div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" /> Physical Parameters
              </h3>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Launch Angle (θ)</span>
                  <span className="text-cyan-400 font-bold">{projAngle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={projAngle}
                  onChange={(e) => setProjAngle(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Initial Speed (u)</span>
                  <span className="text-indigo-400 font-bold">{projVelocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={projVelocity}
                  onChange={(e) => setProjVelocity(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Gravity (g)</span>
                  <span className="text-amber-400 font-bold">{projGravity} m/s²</span>
                </div>
                <input
                  type="range"
                  min="1.6" // Moon
                  max="24.8" // Jupiter
                  step="0.1"
                  value={projGravity}
                  onChange={(e) => setProjGravity(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => onExplainWithTutor('Explain the physics of Projectile Motion equations')}
              className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <MessageSquare className="w-4 h-4" /> Explain What I'm Seeing
            </button>
          </div>
        </div>
      )}

      {/* 2. MATHS LAB (Quadratic Function Explorer) */}
      {category === 'math' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">
                Quadratic Function Grapher: $y = {quadA}x^2 + {quadB}x + {quadC}$
              </h3>
              <div className="h-72 w-full rounded-2xl bg-[#070b16] border border-slate-800 p-4 flex items-center justify-center relative">
                {/* Visual SVG curve */}
                <svg viewBox="-100 -60 200 120" className="w-full h-full">
                  {/* Axes */}
                  <line x1="-100" y1="0" x2="100" y2="0" stroke="#334155" strokeWidth="1" />
                  <line x1="0" y1="-60" x2="0" y2="60" stroke="#334155" strokeWidth="1" />

                  {/* Parabola points */}
                  <path
                    d={(() => {
                      let d = '';
                      for (let x = -30; x <= 30; x += 0.5) {
                        const y = -(quadA * 0.1 * x * x + quadB * 0.5 * x + quadC * 2);
                        if (x === -30) d += `M ${x * 3} ${y}`;
                        else d += ` L ${x * 3} ${y}`;
                      }
                      return d;
                    })()}
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex justify-between">
              <span>Vertex: x = {(-quadB / (2 * quadA || 1)).toFixed(2)}</span>
              <span>Discriminant Δ = {(quadB * quadB - 4 * quadA * quadC).toFixed(1)}</span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase">Coefficients</h3>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>a (Curvature): {quadA}</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={quadA}
                onChange={(e) => setQuadA(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>b (Linear Shift): {quadB}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                value={quadB}
                onChange={(e) => setQuadB(parseFloat(e.target.value))}
                className="w-full accent-indigo-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>c (y-intercept): {quadC}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                value={quadC}
                onChange={(e) => setQuadC(parseFloat(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <button
              onClick={() => onExplainWithTutor('Explain quadratic function roots and discriminant')}
              className="mt-6 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              Ask Tutor About Roots & Vertex
            </button>
          </div>
        </div>
      )}

      {/* 3. CHEMISTRY LAB (Ideal Gas Law PV = nRT) */}
      {category === 'chemistry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">
                Ideal Gas Law Piston {"(P = nRT / V)"}
              </h3>
              <div className="h-64 rounded-2xl bg-[#070b16] border border-slate-800 p-6 flex items-center justify-center">
                {/* Piston visualization */}
                <div
                  className="w-48 bg-cyan-950/30 border-2 border-cyan-400/60 rounded-xl relative overflow-hidden transition-all duration-300"
                  style={{ height: `${Math.min(220, Math.max(60, gasVolume * 14))}px` }}
                >
                  {/* Gas particles bouncing simulation mock */}
                  <div className="absolute inset-0 flex flex-wrap gap-2 p-2 opacity-60">
                    {Array.from({ length: Math.min(24, gasMoles * 8) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping"
                        style={{ animationDuration: `${Math.max(0.4, 2000 / gasTemp)}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Gas Pressure:</span>
              <span className="text-xl font-black text-amber-400 font-heading">{gasPressure} atm</span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase">Thermodynamic State</h3>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Temperature (T): {gasTemp} K</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                value={gasTemp}
                onChange={(e) => setGasTemp(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Volume (V): {gasVolume} L</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                value={gasVolume}
                onChange={(e) => setGasVolume(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Amount (n): {gasMoles} mol</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={gasMoles}
                onChange={(e) => setGasMoles(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. AI SIMULATION GENERATOR */}
      {category === 'custom_ai' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2">
              Generate Any Interactive Simulation on Demand
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Type any concept from physics, biology, chemistry, or math. Gemini will synthesize a safe, sandboxed HTML5 Canvas interactive lab.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Show how double-slit wave interference creates bright and dark fringes"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs md:text-sm focus:outline-none"
              />
              <button
                onClick={handleGenerateCustomSim}
                disabled={loadingAiSim || !customPrompt.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-bold text-xs hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
              >
                {loadingAiSim ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Simulation</span>
              </button>
            </div>
          </div>

          {customSimulation && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-heading">
                  {customSimulation.title}
                </h3>
                <button
                  onClick={() => onExplainWithTutor(`Explain ${customSimulation.title}`)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-semibold"
                >
                  Explain Simulation →
                </button>
              </div>

              <iframe
                srcDoc={customSimulation.html_code}
                title={customSimulation.title}
                sandbox="allow-scripts"
                className="w-full h-96 rounded-2xl border border-slate-800 bg-[#0B1020]"
              />

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <div className="font-semibold text-cyan-300 mb-1">How it works:</div>
                <p>{customSimulation.description}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
