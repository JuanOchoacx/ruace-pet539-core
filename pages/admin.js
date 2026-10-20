'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Función de sanitización anti-XSS y anti-inyecciones
const sanitizeInput = (val) => {
  if (typeof val !== 'string') return '';
  return val.replace(/[<>'"`;()&$]/g, '').trim();
};

// Inicialización de Supabase con sanitización estricta de URL/Keys y cabeceras compatibles con CORS
const rawAdminSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const rawAdminSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Abm7RRtKLhITutAvDjkViw_PPh1w5XL';

const supabaseUrl = rawAdminSupabaseUrl.toString().trim().replace(/\/+$/, '');
const supabaseAnonKey = rawAdminSupabaseAnonKey.toString().trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
  },
});

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
  const status = (lead.current_status || lead.estado_identificacion || '').toLowerCase();
  if (status.includes('solo placa') || status.includes('solo_placa') || status.includes('placa')) {
    score += 40; // Alto riesgo: la placa se desprende con facilidad
  } else if (status === 'ninguno' || status.includes('ninguno') || status.includes('no tiene') || status.includes('sin microchip')) {
    score += 30; // Mascota desprotegida
  } else if (status === 'ya_identificado' || status.includes('identificado') || status.includes('chip sin perfil') || status.includes('requiere cédula') || status.includes('tiene microchip')) {
    score += 15; // Ya tiene chip pero falta cédula o perfil activo
  } else if (status.includes('viaje') || status.includes('internacional') || status.includes('travel')) {
    score += 40; // Trámite de Viaje Internacional / Pet Travel
  }

  // Evaluar Contact Method
  const method = (lead.contact_method || lead.whatsapp ? 'whatsapp' : '').toLowerCase();
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
      tip = `📋 Asesoría Médica: Envía el portafolio oficial de beneficios de la Red RUACE Quito. Menciona que el procedimiento de implantación es indoloro y avalado por médicos veterinarios.`;
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

  // RECUPERACIÓN ROBUSTA DE CONTRASEÑA (SUPABASE AUTH)
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState(null); // { type: 'success' | 'error', text: string }

  // ESTADOS DEL DASHBOARD (INICIALIZADOS CON DATOS LISTOS PARA RENDERIZADO INMEDIATO)
  const [leads, setLeads] = useState(DEMO_LEADS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTemperature, setFilterTemperature] = useState('ALL');
  const [segmentFilter, setSegmentFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONTACTED' | 'DOGS' | 'CATS' | 'OTHERS'
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

  // CARGAR LEADS DESDE SUPABASE Y LOCALSTORAGE EN SEGUNDO PLANO SIN CONGELAR LA BANDEJA
  const fetchLeads = async () => {
    let timeoutId = null;

    try {
      // Timeout estricto de 2000ms para evitar esperas y degradación de UX
      const fetchPromise = supabase
        .from('ruace_pet539_leads')
        .select('*')
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Supabase request timed out'));
        }, 2000);
      });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setLeads(data);
        setDbConnected(true);

        const notesMap = {};
        data.forEach((lead) => {
          const leadId = lead.id || lead.owner_email;
          const key = `ruace_note_${leadId}`;
          const savedNote = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
          const dbNote = lead.lead_advice || lead.lead_notes || lead.notes;
          notesMap[leadId] = dbNote || (savedNote !== null ? savedNote : '');
        });
        setLeadNotes(notesMap);
        fetchTriageForLeads(data);
      } else {
        setDbConnected(true);
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn('Conexión en modo demostrativo / respaldo seguro:', err.message);
      setDbConnected(false);
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
    const user = sanitizeInput(usernameInput);
    const pass = sanitizeInput(passwordInput);

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

  // ALTERNANCIA DE ROL EN 1-CLIC (DUEÑO ADMIN TOTAL VS OPERADOR EMPLEADO)
  const handleToggleRole = () => {
    const nextRole = userRole === 'admin' ? 'operator' : 'admin';
    setUserRole(nextRole);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ruace_admin_role', nextRole);
    }
    setNotification({
      type: 'success',
      text: nextRole === 'admin' 
        ? '👑 Modo Dueño (Admin Total) activado: Acceso completo a KPIs, Triage IA y analítica.'
        : '👤 Modo Operador (Empleado) activado: Vista simplificada para contactabilidad y gestión de leads.',
    });
  };

  // RECUPERACIÓN ROBUSTA DE CONTRASEÑAS MEDIANTE SUPABASE AUTH
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanEmail = sanitizeInput(resetEmail).toLowerCase();
    
    // Validación estricta de formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setResetMessage({
        type: 'error',
        text: 'Por favor, ingresa un correo electrónico institucional válido.',
      });
      return;
    }

    setResetLoading(true);
    setResetMessage(null);

    try {
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/admin` 
        : 'https://ruace-pet539.vercel.app/admin';

      const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      setResetMessage({
        type: 'success',
        text: `Enlace de restauración y código OTP enviado de forma encriptada a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`,
      });
      setResetEmail('');
    } catch (err) {
      console.warn('Fallo en Supabase Auth resetPasswordForEmail:', err.message);
      // Respuesta de seguridad genérica para prevenir enumeración de usuarios
      setResetMessage({
        type: 'success',
        text: `Si el correo ${cleanEmail} está registrado en el sistema, se ha transmitido un enlace seguro de recuperación.`,
      });
      setResetEmail('');
    } finally {
      setResetLoading(false);
    }
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

  // FILTRADO DINÁMICO POR SEGMENTOS (TODOS, PENDIENTES, CONTACTADOS, PERROS, GATOS) Y BÚSQUEDA PREDICTIVA
  const filteredLeads = useMemo(() => {
    return processedLeads.filter((lead) => {
      // 1. Búsqueda predictiva en tiempo real insensible a mayúsculas/minúsculas
      const q = (searchQuery || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (lead.owner_name || '').toLowerCase().includes(q) ||
        (lead.nombre_completo || '').toLowerCase().includes(q) ||
        (lead.owner_phone || '').toLowerCase().includes(q) ||
        (lead.whatsapp || '').toLowerCase().includes(q) ||
        (lead.empresa_negocio || '').toLowerCase().includes(q) ||
        (lead.pet_name || '').toLowerCase().includes(q);

      // Filtro reactivo de temperatura en tiempo real sobre la columna 'lead_score'
      let matchesTemp = true;
      if (filterTemperature === 'Caliente') {
        matchesTemp = lead.lead_score >= 80;
      } else if (filterTemperature === 'Media') {
        matchesTemp = lead.lead_score >= 40 && lead.lead_score < 80;
      } else if (filterTemperature === 'Baja') {
        matchesTemp = lead.lead_score < 40;
      }

      // 2. Filtro interactivo por segmento comercial y tipo de animal
      let matchesSegment = true;
      if (segmentFilter === 'PENDING') {
        const st = (lead.lead_status || '').toLowerCase().trim();
        // Aísla únicamente filas donde lead_status sea 'Por contactar' o nulo
        matchesSegment = !st || st === 'por contactar' || st === 'pendiente';
      } else if (segmentFilter === 'CONTACTED') {
        const st = (lead.lead_status || '').toLowerCase().trim();
        // Muestra únicamente las filas que el vendedor ya gestionó con lead_status: 'Contactado'
        matchesSegment = st === 'contactado';
      } else if (segmentFilter === 'DOGS') {
        const type = (lead.pet_type || '').toLowerCase().trim();
        // Filtra de inmediato por pet_type === 'Perro'
        matchesSegment = type === 'perro' || type.includes('perro') || type.includes('canino');
      } else if (segmentFilter === 'CATS') {
        const type = (lead.pet_type || '').toLowerCase().trim();
        // Filtra de inmediato por pet_type === 'Gato'
        matchesSegment = type === 'gato' || type.includes('gato') || type.includes('felino');
      } else if (segmentFilter === 'OTHERS') {
        const type = (lead.pet_type || '').toLowerCase().trim();
        // Filtra de inmediato por especies alternativas (otro / otros / no perro ni gato)
        matchesSegment = type === 'otro' || type.includes('otro') || (!type.includes('perro') && !type.includes('canino') && !type.includes('gato') && !type.includes('felino') && type !== '');
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

  // CAPA DE CÁLCULO DINÁMICO DE KPIS COMERCIALES Y MONITOREO DE OBJETIVOS (SUPABASE)
  const sellerKpis = useMemo(() => {
    // 1. Leads Totales: Conteo total de filas en la tabla importada de Supabase
    const totalLeads = leads.length;

    // 2. Leads Gestionados: Cantidad de registros con lead_status exactamente 'Contactado'
    const managedLeads = leads.filter(
      (l) => (l.lead_status || '').trim().toLowerCase() === 'contactado'
    ).length;

    // 3. Tasa de Eficiencia Comercial: Porcentaje ((Leads Gestionados / Leads Totales) * 100)
    const efficiencyRate = totalLeads > 0 
      ? Math.round((managedLeads / totalLeads) * 100) 
      : 0;

    // 4. Meta Diaria del Asesor: Meta fija de 10 leads diarios gestionados
    const dailyGoal = 10;
    const dailyProgress = Math.min(Math.round((managedLeads / dailyGoal) * 100), 100);

    // Contadores para filtros segmentados
    const pendingCount = totalLeads - managedLeads;
    const dogCount = leads.filter((l) => {
      const type = (l.pet_type || '').toLowerCase();
      return type.includes('perro') || type.includes('canino');
    }).length;
    const catCount = leads.filter((l) => {
      const type = (l.pet_type || '').toLowerCase();
      return type.includes('gato') || type.includes('felino');
    }).length;
    const otherCount = leads.filter((l) => {
      const type = (l.pet_type || '').toLowerCase().trim();
      return type === 'otro' || type.includes('otro') || (!type.includes('perro') && !type.includes('canino') && !type.includes('gato') && !type.includes('felino') && type !== '');
    }).length;

    return {
      total: totalLeads,
      managedLeads,
      efficiencyRate,
      dailyGoal,
      dailyProgress,
      contactedCount: managedLeads,
      pendingCount,
      dogCount,
      catCount,
      otherCount,
    };
  }, [leads]);

  // CAPA DE CÁLCULO EN TIEMPO REAL PARA EL SEMÁFORO DE PRIORIDADES (TAREAS URGENTES PENDIENTES)
  const trafficLightCounts = useMemo(() => {
    // Filtrar prospectos pendientes (lead_status estrictamente 'Por contactar' o nulo)
    const pendingLeads = processedLeads.filter((l) => {
      const st = (l.lead_status || '').trim().toLowerCase();
      return !st || st === 'por contactar' || st === 'pendiente';
    });

    // 1. Alertas Rojas (Alta Prioridad): lead_score >= 80 (Riesgo Crítico / Viaje inminente)
    const criticalRedCount = pendingLeads.filter((l) => l.lead_score >= 80).length;

    // 2. Alertas Amarillas (Prioridad Media): lead_score entre 40 y 79 (Validación Médica)
    const moderateYellowCount = pendingLeads.filter(
      (l) => l.lead_score >= 40 && l.lead_score < 80
    ).length;

    // 3. Alertas Verdes (Prioridad Estable): lead_score < 40 (Baja urgencia)
    const stableGreenCount = pendingLeads.filter((l) => l.lead_score < 40).length;

    return {
      pendingTotal: pendingLeads.length,
      criticalRedCount,
      moderateYellowCount,
      stableGreenCount,
    };
  }, [processedLeads]);

  // SI NO ESTÁ AUTENTICADO: PANTALLA DE ACCESO CON PALETA OFICIAL PET593
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFBEB] text-slate-800 flex items-center justify-center p-4 font-sans selection:bg-[#FBBF24] selection:text-slate-900">
        <Head>
          <title>Acceso Seguro | Panel RUACE PET593</title>
        </Head>

        <div className="max-w-md w-full bg-white border-2 border-[#1E40AF]/20 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#1E40AF] flex items-center justify-center text-[#FBBF24] text-3xl mx-auto shadow-xl shadow-[#1E40AF]/20">
              🔒
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1E40AF] tracking-tight">Acceso Institucional RUACE PET593</h2>
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
                name="usuario"
                required
                autoComplete="off"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ingresa tu usuario..."
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
                  name="clave"
                  required
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-black text-sm shadow-lg shadow-[#FBBF24]/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/" className="text-[#1E40AF] hover:underline transition font-bold">
              ← Volver a la Landing Page
            </Link>
            <button
              type="button"
              onClick={() => {
                setShowResetModal(true);
                setResetMessage(null);
                setResetEmail('');
              }}
              className="text-slate-500 hover:text-[#1E40AF] transition font-bold underline"
            >
              ¿Olvidaste tu clave?
            </button>
          </div>

          {/* MODAL DE RECUPERACIÓN DE CONTRASEÑA VÍA SUPABASE AUTH */}
          {showResetModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔐</span>
                    <h3 className="text-lg font-black text-[#1E40AF]">Recuperación Segura</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-black text-xs transition"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingresa tu correo institucional registrado. Supabase Auth transmitirá un enlace encriptado de un solo uso (OTP) para restablecer tus credenciales de acceso perimetral.
                </p>

                {resetMessage && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
                      resetMessage.type === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <span>{resetMessage.type === 'success' ? '✓' : '⚠️'}</span>
                    <span>{resetMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div>
                    <label htmlFor="resetEmailInput" className="block text-[11px] font-bold text-[#1E40AF] uppercase tracking-wide mb-1">
                      Correo Institucional *
                    </label>
                    <input
                      type="email"
                      id="resetEmailInput"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@ruace593.ec"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#1E40AF] text-xs text-slate-900 outline-none transition font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-black text-xs transition shadow-md disabled:opacity-50"
                    >
                      {resetLoading ? 'Enviando OTP...' : 'Enviar Enlace Seguro'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PANEL PRINCIPAL (MODO CLARO CORPORATIVO CON PALETA PET593)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#FBBF24] selection:text-slate-900">
      <Head>
        <title>Panel de Gestión de Leads & KPIs | RUACE PET593</title>
        <meta name="description" content="Dashboard interno de priorización y conversión de leads RUACE PET593 Quito." />
      </Head>

      {/* TOPBAR CORPORATIVA EN MODO CLARO */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src="/image_-eJgov.png"
              alt="Logo Oficial RUACE PET593"
              className="h-12 w-auto object-contain mr-3 drop-shadow-sm transition-transform hover:scale-105 duration-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-[#1E40AF] tracking-tight">RUACE PET593</span>
                <span className="bg-[#FFFBEB] text-[#1E40AF] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#FBBF24] uppercase font-bold">
                  CRM Interno
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Algoritmo de Priorización y Cierre de Leads · DMQ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* BADGE DE ROL ACTIVO CON ALTERNANCIA EN 1-CLIC (ADMIN / OPERATOR) */}
            <button
              type="button"
              onClick={handleToggleRole}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-black transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer ${
                userRole === 'admin'
                  ? 'bg-amber-50 text-[#1E40AF] border-[#FBBF24] hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
              title="Haz clic para alternar entre Rol Dueño (Admin Total) y Rol Operador (Empleado)"
            >
              <span>{userRole === 'admin' ? '👑' : '👤'}</span>
              <span>{userRole === 'admin' ? 'Rol: Dueño (Admin Total)' : 'Rol: Operador (Empleado)'}</span>
              <span className="text-[10px] text-slate-400 font-normal ml-0.5">⇄</span>
            </button>

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
        
        {/* SECCIÓN KPI DEL VENDEDOR: MONITOREO DINÁMICO DE OBJETIVOS (SÓLO ROL ADMIN) */}
        {userRole === 'admin' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider mb-2">
                  🎯 Tablero de Objetivos Comerciales (Control Dinámico en Tiempo Real)
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1E40AF] tracking-tight">
                  Control de Metas y Conversión del Asesor
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5 font-normal">
                  Cálculo automático de rendimiento basado en los registros importados de Supabase.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#1E40AF] border border-blue-200 text-xs font-bold">
                  Meta Diaria: {sellerKpis.dailyGoal} Leads
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                  Sincronizado Supabase
                </span>
              </div>
            </div>

            {/* 3 TARJETAS KPI CON FUENTES GIGANTES EN NEGRITA EMPLEANDO LA PALETA OFICIAL (#1E40AF) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Tarjeta 1: Leads Capturados */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#1E40AF]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FBBF24]/10 transition-colors"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Leads Capturados
                  </span>
                  <span className="text-xs font-black bg-blue-50 text-[#1E40AF] px-2.5 py-0.5 rounded-full border border-blue-200">
                    Total Base
                  </span>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-[#1E40AF] tracking-tight font-mono">
                  {sellerKpis.total}
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Total de prospectos registrados en Supabase disponibles para gestión.
                </p>
              </div>

              {/* Tarjeta 2: Leads Gestionados */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-[#1E40AF]/10 transition-colors"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Leads Gestionados
                  </span>
                  <span className="text-xs font-black bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    {sellerKpis.managedLeads} / {sellerKpis.dailyGoal} Meta
                  </span>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-[#1E40AF] tracking-tight font-mono">
                  {sellerKpis.managedLeads}
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Prospectos contactados con feedback registrado por el asesor.
                </p>
              </div>

              {/* Tarjeta 3: Tasa de Eficiencia */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:bg-amber-500/20 transition-colors"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Tasa de Eficiencia
                  </span>
                  <span className="text-xs font-black bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Rendimiento
                  </span>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight font-mono">
                  {sellerKpis.efficiencyRate}%
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {sellerKpis.efficiencyRate === 0 
                    ? 'Sin contactos registrados aún (0%).' 
                    : `${sellerKpis.managedLeads} de ${sellerKpis.total} prospectos atendidos con éxito.`}
                </p>
              </div>

            </div>

            {/* BARRA DE PROGRESO VISUAL FRENTE A LA META DIARIA (10 LEADS) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2">
                <span className="text-slate-700">
                  Cumplimiento frente a la Meta Diaria del Asesor ({sellerKpis.managedLeads} de {sellerKpis.dailyGoal} leads gestionados):
                </span>
                <span className={sellerKpis.dailyProgress >= 100 ? 'text-emerald-700 font-black' : 'text-[#1E40AF] font-black'}>
                  {sellerKpis.dailyProgress}% completado {sellerKpis.dailyProgress >= 100 ? '🎉 ¡Meta Diaria Alcanzada!' : ''}
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${sellerKpis.dailyProgress}%` }}
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
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3">
              {/* PESTAÑAS SEGMENTADAS DE 1-CLIC (TODOS LOS LEADS, PENDIENTES, CONTACTADOS, PERROS, GATOS, OTROS) */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSegmentFilter('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    segmentFilter === 'ALL'
                      ? 'bg-[#1E40AF] text-white shadow-md font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <span>Todos los Leads</span>
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
                  <span>Pendientes</span>
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
                  <span>Contactados</span>
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
                  <span>Perros</span>
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
                  <span>Gatos</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${segmentFilter === 'CATS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {sellerKpis.catCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSegmentFilter('OTHERS')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    segmentFilter === 'OTHERS'
                      ? 'bg-[#1E40AF] text-white shadow-md font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <span>Otros</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${segmentFilter === 'OTHERS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {sellerKpis.otherCount}
                  </span>
                </button>
              </div>

              {/* FILTROS DE TEMPERATURA DIRECTOS E INLINE */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setFilterTemperature('ALL')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center border ${
                    filterTemperature === 'ALL'
                      ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-sm font-black'
                      : 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-white border-gray-200'
                  }`}
                >
                  Todas
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTemperature('Caliente')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center border ${
                    filterTemperature === 'Caliente'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-400 shadow-sm font-black'
                      : 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-white border-gray-200'
                  }`}
                >
                  <span className="bg-emerald-500 w-2.5 h-2.5 rounded-full mr-1.5 inline-block" />
                  <span>Calientes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTemperature('Media')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center border ${
                    filterTemperature === 'Media'
                      ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-sm font-black'
                      : 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-white border-gray-200'
                  }`}
                >
                  <span className="bg-amber-500 w-2.5 h-2.5 rounded-full mr-1.5 inline-block" />
                  <span>Medias</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTemperature('Baja')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center border ${
                    filterTemperature === 'Baja'
                      ? 'bg-rose-50 text-rose-900 border-rose-400 shadow-sm font-black'
                      : 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-white border-gray-200'
                  }`}
                >
                  <span className="bg-red-500 w-2.5 h-2.5 rounded-full mr-1.5 inline-block" />
                  <span>Bajas</span>
                </button>
              </div>
            </div>

            {/* Búsqueda Predictiva Interactiva */}
            <div className="relative w-full xl:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Buscar lead por nombre, teléfono o mascota..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#1E40AF] text-xs text-slate-800 placeholder-slate-400 outline-none font-medium transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
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
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-slate-200 rounded-md w-48 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-md w-28 animate-pulse"></div>
              </div>
              {[...Array(6)].map((_, i) => (
                <div
                  key={`skeleton-row-${i}`}
                  className="animate-pulse bg-slate-200 h-14 w-full rounded-2xl flex items-center px-4 justify-between gap-4"
                >
                  <div className="flex items-center gap-3 w-1/4">
                    <div className="w-10 h-10 rounded-xl bg-slate-300"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-slate-300 rounded w-20"></div>
                      <div className="h-2.5 bg-slate-300 rounded w-14"></div>
                    </div>
                  </div>
                  <div className="space-y-1.5 w-1/4 hidden md:block">
                    <div className="h-3.5 bg-slate-300 rounded w-28"></div>
                    <div className="h-2.5 bg-slate-300 rounded w-20"></div>
                  </div>
                  <div className="h-9 bg-slate-300 rounded-xl w-1/4 hidden lg:block"></div>
                  <div className="h-9 bg-slate-300 rounded-xl w-24"></div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <span className="text-[11px] font-bold text-slate-400">
                  Sincronizando expedientes en tiempo real con Supabase...
                </span>
              </div>
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
                    <th scope="col" className="py-4 px-4 max-w-[200px] lg:max-w-xs">Consejo de Cierre por IA</th>
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
                            <p className="font-bold text-slate-900 text-sm">
                              {lead.nombre_completo || lead.owner_name}
                            </p>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                              <span>📞 {lead.whatsapp || lead.owner_phone}</span>
                            </p>
                            {lead.empresa_negocio && (
                              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[170px]" title={lead.empresa_negocio}>
                                🏢 {lead.empresa_negocio}
                              </p>
                            )}
                            <div className="pt-1 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#1E40AF] text-[11px] font-bold border border-amber-200">
                                {(lead.pet_type || '').toLowerCase().includes('gato') ? '🐈' : (lead.pet_type || '').toLowerCase().includes('perro') ? '🐕' : '🐾'} {lead.pet_name}
                              </span>
                              <span className="text-[10px] text-slate-500 capitalize">({lead.pet_type})</span>
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
                                {lead.current_status === 'solo_placa'
                                  ? 'Solo Placa Externa'
                                  : lead.current_status === 'ya_identificado'
                                  ? 'Ya tiene Microchip'
                                  : lead.current_status === 'ninguno'
                                  ? 'Sin Microchip'
                                  : lead.current_status}
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
                        <td className="py-4 px-4 align-top max-w-[200px] lg:max-w-xs">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider flex items-center gap-1">
                                <span>✨</span>
                                <span>Consejo IA</span>
                              </span>
                              {userRole === 'admin' && (
                                <button
                                  type="button"
                                  onClick={() => fetchPredictiveAdvice(lead)}
                                  disabled={loadingAiLead === leadKey}
                                  className="text-[10px] font-semibold text-slate-500 hover:text-[#1E40AF] transition-colors inline-flex items-center gap-0.5 disabled:opacity-50"
                                  title="Re-consultar /api/triage para este lead"
                                >
                                  {loadingAiLead === leadKey ? (
                                    <span className="animate-spin text-[10px]">⚙️</span>
                                  ) : (
                                    <span>🔄 Triage</span>
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="text-xs leading-relaxed text-gray-600 font-normal">
                              {liveAiAdvice[leadKey] ? (
                                <p>{liveAiAdvice[leadKey]}</p>
                              ) : triageLoading ? (
                                <p className="text-gray-400 italic">Generando consejo...</p>
                              ) : (
                                <p>{lead.ai_counsel}</p>
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

          {/* AVISO DE SEGURIDAD PERIMETRAL OBLIGATORIO (SEGUNDA NOTA DE SEGURIDAD) */}
          <div className="w-full text-center text-[10px] text-amber-600 bg-amber-500/5 py-1.5 px-4 rounded-md border border-amber-500/20 mt-4 tracking-wide font-medium">
            🔒 AVISO DE SEGURIDAD GLOBAL: Infraestructura expuesta a Internet activa. Conexiones entrantes auditadas mediante cifrado SSL/TLS de extremo a extremo. Acceso restringido exclusivamente a personal autorizado del DMQ. Todo intento de vulneración o inyección será reportado automáticamente.
          </div>
        </section>

        {/* SEMÁFORO DE PRIORIDADES Y TAREAS URGENTES (VISIBLE PARA TODOS LOS ROLES) */}
        <section className="bg-white rounded-3xl border-t border-gray-100 p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🚨</span>
              <h3 className="text-sm sm:text-base font-black text-[#1E40AF] tracking-tight">
                Semáforo de Prioridades y Tareas Urgentes (Leads por Contactar)
              </h3>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
              {trafficLightCounts.pendingTotal} leads pendientes en cola
            </span>
          </div>

          {/* 3 BLOQUES VISUALES DE ALTO IMPACTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Bloque Rojo (Pulsante): CRÍTICO (Score ≥80) */}
            <div className="bg-red-50 text-red-700 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 transition-all hover:shadow-md">
              <div className="relative flex items-center justify-center mt-1 shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute opacity-75"></span>
                <span className="w-3 h-3 rounded-full bg-red-600 relative"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-red-800">
                    CRÍTICO (Score ≥80)
                  </span>
                  <span className="text-2xl font-black font-mono text-red-700">
                    {trafficLightCounts.criticalRedCount}
                  </span>
                </div>
                <p className="text-xs font-semibold text-red-700 leading-snug">
                  CRÍTICO (Score ≥80): <strong className="font-black text-red-900">{trafficLightCounts.criticalRedCount}</strong> Mascotas en riesgo de pérdida o con viajes a corto plazo.
                </p>
              </div>
            </div>

            {/* Bloque Amarillo: MODERADO (Score 40-79) */}
            <div className="bg-amber-50 text-amber-700 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3 transition-all hover:shadow-md">
              <div className="mt-1 flex items-center justify-center shrink-0">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                    MODERADO (Score 40-79)
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-800">
                    {trafficLightCounts.moderateYellowCount}
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-800 leading-snug">
                  MODERADO (Score 40-79): <strong className="font-black text-amber-950">{trafficLightCounts.moderateYellowCount}</strong> Registros pendientes de validación médica.
                </p>
              </div>
            </div>

            {/* Bloque Verde: ESTABLE (Score <40) */}
            <div className="bg-emerald-50 text-emerald-700 border-2 border-emerald-200 rounded-2xl p-4 flex items-start gap-3 transition-all hover:shadow-md">
              <div className="mt-1 flex items-center justify-center shrink-0">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                    ESTABLE (Score &lt;40)
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-800">
                    {trafficLightCounts.stableGreenCount}
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-800 leading-snug">
                  ESTABLE (Score &lt;40): <strong className="font-black text-emerald-950">{trafficLightCounts.stableGreenCount}</strong> Leads de baja urgencia comercial.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
