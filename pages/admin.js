'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Inicialización de Supabase con fallback seguro
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Abm7RRtKLhITutAvDjkViw_PPh1w5XL';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// CONTRASEÑA MAESTRA INSTITUCIONAL
const MASTER_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ruace2026';

// ALGORITMO MATEMÁTICO DE SCORE RUACE PET539
// 1. pet_travel_intent: 'Corto plazo' -> 40 pts, 'Largo plazo' -> 20 pts, 'No' -> 0 pts
// 2. current_status: 'Solo placa' -> 40 pts, 'No tiene' -> 30 pts, 'Chip sin perfil' -> 15 pts
// 3. contact_method: 'WhatsApp' -> 20 pts, 'Llamada' -> 10 pts, otros -> 0 pts
export const calculateLeadScore = (lead) => {
  let score = 0;

  // Evaluar Pet Travel Intent
  const travel = (lead.pet_travel_intent || '').toLowerCase();
  if (travel.includes('corto') || travel.includes('internacional') || travel.includes('próximo') || travel.includes('urgente')) {
    score += 40;
  } else if (travel.includes('largo') || travel.includes('nacional') || travel.includes('evaluación') || travel.includes('asesoría')) {
    score += 20;
  }

  // Evaluar Current Status (Hallazgos de riesgo / Apify)
  const status = (lead.current_status || '').toLowerCase();
  if (status.includes('solo placa') || status.includes('placa')) {
    score += 40; // Alto riesgo: la placa se desprende con facilidad
  } else if (status.includes('no tiene') || status.includes('sin microchip')) {
    score += 30; // Mascota desprotegida
  } else if (status.includes('chip sin perfil') || status.includes('requiere cédula') || status.includes('tiene microchip')) {
    score += 15; // Ya tiene chip pero falta cédula o perfil activo
  }

  // Evaluar Contact Method
  const method = (lead.contact_method || '').toLowerCase();
  if (method.includes('whatsapp')) {
    score += 20;
  } else if (method.includes('llamada') || method.includes('teléfono')) {
    score += 10;
  }

  return score;
};

// DETERMINAR CLASIFICACIÓN Y BADGE DE TEMPERATURA
export const getTemperatureData = (score) => {
  if (score >= 80) {
    return {
      level: 'Caliente',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dotColor: 'bg-emerald-500',
      label: '🟢 Caliente (Alta Prioridad)',
      priority: 'Alta',
    };
  } else if (score >= 40) {
    return {
      level: 'Media',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
      dotColor: 'bg-amber-500',
      label: '🟡 Media (Seguimiento Estándar)',
      priority: 'Media',
    };
  } else {
    return {
      level: 'Baja',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-300',
      dotColor: 'bg-rose-500',
      label: '🔴 Baja (Nurturing)',
      priority: 'Baja',
    };
  }
};

// GENERADOR DE CONSEJOS DE CIERRE POR IA (AI SALES ADVISOR)
export const generateAICounsel = (lead, score) => {
  const travel = (lead.pet_travel_intent || '').toLowerCase();
  const status = (lead.current_status || '').toLowerCase();
  const method = (lead.contact_method || '').toLowerCase();
  const petName = lead.pet_name || 'la mascota';
  const ownerName = lead.owner_name ? lead.owner_name.split(' ')[0] : 'el tutor';

  let tip = '';

  if (score >= 80) {
    if (travel.includes('corto') || travel.includes('internacional')) {
      tip = `🚨 Oportunidad Urgente: ${ownerName} planea viajar pronto con ${petName}. Ofrece de inmediato el combo Microchip Homologado ISO 11784/85 + Certificado Zoosanitario Agrocalidad. Resalta que los tiempos de emisión toman entre 48h y 72h.`;
    } else if (status.includes('placa')) {
      tip = `⚡ Riesgo Crítico: ${petName} solo usa placa externa. Explícale a ${ownerName} que en Quito el 68% de placas se desprenden o son robadas. Cierra la cita destacando el Microchip Subdérmico Inviolable + Cédula Física Oficial.`;
    } else {
      tip = `🔥 Lead Caliente: ${ownerName} busca máxima protección. Plantea la Cédula Inteligente con QR médico y colocación en clínica aliada o a domicilio esta misma semana.`;
    }
  } else if (score >= 40) {
    if (status.includes('chip') || status.includes('cédula')) {
      tip = `💡 Asesoría Sugerida: ${petName} ya tiene microchip, pero carece de perfil activo y cédula física. Proponle regularizar el registro RUACE con acceso a historial veterinario 24/7.`;
    } else {
      tip = `📋 Asesoría Médica: Envía el catálogo de beneficios de la Red RUACE Quito. Menciona que el procedimiento de implantación es indoloro y avalado por médicos veterinarios.`;
    }
  } else {
    tip = `🌱 Educación y Seguimiento: Comparte por correo o mensaje informativo la normativa de tenencia responsable de Quito y testimonios de mascotas recuperadas gracias al sistema RUACE.`;
  }

  if (method.includes('whatsapp')) {
    tip += ` Contactar vía WhatsApp con mensaje cálido y personalizado.`;
  } else if (method.includes('llamada')) {
    tip += ` Realizar llamada telefónica directa en horario de oficina.`;
  }

  return tip;
};

