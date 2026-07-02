/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Users, Clock, History, Settings, Phone, Shield } from 'lucide-react';
import { ScreenType } from '../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unresolvedRemindersCount?: number;
}

export default function Navigation({ currentScreen, onNavigate, unresolvedRemindersCount = 0 }: NavigationProps) {
  const tabs = [
    { id: 'home' as ScreenType, label: 'Início', icon: Home },
    { id: 'numbers' as ScreenType, label: 'Números', icon: Phone },
    { id: 'contacts' as ScreenType, label: 'Contatos', icon: Users },
    { id: 'timer' as ScreenType, label: 'Timer', icon: Clock },
    { id: 'history' as ScreenType, label: 'Histórico', icon: History },
    { id: 'settings' as ScreenType, label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Tab Bar (Mobile & General viewport) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] px-3 pb-safe pt-2 z-40 md:hidden"
        id="bottom-nav"
      >
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                id={`tab-${tab.id}`}
                className="flex flex-col items-center gap-1 py-1.5 px-1 sm:px-2 rounded-2xl relative transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <div 
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 scale-110' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <span 
                  className={`text-[10px] font-medium tracking-tight transition-colors ${
                    isActive ? 'text-blue-600 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Badge for warnings/reminders on home icon */}
                {tab.id === 'home' && unresolvedRemindersCount > 0 && (
                  <span className="absolute top-1 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Navigation (Desktop) */}
      <aside 
        className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-5 h-screen fixed left-0 top-0 z-40 shadow-[4px_0_16px_rgba(0,0,0,0.01)]"
        id="desktop-sidebar"
      >
        <div className="mb-8 px-2 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-slate-800">
            im<span className="text-blue-600">Safe</span>
          </span>
        </div>

        <div className="flex-1 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                id={`sidebar-${tab.id}`}
                className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl font-medium transition-all text-sm cursor-pointer focus:outline-none ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>

                {/* Badge for Home in sidebar */}
                {tab.id === 'home' && unresolvedRemindersCount > 0 && (
                  <span className="ml-auto bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unresolvedRemindersCount} aviso
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => onNavigate('permissions')}
            id="sidebar-permissions"
            className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl font-medium transition-all text-sm cursor-pointer focus:outline-none ${
              currentScreen === 'permissions'
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Shield className={`w-5 h-5 ${currentScreen === 'permissions' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Permissões</span>
          </button>

          <button
            onClick={() => onNavigate('twilio')}
            id="sidebar-twilio"
            className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl font-medium transition-all text-sm cursor-pointer focus:outline-none ${
              currentScreen === 'twilio'
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Phone className={`w-5 h-5 ${currentScreen === 'twilio' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Central de Alertas</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-[10px] font-mono text-slate-400">imSafe Web Simulator v1.0</p>
        </div>
      </aside>
    </>
  );
}
