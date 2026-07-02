/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Bell, X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationToastProps {
  visible: boolean;
  title: string;
  body: string;
  type: 'checkin' | 'reminder' | 'alert';
  onAction: () => void;
  onClose: () => void;
}

export default function NotificationToast({
  visible,
  title,
  body,
  type,
  onAction,
  onClose
}: NotificationToastProps) {
  
  const getColors = () => {
    switch (type) {
      case 'alert':
        return {
          bg: 'bg-red-600',
          border: 'border-red-500',
          text: 'text-white',
          buttonBg: 'bg-white text-red-600 hover:bg-slate-50',
          icon: AlertTriangle,
          badge: 'URGENTE'
        };
      case 'reminder':
        return {
          bg: 'bg-amber-600',
          border: 'border-amber-500',
          text: 'text-white',
          buttonBg: 'bg-white text-amber-600 hover:bg-slate-50',
          icon: Bell,
          badge: 'LEMBRETE'
        };
      default:
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-500',
          text: 'text-white',
          buttonBg: 'bg-white text-blue-600 hover:bg-slate-50',
          icon: Shield,
          badge: 'CHECK-IN'
        };
    }
  };

  const colors = getColors();
  const Icon = colors.icon;

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed top-4 left-4 right-4 max-w-sm mx-auto z-[100] font-sans" id="notification-toast-container">
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className={`shadow-2xl border rounded-2xl p-4.5 text-white flex flex-col gap-3.5 ${colors.bg} ${colors.border}`}
          >
            {/* Top notification meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-bold tracking-wide">imSafe</span>
                  <span className="text-[10px] opacity-75 font-semibold">• agora</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-white/15 rounded-md">
                  {colors.badge}
                </span>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer focus:outline-none"
                  id="btn-close-notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification content */}
            <div className="flex gap-3">
              <div className="p-2 bg-white/10 rounded-xl h-fit shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-display font-bold text-sm text-white">{title}</h5>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {body}
                </p>
              </div>
            </div>

            {/* Response button */}
            {type !== 'alert' && (
              <button
                onClick={onAction}
                className={`w-full py-2.5 px-4 font-display font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer focus:outline-none active:scale-98 ${colors.buttonBg}`}
                id="btn-notification-action"
              >
                <Check className="w-4 h-4" />
                SIM, ESTOU VIVO! (REINICIAR)
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
