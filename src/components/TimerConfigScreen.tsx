/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Clock, Check, Info, Shield, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface TimerConfigScreenProps {
  user: User;
  onUpdateInterval: (interval: number) => void;
}

export default function TimerConfigScreen({ user, onUpdateInterval }: TimerConfigScreenProps) {
  const [selectedInterval, setSelectedInterval] = useState<number>(user.checkInInterval);
  const [isSaved, setIsSaved] = useState(false);

  const intervals = [
    { value: 1, label: '1 Hora', desc: 'Ideal para alta supervisão ou situações específicas de risco temporário.', color: 'border-blue-100 hover:border-blue-300' },
    { value: 6, label: '6 Horas', desc: 'Recomendado para o dia a dia. Check-ins pela manhã, tarde e noite.', color: 'border-emerald-100 hover:border-emerald-300' },
    { value: 12, label: '12 Horas', desc: 'Duas vezes ao dia. Monitoramento equilibrado e não intrusivo.', color: 'border-indigo-100 hover:border-indigo-300' },
    { value: 24, label: '24 Horas', desc: 'Uma vez ao dia. Ideal para quem possui rotina ativa e independente.', color: 'border-slate-100 hover:border-slate-300' },
  ];

  const handleSave = () => {
    onUpdateInterval(selectedInterval);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 px-4 pt-6" id="timer-config-screen">
      {/* Title */}
      <div>
        <h3 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
          Configuração do Temporizador
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Ajuste a frequência com que o aplicativo confirmará se está tudo bem com você.
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-4 text-xs text-slate-600 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-800">Como funciona o temporizador?</p>
          <p className="leading-relaxed">
            Ao fim do período selecionado, enviamos uma notificação. Se você não clicar em "Estou bem" em até 3 lembretes automáticos, seus contatos de emergência serão alertados com sua última localização conhecida.
          </p>
        </div>
      </div>

      {/* Grid of options */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Selecione o Intervalo de Check-in
        </label>
        <div className="space-y-3">
          {intervals.map((item) => {
            const isSelected = selectedInterval === item.value;
            return (
              <div
                key={item.value}
                onClick={() => setSelectedInterval(item.value)}
                className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all flex items-center justify-between shadow-sm ${item.color} ${
                  isSelected 
                    ? 'ring-2 ring-blue-500/20 border-blue-500 bg-blue-50/10' 
                    : ''
                }`}
              >
                <div className="flex gap-3.5 items-start">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-slate-800 text-sm">
                      {item.label}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-[280px]">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-slate-200'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe guard info */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Aviso de proteção imSafe
        </h4>
        
        <div className="relative border-l-2 border-slate-200 pl-4 py-1 space-y-3 text-xs text-slate-500">
          <div className="relative">
            <span className="absolute -left-[22px] top-0.5 bg-blue-500 text-white font-mono text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center">1</span>
            <p className="font-semibold text-slate-700">Fim do Intervalo</p>
            <p>O aplicativo exibe a tela e envia notificação: "Você está bem?".</p>
          </div>
          <div className="relative">
            <span className="absolute -left-[22px] top-0.5 bg-amber-500 text-white font-mono text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center">2</span>
            <p className="font-semibold text-slate-700">Três Lembretes (30 min cada)</p>
            <p>Caso não haja resposta, o aplicativo repete o aviso de forma persistente com som especial.</p>
          </div>
          <div className="relative">
            <span className="absolute -left-[22px] top-0.5 bg-red-500 text-white font-mono text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center">3</span>
            <p className="font-semibold text-slate-700">Envio de Alerta Automatizado</p>
            <p>Os contatos cadastrados recebem mensagens com seu último local via Cloud Functions.</p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaved}
        className={`w-full py-3.5 rounded-2xl font-display font-semibold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
          isSaved 
            ? 'bg-emerald-600 text-white shadow-emerald-500/10' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 active:scale-98'
        }`}
        id="btn-save-timer"
      >
        {isSaved ? (
          <>
            <Check className="w-5 h-5" />
            Configuração Salva com Sucesso!
          </>
        ) : (
          'Salvar Intervalo'
        )}
      </button>
    </div>
  );
}
