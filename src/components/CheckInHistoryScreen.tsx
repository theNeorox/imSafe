/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, AlertTriangle, ShieldAlert, MapPin, ExternalLink, RefreshCw, Activity, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { CheckInLog } from '../types';

interface CheckInHistoryScreenProps {
  history: CheckInLog[];
  onClearHistory: () => void;
}

export default function CheckInHistoryScreen({ history, onClearHistory }: CheckInHistoryScreenProps) {
  
  const getStatusBadge = (status: CheckInLog['status']) => {
    switch (status) {
      case 'alive':
        return {
          label: 'Estou Vivo',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          icon: CheckCircle2,
        };
      case 'missed':
        return {
          label: 'Não Respondido',
          color: 'bg-amber-50 text-amber-700 border-amber-100',
          icon: AlertTriangle,
        };
      case 'alert_sent':
        return {
          label: 'Alerta Automático',
          color: 'bg-red-50 text-red-700 border-red-100',
          icon: ShieldAlert,
        };
      case 'not_well':
        return {
          label: 'Não Estou Bem',
          color: 'bg-amber-100 text-amber-850 border-amber-200',
          icon: Activity,
        };
      case 'danger':
        return {
          label: 'Estou em Perigo',
          color: 'bg-red-600 text-white border-red-700',
          icon: ShieldAlert,
        };
      case 'cancelled':
        return {
          label: 'Alerta Cancelado',
          color: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: XCircle,
        };
      default:
        return {
          label: 'Info',
          color: 'bg-slate-50 text-slate-500 border-slate-100',
          icon: CheckCircle2,
        };
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 px-4 pt-6" id="history-screen">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
            Histórico de Check-ins
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Registro de confirmações e alertas automáticos enviados.
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 cursor-pointer focus:outline-none transition-colors"
            id="btn-clear-history"
          >
            Limpar Registros
          </button>
        )}
      </div>

      {/* History timeline ledger */}
      <div className="space-y-4" id="history-list">
        {history.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-6" id="history-empty-state">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <h4 className="font-display font-bold text-slate-700 text-sm">Sem registros ainda</h4>
            <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed">
              Os registros de check-in aparecerão aqui conforme as horas passarem ou você simular os testes.
            </p>
          </div>
        ) : (
          history.map((log) => {
            const badge = getStatusBadge(log.status);
            const LogIcon = badge.icon;
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 bg-white border rounded-3xl shadow-sm space-y-3.5 transition-all hover:shadow-md ${
                  log.status === 'alert_sent' ? 'border-red-100 bg-red-50/10' : 'border-slate-100'
                }`}
              >
                {/* Log Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${badge.color}`}>
                      <LogIcon className="w-4.5 h-4.5 shrink-0" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wide uppercase">
                        ID: {log.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">{formatDate(log.timestamp)}</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{formatTime(log.timestamp)}</p>
                  </div>
                </div>

                {/* Notes/Summary */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {log.notes || 'Verificação periódica regular'}
                </p>

                {/* Location Card and link */}
                {log.location && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 text-[11px]">Localização de Segurança:</p>
                        <p className="text-[11px] truncate mt-0.5">
                          {log.location.address || 'Endereço indisponível'}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                          Lat: {log.location.latitude.toFixed(6)}, Lng: {log.location.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${log.location.latitude},${log.location.longitude}`}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 pt-1 focus:outline-none"
                    >
                      Ver no Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
