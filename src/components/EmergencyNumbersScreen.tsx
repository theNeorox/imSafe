/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phone, Shield, Heart, Flame, ExternalLink } from 'lucide-react';
import { EmergencyNumbers } from '../types';
import { motion } from 'motion/react';

interface EmergencyNumbersScreenProps {
  numbers: EmergencyNumbers;
}

export default function EmergencyNumbersScreen({ numbers }: EmergencyNumbersScreenProps) {
  const handleCall = (service: string, num: string) => {
    // Show alert/notification or simulate dialer open
    alert(`[Simulação] Ligando para ${service}: ${num}`);
    window.location.href = `tel:${num}`;
  };

  const services = [
    {
      id: 'police',
      name: 'Polícia Militar',
      number: numbers.police,
      icon: Shield,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      textColor: 'text-blue-600',
      lightBg: 'bg-blue-50',
      desc: 'Para ocorrências de crimes, roubos, violência ou ameaça imediata à segurança pública.',
      code: '190'
    },
    {
      id: 'samu',
      name: 'SAMU',
      number: numbers.samu,
      icon: Heart,
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      textColor: 'text-amber-600',
      lightBg: 'bg-amber-50',
      desc: 'Serviço de Atendimento Móvel de Urgência para casos de risco de vida e emergências médicas.',
      code: '192'
    },
    {
      id: 'firefighters',
      name: 'Corpo de Bombeiros',
      number: numbers.firefighters,
      icon: Flame,
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      textColor: 'text-red-600',
      lightBg: 'bg-red-50',
      desc: 'Para incêndios, acidentes com vítimas, desabamentos, vazamentos de gás ou salvamento.',
      code: '193'
    }
  ];

  return (
    <div className="px-4 pb-24 md:pb-8" id="emergency-numbers-screen">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Phone className="w-6 h-6 text-blue-600" />
          Números de Emergência
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Canais de utilidade pública para ligação rápida e suporte emergencial.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-800">Uso Consciente</h4>
          <p className="text-xs text-amber-700 mt-1">
            Estes telefones são para situações de urgência e emergência real. Chamadas falsas (trote) prejudicam o socorro e são consideradas crime.
          </p>
        </div>
      </div>

      {/* Grid of Emergency Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <motion.div
              key={svc.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${svc.lightBg} flex items-center justify-center ${svc.textColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                  Padrão BR: {svc.code}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">{svc.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">{svc.desc}</p>

              <button
                onClick={() => handleCall(svc.name, svc.number)}
                id={`btn-call-${svc.id}`}
                className={`w-full py-4 px-5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer ${svc.color} ${svc.hoverColor}`}
              >
                <Phone className="w-5 h-5" />
                <span>Ligar para {svc.number}</span>
                <ExternalLink className="w-4 h-4 opacity-70 ml-auto" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          Precisa configurar números internacionais? Acesse a aba <span className="font-semibold text-slate-600">Ajustes</span> para personalizar cada um.
        </p>
      </div>
    </div>
  );
}
