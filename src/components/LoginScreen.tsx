/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!email.includes('@')) {
      setError('Insira um endereço de e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    // Simulate network latency for Firebase Auth
    setTimeout(() => {
      setLoading(false);
      // Simulate successful login
      const mockUser: User = {
        id: 'usr_1',
        name: email.split('@')[0].split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ') || 'Usuário',
        email: email,
        phone: '(11) 98765-4321',
        checkInInterval: 6,
        lastCheckIn: new Date().toISOString(),
        nextCheckIn: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      };
      onLoginSuccess(mockUser);
    }, 1200);
  };

  const fillDemoCredentials = () => {
    setEmail('ana.silva@email.com');
    setPassword('senha123');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-blue-50 via-slate-50 to-emerald-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-white border border-slate-100 shadow-xl rounded-3xl"
        id="login-card"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-blue-500/10 text-blue-600 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-800">
            im<span className="text-blue-600">Safe</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Segurança ativa e cuidado para quem mora sozinho.
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 text-sm font-medium text-red-600 bg-red-50 rounded-xl border border-red-100" id="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn-login-submit"
            className="flex items-center justify-center w-full py-3.5 font-display font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Acessar Conta
                <LogIn className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <span className="relative px-3 text-xs uppercase tracking-wider text-slate-400 bg-white font-medium">
            Ou use dados de teste
          </span>
        </div>

        <button
          onClick={fillDemoCredentials}
          className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl transition-all cursor-pointer"
          id="btn-demo-data"
        >
          Entrar como Ana Silva (Demonstração)
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Não tem uma conta?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-semibold text-blue-600 hover:text-blue-700 underline focus:outline-none"
              id="btn-go-to-register"
            >
              Cadastre-se agora
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
