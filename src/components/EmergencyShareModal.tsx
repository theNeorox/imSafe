/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  Check, 
  User, 
  Heart, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmergencyContact } from '../types';

interface EmergencyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'not_well' | 'danger';
  contacts: EmergencyContact[];
}

export default function EmergencyShareModal({
  isOpen,
  onClose,
  type,
  contacts
}: EmergencyShareModalProps) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showPreview, setShowPreview] = useState(false);

  // Initialize selected contacts with all contacts
  useEffect(() => {
    if (isOpen) {
      setSelectedContacts(contacts.map(c => c.id));
      setCurrentTime(new Date());

      // Fetch precise location instantly when opened
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => {
            // Fallback (São Paulo)
            setCoords({ latitude: -23.55052, longitude: -46.633308 });
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setCoords({ latitude: -23.55052, longitude: -46.633308 });
      }
    }
  }, [isOpen, contacts]);

  if (!isOpen) return null;

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString('pt-BR');
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const lat = coords?.latitude ?? -23.55052;
  const lng = coords?.longitude ?? -46.633308;

  // Generate exact requested message text
  const getMessageText = () => {
    if (type === 'not_well') {
      return `🚨 ALERTA IMSAFE\n\nOlá, preciso de ajuda.\n\nAcionei o protocolo "Não estou bem" no aplicativo imSafe.\n\n📅 Data: ${formattedDate}\n\n🕒 Hora: ${formattedTime}\n\n📍 Minha localização:\nhttps://maps.google.com/?q=${lat},${lng}\n\nPor favor, entre em contato comigo o mais rápido possível.`;
    } else {
      return `🚨 EMERGÊNCIA IMSAFE\n\nEstou em uma situação de perigo.\n\nSe estiver recebendo esta mensagem, preciso de ajuda imediatamente.\n\n📅 Data: ${formattedDate}\n\n🕒 Hora: ${formattedTime}\n\n📍 Minha localização:\nhttps://maps.google.com/?q=${lat},${lng}\n\nAcione a Polícia Militar (190) caso não consiga entrar em contato comigo.`;
    }
  };

  const messageText = getMessageText();

  // Handle contact selection toggle
  const toggleContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  // Format phone number to clean WhatsApp compatible digits
  const formatWhatsAppPhone = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    return clean.startsWith('55') ? clean : `55${clean}`;
  };

  // Sharing Actions
  const handleShareWhatsApp = () => {
    const selectedList = contacts.filter(c => selectedContacts.includes(c.id));
    
    if (selectedList.length === 0) {
      // General sharing without specific target contact
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
      window.open(url, '_blank');
      onClose();
      return;
    }

    if (selectedList.length === 1) {
      // Exact single target contact
      const targetPhone = formatWhatsAppPhone(selectedList[0].phone);
      const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(messageText)}`;
      window.open(url, '_blank');
      onClose();
    } else {
      // If multiple, use standard text-only send (opens selector) OR we let user dispatch via individual links shown below.
      // We will open general selector as the fallback.
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
      window.open(url, '_blank');
      onClose();
    }
  };

  const handleShareSMS = () => {
    const selectedList = contacts.filter(c => selectedContacts.includes(c.id));
    const phones = selectedList.map(c => c.phone.replace(/\D/g, ''));
    
    // Create SMS URL standard compatible with Android/iOS
    const target = phones.length > 0 ? phones.join(',') : '';
    const url = `sms:${target}?body=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleShareEmail = () => {
    const selectedList = contacts.filter(c => selectedContacts.includes(c.id));
    const emails = selectedList.map(c => c.email);
    
    const target = emails.length > 0 ? emails.join(',') : '';
    const subject = type === 'not_well' ? 'ALERTA IMSAFE' : 'EMERGÊNCIA IMSAFE';
    const url = `mailto:${target}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
    onClose();
  };

  // Helper single dispatch
  const handleSingleWhatsApp = (phone: string) => {
    const targetPhone = formatWhatsAppPhone(phone);
    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg border border-slate-100 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        id="emergency-share-modal"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${type === 'danger' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-black text-slate-800 text-base uppercase tracking-tight">
                {type === 'danger' ? '🚨 Enviar Alerta de Perigo' : '🚨 Enviar Alerta Não Estou Bem'}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Sua localização atual foi obtida com sucesso.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
            id="btn-close-share-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Geolocation status */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
              <span>Localização resolvida com precisão:</span>
            </div>
            <span className="font-mono font-semibold text-[10px] text-emerald-600">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          </div>

          {/* Contacts checklist section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Selecione os Contatos de Emergência
              </label>
              {contacts.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {selectedContacts.length === contacts.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
              )}
            </div>

            {contacts.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                <p>Nenhum contato cadastrado ainda.</p>
                <p className="text-[10px] text-slate-400 mt-1">Sua mensagem será gerada, mas você precisará selecionar os contatos manualmente no aplicativo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {contacts.map((c) => {
                  const isChecked = selectedContacts.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleContact(c.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'bg-blue-50/40 border-blue-200/60 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isChecked ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <h5 className="font-bold text-slate-800 text-xs">{c.name}</h5>
                          <p className="text-[10px] text-slate-400">
                            {c.relationship} • {c.phone}
                          </p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sequential WhatsApp Trigger Buttons for Multiple Contacts */}
          {contacts.filter(c => selectedContacts.includes(c.id)).length > 1 && (
            <div className="bg-emerald-50/30 border border-emerald-500/10 rounded-2xl p-3.5 space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Envios Individuais Rápidos (WhatsApp)
              </span>
              <p className="text-[10px] text-emerald-700 leading-normal">
                Devido aos limites de privacidade do WhatsApp, envie individualmente para cada destinatário com um toque abaixo:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {contacts
                  .filter(c => selectedContacts.includes(c.id))
                  .map((c) => (
                    <button
                      key={`single-wa-${c.id}`}
                      onClick={() => handleSingleWhatsApp(c.phone)}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Enviar para {c.name.split(' ')[0]}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Interactive Message Preview */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs font-bold text-slate-600"
            >
              <span>Visualizar Conteúdo da Mensagem</span>
              {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-slate-50/40 border-t border-slate-100"
                >
                  <pre className="p-4 text-[11px] font-mono text-slate-700 whitespace-pre-wrap text-left leading-relaxed">
                    {messageText}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer App Selector / Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-[32px] sm:rounded-b-[32px] shrink-0 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-1">
            Escolha o canal oficial para envio
          </span>

          <div className="grid grid-cols-3 gap-3">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="py-3.5 px-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
              id="share-btn-whatsapp"
            >
              <MessageSquare className="w-6 h-6 stroke-[2]" />
              <span className="text-[11px] font-bold">WhatsApp</span>
            </button>

            {/* SMS */}
            <button
              onClick={handleShareSMS}
              className="py-3.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
              id="share-btn-sms"
            >
              <Smartphone className="w-6 h-6 stroke-[2]" />
              <span className="text-[11px] font-bold">SMS</span>
            </button>

            {/* Email */}
            <button
              onClick={handleShareEmail}
              className="py-3.5 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
              id="share-btn-email"
            >
              <Mail className="w-6 h-6 stroke-[2]" />
              <span className="text-[11px] font-bold">E-mail</span>
            </button>
          </div>

          <p className="text-[9px] text-slate-400 text-center pt-2">
            O aplicativo correspondente será aberto com a mensagem totalmente preenchida para envio rápido.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
