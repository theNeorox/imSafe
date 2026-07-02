/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Shield, HelpCircle, UserCheck, Phone, Check, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, EmergencyContact, CheckInLog, ScreenType, EmergencyNumbers } from './types';
import { 
  getStoredUser, 
  saveStoredUser, 
  getStoredContacts, 
  saveStoredContacts, 
  getStoredHistory, 
  saveStoredHistory,
  getStoredNumbers,
  saveStoredNumbers,
  getStoredTwilioConfig,
  saveStoredTwilioConfig,
  getStoredEmailConfig,
  saveStoredEmailConfig,
  clearAllStorage 
} from './lib/storage';

// Screens
import LoginScreen from './components/LoginScreen';
import CadastroScreen from './components/CadastroScreen';
import HomeScreen from './components/HomeScreen';
import TimerConfigScreen from './components/TimerConfigScreen';
import EmergencyContactsScreen from './components/EmergencyContactsScreen';
import CheckInHistoryScreen from './components/CheckInHistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import EmergencyNumbersScreen from './components/EmergencyNumbersScreen';
import PermissionsScreen from './components/PermissionsScreen';
import TwilioScreen from './components/TwilioScreen';
import Navigation from './components/Navigation';

// Core Simulated Components
import SimulationPanel from './components/SimulationPanel';
import NotificationToast from './components/NotificationToast';

