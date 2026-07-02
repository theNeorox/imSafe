/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Heart, 
  Calendar, 
  Compass, 
  AlertCircle, 
  ArrowRight, 
  UserCheck, 
  AlertTriangle, 
  Flame, 
  Activity, 
  X, 
  Check, 
  Play, 
  PowerOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, EmergencyContact, CheckInLog } from '../types';
import EmergencyShareModal from './EmergencyShareModal';

interface HomeScreenProps {
  user: User;
  contacts: EmergencyContact[];
  history: CheckInLog[];
  timeLeft: number;
  remindersSent: number;
  alertStatus: 'normal' | 'warning' | 'alerted';
  onCheckIn: (notes?: string) => void;
  onNavigateToContacts: () => void;
  onNavigateToTimer: () => void;
  onTriggerNotWell: () => void;
  onTriggerDanger: () => void;
  notWellCountdown: number;
  onCancelNotWell: () => void;
  dangerProtocolActive: boolean;
  onResetDangerProtocol: () => void;
  onNavigateToPermissions?: () => void;
}

export default function HomeScreen({
  user,
  contacts,
  history,
  timeLeft,
  remindersSent,
  alertStatus,
  onCheckIn,
  onNavigateToContacts,
  onNavigateToTimer,
  onTriggerNotWell,
  onTriggerDanger,
  notWellCountdown,
  dangerProtocolActive,
  onCancelNotWell,
  onResetDangerProtocol,
  onNavigateToPermissions
}: HomeScreenProps) {
  // Modals for Confirmation
  const [showNotWellConfirm, setShowNotWellConfirm] = useState(false);
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [activeShareModal, setActiveShareModal] = useState<'not_well' | 'danger' | null>(null);

  // Helper to format remaining timer
  const formatTimeRemaining = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check-in interval in seconds for calculation
  const totalIntervalSeconds = user.checkInInterval * 3600;
  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / totalIntervalSeconds) * 100));

  // Get color configurations based on safety status
  const getStatusConfig = () => {
    if (dangerProtocolActive) {
      return {
        title: '⚠️ PROTOCOLO DE PERIGO ATIVO',
        desc: 'Contatos de emergência alertados com ALTA PRIORIDADE. Sua localização está sendo compartilhada em tempo real.',
        bg: 'bg-red-600 border-red-700 text-white',
        badge: 'bg-white text-red-600',
        text: 'text-white',
        btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        ringColor: 'stroke-red-500',
        accentBg: 'bg-red-700/50',
        icon: ShieldAlert,
      };
    }

    if (notWellCountdown > 0) {
      return {
        title: '🚨 ACIONANDO AJUDA MÉDICA',
        desc: `Iniciando protocolo de emergência em ${notWellCountdown}s. Caso seja um engano, toque em CANCELAR.`,
        bg: 'bg-amber-500 border-amber-600 text-white animate-pulse',
        badge: 'bg-white text-amber-600',
        text: 'text-white',
        btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        ringColor: 'stroke-amber-400',
        accentBg: 'bg-amber-600/50',
        icon: Activity,
      };
    }

    switch (alertStatus) {
      case 'alerted':
        return {
          title: 'ALERTA DISPARADO',
          desc: 'Você não respondeu aos check-ins e lembretes. Os alertas com sua última localização foram enviados aos seus contatos de emergência.',
          bg: 'bg-red-50 border-red-150',
          badge: 'bg-red-500 text-white',
          text: 'text-red-700',
          btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          ringColor: 'stroke-red-500',
          accentBg: 'bg-red-100/50',
          icon: ShieldAlert,
        };
      case 'warning':
        return {
          title: 'VERIFICAÇÃO PENDENTE',
          desc: `Aguardando sua confirmação. Lembrete ${remindersSent} de 3 enviado. Por favor, confirme que está bem para evitar o alerta aos contatos.`,
          bg: 'bg-amber-50 border-amber-150',
          badge: 'bg-amber-500 text-white',
          text: 'text-amber-700',
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse',
          ringColor: 'stroke-amber-500',
          accentBg: 'bg-amber-100/50',
          icon: AlertCircle,
        };
      default:
        return {
          title: 'SISTEMA PROTEGIDO',
          desc: 'Seu monitoramento está ativo. Confirmaremos se está tudo bem ao final do período do temporizador.',
          bg: 'bg-gradient-to-tr from-blue-50/50 via-white to-emerald-50/30 border-blue-50',
          badge: 'bg-blue-600 text-white',
          text: 'text-slate-800',
          btnClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 text-white active:scale-95',
          ringColor: 'stroke-blue-500',
          accentBg: 'bg-blue-50/80',
          icon: Shield,
        };
    }
  };

  const currentStatus = getStatusConfig();
  const StatusIcon = currentStatus.icon;

  const confirmNotWellAction = () => {
    setShowNotWellConfirm(false);
    onTriggerNotWell();
    setActiveShareModal('not_well');
  };

  const confirmDangerAction = () => {
    setShowDangerConfirm(false);
    onTriggerDanger();
    setActiveShareModal('danger');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-28 px-4 pt-4" id="home-screen">
      
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Olá, {user.name}</span>
          <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight mt-0.5">imSafe Dashboard</h2>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold text-xs px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span>Monitorando</span>
        </div>
      </div>

      {/* Main Safety Status Banner */}
      <motion.div
        layout
        className={`p-5 rounded-3xl border shadow-sm transition-all relative overflow-hidden ${currentStatus.bg}`}
        id="safety-status-card"
      >
        <div className="flex gap-4">
          <div className={`p-3.5 h-fit rounded-2xl ${currentStatus.accentBg}`}>
            <StatusIcon className="w-6 h-6 text-current" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className={`font-display font-bold text-xs tracking-wide uppercase ${dangerProtocolActive || notWellCountdown > 0 ? 'text-white/80' : 'text-slate-400'}`}>
              {currentStatus.title}
            </h3>
            <p className={`text-xs leading-relaxed font-medium ${dangerProtocolActive || notWellCountdown > 0 ? 'text-white' : 'text-slate-600'}`}>
              {currentStatus.desc}
            </p>
            {dangerProtocolActive && (
              <button
                onClick={onResetDangerProtocol}
                className="mt-3 bg-white text-red-600 px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <PowerOff className="w-3.5 h-3.5" />
                Desativar Protocolo de Perigo
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 30 Seconds Countdown Overlay for "Não estou bem" */}
      <AnimatePresence>
        {notWellCountdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 shadow-md flex flex-col items-center text-center space-y-4"
          >
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 animate-pulse">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-850">Protocolo de Emergência Médica</h3>
              <p className="text-xs text-amber-700 max-w-sm mt-1 leading-relaxed">
                Estamos obtendo sua localização e preparando o alerta para todos os seus contatos cadastrados. O envio será feito em:
              </p>
            </div>
            <div className="text-4xl font-mono font-bold text-amber-600 py-1">
              {notWellCountdown}s
            </div>
            <button
              onClick={onCancelNotWell}
              id="btn-cancel-notwell-countdown"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              CANCELAR ALERTA (FALSO ALARME)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circle Countdown Visualizer & Action Area */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-4">
          Próxima Verificação de Segurança
        </h4>

        {/* Circular Progress & Timer */}
        <div className="relative flex items-center justify-center w-48 h-48 mb-5">
          {/* Outer Ring Background */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-slate-100 fill-none"
              strokeWidth="10"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r="84"
              className={`fill-none transition-all duration-1000 ${currentStatus.ringColor}`}
              strokeWidth="10"
              strokeDasharray={527} // 2 * pi * r (2 * 3.1415 * 84 ≈ 527)
              strokeDashoffset={527 - (527 * progressPercentage) / 100}
              strokeLinecap="round"
            />
          </svg>

          {/* Absolute Inner Countdown */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-mono font-bold text-slate-800 tracking-wider">
              {formatTimeRemaining(timeLeft)}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
              intervalo: {user.checkInInterval}h
            </span>
          </div>
        </div>

        {/* TRIPLE ACTION BUTTONS - ALWAYS VISIBLE */}
        <div className="w-full space-y-3" id="main-safety-buttons">
          {/* 1. BLUE BUTTON: ESTOU VIVO */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onCheckIn('Check-in manual - Respondido "Estou Vivo"')}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/10 text-white rounded-2xl font-display font-bold text-base tracking-wide flex items-center justify-center gap-2.5 transition-all cursor-pointer focus:outline-none"
            id="btn-estou-vivo"
          >
            <UserCheck className="w-5.5 h-5.5" />
            ESTOU VIVO! (CHECK-IN)
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            {/* 2. YELLOW BUTTON: NÃO ESTOU BEM */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowNotWellConfirm(true)}
              className="py-3.5 px-4 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-2xl font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none border border-amber-300"
              id="btn-nao-estou-bem"
            >
              <Activity className="w-4.5 h-4.5 text-amber-950" />
              Não estou bem
            </motion.button>

            {/* 3. RED BUTTON: ESTOU EM PERIGO */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowDangerConfirm(true)}
              className="py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none shadow-md shadow-red-600/10"
              id="btn-estou-em-perigo"
            >
              <ShieldAlert className="w-4.5 h-4.5 text-white" />
              Estou em perigo
            </motion.button>
          </div>
        </div>
      </div>

      {/* Security Permissions Alert Banner */}
      <div 
        onClick={onNavigateToPermissions}
        className="bg-slate-50 border border-slate-100 p-5 rounded-3xl shadow-sm hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group flex items-start justify-between gap-4"
        id="home-permissions-banner"
      >
        <div className="flex gap-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h5 className="font-display font-semibold text-slate-800 text-xs">Proteção Ativa & Permissões</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O imSafe precisa de permissões de Localização e Notificações ativas para garantir monitoramento constante em segundo plano.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold shrink-0 mt-1">
          <span>Verificar</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Quick Access Grid / Overview */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contacts Card */}
        <div 
          onClick={onNavigateToContacts}
          className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group"
          id="quick-card-contacts"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">
              {contacts.length} cadastrados
            </span>
          </div>
          <h5 className="font-display font-semibold text-slate-800 text-sm">Contatos</h5>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Pessoas de confiança que receberão os alertas de emergência.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold mt-4">
            <span>Gerenciar</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Timer Config Card */}
        <div 
          onClick={onNavigateToTimer}
          className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group"
          id="quick-card-timer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">
              A cada {user.checkInInterval}h
            </span>
          </div>
          <h5 className="font-display font-semibold text-slate-800 text-sm">Temporizador</h5>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Ajuste o intervalo padrão de check-in de acordo com sua rotina diária.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold mt-4">
            <span>Configurar</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Last Action Indicator */}
      {history.length > 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Último check-in: <strong className="text-slate-700">{new Date(history[0].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong></span>
          </div>
          {history[0].location && (
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
              {history[0].location.address || `${history[0].location.latitude.toFixed(4)}, ${history[0].location.longitude.toFixed(4)}`}
            </span>
          )}
        </div>
      )}

      {/* Confirmation Modals (Custom UI, avoiding native blocky confirms for elegant feel) */}
      <AnimatePresence>
        {/* 1. "Não estou bem" Custom Dialog */}
        {showNotWellConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-950">Confirmar Emergência</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você confirmou que <strong>não está bem</strong>? Isso iniciará o protocolo de emergência médica e disparará um alerta com sua localização para todos os seus contatos cadastrados após 30 segundos.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNotWellConfirm(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmNotWellAction}
                  id="confirm-notwell-btn"
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-amber-955 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Sim, Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. "Estou em perigo" Custom Dialog */}
        {showDangerConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2.5 bg-red-50 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-950">⚠️ ALERTA DE PERIGO!</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você está em <strong>situação de perigo</strong>? Isso enviará um alerta de <strong>ALTÍSSIMA PRIORIDADE</strong> imediatamente para todos os seus contatos com sua localização. O protocolo começará instantaneamente.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDangerConfirm(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDangerAction}
                  id="confirm-danger-btn"
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Sim, Estou em Perigo!
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* imSafe Official Emergency Share Modal */}
        {activeShareModal && (
          <EmergencyShareModal
            isOpen={!!activeShareModal}
            type={activeShareModal}
            contacts={contacts}
            onClose={() => setActiveShareModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
