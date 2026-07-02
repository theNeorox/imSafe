/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Phone, 
  Key, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  HelpCircle, 
  Save, 
  Send,
  Eye,
  EyeOff,
  Mail,
  Server
} from 'lucide-react';
import { TwilioConfig, EmailConfig } from '../types';
import { 
  getStoredTwilioConfig, 
  saveStoredTwilioConfig, 
  getStoredEmailConfig, 
  saveStoredEmailConfig, 
  getStoredContacts 
} from '../lib/storage';

export default function TwilioScreen() {
  // Twilio SMS & Call Config
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>({
    accountSid: '',
    authToken: '',
    fromNumber: '',
  });

  // Email SMTP Config
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
  });

  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);
  
  const [isSavingTwilio, setIsSavingTwilio] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [testNumber, setTestNumber] = useState('');
  const [testEmail, setTestEmail] = useState('');
  
  const [isTestingTwilio, setIsTestingTwilio] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const [twilioTestResult, setTwilioTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const [emailTestResult, setEmailTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');

  useEffect(() => {
    // Load Twilio Config
    const storedTwilio = getStoredTwilioConfig();
    setTwilioConfig(storedTwilio);

    // Load Email Config
    const storedEmail = getStoredEmailConfig();
    setEmailConfig(storedEmail);

    // Prefill test destinations
    const contacts = getStoredContacts();
    if (contacts.length > 0) {
      setTestNumber(contacts[0].phone);
      setTestEmail(contacts[0].email);
    }
  }, []);

  const handleSaveTwilio = () => {
    setIsSavingTwilio(true);
    saveStoredTwilioConfig(twilioConfig);
    setTimeout(() => {
      setIsSavingTwilio(false);
      alert('Configuração do Twilio salva com sucesso!');
    }, 600);
  };

  const handleSaveEmail = () => {
    setIsSavingEmail(true);
    saveStoredEmailConfig(emailConfig);
    setTimeout(() => {
      setIsSavingEmail(false);
      alert('Configuração do Servidor de E-mail (SMTP) salva com sucesso!');
    }, 600);
  };

  const handleTestTwilio = async () => {
    if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.fromNumber) {
      setTwilioTestResult({
        success: false,
        message: 'Preencha todos os campos do Twilio antes de testar a conexão.'
      });
      return;
    }

    if (!testNumber) {
      setTwilioTestResult({
        success: false,
        message: 'Por favor, informe um número de destino para receber o SMS/Chamada de teste.'
      });
      return;
    }

    setIsTestingTwilio(true);
    setTwilioTestResult(null);

    try {
      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          userName: 'Teste do Sistema imSafe',
          contacts: [{ name: 'Destinatário de Teste', phone: testNumber, email: '', relationship: 'Test' }],
          location: { latitude: -23.55052, longitude: -46.633308 },
          twilioConfig: twilioConfig
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTwilioTestResult({
          success: true,
          message: 'SMS e chamada telefônica de teste disparados com sucesso! Verifique o aparelho do destinatário.',
          details: data.results
        });
      } else {
        setTwilioTestResult({
          success: false,
          message: data.error || 'Ocorreu um erro ao enviar o SMS de teste.',
          details: data.results || data.missingCredentials
        });
      }
    } catch (err: any) {
      setTwilioTestResult({
        success: false,
        message: `Falha na requisição: ${err.message || String(err)}`
      });
    } finally {
      setIsTestingTwilio(false);
    }
  };

  const handleTestEmail = async () => {
    if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPass || !emailConfig.fromEmail) {
      setEmailTestResult({
        success: false,
        message: 'Preencha todos os campos do servidor SMTP antes de testar a conexão.'
      });
      return;
    }

    if (!testEmail) {
      setEmailTestResult({
        success: false,
        message: 'Por favor, informe um endereço de e-mail de destino para o teste.'
      });
      return;
    }

    setIsTestingEmail(true);
    setEmailTestResult(null);

    try {
      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          userName: 'Teste de Alerta Automático imSafe',
          contacts: [{ name: 'Destinatário de Teste E-mail', phone: '', email: testEmail, relationship: 'Test' }],
          location: { latitude: -23.55052, longitude: -46.633308 },
          emailConfig: emailConfig
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailTestResult({
          success: true,
          message: 'E-mail de alerta disparado com sucesso! Verifique a caixa de entrada (e caixa de spam) do destinatário.',
          details: data.results
        });
      } else {
        setEmailTestResult({
          success: false,
          message: data.error || 'Ocorreu um erro ao disparar o e-mail de teste.',
          details: data.results || data.missingCredentials
        });
      }
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        message: `Falha na requisição: ${err.message || String(err)}`
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="px-4 pb-24 md:pb-8 max-w-xl mx-auto space-y-6 pt-4" id="twilio-screen">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Phone className="w-6 h-6 text-blue-600 animate-pulse" />
          Central de Alertas Automatizados
        </h1>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
          Configure as integrações oficiais de telefonia e e-mail para que o imSafe envie alertas 100% automáticos via SMS, chamadas telefônicas e e-mails reais em situações de perigo ou ausência de check-in.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('phone')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'phone' 
              ? 'bg-white text-slate-950 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4 text-blue-600" />
          SMS e Chamadas (Twilio)
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'email' 
              ? 'bg-white text-slate-950 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4 text-amber-600" />
          E-mail Automático (SMTP)
        </button>
      </div>

      {activeTab === 'phone' ? (
        <div className="space-y-6">
          {/* Info Notice Box */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 space-y-2 shadow-sm">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              Onde encontro estas informações?
            </h4>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Acesse o painel do seu console em <a href="https://www.twilio.com" target="_blank" rel="noreferrer" className="underline hover:text-blue-950 font-semibold">twilio.com</a>. Na tela inicial, você verá o seu **Account SID**, **Auth Token** e o seu **Twilio Phone Number** ativo.
            </p>
          </div>

          {/* Twilio Credentials Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-500" />
              Credenciais do Twilio
            </h3>

            <div className="space-y-4">
              {/* Account SID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">ACCOUNT SID</label>
                <input
                  type="text"
                  placeholder="Ex: ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={twilioConfig.accountSid}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })}
                  className="w-full text-xs font-mono py-3 px-4 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Auth Token */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">AUTH TOKEN</label>
                <div className="relative">
                  <input
                    type={showTwilioToken ? 'text' : 'password'}
                    placeholder="Insira seu Auth Token"
                    value={twilioConfig.authToken}
                    onChange={(e) => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                    className="w-full text-xs font-mono py-3 px-4 pr-10 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTwilioToken(!showTwilioToken)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showTwilioToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* From Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">NÚMERO TWILIO (E.164)</label>
                <input
                  type="text"
                  placeholder="Ex: +18501234567"
                  value={twilioConfig.fromNumber}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, fromNumber: e.target.value })}
                  className="w-full text-xs font-mono py-3 px-4 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-[9px] text-slate-400 leading-normal block">
                  Número de telefone Twilio ativo com capacidade para SMS e Voz no formato internacional (ex: +1...).
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveTwilio}
              disabled={isSavingTwilio}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSavingTwilio ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Credenciais Twilio</span>
                </>
              )}
            </button>
          </div>

          {/* Test Section Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-slate-500" />
              Testar SMS e Ligação Automática
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">TELEFONE DO DESTINATÁRIO (E.164)</label>
                <input
                  type="text"
                  placeholder="Ex: +5511999991111"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  className="w-full text-xs font-mono py-3 px-4 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-[9px] text-slate-400 block">
                  Telefone ativo incluindo +55 e o DDD para testar a entrega de mensagens e chamada de voz.
                </span>
              </div>

              <button
                onClick={handleTestTwilio}
                disabled={isTestingTwilio}
                className="w-full py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:bg-slate-150 disabled:text-slate-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTestingTwilio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Disparando SMS e Chamada Telefônica...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Teste Completo (SMS + Chamada)</span>
                  </>
                )}
              </button>

              {/* Status Feedback */}
              {twilioTestResult && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                  twilioTestResult.success 
                    ? 'bg-emerald-50 text-emerald-850 border-emerald-100' 
                    : 'bg-red-50 text-red-850 border-red-100'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {twilioTestResult.success ? <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> : <XCircle className="w-4.5 h-4.5 text-red-600" />}
                    <span>{twilioTestResult.success ? 'Twilio OK!' : 'Erro no Twilio'}</span>
                  </div>
                  <p className="text-[11px]">{twilioTestResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Info SMTP Notice Box */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 space-y-2 shadow-sm">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Como configurar o disparo de e-mail?
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              O imSafe utiliza protocolo **SMTP** padrão para disparar e-mails reais de forma invisível no servidor. Você pode configurar sua própria conta Gmail (criando uma *Senha de Aplicativo* nas configurações do Google), SendGrid, Outlook ou qualquer servidor de e-mail corporativo.
            </p>
          </div>

          {/* SMTP Credentials Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-500" />
              Configurações do Servidor de E-mail (SMTP)
            </h3>

            <div className="space-y-4">
              {/* Host SMTP */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">HOST SMTP</label>
                <input
                  type="text"
                  placeholder="Ex: smtp.gmail.com ou smtp.sendgrid.net"
                  value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                  className="w-full text-xs font-mono py-3 px-4 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Port SMTP */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">PORTA SMTP</label>
                <input
                  type="number"
                  placeholder="Ex: 587 (TLS) ou 465 (SSL)"
                  value={emailConfig.smtpPort || ''}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) || 587 })}
                  className="w-full text-xs font-mono py-3 px-4 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* User SMTP */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">USUÁRIO SMTP (E-MAIL)</label>
                <input
                  type="text"
                  placeholder="Ex: seugmail@gmail.com"
                  value={emailConfig.smtpUser}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                  className="w-full text-xs font-mono py-3 px-4 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Password SMTP */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">SENHA SMTP / SENHA DE APP</label>
                <div className="relative">
                  <input
                    type={showEmailPass ? 'text' : 'password'}
                    placeholder="Sua senha ou senha de aplicativo"
                    value={emailConfig.smtpPass}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                    className="w-full text-xs font-mono py-3 px-4 pr-10 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPass(!showEmailPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showEmailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[9px] text-slate-400 leading-normal block">
                  Para contas do Gmail, recomendamos utilizar uma **Senha de App** gerada nas configurações de Segurança da sua conta Google.
                </span>
              </div>

              {/* From Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">E-MAIL DO REMETENTE</label>
                <input
                  type="email"
                  placeholder="Ex: alertas@imsafe.com.br ou seugmail@gmail.com"
                  value={emailConfig.fromEmail}
                  onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                  className="w-full text-xs font-mono py-3 px-4 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveEmail}
              disabled={isSavingEmail}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSavingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Credenciais SMTP</span>
                </>
              )}
            </button>
          </div>

          {/* Test Section Email */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-slate-500" />
              Testar Envio de E-mail Automático
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">E-MAIL DO DESTINATÁRIO</label>
                <input
                  type="email"
                  placeholder="Ex: destinatario@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full text-xs font-mono py-3 px-4 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                className="w-full py-3 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:bg-slate-150 disabled:text-slate-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTestingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Disparando E-mail de Teste...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Disparar E-mail de Teste</span>
                  </>
                )}
              </button>

              {/* Status Feedback Email */}
              {emailTestResult && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                  emailTestResult.success 
                    ? 'bg-emerald-50 text-emerald-850 border-emerald-100' 
                    : 'bg-red-50 text-red-850 border-red-100'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {emailTestResult.success ? <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> : <XCircle className="w-4.5 h-4.5 text-red-600" />}
                    <span>{emailTestResult.success ? 'SMTP E-mail OK!' : 'Erro no Envio do E-mail'}</span>
                  </div>
                  <p className="text-[11px]">{emailTestResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Priority Alert Notice */}
      <div className="bg-amber-50/50 border border-amber-150 rounded-3xl p-5 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-900">Segurança Robusta para Pessoas Sozinhas</h4>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Ao configurar ambos os canais, o imSafe garante redundância máxima de vida ou morte: assim que qualquer emergência é confirmada ou um check-in de temporizador falha, o servidor instantaneamente dispara SMS real, chamada de voz real com leitura robótica em português AND envia e-mails contendo seu nome, tipo de risco e mapa exato com coordenadas.
          </p>
        </div>
      </div>
    </div>
  );
}
