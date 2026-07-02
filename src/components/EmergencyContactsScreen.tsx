/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Heart, User, Phone, Mail, HelpCircle, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmergencyContact } from '../types';

interface EmergencyContactsScreenProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
}

export default function EmergencyContactsScreen({
  contacts,
  onAddContact,
  onDeleteContact
}: EmergencyContactsScreenProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Filho');
  const [error, setError] = useState('');

  const relationsList = ['Filho', 'Filha', 'Vizinho(a)', 'Cônjuge', 'Irmão/Irmã', 'Amigo(a)', 'Médico(a)', 'Outro'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (contacts.length >= 5) {
      setError('Você já cadastrou o limite máximo de 5 contatos de emergência.');
      return;
    }

    if (!name || !phone || !email) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!email.includes('@')) {
      setError('Insira um e-mail válido.');
      return;
    }

    onAddContact({
      name,
      phone,
      email,
      relationship
    });

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setRelationship('Filho');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 px-4 pt-6" id="contacts-screen">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
            Contatos de Emergência
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre até 5 contatos de confiança ({contacts.length}/5 cadastrados).
          </p>
        </div>
        <button
          onClick={() => {
            if (contacts.length >= 5 && !showAddForm) {
              alert('Você atingiu o limite de 5 contatos. Exclua um antes de adicionar outro.');
            } else {
              setShowAddForm(!showAddForm);
            }
          }}
          className={`p-2.5 rounded-full text-white transition-all cursor-pointer shadow-md focus:outline-none ${
            showAddForm 
              ? 'bg-slate-800 rotate-45 hover:bg-slate-900' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
          }`}
          id="btn-toggle-add-contact"
          title={showAddForm ? 'Fechar formulário' : 'Adicionar contato'}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Safety warning if no contacts are configured */}
      {contacts.length === 0 && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-3xl text-xs text-red-700 flex gap-3" id="no-contacts-warning">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-800">Nenhum contato cadastrado</p>
            <p className="leading-relaxed">
              Você precisa cadastrar pelo menos um contato de emergência. Sem contatos, o sistema não poderá enviar alertas de socorro em caso de ausência de check-in.
            </p>
          </div>
        </div>
      )}

      {/* Slide down Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4"
            id="add-contact-card"
          >
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h4 className="font-display font-bold text-slate-800 text-sm">
                Novo Contato de Confiança
              </h4>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 rounded-xl" id="add-contact-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5" id="add-contact-form">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ex: Carlos Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Telefone celular
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="(11) 99999-1111"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Parentesco / Relação
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-semibold"
                  >
                    {relationsList.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  E-mail do contato
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="carlos@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-contact"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Salvar Contato de Segurança
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts List */}
      <div className="space-y-3" id="contacts-list">
        {contacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between group"
          >
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                <Heart className="w-5 h-5 fill-rose-50" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-slate-800 text-sm">{contact.name}</h4>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {contact.relationship}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 md:flex-row md:gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {contact.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {contact.email}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onDeleteContact(contact.id)}
              className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer focus:outline-none"
              id={`btn-delete-contact-${contact.id}`}
              title="Excluir contato"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </motion.div>
        ))}

        {contacts.length > 0 && (
          <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed max-w-sm mx-auto">
            Em caso de perigo ou ausência de confirmação, estes contatos receberão simultaneamente alertas detalhados via canais imSafe.
          </p>
        )}
      </div>
    </div>
  );
}