export default function App() {
  // Navigation & Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isRegistering, setIsRegistering] = useState(false);

  // Core Data Lists
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [history, setHistory] = useState<CheckInLog[]>([]);

  // Safety Timer and Progression states
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [remindersSent, setRemindersSent] = useState<number>(0);
  const [alertStatus, setAlertStatus] = useState<'normal' | 'warning' | 'alerted'>('normal');
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Active Simulated push notifications
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    body: string;
    type: 'checkin' | 'reminder' | 'alert';
  } | null>(null);

  // Ref to store current timer intervals
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalRef = useRef<number>(6); // Default 6h

  // Emergency Numbers
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyNumbers>({
    police: '190',
    samu: '192',
    firefighters: '193'
  });

  // Emergency trigger / countdown state
  const [notWellCountdown, setNotWellCountdown] = useState<number>(0);
  const [dangerProtocolActive, setDangerProtocolActive] = useState<boolean>(false);
  const notWellTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Data Loading
  useEffect(() => {
    const user = getStoredUser();
    const storedContacts = getStoredContacts();
    const storedHistory = getStoredHistory();

    if (user) {
      setCurrentUser(user);
      currentIntervalRef.current = user.checkInInterval;
      
      // Calculate remaining time until next checkin
      const nextCheckInTime = new Date(user.nextCheckIn).getTime();
      const diffSeconds = Math.max(0, Math.floor((nextCheckInTime - Date.now()) / 1000));
      
      setTimeLeft(diffSeconds > 0 ? diffSeconds : user.checkInInterval * 3600);
      setIsTimerRunning(true);
    }
    
    setContacts(storedContacts);
    setHistory(storedHistory);
    
    const storedNumbers = getStoredNumbers();
    setEmergencyNumbers(storedNumbers);
  }, []);

  // 2. Active timer effect
  useEffect(() => {
    if (isTimerRunning && currentUser) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished! Trigger Safety Alarm sequence
            clearInterval(timerRef.current!);
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, currentUser, remindersSent, alertStatus]);

  // 2b. "Não estou bem" countdown timer effect
  useEffect(() => {
    if (notWellCountdown > 0) {
      notWellTimerRef.current = setTimeout(() => {
        setNotWellCountdown((prev) => {
          if (prev <= 1) {
            triggerNotWellEmergency();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (notWellTimerRef.current) clearTimeout(notWellTimerRef.current);
    }

    return () => {
      if (notWellTimerRef.current) clearTimeout(notWellTimerRef.current);
    };
  }, [notWellCountdown]);

  // 3. User & Storage Syncer
  const updateCurrentUser = (updatedUser: User | null) => {
    setCurrentUser(updatedUser);
    saveStoredUser(updatedUser);
    if (updatedUser) {
      currentIntervalRef.current = updatedUser.checkInInterval;
    }
  };

  // 4. Safety Notification trigger logic (Cloud Messaging simulation)
  const handleTimerEnd = () => {
    // If we were normal, first timer end starts warning
    if (alertStatus === 'normal') {
      const nextReminderCount = 1;
      setRemindersSent(nextReminderCount);
      setAlertStatus('warning');
      
      // Push notification
      setNotification({
        visible: true,
        title: 'Verificação de Segurança',
        body: 'Você está bem? Por favor, confirme o check-in no aplicativo imSafe.',
        type: 'checkin'
      });

      // Log missed checkin
      addHistoryLog('missed', 'Check-in programado expirou. Primeiro aviso enviado por Cloud Messaging.');

      // Setup short timer for next reminder (10s for simulation, 1800s/30m for real)
      // Since it's warning state, let's set timer to 15 seconds to let the user see progression
      setTimeLeft(15);
      setIsTimerRunning(true);
    } else if (alertStatus === 'warning') {
      const nextReminderCount = remindersSent + 1;
      
      if (nextReminderCount <= 3) {
        setRemindersSent(nextReminderCount);
        
        setNotification({
          visible: true,
          title: `Lembrete de Segurança (${nextReminderCount}/3)`,
          body: nextReminderCount === 3 
            ? 'ALERTA CRÍTICO: Confirme imediatamente ou seus contatos de emergência serão alertados!'
            : 'Sua confirmação de segurança está pendente. Por favor, toque em "Estou Bem".',
          type: nextReminderCount === 3 ? 'alert' : 'reminder'
        });

        addHistoryLog('missed', `Lembrete ${nextReminderCount}/3 enviado. Nenhuma resposta do usuário.`);
        setTimeLeft(15);
        setIsTimerRunning(true);
      } else {
        // Exceeded 3 reminders! Fire Emergency alert!
        triggerEmergencyAlert();
      }
    }
  };

  // Twilio and Email automatic API alert dispatcher
  const dispatchTwilioAlert = async (
    type: 'not_well' | 'danger' | 'missed',
    lat: number,
    lng: number
  ): Promise<string> => {
    const twilioConfig = getStoredTwilioConfig();
    const emailConfig = getStoredEmailConfig();
    
    const hasTwilio = twilioConfig.accountSid && twilioConfig.authToken && twilioConfig.fromNumber;
    const hasEmail = emailConfig.smtpHost && emailConfig.smtpUser && emailConfig.smtpPass;

    if (!hasTwilio && !hasEmail) {
      return '⚠️ [Alertas: Twilio e E-mail não configurados. Configure-os na Central de Alertas para automação de segurança real]';
    }

    try {
      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          userName: currentUser?.name || 'Ana Silva',
          contacts,
          location: { latitude: lat, longitude: lng },
          twilioConfig,
          emailConfig
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        return `❌ [Erro Alertas: ${errData.error || response.statusText}]`;
      }

      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        const summary = data.results.map((r: any) => {
          const statusIcon = r.status === 'success' ? '✅' : '❌';
          const attemptText = r.attempts > 1 ? ` (${r.attempts}t)` : '';
          let channelLabel = '';
          if (r.actionType === 'SMS') channelLabel = 'SMS';
          else if (r.actionType === 'Call') channelLabel = 'Lig.';
          else if (r.actionType === 'Email') channelLabel = 'E-mail';
          return `${statusIcon} ${r.contactName} (${channelLabel}): ${r.status === 'success' ? 'Sucesso' : 'Falha'}${attemptText}`;
        }).join(', ');
        return `📲 [Canais Ativos: ${summary}]`;
      }

      return '✅ [Alertas: Enviados com sucesso para os canais configurados]';
    } catch (err: any) {
      return `❌ [Falha na requisição de disparos: ${err.message || String(err)}]`;
    }
  };

  // 5. Fire Emergency Alert (Cloud Functions simulation)
  const triggerEmergencyAlert = () => {
    setIsTimerRunning(false);
    setAlertStatus('alerted');
    setRemindersSent(3);

    // Get position to simulate or grab real Geolocation coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await sendAlertWithCoords(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
        },
        async () => {
          // Fallback location (São Paulo, BR)
          await sendAlertWithCoords(-23.55052, -46.633308);
        }
      );
    } else {
      sendAlertWithCoords(-23.55052, -46.633308);
    }
  };

  const sendAlertWithCoords = async (lat: number, lng: number, accuracy?: number) => {
    // Generate notification
    setNotification({
      visible: true,
      title: '⚠️ ALERTA ENVIADO',
      body: 'Seus contatos de emergência foram notificados por SMS e e-mail com sua última localização conhecida.',
      type: 'alert'
    });

    const contactsCount = contacts.length;
    const names = contacts.map(c => c.name).join(', ') || 'Nenhum contato cadastrado';

    // Dispatch Twilio automatic SMS
    const twilioReport = await dispatchTwilioAlert('missed', lat, lng);

    addHistoryLog(
      'alert_sent',
      `ALERTA ENVIADO AUTOMATICAMENTE: Usuário não respondeu aos 3 check-ins. ${contactsCount} contatos acionados (${names}). ${twilioReport}`,
      lat,
      lng,
      accuracy
    );
  };

  // 5b. "Não estou bem" & "Estou em perigo" Protocol Engines
  const triggerNotWellEmergency = () => {
    setNotWellCountdown(0);
    
    const sendMedicalAlert = async (lat: number, lng: number, accuracy?: number) => {
      const formattedDate = new Date().toLocaleDateString('pt-BR');
      const formattedTime = new Date().toLocaleTimeString('pt-BR');
      const locationText = lat && lng ? `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}` : 'Indisponível';
      const userStr = currentUser?.name || 'O usuário';
      
      setNotification({
        visible: true,
        title: '🚑 ALERTA MÉDICO ENVIADO',
        body: 'Alerta de emergência médica enviado para todos os contatos cadastrados.',
        type: 'alert'
      });

      const contactsNames = contacts.map(c => c.name).join(', ') || 'Nenhum contato';

      // Dispatch Twilio SMS for medical / not well
      const twilioReport = await dispatchTwilioAlert('not_well', lat, lng);

      addHistoryLog(
        'not_well',
        `ALERTA MÉDICO ENVIADO: "${userStr} informou que não está bem e pode precisar de ajuda. Data: ${formattedDate}, Hora: ${formattedTime}, Localização: ${locationText}" para contatos (${contactsNames}). ${twilioReport}`,
        lat,
        lng,
        accuracy
      );
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendMedicalAlert(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
        },
        () => {
          sendMedicalAlert(-23.55052, -46.633308);
        }
      );
    } else {
      sendMedicalAlert(-23.55052, -46.633308);
    }
  };

  const handleCancelNotWell = () => {
    if (notWellTimerRef.current) clearTimeout(notWellTimerRef.current);
    setNotWellCountdown(0);

    const logCancellation = (lat?: number, lng?: number, accuracy?: number) => {
      addHistoryLog(
        'cancelled',
        'Protocolo "Não estou bem" cancelado pelo usuário dentro dos 30 segundos.',
        lat,
        lng,
        accuracy
      );

      setNotification({
        visible: true,
        title: '✅ ALERTA CANCELADO',
        body: 'O envio de alertas de emergência médica foi cancelado.',
        type: 'checkin'
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          logCancellation(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
        },
        () => {
          logCancellation();
        }
      );
    } else {
      logCancellation();
    }
  };

  const handleTriggerDanger = () => {
    setDangerProtocolActive(true);

    const sendDangerAlert = async (lat: number, lng: number, accuracy?: number) => {
      const formattedDate = new Date().toLocaleDateString('pt-BR');
      const formattedTime = new Date().toLocaleTimeString('pt-BR');
      const locationText = lat && lng ? `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}` : 'Indisponível';
      const userStr = currentUser?.name || 'O usuário';

      setNotification({
        visible: true,
        title: '🚨 PERIGO: ALERTA DISPARADO',
        body: 'Mensagem de perigo urgente enviada para todos os contatos com sua localização.',
        type: 'alert'
      });

      const contactsNames = contacts.map(c => c.name).join(', ') || 'Nenhum contato';

      // Dispatch Twilio SMS & Voice Call for danger
      const twilioReport = await dispatchTwilioAlert('danger', lat, lng);

      addHistoryLog(
        'danger',
        `ALERTA DE PERIGO ENVIADO: "EMERGÊNCIA: O usuário ${userStr} informou que está em perigo. Verifique imediatamente sua localização. Data: ${formattedDate}, Hora: ${formattedTime}, Localização: ${locationText}" para contatos (${contactsNames}). ${twilioReport}`,
        lat,
        lng,
        accuracy
      );
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendDangerAlert(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
        },
        () => {
          sendDangerAlert(-23.55052, -46.633308);
        }
      );
    } else {
      sendDangerAlert(-23.55052, -46.633308);
    }
  };

  // Helper to add history log
  const addHistoryLog = (
    status: CheckInLog['status'], 
    notes: string, 
    latitude?: number, 
    longitude?: number,
    accuracy?: number
  ) => {
    const lat = latitude ?? -23.55052;
    const lng = longitude ?? -46.633308;
    
    // Reverse geocode mockup for realistic testing
    let address = 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP';
    if (latitude && longitude) {
      // Offset details if real coordinates are found
      address = `Coordenadas capturadas via GPS (Precisão: ${accuracy ? Math.round(accuracy) + 'm' : 'alta'})`;
    }

    const newLog: CheckInLog = {
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status,
      notes,
      location: {
        latitude: lat,
        longitude: lng,
        accuracy,
        address
      }
    };

    const updatedHistory = [newLog, ...history];
    setHistory(updatedHistory);
    saveStoredHistory(updatedHistory);
  };

  // 6. User Check-In Action ("Estou Vivo")
  const handleCheckIn = (customNotes?: string) => {
    if (!currentUser) return;

    // Reset safety metrics
    setAlertStatus('normal');
    setRemindersSent(0);
    setNotification(null);

    // Calculate next checkin time
    const nextTime = new Date(Date.now() + currentUser.checkInInterval * 3600 * 1000);
    const updatedUser = {
      ...currentUser,
      lastCheckIn: new Date().toISOString(),
      nextCheckIn: nextTime.toISOString()
    };

    updateCurrentUser(updatedUser);
    setTimeLeft(currentUser.checkInInterval * 3600);
    setIsTimerRunning(true);

    // Grab location to attach to positive log
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          addHistoryLog(
            'alive', 
            customNotes || 'Check-in regular - Respondeu "Estou bem"',
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          );
        },
        () => {
          addHistoryLog('alive', customNotes || 'Check-in regular - Respondeu "Estou bem"');
        }
      );
    } else {
      addHistoryLog('alive', customNotes || 'Check-in regular - Respondeu "Estou bem"');
    }
  };

  // 7. Interactive Simulation Panel Actions
  const handleSimFastTimer = () => {
    // Set countdown to 10 seconds for rapid demonstration!
    setTimeLeft(10);
    setIsTimerRunning(true);
  };

  const handleFastForward = (minutes: number) => {
    setTimeLeft((prev) => Math.max(0, prev - minutes * 60));
  };

  const handleSimulateMissedCheckIn = () => {
    // Speed countdown straight to zero to trigger the next missed event instantly
    setTimeLeft(0);
    handleTimerEnd();
  };

  const handleSimulateEmergencyAlert = () => {
    triggerEmergencyAlert();
  };

  const handleResetSimulation = () => {
    clearAllStorage();
    const defaultUser = getStoredUser();
    const defaultContacts = getStoredContacts();
    const defaultHistory = getStoredHistory();
    const defaultNumbers = getStoredNumbers();
    
    setCurrentUser(defaultUser);
    setContacts(defaultContacts);
    setHistory(defaultHistory);
    setEmergencyNumbers(defaultNumbers);
    setNotWellCountdown(0);
    setDangerProtocolActive(false);
    
    setAlertStatus('normal');
    setRemindersSent(0);
    setNotification(null);
    
    if (defaultUser) {
      setTimeLeft(defaultUser.checkInInterval * 3600);
      setIsTimerRunning(true);
    }
    
    setCurrentScreen('home');
    alert('Simulação reiniciada com as configurações padrões de fábrica.');
  };

  // 8. DB Operations
  const handleAddContact = (newContact: Omit<EmergencyContact, 'id'>) => {
    const contact: EmergencyContact = {
      ...newContact,
      id: `c_${Math.random().toString(36).substr(2, 9)}`
    };
    const updated = [...contacts, contact];
    setContacts(updated);
    saveStoredContacts(updated);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    saveStoredContacts(updated);
  };

  const handleUpdateInterval = (interval: number) => {
    if (!currentUser) return;
    
    const nextTime = new Date(Date.now() + interval * 3600 * 1000);
    const updatedUser = {
      ...currentUser,
      checkInInterval: interval,
      nextCheckIn: nextTime.toISOString()
    };
    
    updateCurrentUser(updatedUser);
    setTimeLeft(interval * 3600);
    setIsTimerRunning(true);
  };

  const handleLogout = () => {
    updateCurrentUser(null);
    setIsRegistering(false);
  };

  // 9. Conditional Layout Resolver
  const renderActiveScreen = () => {
    if (!currentUser) {
      if (isRegistering) {
        return (
          <CadastroScreen
            onRegisterSuccess={(user) => {
              updateCurrentUser(user);
              setIsRegistering(false);
              setCurrentScreen('home');
            }}
            onNavigateToLogin={() => setIsRegistering(false)}
          />
        );
      }
      return (
        <LoginScreen
          onLoginSuccess={(user) => {
            updateCurrentUser(user);
            setCurrentScreen('home');
          }}
          onNavigateToRegister={() => setIsRegistering(true)}
        />
      );
    }

    switch (currentScreen) {
      case 'permissions':
        return (
          <PermissionsScreen />
        );
      case 'twilio':
        return (
          <TwilioScreen />
        );
      case 'numbers':
        return (
          <EmergencyNumbersScreen
            numbers={emergencyNumbers}
          />
        );
      case 'contacts':
        return (
          <EmergencyContactsScreen
            contacts={contacts}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
          />
        );
      case 'timer':
        return (
          <TimerConfigScreen
            user={currentUser}
            onUpdateInterval={handleUpdateInterval}
          />
        );
      case 'history':
        return (
          <CheckInHistoryScreen
            history={history}
            onClearHistory={() => {
              setHistory([]);
              saveStoredHistory([]);
            }}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            user={currentUser}
            onUpdateUser={(updated) => {
              updateCurrentUser(updated);
              alert('Perfil atualizado!');
            }}
            onLogout={handleLogout}
            numbers={emergencyNumbers}
            onUpdateNumbers={(updatedNumbers) => {
              setEmergencyNumbers(updatedNumbers);
              saveStoredNumbers(updatedNumbers);
            }}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        );
      default:
        return (
          <HomeScreen
            user={currentUser}
            contacts={contacts}
            history={history}
            timeLeft={timeLeft}
            remindersSent={remindersSent}
            alertStatus={alertStatus}
            onCheckIn={handleCheckIn}
            onNavigateToContacts={() => setCurrentScreen('contacts')}
            onNavigateToTimer={() => setCurrentScreen('timer')}
            onTriggerNotWell={() => setNotWellCountdown(30)}
            onTriggerDanger={handleTriggerDanger}
            notWellCountdown={notWellCountdown}
            onCancelNotWell={handleCancelNotWell}
            dangerProtocolActive={dangerProtocolActive}
            onResetDangerProtocol={() => setDangerProtocolActive(false)}
            onNavigateToPermissions={() => setCurrentScreen('permissions')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 relative select-none font-sans flex flex-col md:pl-64">
      {/* simulated Cloud Messaging alert */}
      <NotificationToast
        visible={notification?.visible || false}
        title={notification?.title || ''}
        body={notification?.body || ''}
        type={notification?.type || 'checkin'}
        onAction={() => handleCheckIn('Respondeu através da notificação Push')}
        onClose={() => setNotification(null)}
      />

      {/* Main app viewport container */}
      <main className="flex-1 w-full max-w-5xl mx-auto py-4 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentUser ? currentScreen : (isRegistering ? 'register' : 'login')}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation tabs & sidebars */}
      {currentUser && (
        <Navigation
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          unresolvedRemindersCount={alertStatus !== 'normal' ? 1 : 0}
        />
      )}

      {/* Developer testing & simulation cockpit */}
      {currentUser && (
        <SimulationPanel
          timeLeft={timeLeft}
          checkInInterval={currentUser.checkInInterval}
          remindersSent={remindersSent}
          alertStatus={alertStatus}
          onFastForward={handleFastForward}
          onSetFastTimer={handleSimFastTimer}
          onSimulateMissedCheckIn={handleSimulateMissedCheckIn}
          onSimulateEmergencyAlert={handleSimulateEmergencyAlert}
          onResetSimulation={handleResetSimulation}
          isTimerRunning={isTimerRunning}
          onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        />
      )}
    </div>
  );
}
