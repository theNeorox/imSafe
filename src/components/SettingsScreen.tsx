/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  Code, 
  Smartphone, 
  Radio, 
  Settings, 
  AlertOctagon, 
  Shield, 
  Heart, 
  Flame,
  Save,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { User as UserType, EmergencyNumbers, ScreenType } from '../types';

interface SettingsScreenProps {
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
  onLogout: () => void;
  numbers: EmergencyNumbers;
  onUpdateNumbers: (updatedNumbers: EmergencyNumbers) => void;
  onNavigate?: (screen: ScreenType) => void;
}

export default function SettingsScreen({ 
  user, 
  onUpdateUser, 
  onLogout, 
  numbers, 
  onUpdateNumbers,
  onNavigate
}: SettingsScreenProps) {
  // User Profile state
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);

  // Emergency Numbers state
  const [police, setPolice] = useState(numbers.police);
  const [samu, setSamu] = useState(numbers.samu);
  const [firefighters, setFirefighters] = useState(numbers.firefighters);
  const [isEditingNumbers, setIsEditingNumbers] = useState(false);

  const [message, setMessage] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      phone,
      email,
    });
    setIsEditing(false);
    setMessage('Perfil atualizado com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveNumbers = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNumbers({
      police,
      samu,
      firefighters
    });
    setIsEditingNumbers(false);
    setMessage('Números de emergência atualizados com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 px-4 pt-4" id="settings-screen">
      {/* Title */}
      <div>
        <h3 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
          Configurações
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Gerencie seu perfil de usuário, ajuste os canais de ligação rápida e conheça o sistema.
        </p>
      </div>

      {message && (
        <div className="p-3.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-100" id="settings-message">
          {message}
        </div>
      )}

      {/* Profile Form / View */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <h4 className="font-display font-bold text-slate-800 text-sm">
            Seu Perfil Seguro
          </h4>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 focus:outline-none cursor-pointer flex items-center gap-1"
            id="btn-edit-profile"
          >
            <Edit2 className="w-3 h-3" />
            {isEditing ? 'Cancelar' : 'Editar Dados'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3.5" id="profile-edit-form">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Seu Celular
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Seu E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-save-profile"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </form>
        ) : (
          <div className="space-y-3 text-xs text-slate-600 font-medium" id="profile-view">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Nome</p>
                <p className="text-slate-800 mt-0.5">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Celular</p>
                <p className="text-slate-800 mt-0.5">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">E-mail</p>
                <p className="text-slate-800 mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Numbers Form / Config */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4" id="emergency-numbers-config">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <h4 className="font-display font-bold text-slate-800 text-sm">
            Números de Ligação Rápida
          </h4>
          <button
            onClick={() => setIsEditingNumbers(!isEditingNumbers)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 focus:outline-none cursor-pointer flex items-center gap-1"
            id="btn-edit-numbers"
          >
            <Edit2 className="w-3 h-3" />
            {isEditingNumbers ? 'Cancelar' : 'Personalizar'}
          </button>
        </div>

        {isEditingNumbers ? (
          <form onSubmit={handleSaveNumbers} className="space-y-3.5" id="numbers-edit-form">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Você pode alterar estes telefones públicos de acordo com a região ou país onde reside (ex: 911 nos EUA, 112 na Europa).
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Polícia Militar
              </label>
              <input
                type="text"
                value={police}
                onChange={(e) => setPolice(e.target.value)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-amber-500" />
                SAMU
              </label>
              <input
                type="text"
                value={samu}
                onChange={(e) => setSamu(e.target.value)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                Corpo de Bombeiros
              </label>
              <input
                type="text"
                value={firefighters}
                onChange={(e) => setFirefighters(e.target.value)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              id="btn-save-numbers"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Salvar Números de Emergência
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 font-medium" id="numbers-view">
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-center">
              <Shield className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Polícia</p>
              <p className="text-slate-800 font-bold text-sm mt-0.5">{numbers.police}</p>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl text-center">
              <Heart className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">SAMU</p>
              <p className="text-slate-800 font-bold text-sm mt-0.5">{numbers.samu}</p>
            </div>

            <div className="p-3 bg-red-50/50 border border-red-100 rounded-2xl text-center">
              <Flame className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Bombeiros</p>
              <p className="text-slate-800 font-bold text-sm mt-0.5">{numbers.firefighters}</p>
            </div>
          </div>
        )}
      </div>

      {/* Central de Permissões Quick Access */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800" id="settings-permissions-card">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-slate-100">
              Central de Permissões Android & Google
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verifique o status de localização, notificações e chamadas telefônicas. Conheça as políticas do Google Play e as alternativas oficiais seguras de proteção do imSafe.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('permissions')}
          id="btn-goto-permissions"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Gerenciar Permissões do Dispositivo
        </button>
      </div>

      {/* Central de Alertas Quick Access */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-blue-900/30" id="settings-twilio-card">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/15 text-blue-400 rounded-2xl border border-blue-500/10 shrink-0">
            <Phone className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-slate-100">
              Central de Alertas (SMS, Ligações & E-mails)
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Configure suas contas do Twilio e servidor de e-mail SMTP para habilitar alertas automáticos reais via SMS redundante, ligações com leitura de voz e disparo de e-mails em tempo real.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('twilio')}
          id="btn-goto-twilio"
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4 text-blue-600" />
          Configurar Canais de Alerta
        </button>
      </div>

      {/* imSafe Safety Flow Map Graphic */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Como o imSafe te protege:
        </h4>

        <div className="grid grid-cols-3 gap-3 text-center text-[11px] leading-snug">
          <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-2xl flex flex-col items-center">
            <Smartphone className="w-5 h-5 text-blue-600 mb-2" />
            <strong className="text-slate-700">1. App nativo</strong>
            <p className="text-[10px] text-slate-400 mt-1">Agenda e controla o temporizador em background.</p>
          </div>
          
          <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex flex-col items-center">
            <Radio className="w-5 h-5 text-emerald-600 mb-2" />
            <strong className="text-slate-700">2. Cloud Messaging</strong>
            <p className="text-[10px] text-slate-400 mt-1">Envia notificações de "Você está bem?" recorrentes.</p>
          </div>

          <div className="p-3 bg-red-50/40 border border-red-100 rounded-2xl flex flex-col items-center">
            <AlertOctagon className="w-5 h-5 text-red-500 mb-2" />
            <strong className="text-slate-700">3. Cloud Functions</strong>
            <p className="text-[10px] text-slate-400 mt-1">Dispara o alerta de perigo em caso de não-resposta.</p>
          </div>
        </div>
      </div>

      {/* Simulator Architecture Disclaimer */}
      <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 text-xs text-slate-300 space-y-2">
        <h5 className="font-display font-bold text-slate-100 text-sm flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-400" />
          Arquitetura e Tecnologia
        </h5>
        <p className="leading-relaxed text-slate-400">
          Este ambiente de teste do **imSafe** simula a pilha completa descrita em seu escopo de produção:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
          <li><strong>Firebase Authentication:</strong> Simulado via rotas seguras locais.</li>
          <li><strong>Cloud Messaging (Push):</strong> Exibido dinamicamente como alertas flutuantes em tela para você testar com tempos curtos.</li>
          <li><strong>Cloud Functions (Automação):</strong> Motor de background que gerencia o temporizador e envia SMS/Emails aos contatos caso você falhe ao confirmar que está bem.</li>
        </ul>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-display font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer focus:outline-none"
        id="btn-logout"
      >
        <LogOut className="w-4 h-4" />
        Sair da Conta (Logout)
      </button>
    </div>
  );
}
