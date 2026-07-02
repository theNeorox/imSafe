/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Play, RotateCcw, FastForward, BellRing, AlertTriangle, HelpCircle, Check, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulationPanelProps {
  timeLeft: number;
  checkInInterval: number;
  remindersSent: number;
  alertStatus: 'normal' | 'warning' | 'alerted';
  onFastForward: (minutes: number) => void;
  onSetFastTimer: () => void;
  onSimulateMissedCheckIn: () => void;
  onSimulateEmergencyAlert: () => void;
  onResetSimulation: () => void;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
}

export default function SimulationPanel({
  timeLeft,
  checkInInterval,
  remindersSent,
  alertStatus,
  onFastForward,
  onSetFastTimer,
  onSimulateMissedCheckIn,
  onSimulateEmergencyAlert,
  onResetSimulation,
  isTimerRunning,
  onToggleTimer
}: SimulationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 font-sans" id="simulation-panel-container">
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-3 rounded-full text-white shadow-lg font-medium transition-all cursor-pointer focus:outline-none ${
          isOpen 
            ? 'bg-slate-800' 
            : alertStatus === 'alerted'
              ? 'bg-red-500 animate-pulse'
              : alertStatus === 'warning'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
        id="btn-toggle-simulation"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span>{isOpen ? 'Fechar Testes' : 'Painel de Testes'}</span>
      </motion.button>

      {/* Main Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-16 right-0 w-[340px] md:w-[380px] bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-200 shadow-2xl overflow-hidden"
            id="simulation-drawer"
          >
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <h4 className="font-display font-semibold text-sm tracking-wide text-white">
                  SIMULADOR IMSAFE
                </h4>
                <div className="relative">
                  <button 
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  {showTooltip && (
                    <div className="absolute bottom-6 right-0 w-64 p-3 bg-slate-800 border border-slate-700 rounded-xl text-[11px] leading-relaxed text-slate-300 shadow-xl z-50">
                      Como testar o envio do alerta:<br/>
                      1. Adicione um contato de emergência.<br/>
                      2. Clique em <strong>"Temporizador 10s"</strong>.<br/>
                      3. Aguarde o tempo zerar. O app vai notificar.<br/>
                      4. Se você ignorar as notificações e simular lembretes perdidos até o 3º, os contatos cadastrados serão alertados automaticamente com sua localização!
                    </div>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                alertStatus === 'alerted' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : alertStatus === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {alertStatus === 'alerted' ? 'Alerta Ativo' : alertStatus === 'warning' ? 'Aviso Ativo' : 'Seguro'}
              </span>
            </div>

            {/* Quick Status Stats */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 mb-4 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Cronômetro</p>
                <p className="font-mono text-white text-sm font-semibold tracking-wider mt-0.5">
                  {formatTime(timeLeft)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Lembretes Falhos</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {[1, 2, 3].map((num) => (
                    <div 
                      key={num}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        remindersSent >= num 
                          ? 'bg-red-500 text-white' 
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                  <span className="text-[10px] text-slate-400 font-medium ml-1">
                    ({remindersSent}/3)
                  </span>
                </div>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1">
                Controles Rápidos do Temporizador
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onSetFastTimer}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer focus:outline-none active:scale-95"
                  id="btn-sim-fast-timer"
                >
                  <Play className="w-4 h-4 text-blue-400" />
                  Temporizador 10s
                </button>
                <button
                  onClick={() => onFastForward(60)}
                  className="flex items-center justify-center gap-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer focus:outline-none active:scale-95"
                >
                  <FastForward className="w-4 h-4 text-emerald-400" />
                  Avançar 1h
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleTimer}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-600/10 text-amber-400 border-amber-600/30 hover:bg-amber-600/20'
                      : 'bg-emerald-600/10 text-emerald-400 border-emerald-600/30 hover:bg-emerald-600/20'
                  }`}
                >
                  {isTimerRunning ? 'Pausar Relógio' : 'Iniciar Relógio'}
                </button>
                <button
                  onClick={() => onFastForward(1)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-xl text-slate-300 transition-all active:scale-95"
                >
                  Avançar 1m
                </button>
              </div>

              <div className="h-px bg-slate-800/80 my-3" />

              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1">
                Simulações de Resposta & Alerta
              </p>

              <div className="space-y-2">
                <button
                  onClick={onSimulateMissedCheckIn}
                  className={`flex items-center gap-3 w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer focus:outline-none active:scale-98 text-xs font-semibold ${
                    remindersSent >= 3
                      ? 'bg-slate-800/50 text-slate-500 border-slate-800'
                      : 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-amber-500/20'
                  }`}
                  disabled={remindersSent >= 3}
                  id="btn-sim-missed"
                >
                  <BellRing className="w-4 h-4 shrink-0 text-amber-400" />
                  <div>
                    <p>Perder Próximo Check-In</p>
                    <p className="text-[9px] font-normal text-slate-400 mt-0.5">
                      {remindersSent === 0 ? 'Dispara o 1º Lembrete' : remindersSent === 1 ? 'Dispara o 2º Lembrete' : 'Dispara o 3º Lembrete (Crítico)'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={onSimulateEmergencyAlert}
                  className="flex items-center gap-3 w-full p-2.5 bg-red-950/40 hover:bg-red-950/60 text-red-300 border border-red-500/20 rounded-xl text-left transition-all cursor-pointer focus:outline-none active:scale-98 text-xs font-semibold"
                  id="btn-sim-emergency"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 animate-pulse" />
                  <div>
                    <p>Simular Perda de Resposta Final</p>
                    <p className="text-[9px] font-normal text-red-400/80 mt-0.5">
                      Dispara Cloud Function e alerta contatos imediatamente
                    </p>
                  </div>
                </button>
              </div>

              <div className="h-px bg-slate-800/80 my-3" />

              <button
                onClick={onResetSimulation}
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850 rounded-xl text-xs font-medium transition-all cursor-pointer"
                id="btn-reset-simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar Banco Local & Reiniciar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
