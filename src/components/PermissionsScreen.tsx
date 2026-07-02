/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Smartphone, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Bell, 
  Wifi, 
  Battery, 
  Play, 
  RefreshCw,
  Copy,
  Check,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PermissionItem {
  id: string;
  name: string;
  category: 'web' | 'android';
  description: string;
  policyExplanations: string;
  officialAlternative: string;
  status: 'granted' | 'denied' | 'prompt' | 'restricted';
  nativeCodeSnippet?: string;
  icon: any;
}

export default function PermissionsScreen() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'android'>('all');
  const [selectedPermission, setSelectedPermission] = useState<PermissionItem | null>(null);
  
  // States of permissions we manage/detect
  const [geoStatus, setGeoStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [notifStatus, setNotifStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Simulated Android permissions stored in localStorage
  const [simulatedPerms, setSimulatedPerms] = useState<{
    phoneCall: 'restricted' | 'granted' | 'denied';
    openDialer: 'granted' | 'denied';
    sendEmail: 'restricted' | 'granted' | 'denied';
    backgroundLocation: 'prompt' | 'granted' | 'denied';
    backgroundTasks: 'granted' | 'denied';
    autoStart: 'granted' | 'denied';
    batteryOptimization: 'granted' | 'denied';
  }>(() => {
    const data = localStorage.getItem('imsafe_simulated_perms');
    if (data) {
      return JSON.parse(data);
    }
    return {
      phoneCall: 'restricted',
      openDialer: 'granted',
      sendEmail: 'restricted',
      backgroundLocation: 'prompt',
      backgroundTasks: 'granted',
      autoStart: 'granted',
      batteryOptimization: 'granted'
    };
  });

  useEffect(() => {
    localStorage.setItem('imsafe_simulated_perms', JSON.stringify(simulatedPerms));
  }, [simulatedPerms]);

  // Real-time permission detectors
  const checkRealPermissions = async () => {
    // 1. Geolocation
    if (navigator.geolocation) {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const geoRes = await navigator.permissions.query({ name: 'geolocation' as any });
          setGeoStatus(geoRes.state as any);
          geoRes.onchange = () => {
            setGeoStatus(geoRes.state as any);
          };
        } catch (e) {
          // Fallback if browser doesn't support query for geolocation
          navigator.geolocation.getCurrentPosition(
            () => setGeoStatus('granted'),
            () => setGeoStatus('denied'),
            { timeout: 1000 }
          );
        }
      }
    }

    // 2. Notifications
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        setNotifStatus('prompt');
      } else {
        setNotifStatus(Notification.permission as any);
      }
    }

    // 3. Internet
    setIsOnline(navigator.onLine);
  };

  useEffect(() => {
    checkRealPermissions();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const requestGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setGeoStatus('granted');
          alert('Permissão de Localização concedida com sucesso!');
        },
        () => {
          setGeoStatus('denied');
          alert('Acesso à localização negado. Ative nas configurações do seu navegador ou celular.');
        }
      );
    }
  };

  const requestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setNotifStatus(permission as any);
        if (permission === 'granted') {
          alert('Notificações ativadas! O imSafe enviará alertas flutuantes.');
        } else {
          alert('Acesso negado às Notificações.');
        }
      });
    } else {
      alert('Seu navegador não suporta a API de Notificações.');
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Define All Permissions with Explanations, Policies & Native Code Alternatives
  const permissionsData: PermissionItem[] = [
    {
      id: 'internet',
      name: 'Acesso à Internet',
      category: 'web',
      description: 'Permite sincronizar os dados de check-in com o Firebase em tempo real e enviar alertas.',
      policyExplanations: 'Nenhuma restrição de segurança no Android ou iOS para acesso normal à Internet.',
      officialAlternative: 'Declarado de forma simples no manifesto do aplicativo.',
      status: isOnline ? 'granted' : 'denied',
      icon: Wifi,
      nativeCodeSnippet: `<uses-permission android:name="android.permission.INTERNET" />`
    },
    {
      id: 'geolocation',
      name: 'Localização Precisa (GPS)',
      category: 'web',
      description: 'Obtém as coordenadas GPS exatas no momento do check-in ou do acionamento de emergência.',
      policyExplanations: 'Tanto navegadores web quanto o Android exigem o consentimento do usuário em tempo de execução para acessar o GPS de alta precisão (ACCESS_FINE_LOCATION).',
      officialAlternative: 'Sempre utilize o localizador oficial integrado do sistema de forma transparente.',
      status: geoStatus,
      icon: MapPin,
      nativeCodeSnippet: `<!-- No AndroidManifest.xml -->\n<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n\n// No Kotlin/Java em tempo de execução:\nActivityCompat.requestPermissions(this, arrayOf(\n    Manifest.permission.ACCESS_FINE_LOCATION\n), LOCATION_PERMISSION_REQUEST_CODE)`
    },
    {
      id: 'backgroundLocation',
      name: 'Localização em Segundo Plano',
      category: 'android',
      description: 'Permite rastrear o usuário mesmo quando o celular está com a tela desligada ou o app fechado.',
      policyExplanations: '⚠️ RESTRIÇÃO SEVERA DA GOOGLE PLAY: O Google Play restringe severamente a permissão ACCESS_BACKGROUND_LOCATION. Se o seu app a solicitar sem justificativa plausível de "recurso principal essencial", ele será BANIDO da loja.',
      officialAlternative: 'A alternativa oficial do Android para segurança confiável é iniciar um Serviço em Primeiro Plano (Foreground Service) com uma notificação persistente visível. Isso garante alta prioridade para o GPS sem acionar os bloqueios de segurança de segundo plano.',
      status: simulatedPerms.backgroundLocation,
      icon: MapPin,
      nativeCodeSnippet: `<!-- Manifest para Serviço com tipo de Localização -->\n<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />\n<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />\n<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />\n\n// Serviço em primeiro plano garante atualização constante:\nstartForeground(NOTIFICATION_ID, notification, FOREGROUND_SERVICE_TYPE_LOCATION)`
    },
    {
      id: 'notifications',
      name: 'Envio de Notificações Push',
      category: 'web',
      description: 'Envia lembretes imediatos perguntando "Você está bem?" e avisando antes do disparo de alarmes.',
      policyExplanations: 'A partir do Android 13 (API 33), a permissão POST_NOTIFICATIONS é considerada perigosa e deve ser solicitada de forma explícita em tempo de execução.',
      officialAlternative: 'O imSafe utiliza Firebase Cloud Messaging (FCM) integrado para notificações altamente duráveis em stand-by.',
      status: notifStatus,
      icon: Bell,
      nativeCodeSnippet: `<!-- Manifest para Android 13+ -->\n<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n\n// Verificação em tempo de execução:\nif (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {\n    ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), NOTIF_CODE)\n}`
    },
    {
      id: 'phoneCall',
      name: 'Realizar Ligações Telefônicas',
      category: 'android',
      description: 'Capacidade de efetuar uma chamada telefônica instantânea direta com um clique.',
      policyExplanations: '🚫 RESTRIÇÃO TOTAL DA GOOGLE PLAY: A permissão CALL_PHONE (chamada silenciosa ou direta sem interação) é estritamente proibida para aplicativos gerais. O Google Play remove aplicativos que a declaram sem serem o discador oficial padrão do aparelho.',
      officialAlternative: 'A alternativa oficial recomendada é usar o Intent ACTION_DIAL com URI "tel:190". Isso abre o aplicativo de discagem nativo do aparelho com o número preenchido de forma limpa e segura, onde o usuário só precisa dar um toque para chamar. Isso é 100% livre de restrições e seguro!',
      status: 'restricted',
      icon: PhoneCall,
      nativeCodeSnippet: `// ❌ EVITE (Causa banimento da Play Store):\n// val callIntent = Intent(Intent.ACTION_CALL, Uri.parse("tel:190"))\n\n// ✅ RECOMENDADO (Alternativa oficial e segura):\nval dialIntent = Intent(Intent.ACTION_DIAL).apply {\n    data = Uri.parse("tel:190")\n}\nstartActivity(dialIntent)`
    },
    {
      id: 'openDialer',
      name: 'Abrir Discador Natico',
      category: 'web',
      description: 'Capacidade do aplicativo de abrir a tela de discagem do seu dispositivo com o número de emergência inserido.',
      policyExplanations: 'Não há restrições. É a forma recomendada e suportada tanto na Web (via tel:) quanto no Android Native.',
      officialAlternative: 'Já implementado nativamente na tela "Números de Emergência" do imSafe.',
      status: 'granted',
      icon: Smartphone,
      nativeCodeSnippet: `<!-- HTML/Web PWA standard call -->\n<a href="tel:190" className="btn">Ligar para Polícia</a>\n\n// No React Native / Capacitor:\nLinking.openURL('tel:192')`
    },
    {
      id: 'sendEmail',
      name: 'Enviar E-mails de Alerta',
      category: 'android',
      description: 'Disparar e-mails automáticos contendo nome e localização atual para contatos cadastrados.',
      policyExplanations: '🚫 RESTRIÇÃO DE SEGURANÇA: Enviar e-mails diretamente a partir do cliente em segundo plano é bloqueado por questões de segurança (prevenção de spam).',
      officialAlternative: 'A alternativa oficial e recomendada pelo Android e Firebase é disparar a ação de envio a partir de um servidor seguro ou serviço de backend, como o Firebase Cloud Functions integrado com um provedor de e-mail confiável (SendGrid/Nodemailer). Isso mantém a credencial do e-mail protegida e evita falhas no aparelho.',
      status: 'restricted',
      icon: Mail,
      nativeCodeSnippet: `// No Firebase Cloud Functions (Node.js/TS Backend):\nexport const sendEmergencyEmail = functions.firestore\n  .document('logs/{logId}')\n  .onCreate(async (snap, context) => {\n    const data = snap.data();\n    await emailTransporter.sendMail({\n      from: 'alertas@imsafe.com.br',\n      to: data.contactEmail,\n      subject: '🚨 EMERGÊNCIA: imSafe Alerta',\n      text: \`O usuário \${data.userName} informou que está em perigo.\`\n    });\n  });`
    },
    {
      id: 'backgroundTasks',
      name: 'Executar em Segundo Plano',
      category: 'android',
      description: 'Permite que o aplicativo execute rotinas de verificação do temporizador mesmo fechado.',
      policyExplanations: 'Sistemas Android modernos aplicam limites agressivos a apps em background para economizar bateria e processamento.',
      officialAlternative: 'Utilizar a biblioteca WorkManager para agendamento periódico garantido ou criar um Foreground Service persistente para alta fidelidade.',
      status: simulatedPerms.backgroundTasks,
      icon: Play,
      nativeCodeSnippet: `// Android Kotlin utilizando WorkManager oficial:\nval checkInRequest = PeriodicWorkRequestBuilder<CheckInWorker>(\n    15, TimeUnit.MINUTES // Tempo mínimo permitido por lei\n).build()\n\nWorkManager.getInstance(context).enqueueUniquePeriodicWork(\n    "CheckInWorker",\n    ExistingPeriodicWorkPolicy.KEEP,\n    checkInRequest\n)`
    },
    {
      id: 'autoStart',
      name: 'Iniciar no Boot (Autostart)',
      category: 'android',
      description: 'Garante que os alarmes do imSafe voltem a funcionar automaticamente se o celular for reiniciado.',
      policyExplanations: 'Requer declaração especial do receptor BOOT_COMPLETED no manifesto e consentimento em alguns aparelhos específicos (como Xiaomi/Oppo).',
      officialAlternative: 'Registrar um BroadcastReceiver que escuta a ação ACTION_BOOT_COMPLETED para reagendar os alarmes do WorkManager.',
      status: simulatedPerms.autoStart,
      icon: RefreshCw,
      nativeCodeSnippet: `<!-- Manifest para capturar reinicialização -->\n<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />\n\n<receiver android:name=".BootReceiver" android:enabled="true" android:exported="true">\n    <intent-filter>\n        <action android:name="android.intent.action.BOOT_COMPLETED" />\n    </intent-filter>\n</receiver>`
    },
    {
      id: 'batteryOptimization',
      name: 'Ignorar Otimizações de Bateria',
      category: 'android',
      description: 'Evita que o sistema Android "coloque para dormir" ou suspenda o imSafe por falta de uso temporário.',
      policyExplanations: '⚠️ RESTRIÇÃO DE ENERGIA: Solicitar diretamente ignorar otimizações é restrito e deve ser justificado à Google Play se o aplicativo não pertencer à categoria de rastreamento/alarme crítico.',
      officialAlternative: 'Recomenda-se redirecionar o usuário para as configurações do sistema para que ele mesmo marque o aplicativo como "Não Otimizado" manualmente.',
      status: simulatedPerms.batteryOptimization,
      icon: Battery,
      nativeCodeSnippet: `// Solicitar a isenção de otimização de bateria de forma explícita:\nval intent = Intent().apply {\n    action = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS\n    data = Uri.parse("package:\${packageName}")\n}\nstartActivity(intent)`
    }
  ];

  const filteredPermissions = permissionsData.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const getStatusIcon = (status: PermissionItem['status']) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case 'prompt':
        return <Info className="w-5 h-5 text-blue-500 shrink-0 animate-pulse" />;
      case 'restricted':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-slate-400 shrink-0" />;
    }
  };

  const getStatusBadge = (status: PermissionItem['status']) => {
    switch (status) {
      case 'granted':
        return (
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-150">
            Concedida
          </span>
        );
      case 'denied':
        return (
          <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-150 animate-pulse">
            Negada / Ativar
          </span>
        );
      case 'prompt':
        return (
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-150">
            Solicitar
          </span>
        );
      case 'restricted':
        return (
          <span className="text-[10px] font-bold bg-amber-50 text-amber-850 px-2.5 py-1 rounded-full border border-amber-150">
            Segurança Android (Alternativa Oficial)
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full border border-slate-100">
            Pendente
          </span>
        );
    }
  };

  const handleActionClick = (item: PermissionItem) => {
    if (item.id === 'geolocation' && item.status !== 'granted') {
      requestGeolocation();
    } else if (item.id === 'notifications' && item.status !== 'granted') {
      requestNotifications();
    } else {
      setSelectedPermission(item);
    }
  };

  return (
    <div className="px-4 pb-24 md:pb-8 max-w-xl mx-auto space-y-6 pt-4" id="permissions-screen">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-blue-600" />
          Central de Permissões Android & Google
        </h1>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
          O imSafe foi desenvolvido respeitando rigorosamente as diretrizes de segurança da Google Play Store. Gerencie as autorizações e conheça as alternativas oficiais adotadas pelo app.
        </p>
      </div>

      {/* Info Warning Alert */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm">
        <Info className="w-5.5 h-5.5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-blue-900">Transparência e Segurança no Android</h4>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Muitas permissões invasivas (como chamadas automáticas silenciosas) são restritas pelo sistema operacional Android para evitar fraudes ou spam. O imSafe utiliza as **vias oficiais de segurança recomendadas pela Google**, garantindo 100% de funcionamento sem expor seu dispositivo a riscos.
          </p>
        </div>
      </div>

      {/* Tab Filter Switches */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Todas ({permissionsData.length})
        </button>
        <button
          onClick={() => setActiveTab('web')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'web' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Navegador Web/PWA
        </button>
        <button
          onClick={() => setActiveTab('android')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'android' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Android Nativo / Google Play
        </button>
      </div>

      {/* Permissions List */}
      <div className="space-y-3">
        {filteredPermissions.map((item) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.id}
              layout
              className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4"
            >
              <div className="flex gap-3.5">
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 h-fit mt-0.5">
                  <IconComponent className="w-5 h-5 text-slate-600" />
                </div>
                <div className="space-y-1.5 max-w-[280px] sm:max-w-[320px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-slate-800">{item.name}</h3>
                    {item.category === 'android' ? (
                      <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md border border-purple-100">
                        Nativo Android
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-md border border-sky-100">
                        Navegador
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{item.description}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2.5 shrink-0 justify-between h-full">
                {getStatusBadge(item.status)}
                
                <button
                  onClick={() => handleActionClick(item)}
                  id={`btn-perm-action-${item.id}`}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-xl cursor-pointer transition-colors"
                >
                  {item.status === 'granted' ? 'Detalhes' : (item.status === 'restricted' ? 'Alternativa' : 'Solicitar')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail & Policy Explanation Modal */}
      <AnimatePresence>
        {selectedPermission && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <selectedPermission.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedPermission.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Diretrizes de Segurança Android</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPermission(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Policy Explanation */}
              <div className="space-y-4">
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-1.5">
                  <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Regulação & Políticas do Android
                  </h5>
                  <p className="text-xs text-amber-850 leading-relaxed">
                    {selectedPermission.policyExplanations}
                  </p>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 space-y-1.5">
                  <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Solução imSafe Oficial (Sem Código Fictício)
                  </h5>
                  <p className="text-xs text-emerald-850 leading-relaxed">
                    {selectedPermission.officialAlternative}
                  </p>
                </div>

                {/* Native Android XML/Code block */}
                {selectedPermission.nativeCodeSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        Estrutura Nativa do Android
                      </span>
                      <button
                        onClick={() => handleCopy(selectedPermission.nativeCodeSnippet!, selectedPermission.id)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer focus:outline-none"
                      >
                        {copiedId === selectedPermission.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copiar Código
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-slate-200 text-[10px] font-mono p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 shadow-inner max-h-48">
                      {selectedPermission.nativeCodeSnippet}
                    </pre>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <button
                  onClick={() => setSelectedPermission(null)}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Entendi e Aceito a Alternativa Oficial
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Production Packaging Guideline Card */}
      <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 space-y-4 shadow-xl border border-slate-850">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-400" />
          Vai publicar como Aplicativo Nativo?
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Para empacotar o imSafe utilizando **CapacitorJS** ou **Cordova** e convertê-lo em um arquivo `.apk` ou `.aab` para a Google Play Store, todos os manifestos e permissões já estão prontos. Nossos scripts de inicialização de permissão respeitam rigorosamente o modelo do Android Marshmallow (API 23) em diante.
        </p>
        <div className="text-[10px] bg-slate-850 p-4 rounded-2xl font-mono text-slate-300 leading-relaxed border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-blue-400">// Configuração recomendada do Gradle:</p>
            <p className="text-slate-400">targetSdkVersion = 34 // Android 14 (Upside Down Cake)</p>
            <p className="text-slate-400">minSdkVersion = 24 // Android 7.0 (Nougat)</p>
          </div>
          <ExternalLink className="w-5 h-5 text-slate-500 shrink-0" />
        </div>
      </div>
    </div>
  );
}