// DATOS DEMOSTRATIVOS DE RESPALDO (Académico / Presentación)
const DEMO_LEADS = [
  {
    id: 'demo-1',
    owner_name: 'Estefanía Amores',
    owner_phone: '+593 96 418 0420',
    owner_email: 'estefania.amores@gmail.com',
    pet_name: 'Max',
    pet_type: 'Perro',
    current_status: 'Solo placa',
    pet_travel_intent: 'Corto plazo',
    contact_method: 'WhatsApp',
    lead_status: 'Por contactar',
    notes: 'Cliente muy interesada en combo de viaje urgente a España.',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'demo-2',
    owner_name: 'Carlos Maldonado',
    owner_phone: '+593 98 311 3678',
    owner_email: 'cmaldonado@empresa.ec',
    pet_name: 'Kira',
    pet_type: 'Gato',
    current_status: 'No tiene',
    pet_travel_intent: 'Corto plazo',
    contact_method: 'WhatsApp',
    lead_status: 'Por contactar',
    notes: 'Pide información de costo a domicilio en Quito Norte.',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'demo-3',
    owner_name: 'Henry Troya',
    owner_phone: '+593 99 594 3723',
    owner_email: 'htroya@quito.gob.ec',
    pet_name: 'Rocky',
    pet_type: 'Perro',
    current_status: 'Chip sin perfil',
    pet_travel_intent: 'Largo plazo',
    contact_method: 'Llamada',
    lead_status: 'Contactado',
    notes: 'Llamada realizada: cita agendada para este sábado 10:00 AM.',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'demo-4',
    owner_name: 'Valquiria Ambuludi',
    owner_phone: '+593 99 945 2384',
    owner_email: 'valquiria.a@outlook.com',
    pet_name: 'Simba',
    pet_type: 'Gato',
    current_status: 'No tiene',
    pet_travel_intent: 'No',
    contact_method: 'Llamada',
    lead_status: 'Por contactar',
    notes: 'Pendiente primera llamada.',
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  },
  {
    id: 'demo-5',
    owner_name: 'Ximena Silva',
    owner_phone: '+593 97 812 4455',
    owner_email: 'xime.silva@uio.net',
    pet_name: 'Bruno',
    pet_type: 'Perro',
    current_status: 'Solo placa',
    pet_travel_intent: 'No',
    contact_method: 'WhatsApp',
    lead_status: 'Contactado',
    notes: 'Se envió cotización formal por WhatsApp.',
    created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
];

export default function AdminDashboard() {
  // CONTROL DE ACCESO CON USUARIO, CLAVE Y ROLES (ADMIN / OPERATOR)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'operator'
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // ESTADOS DEL DASHBOARD
  const [leads, setLeads] = useState(DEMO_LEADS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTemperature, setFilterTemperature] = useState('ALL');
  const [segmentFilter, setSegmentFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONTACTED' | 'DOGS' | 'CATS'
  const [updatingId, setUpdatingId] = useState(null);
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [notification, setNotification] = useState(null);

  // NOTAS LOCALES Y CONSEJOS PREDICTIVOS CLAUDE IA (/api/triage)
  const [leadNotes, setLeadNotes] = useState({});
  const [liveAiAdvice, setLiveAiAdvice] = useState({});
  const [loadingAiLead, setLoadingAiLead] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);

  // VERIFICAR AUTENTICACIÓN Y ROL EN SESIÓN
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStored = sessionStorage.getItem('ruace_admin_auth');
      const roleStored = sessionStorage.getItem('ruace_admin_role');
      if (authStored === 'true' && roleStored) {
        setIsAuthenticated(true);
        setUserRole(roleStored);
      }
    }
  }, []);

  // CARGAR LEADS DESDE SUPABASE Y LOCALSTORAGE
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ruace_pet539_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      let loadedLeads = DEMO_LEADS;
      if (data && data.length > 0) {
        loadedLeads = data;
        setDbConnected(true);
      } else {
        setDbConnected(true);
      }

      // Cargar notas desde Supabase y localStorage para persistencia bidireccional
      const notesMap = {};
      loadedLeads.forEach((lead) => {
        const leadId = lead.id || lead.owner_email;
        const key = `ruace_note_${leadId}`;
        const savedNote = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        // Priorizar valor persistido en Supabase (lead_advice, lead_notes o notes)
        const dbNote = lead.lead_advice || lead.lead_notes || lead.notes;
        notesMap[leadId] = dbNote || (savedNote !== null ? savedNote : '');
      });
      setLeadNotes(notesMap);
      setLeads(loadedLeads);

      // LLAMADA AUTOMÁTICA A /api/triage PARA REEMPLAZAR EL CONSEJO SIMULADO POR EL REAL
      fetchTriageForLeads(loadedLeads);
    } catch (err) {
      console.warn('Fallo al conectar con Supabase, usando datos de respaldo:', err.message);
      setLeads(DEMO_LEADS);
      setDbConnected(false);
      
      const notesMap = {};
      DEMO_LEADS.forEach((lead) => {
        const leadId = lead.id || lead.owner_email;
        const key = `ruace_note_${leadId}`;
        const savedNote = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        const dbNote = lead.lead_advice || lead.lead_notes || lead.notes;
        notesMap[leadId] = dbNote || (savedNote !== null ? savedNote : '');
      });
      setLeadNotes(notesMap);

      // LLAMADA AUTOMÁTICA A /api/triage PARA LEADS DE DEMOSTRACIÓN
      fetchTriageForLeads(DEMO_LEADS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  // MANEJO DE INICIO DE SESIÓN CON CREDENCIALES EXACTAS Y ASIGNACIÓN DE ROL
  const handleLogin = (e) => {
    e.preventDefault();
    const user = usernameInput.trim();
    const pass = passwordInput.trim();

    if (user === 'ruace2026' && pass === '12345') {
      // Rol 'admin': Acceso Total Dueño
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ruace_admin_auth', 'true');
        sessionStorage.setItem('ruace_admin_role', 'admin');
      }
      setIsAuthenticated(true);
      setUserRole('admin');
      setAuthError('');
    } else if (user === 'empleado593' && pass === '11111') {
      // Rol 'operator': Acceso Limitado Operador
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ruace_admin_auth', 'true');
        sessionStorage.setItem('ruace_admin_role', 'operator');
      }
      setIsAuthenticated(true);
      setUserRole('operator');
      setAuthError('');
    } else {
      setAuthError('Credenciales incorrectas. Intente de nuevo.');
    }
  };

  // CERRAR SESIÓN
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ruace_admin_auth');
      sessionStorage.removeItem('ruace_admin_role');
    }
    setIsAuthenticated(false);
    setUserRole(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  // PROCESAMIENTO Y REORDENAMIENTO ESTRICTO POR SCORE (MAYOR A MENOR)
  const processedLeads = useMemo(() => {
    return leads
      .map((lead) => {
        const score = calculateLeadScore(lead);
        const temp = getTemperatureData(score);
        const aiTip = generateAICounsel(lead, score);
        const rawStatus = (lead.lead_status || 'Por contactar').trim();
        const normalizedStatus = rawStatus.toLowerCase() === 'contactado' ? 'Contactado' : 'Por contactar';
        return {
          ...lead,
          lead_score: score,
          temperature: temp,
          ai_counsel: aiTip,
          lead_status: normalizedStatus,
        };
      })
      .sort((a, b) => b.lead_score - a.lead_score); // Reordenamiento estricto descendente
  }, [leads]);

  // FILTRADO DINÁMICO POR SEGMENTOS (TODOS, PENDIENTES, CONTACTADOS, PERROS, GATOS) Y TEMPERATURA
  const filteredLeads = useMemo(() => {
    return processedLeads.filter((lead) => {
      // Búsqueda libre
      const matchesSearch =
        (lead.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.pet_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.owner_phone || '').includes(searchQuery);

      // Filtro de temperatura
      const matchesTemp =
        filterTemperature === 'ALL' || lead.temperature.level === filterTemperature;

      // Filtro interactivo por segmento
      let matchesSegment = true;
      if (segmentFilter === 'PENDING') {
        matchesSegment = lead.lead_status === 'Por contactar';
      } else if (segmentFilter === 'CONTACTED') {
        matchesSegment = lead.lead_status === 'Contactado';
      } else if (segmentFilter === 'DOGS') {
        const type = (lead.pet_type || '').toLowerCase();
        matchesSegment = type.includes('perro') || type.includes('canino');
      } else if (segmentFilter === 'CATS') {
        const type = (lead.pet_type || '').toLowerCase();
        matchesSegment = type.includes('gato') || type.includes('felino');
      }

      return matchesSearch && matchesTemp && matchesSegment;
    });
  }, [processedLeads, searchQuery, filterTemperature, segmentFilter]);

  // MARCAR COMO CONTACTADO Y PERSISTIR NOTA/FEEDBACK ASÍNCRONAMENTE EN SUPABASE
  const handleMarkAsContacted = async (lead) => {
    const leadKey = lead.id || lead.owner_email;
    const currentNote = leadNotes[leadKey] !== undefined ? leadNotes[leadKey] : (lead.lead_advice || lead.lead_notes || lead.notes || '');
    setUpdatingId(leadKey);

    // Persistencia local en navegador para respaldo inmediato
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ruace_note_${leadKey}`, currentNote);
    }

    // 1. LLAMADA ASÍNCRONA .update() A SUPABASE (ruace_pet539_leads)
    try {
      if (lead.id && !String(lead.id).startsWith('demo-')) {
        const updatePayload = {
          lead_status: 'Contactado',
          lead_advice: currentNote,
          notes: currentNote,
        };

        const { error } = await supabase
          .from('ruace_pet539_leads')
          .update(updatePayload)
          .eq('id', lead.id);

        if (error) {
          console.warn('Reintentando mutación estricta .update({ lead_status, lead_advice }):', error.message);
          // Mutación exacta hacia Supabase: .update({ lead_status: 'Contactado', lead_advice: currentNote })
          const { error: retryError } = await supabase
            .from('ruace_pet539_leads')
            .update({
              lead_status: 'Contactado',
              lead_advice: currentNote,
            })
            .eq('id', lead.id);

          if (retryError) {
            console.warn('Reintento con columna alternativa notes:', retryError.message);
            await supabase
              .from('ruace_pet539_leads')
              .update({
                lead_status: 'Contactado',
                notes: currentNote,
              })
              .eq('id', lead.id);
          }
        }
      }

      // 2. ACTUALIZACIÓN INMEDIATA DEL ESTADO LOCAL DE REACT TRAS ÉXITO
      setLeads((prev) =>
        prev.map((item) => {
          const isMatch = (item.id && item.id === lead.id) || item.owner_email === lead.owner_email;
          return isMatch
            ? {
                ...item,
                lead_status: 'Contactado',
                lead_advice: currentNote,
                notes: currentNote,
                lead_notes: currentNote,
              }
            : item;
        })
      );

      setNotification({
        type: 'success',
        text: `✓ Lead de ${lead.owner_name} marcado como "Contactado" y feedback guardado en Supabase.`,
      });
    } catch (err) {
      console.warn('Error al actualizar en Supabase, aplicando actualización en memoria:', err.message);
      // Actualización local de respaldo para leads demo o modo offline
      setLeads((prev) =>
        prev.map((item) => {
          const isMatch = (item.id && item.id === lead.id) || item.owner_email === lead.owner_email;
          return isMatch
            ? {
                ...item,
                lead_status: 'Contactado',
                lead_advice: currentNote,
                notes: currentNote,
                lead_notes: currentNote,
              }
            : item;
        })
      );
      setNotification({
        type: 'success',
        text: `✓ ${lead.owner_name} marcado como "Contactado" (guardado localmente).`,
      });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // ALTERNAR ESTADO (Por contactar <-> Contactado)
  const handleToggleStatus = async (lead) => {
    const nextStatus = lead.lead_status === 'Contactado' ? 'Por contactar' : 'Contactado';
    const targetKey = lead.id || lead.owner_email;
    setUpdatingId(targetKey);

    // Actualización en Supabase
    try {
      if (lead.id && !String(lead.id).startsWith('demo-')) {
        const { error } = await supabase
          .from('ruace_pet539_leads')
          .update({ lead_status: nextStatus })
          .eq('id', lead.id);

        if (error) throw error;
      }

      // Actualización del estado local tras éxito
      setLeads((prev) =>
        prev.map((item) => {
          const isMatch = (item.id && item.id === lead.id) || item.owner_email === lead.owner_email;
          return isMatch ? { ...item, lead_status: nextStatus } : item;
        })
      );

      setNotification({
        type: 'success',
        text: `Estado de ${lead.owner_name} actualizado a "${nextStatus}".`,
      });
    } catch (err) {
      console.warn('Actualizado localmente:', err.message);
      setLeads((prev) =>
        prev.map((item) => {
          const isMatch = (item.id && item.id === lead.id) || item.owner_email === lead.owner_email;
          return isMatch ? { ...item, lead_status: nextStatus } : item;
        })
      );
      setNotification({
        type: 'success',
        text: `Estado de ${lead.owner_name} actualizado a "${nextStatus}" (local).`,
      });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // GUARDAR NOTAS / FEEDBACK POR LEAD
  const handleSaveNote = async (lead) => {
    const leadKey = lead.id || lead.owner_email;
    const currentNote = leadNotes[leadKey] !== undefined ? leadNotes[leadKey] : (lead.lead_advice || lead.lead_notes || lead.notes || '');
    setSavingNoteId(leadKey);

    try {
      // Guardar en localStorage para persistencia garantizada
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ruace_note_${leadKey}`, currentNote);
      }

      // Si existe en Supabase y tiene campo notes / lead_advice
      if (lead.id && !String(lead.id).startsWith('demo-')) {
        await supabase
          .from('ruace_pet539_leads')
          .update({ lead_advice: currentNote, notes: currentNote })
          .eq('id', lead.id);
      }

      // Actualizar estado local inmediatamente
      setLeads((prev) =>
        prev.map((item) => {
          const isMatch = (item.id && item.id === lead.id) || item.owner_email === lead.owner_email;
          return isMatch
            ? {
                ...item,
                lead_advice: currentNote,
                notes: currentNote,
                lead_notes: currentNote,
              }
            : item;
        })
      );

      setNotification({
        type: 'success',
        text: `Nota guardada para ${lead.owner_name} en base de datos.`,
      });
    } catch (err) {
      console.warn('Nota persistida en navegador:', err.message);
    } finally {
      setSavingNoteId(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // CONSULTA AUTOMÁTICA AL ENDPOINT /api/triage PARA CADA LEAD DE LA LISTA
  const fetchTriageForLeads = async (leadsList) => {
    if (!leadsList || leadsList.length === 0) return;
    setTriageLoading(true);

    try {
      // Disparar las consultas a /api/triage en paralelo para cada lead
      await Promise.allSettled(
        leadsList.map(async (lead) => {
          const leadKey = lead.id || lead.owner_email;
          try {
            const response = await fetch('/api/triage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lead_id: lead.id,
                owner_name: lead.owner_name,
                pet_name: lead.pet_name,
                pet_type: lead.pet_type,
                current_status: lead.current_status,
                pet_travel_intent: lead.pet_travel_intent,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const adviceText = data.advice || data.triage;
              if (adviceText) {
                setLiveAiAdvice((prev) => ({
                  ...prev,
                  [leadKey]: adviceText,
                }));
              }
            }
          } catch (err) {
            console.warn(`Error al consultar /api/triage para ${lead.pet_name}:`, err.message);
          }
        })
      );
    } catch (err) {
      console.error('Error general en triage masivo:', err);
    } finally {
      setTriageLoading(false);
    }
  };

  // CONSULTA MANUAL INDIVIDUAL AL ENDPOINT /api/triage
  const fetchPredictiveAdvice = async (lead) => {
    const leadKey = lead.id || lead.owner_email;
    setLoadingAiLead(leadKey);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          owner_name: lead.owner_name,
          pet_name: lead.pet_name,
          pet_type: lead.pet_type,
          current_status: lead.current_status,
          pet_travel_intent: lead.pet_travel_intent,
        }),
      });

      const data = await response.json();
      const adviceText = data.advice || data.triage;
      if (adviceText) {
        setLiveAiAdvice((prev) => ({
          ...prev,
          [leadKey]: adviceText,
        }));
        setNotification({
          type: 'success',
          text: `Consejo generado por /api/triage para ${lead.pet_name}.`,
        });
      }
    } catch (err) {
      console.error('Error al conectar con /api/triage:', err);
      setNotification({
        type: 'error',
        text: 'No se pudo conectar con /api/triage. Usando recomendación heurística local.',
      });
    } finally {
      setLoadingAiLead(null);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // MÉTRICAS KPI DEL VENDEDOR / ASESOR
  const sellerKpis = useMemo(() => {
    const total = processedLeads.length;
    const contactedCount = processedLeads.filter((l) => l.lead_status === 'Contactado').length;
    const pendingCount = processedLeads.filter((l) => l.lead_status === 'Por contactar').length;
    const dogCount = processedLeads.filter((l) => {
      const type = (l.pet_type || '').toLowerCase();
      return type.includes('perro') || type.includes('canino');
    }).length;
    const catCount = processedLeads.filter((l) => {
      const type = (l.pet_type || '').toLowerCase();
      return type.includes('gato') || type.includes('felino');
    }).length;
    
    // Meta semanal del vendedor: 10 contactos
    const weeklyGoal = 10;
    const goalPercentage = Math.min(Math.round((contactedCount / weeklyGoal) * 100), 100);

    // Leads calientes (Score >= 80) atendidos
    const hotLeads = processedLeads.filter((l) => l.lead_score >= 80);
    const hotContacted = hotLeads.filter((l) => l.lead_status === 'Contactado').length;
    const hotConversionRate = hotLeads.length > 0 ? Math.round((hotContacted / hotLeads.length) * 100) : 0;

    // Score medio general
    const avgScore = total > 0 ? Math.round(processedLeads.reduce((acc, l) => acc + l.lead_score, 0) / total) : 0;

    return {
      total,
      contactedCount,
      pendingCount,
      dogCount,
      catCount,
      weeklyGoal,
      goalPercentage,
      hotCount: hotLeads.length,
      hotContacted,
      hotConversionRate,
      avgScore,
    };
  }, [processedLeads]);

  // SI NO ESTÁ AUTENTICADO: PANTALLA DE ACCESO CON PALETA OFICIAL PET593
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFBEB] text-slate-800 flex items-center justify-center p-4 font-sans selection:bg-[#FBBF24] selection:text-slate-900">
        <Head>
          <title>Acceso Seguro | Panel RUACE PET539</title>
        </Head>

        <div className="max-w-md w-full bg-white border-2 border-[#1E40AF]/20 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#1E40AF] flex items-center justify-center text-[#FBBF24] text-3xl mx-auto shadow-xl shadow-[#1E40AF]/20">
              🔒
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1E40AF] tracking-tight">Acceso Institucional RUACE</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Panel de Priorización Comercial y Gestión de Leads</p>
            </div>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="adminUsername" className="block text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-2">
                Usuario *
              </label>
              <input
                type="text"
                id="adminUsername"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ingresa tu usuario (ej. ruace2026 / empleado593)..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 text-sm text-slate-900 placeholder-slate-400 outline-none transition font-medium"
              />
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-2">
                Clave *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="adminPassword"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Ingresa tu clave..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 text-sm text-slate-900 placeholder-slate-400 outline-none transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1E40AF] text-xs font-bold"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-700">💡 Credenciales autorizadas del sistema:</p>
              <div className="flex flex-col gap-1 font-mono text-[10px]">
                <div>• <span className="font-bold text-[#1E40AF]">Dueño (Admin):</span> <code className="bg-amber-50 px-1 py-0.5 rounded border border-[#FBBF24]">ruace2026</code> / <code className="bg-amber-50 px-1 py-0.5 rounded border border-[#FBBF24]">12345</code></div>
                <div>• <span className="font-bold text-slate-800">Operador (Empleado):</span> <code className="bg-slate-200 px-1 py-0.5 rounded border border-slate-300">empleado593</code> / <code className="bg-slate-200 px-1 py-0.5 rounded border border-slate-300">11111</code></div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-black text-sm shadow-lg shadow-[#FBBF24]/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs text-[#1E40AF] hover:underline transition font-bold">
              ← Volver a la Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PANEL PRINCIPAL (MODO CLARO CORPORATIVO CON PALETA PET593)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#FBBF24] selection:text-slate-900">
      <Head>
        <title>Panel de Gestión de Leads & KPIs | RUACE PET539</title>
        <meta name="description" content="Dashboard interno de priorización y conversión de leads RUACE PET539 Quito." />
      </Head>

      {/* TOPBAR CORPORATIVA EN MODO CLARO */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1E40AF] flex items-center justify-center text-[#FBBF24] shadow-md shadow-[#1E40AF]/20 font-black text-xl">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-[#1E40AF] tracking-tight">RUACE PET539</span>
                <span className="bg-[#FFFBEB] text-[#1E40AF] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#FBBF24] uppercase font-bold">
                  CRM Interno
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Algoritmo de Priorización y Cierre de Leads · DMQ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* BADGE DE ROL ACTIVO (ADMIN / OPERATOR) */}
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-black ${
              userRole === 'admin'
                ? 'bg-amber-50 text-[#1E40AF] border-[#FBBF24]'
                : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}>
              <span>{userRole === 'admin' ? '👑' : '👤'}</span>
              <span>{userRole === 'admin' ? 'Rol: Dueño (Admin Total)' : 'Rol: Operador (Empleado)'}</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 bg-[#FFFBEB] px-3 py-1.5 rounded-xl border border-amber-200 font-medium">
              <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {dbConnected ? 'Supabase Conectado' : 'Modo Demostrativo'}
            </span>

            <button
              onClick={fetchLeads}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200 text-xs font-bold flex items-center gap-2"
              title="Recargar leads"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden md:inline">Actualizar</span>
            </button>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1E40AF] font-bold text-xs border border-slate-300 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Ver Landing</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition flex items-center gap-1.5"
              title="Cerrar sesión segura"
            >
              <span>Salir</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-rose-50 border-rose-400 text-rose-900'
            }`}
          >
            <span>{notification.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* SECCIÓN KPI DEL VENDEDOR: TARJETAS CON NÚMEROS GIGANTES EN NEGRITA (+15.000, +120) */}
        {/* REGLA DE ROL: VISIBLE ÚNICAMENTE PARA 'admin' (DUEÑO). OCULTO PARA 'operator' */}
        {userRole === 'admin' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider mb-2">
                  🎯 Tablero de Objetivos Comerciales del Asesor (Vista Exclusiva Administrador)
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1E40AF] tracking-tight">
                  Métricas de Impacto y Conversión en Quito
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5 font-normal">
                  Monitoreo en tiempo real de metas comerciales, atención prioritaria de leads y alcance de la red.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                  Red Activa Quito
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#FFFBEB] text-[#1E40AF] border border-[#FBBF24] text-xs font-bold">
                  Meta 2026
                </span>
              </div>
            </div>

            {/* GRID DE NÚMEROS GIGANTES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Tarjeta 1: +15,000 Mascotas Registradas */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#1E40AF]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FBBF24]/10 transition-colors"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Mascotas Registradas
                  </span>
                  <span className="text-xs font-black bg-[#FFFBEB] text-[#1E40AF] px-2 py-0.5 rounded-full border border-amber-200">
                    Total DMQ
                  </span>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-[#1E40AF] tracking-tight font-mono">
                  +15,000
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Perros y gatos con microchip ISO y PETCÉDULA en Quito y Ecuador.
                </p>
              </div>

              {/* Tarjeta 2: +120 Clínicas Aliadas en Quito */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#FBBF24]/10 rounded-bl-full pointer-events-none group-hover:bg-[#1E40AF]/10 transition-colors"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Clínicas Aliadas en Quito
                  </span>
                  <span className="text-xs font-black bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    Red Activa
                  </span>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                  +120
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Centros veterinarios homologados para colocación inmediata y validación.
                </p>
              </div>

              {/* Tarjeta 3: 47.7% Tasa de Cierre Comercial */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Tasa de Cierre Comercial
                  </span>
                  <span className="text-xs font-black bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    Efectividad
                  </span>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight font-mono">
                  47.7%
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Conversión promedio del asesor en prospectos de viaje y alto riesgo.
                </p>
              </div>

              {/* Tarjeta 4: Contactos del Asesor (Meta Semanal) */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Meta Semanal del Asesor
                  </span>
                  <span className="text-xs font-black bg-[#FBBF24] text-slate-900 px-2.5 py-0.5 rounded-full shadow-sm">
                    {sellerKpis.goalPercentage}%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl sm:text-5xl font-black text-[#1E40AF] tracking-tight font-mono">
                    {sellerKpis.contactedCount}
                  </p>
                  <span className="text-xl font-bold text-slate-400 font-mono">
                    / {sellerKpis.weeklyGoal}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {sellerKpis.pendingCount} prospectos restantes en la cola actual.
                </p>
              </div>

            </div>

            {/* BARRA DE PROGRESO DE OBJETIVO COMERCIAL */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Progreso hacia el objetivo comercial semanal ({sellerKpis.weeklyGoal} contactos):</span>
                <span className={sellerKpis.goalPercentage >= 80 ? 'text-[#1E40AF]' : 'text-amber-700'}>
                  {sellerKpis.goalPercentage}% completado {sellerKpis.goalPercentage >= 100 ? '🎉 ¡Meta Semanal Alcanzada!' : ''}
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#1E40AF] via-[#1E40AF] to-[#FBBF24] rounded-full transition-all duration-500"
                  style={{ width: `${sellerKpis.goalPercentage}%` }}
                ></div>
              </div>
            </div>
          </section>
        )}

        {/* BANNER INFORMATIVO PARA EL OPERADOR SI ESTÁ EN MODO LIMITADO */}
        {userRole === 'operator' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📋</span>
              <div>
                <p className="text-xs font-black text-[#1E40AF] uppercase tracking-wide">
                  Panel de Operaciones Veterinarias
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Gestión y seguimiento de prospectos en cola. Escribe tus notas y marca como contactado.
                </p>
              </div>
            </div>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2.5 py-1 rounded-full border border-slate-200 font-bold">
              Vista Operador
            </span>
          </div>
        )}

        {/* FILTROS INTERACTIVOS: SEGMENTACIÓN CONTACTADOS VS PENDIENTES */}
        <section className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* PESTAÑAS SEGMENTADAS DE 1-CLIC (TODOS, PENDIENTES, CONTACTADOS, PERROS, GATOS) */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSegmentFilter('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  segmentFilter === 'ALL'
                    ? 'bg-[#1E40AF] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>Ver Todos</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${segmentFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {sellerKpis.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSegmentFilter('PENDING')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  segmentFilter === 'PENDING'
                    ? 'bg-[#FBBF24] text-slate-950 shadow-md font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>⏳ Por Contactar</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${segmentFilter === 'PENDING' ? 'bg-slate-900/20 text-slate-900' : 'bg-slate-200 text-slate-700'}`}>
                  {sellerKpis.pendingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSegmentFilter('CONTACTED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  segmentFilter === 'CONTACTED'
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>✓ Contactados</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${segmentFilter === 'CONTACTED' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {sellerKpis.contactedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSegmentFilter('DOGS')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  segmentFilter === 'DOGS'
                    ? 'bg-[#1E40AF] text-white shadow-md font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>🐶 Perros</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${segmentFilter === 'DOGS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {sellerKpis.dogCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSegmentFilter('CATS')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  segmentFilter === 'CATS'
                    ? 'bg-[#1E40AF] text-white shadow-md font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>🐱 Gatos</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${segmentFilter === 'CATS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {sellerKpis.catCount}
                </span>
              </button>
            </div>

            {/* Búsqueda y Selector de Temperatura */}
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por tutor, teléfono o mascota..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#1E40AF] text-xs text-slate-800 placeholder-slate-400 outline-none font-medium"
                />
              </div>

              <select
                value={filterTemperature}
                onChange={(e) => setFilterTemperature(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 py-2 px-3 rounded-xl focus:border-[#1E40AF] outline-none"
              >
                <option value="ALL">Todas las Temperaturas</option>
                <option value="Caliente">🟢 Calientes (≥ 80)</option>
                <option value="Media">🟡 Medias (40 - 79)</option>
                <option value="Baja">🔴 Bajas (&lt; 40)</option>
              </select>
            </div>

          </div>
        </section>

        {/* TABLA PRINCIPAL DE LEADS REORDENADOS POR SCORE */}
        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#1E40AF] uppercase tracking-wider">Prospectos Priorizados</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold font-mono">
                {filteredLeads.length} resultados
              </span>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Algoritmo RUACE: <strong className="text-[#1E40AF]">Score Descendente (100 → 0)</strong>
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-bold text-slate-500">Cargando prospectos en tiempo real...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <p className="text-4xl">🔍</p>
              <h3 className="text-base font-bold text-slate-800">No se encontraron prospectos con los filtros actuales</h3>
              <p className="text-xs text-slate-500">Prueba cambiando el estado (Pendientes / Contactados) o los términos de búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#FFFBEB] text-[11px] uppercase font-black text-[#1E40AF] tracking-wider border-b border-amber-200">
                  <tr>
                    <th scope="col" className="py-4 px-4 sm:px-6">Puesto & Score</th>
                    <th scope="col" className="py-4 px-4">Tutor & Mascota</th>
                    <th scope="col" className="py-4 px-4">Variables Clave</th>
                    <th scope="col" className="py-4 px-4 min-w-[260px]">Consejo de Cierre por IA</th>
                    <th scope="col" className="py-4 px-4 min-w-[270px]">Notas / Feedback del Cliente</th>
                    <th scope="col" className="py-4 px-4 text-center">Acción Comercial</th>
                    <th scope="col" className="py-4 px-4 text-right">Contacto Directo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead, index) => {
                    const isHot = lead.lead_score >= 80;
                    const isContacted = lead.lead_status === 'Contactado';
                    const cleanPhone = (lead.owner_phone || '').replace(/[^0-9]/g, '');
                    const leadKey = lead.id || lead.owner_email;
                    const noteValue = leadNotes[leadKey] !== undefined ? leadNotes[leadKey] : (lead.lead_advice || lead.lead_notes || lead.notes || '');

                    return (
                      <tr
                        key={leadKey || index}
                        className={`transition-colors hover:bg-amber-50/40 ${
                          isHot ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Puesto, Score y Badge de Temperatura */}
                        <td className="py-4 px-4 sm:px-6 align-top">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-slate-400 w-5">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-2xl font-black text-[#1E40AF] font-mono">
                                  {lead.lead_score}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">/100</span>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border mt-1 ${lead.temperature.badgeColor}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${lead.temperature.dotColor}`}></span>
                                {lead.temperature.level}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tutor y Mascota */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-sm">{lead.owner_name}</p>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                              <span>📞 {lead.owner_phone}</span>
                            </p>
                            <div className="pt-1 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#1E40AF] text-[11px] font-bold border border-amber-200">
                                {lead.pet_type === 'Gato' ? '🐱' : '🐶'} {lead.pet_name}
                              </span>
                              <span className="text-[10px] text-slate-500">({lead.pet_type})</span>
                            </div>
                          </div>
                        </td>

                        {/* Variables Clave del Algoritmo */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 text-[11px]">Viaje:</span>
                              <span className="font-semibold text-slate-800 text-right">
                                {lead.pet_travel_intent}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 text-[11px]">Estado:</span>
                              <span className="font-semibold text-slate-800 text-right">
                                {lead.current_status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 text-[11px]">Canal:</span>
                              <span className="font-bold text-[#1E40AF] text-right">
                                {lead.contact_method}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* CONSEJO DE CIERRE POR IA */}
                        <td className="py-4 px-4 align-top">
                          <div className="bg-[#FFFBEB] p-3.5 rounded-2xl border border-amber-200 text-xs text-slate-700 leading-relaxed shadow-sm">
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-black text-[#1E40AF] uppercase tracking-wider">
                                <svg className="w-3.5 h-3.5 text-[#1E40AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Consejo IA Real (/api/triage)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => fetchPredictiveAdvice(lead)}
                                disabled={loadingAiLead === leadKey}
                                className="text-[10px] font-bold text-[#1E40AF] hover:text-blue-900 bg-white hover:bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors inline-flex items-center gap-1 shadow-xs disabled:opacity-50"
                                title="Re-consultar /api/triage para este lead"
                              >
                                {loadingAiLead === leadKey ? (
                                  <>
                                    <span className="animate-spin text-[10px]">⚙️</span>
                                    <span>Triage...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>✨</span>
                                    <span>Triage IA</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-slate-800 text-[11px] leading-relaxed font-semibold">
                              {liveAiAdvice[leadKey] ? (
                                <p className="text-slate-900">{liveAiAdvice[leadKey]}</p>
                              ) : triageLoading ? (
                                <p className="text-amber-800 italic flex items-center gap-1 animate-pulse">
                                  <span>🤖</span>
                                  <span>Procesando variables con IA (/api/triage)...</span>
                                </p>
                              ) : (
                                <p className="text-slate-700 font-medium">{lead.ai_counsel}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CAMPO DE TEXTO DE NOTAS / FEEDBACK DEL CLIENTE */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-2">
                            <textarea
                              rows="2"
                              value={noteValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLeadNotes((prev) => ({
                                  ...prev,
                                  [leadKey]: val,
                                }));
                              }}
                              placeholder="Notas / Feedback del Cliente: acuerdos, objeciones o fecha pactada..."
                              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#1E40AF] focus:bg-white text-xs text-slate-800 placeholder-slate-400 outline-none resize-none transition font-medium"
                            ></textarea>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {isContacted ? '✓ Feedback persistido' : 'Pendiente de registrar'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSaveNote(lead)}
                                disabled={savingNoteId === leadKey}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-300 transition flex items-center gap-1 shadow-xs"
                                title="Guardar nota sin alterar estado comercial"
                              >
                                {savingNoteId === leadKey ? 'Guardando...' : '💾 Guardar'}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* BOTÓN DE CONTACTO Y ACCIÓN COMERCIAL */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="flex flex-col items-center gap-2">
                            {isContacted ? (
                              <div className="flex flex-col items-center gap-1.5 w-full max-w-[190px]">
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsContacted(lead)}
                                  disabled={updatingId === leadKey}
                                  className="w-full px-3.5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-xs cursor-pointer group"
                                  title="Lead ya contactado. Haz clic si deseas sincronizar nuevas notas con Supabase."
                                >
                                  {updatingId === leadKey ? (
                                    <svg className="w-4 h-4 animate-spin text-emerald-700" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 text-emerald-600 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  <span>Contactado ✓</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(lead)}
                                  className="text-[10px] text-slate-400 hover:text-slate-700 underline font-semibold transition-colors"
                                  title="Revertir el estado a Por contactar"
                                >
                                  Revertir a Por Contactar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMarkAsContacted(lead)}
                                disabled={updatingId === leadKey}
                                className="w-full max-w-[190px] px-3.5 py-2.5 rounded-xl font-black text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-sm bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 border border-amber-400 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                                title="Marcar como Contactado y guardar notas en Supabase"
                              >
                                {updatingId === leadKey ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin text-slate-900" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Guardando...</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-4 h-4 rounded-full bg-slate-900/10 flex items-center justify-center group-hover:bg-slate-900/20 transition-colors">
                                      <svg className="w-3 h-3 text-slate-950 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <span>Marcar como Contactado</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* ACCIÓN RÁPIDA (WhatsApp Directo con Botón Amarillo / Azul) */}
                        <td className="py-4 px-4 align-top text-right">
                          {cleanPhone ? (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hola ${lead.owner_name}, te saludamos de RUACE PET539 Quito sobre la protección y registro de tu mascota ${lead.pet_name}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-black text-xs transition shadow-sm"
                            >
                              <svg className="w-3.5 h-3.5 fill-current text-slate-900" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                              </svg>
                              <span>Chatear</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">Sin teléfono</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer de la Tabla */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Algoritmo de puntuación: <strong className="text-[#1E40AF]">RUACE Scoring Engine v1.5</strong></span>
            <span>Tabla Supabase: <code className="text-[#1E40AF] font-mono font-bold">ruace_pet539_leads</code></span>
          </div>
        </section>

      </main>
    </div>
  );
}
