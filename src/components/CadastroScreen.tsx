/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, User as UserIcon, Mail, Phone, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface CadastroScreenProps {
  onRegisterSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

export default function CadastroScreen({ onRegisterSuccess, onNavigateToLogin }: CadastroScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [interval, setInterval] = useState<number>(6); // Default 6 hours
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!email.includes('@')) {
      setError('Insira um e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    // Simulate Firebase Authentication and DB registration
    setTimeout(() => {
      setLoading(false);
      const newUser: User = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        phone,
        checkInInterval: interval,
        lastCheckIn: new Date().toISOString(),
        nextCheckIn: new Date(Date.now() + interval * 60 * 60 * 1000).toISOString(),
      };
      onRegisterSuccess(newUser);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-blue-50 via-slate-50 to-emerald-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-white border border-slate-100 shadow-xl rounded-3xl"
        id="register-card"
      >
        <button
          onClick={onNavigateToLogin}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6 cursor-pointer focus:outline-none"
          id="btn-back-to-login"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Login
        </button>

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-slate-800">
            Crie sua conta
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure seu perfil de proteção em poucos passos.
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 text-sm font-medium text-red-600 bg-red-50 rounded-xl border border-red-100" id="register-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Nome Completo
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: Ana Maria Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="ana@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Telefone Celular
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                placeholder="Ex: (11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Senha de Segurança
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="No mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Intervalo de Check-in Padrão
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 6, 12, 24].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setInterval(h)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    interval === h
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              A cada {interval} {interval === 1 ? 'hora' : 'horas'}, o app enviará uma notificação perguntando se você está bem.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn-register-submit"
            className="flex items-center justify-center w-full py-3 mt-6 font-display font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cadastrando...
              </span>
            ) : (
              'Criar minha conta'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
