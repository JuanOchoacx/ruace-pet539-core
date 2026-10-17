'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';

// Función de sanitización anti-XSS y anti-inyecciones en formularios
const sanitizeInput = (val) => {
  if (typeof val !== 'string') return '';
  return val.replace(/[<>'"`;()&$]/g, '').trim();
};

// Inicialización del cliente Supabase con cabeceras de seguridad
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Abm7RRtKLhITutAvDjkViw_PPh1w5XL';
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  global: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  },
});

export default function Home() {
  // Estado del formulario con los campos exactos de la tabla 'ruace_pet539_leads' y Fase 2
  const [formData, setFormData] = useState({
    nombre_completo: '',
    owner_name: '',
    whatsapp: '',
    owner_phone: '',
    owner_email: '',
    empresa_negocio: '',
    presupuesto_estimado: 'basico',
    pet_name: '',
    pet_type: 'perro',
    tipo_mascota: 'perro',
    service_type: 'Combo Completo',
    current_status: 'ninguno',
    estado_identificacion: 'ninguno',
    pet_travel_intent: 'No planeo viajar (Protección a nivel nacional)',
    contact_method: 'WhatsApp',
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // Primer FAQ abierto por defecto
  const [openTestimonial, setOpenTestimonial] = useState(0); // Primer testimonio abierto por defecto
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false); // Dropdown de servicios en footer
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const toggleTestimonial = (index) => {
    setOpenTestimonial(openTestimonial === index ? null : index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'nombre_completo' ? { owner_name: value } : {}),
      ...(name === 'owner_name' ? { nombre_completo: value } : {}),
      ...(name === 'whatsapp' ? { owner_phone: value } : {}),
      ...(name === 'owner_phone' ? { whatsapp: value } : {}),
      ...(name === 'tipo_mascota' ? { pet_type: value } : {}),
      ...(name === 'pet_type' ? { tipo_mascota: value } : {}),
      ...(name === 'estado_identificacion' ? { current_status: value } : {}),
      ...(name === 'current_status' ? { estado_identificacion: value } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      setStatusMessage({
        type: 'error',
        text: 'Debes aceptar la Política de Privacidad y el Tratamiento de Datos Personales en Ecuador (Ley LOPDP) para continuar.',
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      // Inserción automática y sanitizada en la tabla 'ruace_pet539_leads'
      const statusValue = sanitizeInput(formData.estado_identificacion || formData.current_status || 'ninguno');

      const travelValue = formData.service_type === 'Asesoría para Viajes'
        ? 'Viaje Internacional próximo (USA / Europa / LATAM)'
        : sanitizeInput(formData.pet_travel_intent);

      const fullNameValue = sanitizeInput(formData.nombre_completo || formData.owner_name);
      const whatsappValue = sanitizeInput(formData.whatsapp || formData.owner_phone);
      const businessValue = sanitizeInput(formData.empresa_negocio || '');
      const budgetValue = sanitizeInput(formData.presupuesto_estimado || 'basico');

      // Payload adaptado al backend con soporte dual de columnas
      const leadPayload = {
        // Nomenclatura oficial Fase 2
        nombre_completo: fullNameValue,
        whatsapp: whatsappValue,
        empresa_negocio: businessValue,
        presupuesto_estimado: budgetValue,
        // Columnas base del esquema
        owner_name: fullNameValue,
        owner_phone: whatsappValue,
        owner_email: sanitizeInput(formData.owner_email).toLowerCase(),
        pet_name: sanitizeInput(formData.pet_name),
        pet_type: sanitizeInput(formData.tipo_mascota || formData.pet_type || 'perro'),
        current_status: statusValue,
        pet_travel_intent: travelValue,
        contact_method: sanitizeInput(formData.contact_method),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('ruace_pet539_leads')
        .insert([leadPayload]);

      if (error) {
        // Si el schema no tiene aún las columnas nuevas, reintentar con las columnas originales para garantizar persistencia
        const fallbackPayload = {
          owner_name: fullNameValue,
          owner_phone: whatsappValue,
          owner_email: sanitizeInput(formData.owner_email).toLowerCase(),
          pet_name: sanitizeInput(formData.pet_name),
          pet_type: sanitizeInput(formData.tipo_mascota || formData.pet_type || 'perro'),
          current_status: statusValue,
          pet_travel_intent: travelValue,
          contact_method: sanitizeInput(formData.contact_method),
          created_at: new Date().toISOString(),
        };
        const { error: fallbackError } = await supabase
          .from('ruace_pet539_leads')
          .insert([fallbackPayload]);
        if (fallbackError) {
          throw fallbackError;
        }
      }

      setStatusMessage({
        type: 'success',
        text: `¡Excelente noticia! Los datos de ${formData.pet_name} han sido registrados con éxito en el sistema RUACE PET593. Un asesor veterinario se comunicará contigo vía ${formData.contact_method}.`,
      });

      // Limpiar formulario tras éxito
      setFormData({
        nombre_completo: '',
        owner_name: '',
        whatsapp: '',
        owner_phone: '',
        owner_email: '',
        empresa_negocio: '',
        presupuesto_estimado: 'basico',
        pet_name: '',
        pet_type: 'perro',
        tipo_mascota: 'perro',
        service_type: 'Combo Completo',
        current_status: 'ninguno',
        estado_identificacion: 'ninguno',
        pet_travel_intent: 'No planeo viajar (Protección a nivel nacional)',
        contact_method: 'WhatsApp',
      });
      setTermsAccepted(false);
    } catch (err) {
      console.error('Error al guardar en Supabase:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Ocurrió un error inesperado al conectar con la base de datos. Por favor, verifica tu conexión o intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // DATOS REALES DE TESTIMONIOS (ACORDEÓN COLAPSABLE VERTICAL INTERACTIVO)
  const testimonials = [
    {
      title: 'Lucy, la gata aventurera',
      petInfo: 'Gata Siamés (2 años)',
      tutor: 'Carolina V. · Quito',
      emoji: '🐱',
      story:
        'Lucy siempre salía a explorar los techos y cornisas del barrio en Villaflora. El miedo constante de que se desorientara y no supiera volver era una angustia diaria. Con su microchip subdérmico y su PETCÉDULA física con código QR inteligente, recuperé la tranquilidad total. La colocación en la clínica fue rápida, no sintió dolor y los doctores fueron sumamente atentos.',
      procedure: 'Microchip ISO + PETCÉDULA QR',
      badge: '✓ 100% Protegida en Casa',
    },
    {
      title: 'Rocky, el perrito explorador',
      petInfo: 'Golden Retriever (3 años)',
      tutor: 'Familia Mantilla · Quito',
      emoji: '🐕',
      story:
        'Rocky es muy juguetón y un día se asustó con fuegos artificiales y salió del portón. Estuvimos horas buscándolo desesperados por Monteserrín. Una familia vecina lo encontró, vio su PETCÉDULA física plastificada, escaneó el código QR con la cámara de su celular y nos llamó de inmediato por WhatsApp. El sistema funcionó al instante sin apps engorrosas.',
      procedure: 'Identificación Oficial Villaflora',
      badge: '✓ Retorno Seguro en <15 min',
    },
    {
      title: 'Bella, la cocker spaniel traviesa',
      petInfo: 'Cocker Spaniel (4 años)',
      tutor: 'Esteban P. & Mariana · Quito Sur',
      emoji: '🐾',
      story:
        'Bella siempre rompía y perdía las placas metálicas tradicionales jugando con otros perros en el parque. En Pet 593 le colocaron su microchip biocompatible y nos entregaron su PETCÉDULA física plastificada con chip. Ahora viajamos tranquilos dentro y fuera del país con su expediente médico activo 24/7 y su código único de 15 dígitos.',
      procedure: 'Brigada Veterinaria a Domicilio',
      badge: '✓ Identidad Inviolable',
    },
  ];

  // DATOS DEL ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
  const faqs = [
    {
      q: '¿La colocación del microchip le duele a mi mascota?',
      a: 'No duele. Es un procedimiento tan rápido y sencillo como ponerle una vacuna rutinaria. El microchip biocompatible es del tamaño de un grano de arroz, se implanta bajo la piel en segundos por un médico veterinario colegiado y tu peludito ni lo siente.',
    },
    {
      q: '¿Tiene algún costo mensual, suscripción o cobro recurrente?',
      a: '¡Ninguno! Es un PAGO ÚNICO de por vida. En RUACE PET593 no existen mensualidades, tarifas sorpresa ni renovaciones para mantener activo el perfil de tu mascota o consultar su historial médico QR.',
    },
    {
      q: '¿El microchip está homologado para viajar con Agrocalidad y normas IATA?',
      a: 'Sí, 100%. Todos nuestros microchips cumplen con el estándar internacional ISO 11784 e ISO 11785 (código de 15 dígitos irrepetible). Son los oficialmente requeridos por Agrocalidad en Ecuador, aerolíneas comerciales para vuelos internacionales y controles de bioseguridad para Galápagos.',
    },
    {
      q: '¿El microchip es un rastreador GPS o necesita recargarse?',
      a: 'No requiere baterías ni recargas. Es un transpondedor pasivo de tecnología RFID que dura toda la vida de tu mascota. Cualquier clínica veterinaria puede leerlo con un lector estándar, y cualquier persona con un celular puede escanear su PETCÉDULA física para contactarte de inmediato.',
    },
    {
      q: '¿Cómo coordino la cita en Villaflora o el servicio a domicilio?',
      a: 'Una vez completado el registro en línea, nuestro equipo veterinario te contacta de inmediato por WhatsApp (096 305 0719) para agendar tu cita en nuestra sede de Villaflora (Quito Sur) o coordinar la brigada de implantación a domicilio en cualquier sector del país.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#FBBF24] selection:text-slate-900">
      <Head>
        <title>RUACE PET593 | Identificación y Cédulas Oficiales para Mascotas en Ecuador</title>
        <meta
          name="description"
          content="Protege a tu mascota en Ecuador con microchip subdérmico oficial ISO 11784/85, PETCÉDULA física con QR médico dinámico y asesoría Pet Travel en Villaflora y todo el país."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* WRAPPER STICKY TOP: BANNER + NAVBAR */}
      <div className="sticky top-0 z-50">
        {/* TOP BAR BANNER (PET TRAVEL ADVISORY) */}
        <div className="bg-[#FBBF24] text-slate-900 text-xs sm:text-sm py-2 px-4 text-center font-black shadow-sm flex items-center justify-center gap-2 border-b border-amber-400">
          <span className="text-base inline-block">✈️</span>
          <span>¿Viajas pronto con tu peludito? Asesoría Pet Travel sin costo con tu registro RUACE PET593 en todo el país.</span>
        </div>

        {/* NAVBAR CON IDENTIDAD OFICIAL RUACE PET593 */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="#hero" className="flex items-center gap-2.5 group">
                <img
                  src="/pet593-logo.png"
                  alt="PET 593 ID - Registro e Identificación Oficial de Mascotas"
                  className="h-12 w-auto object-contain md:h-14 transition-transform duration-300 hover:scale-105"
                />
              </a>
            </div>

            <nav className="hidden lg:flex items-center space-x-7 text-sm font-bold text-slate-700">
              <a href="#hero" className="hover:text-[#1E40AF] transition-colors">Inicio</a>
              <a href="#pasos" className="hover:text-[#1E40AF] transition-colors">¿Cómo Funciona?</a>
              <a href="#registro" className="hover:text-[#1E40AF] transition-colors">Registro Oficial</a>
              <a href="#testimonios" className="hover:text-[#1E40AF] transition-colors">Historias Felices</a>
              <a href="#faq" className="hover:text-[#1E40AF] transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="#registro"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-black text-sm text-slate-900 bg-[#FBBF24] hover:bg-[#F59E0B] shadow-md shadow-[#FBBF24]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Registrar Mascota
              </a>
            </div>
          </div>
        </header>
      </div>

      {/* =========================================================================
          BLOQUE 1: HERO SECTION (OPTIMIZADO - INTACTO)
          Lienzo pastel #E0F2FE, doodles lineales, silueta animada de tutora
          sosteniendo al perro Corgi y la Petcédula 3D micro-compacta con chip dorado.
          ========================================================================= */}
      <section id="hero" className="relative overflow-hidden bg-[#E0F2FE] pt-12 lg:pt-16 pb-0 border-b border-sky-200/70">
        
        {/* DOODLES Y ELEMENTOS VECTORIALES LINEALES */}
        {/* Doodle 1: Huella superior izquierda */}
        <div className="absolute top-8 left-8 sm:left-16 text-[#1E40AF]/30 animate-pulse pointer-events-none">
          <svg className="w-10 h-10 sm:w-14 sm:h-14 rotate-[-20deg]" fill="currentColor" viewBox="0 0 24 24">
            <ellipse cx="12" cy="15" rx="4" ry="4.5" />
            <circle cx="6.5" cy="9.5" r="2" />
            <circle cx="10" cy="7" r="2" />
            <circle cx="14" cy="7" r="2" />
            <circle cx="17.5" cy="9.5" r="2" />
          </svg>
        </div>

        {/* Doodle 2: Corazón lineal flotante cerca del kicker */}
        <div className="absolute top-12 left-1/2 text-rose-400/50 pointer-events-none hidden md:block">
          <svg className="w-7 h-7 rotate-[15deg]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>

        {/* Doodle 3: Línea curva conectora / Guía visual con estrella */}
        <div className="absolute top-24 right-16 sm:right-32 text-[#1E40AF]/35 pointer-events-none hidden sm:block">
          <svg className="w-16 h-16 rotate-12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeDasharray="3 3" d="M3 17c4-8 10-10 18-2" />
            <circle cx="21" cy="15" r="2" fill="currentColor" />
          </svg>
        </div>

        {/* Doodle 4: Destello de protección inferior izquierda */}
        <div className="absolute bottom-10 left-10 text-[#F59E0B]/70 pointer-events-none">
          <svg className="w-8 h-8 rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" />
          </svg>
        </div>

        {/* Doodle 5: Huellita derecha flotante */}
        <div className="absolute bottom-12 right-8 sm:right-16 text-[#1E40AF]/25 pointer-events-none hidden lg:block">
          <svg className="w-12 h-12 rotate-[25deg]" fill="currentColor" viewBox="0 0 24 24">
            <ellipse cx="12" cy="15" rx="4" ry="4.5" />
            <circle cx="6.5" cy="9.5" r="2" />
            <circle cx="10" cy="7" r="2" />
            <circle cx="14" cy="7" r="2" />
            <circle cx="17.5" cy="9.5" r="2" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-10 lg:gap-12">
            
            {/* BLOQUE DE CONTENIDOS (lg:col-span-6): KICKER, COPY DE IMPACTO Y CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left pb-12 lg:pb-16">
              
              {/* KICKER SUPERIOR: AUTORIDAD Y SOCIAL PROOF VALIDADO */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#1E40AF]/30 text-[#1E40AF] text-xs sm:text-sm font-black shadow-sm tracking-wider uppercase">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#1E40AF] animate-ping"></span>
                CENSO NACIONAL DE IDENTIFICACIÓN · +45,000 REGISTRADAS
              </div>

              {/* TÍTULO PRINCIPAL: DOLOR DE PÉRDIDA Y SEGURIDAD */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6 max-w-3xl text-[#1E3A8A]">
                Dale a tu peludito una identidad segura y protege su regreso a casa.
              </h1>

              {/* PÁRRAFO DESCRIPTIVO */}
              <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
                El microchip permanente y su <strong className="text-[#1E40AF] font-black">PETCÉDULA física</strong> se vinculan a un perfil digital activo 24/7. <strong className="text-slate-900 font-black">Pago único</strong> sin mensualidades ocultas. Homologado bajo la norma internacional ISO 11784/85 para lectura inmediata en Ecuador y procesos Pet Travel.
              </p>

              {/* BOTONES DE ACCIÓN PRINCIPALES */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#registro"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#1E40AF] hover:bg-blue-900 text-white font-black text-sm sm:text-base shadow-xl shadow-[#1E40AF]/25 transition-all hover:scale-105 active:scale-95 border-2 border-[#1E40AF] gap-2.5 cursor-pointer group"
                >
                  <span>Registrar Mi Mascota</span>
                  <svg className="w-5 h-5 text-[#FBBF24] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>

                <a
                  href="#registro"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-full bg-white hover:bg-slate-50 text-[#1E40AF] font-bold text-sm sm:text-base shadow-md shadow-sky-900/5 border-2 border-[#1E40AF]/20 transition-all hover:scale-105 active:scale-95 gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[#1E40AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Asesoría Pet Travel</span>
                </a>
              </div>

              {/* ACREDITACIONES DIRECTAS Y MÉTRICA CLAVE DEL SCRAPING */}
              <div className="pt-4 border-t border-sky-300/80 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-600 font-bold">
                <span className="inline-flex items-center gap-1.5 text-[#1E40AF] bg-white px-2.5 py-1 rounded-full border border-sky-200 shadow-xs">
                  <span className="text-[#F59E0B] font-black">★</span> +45,000 Mascotas Identificadas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#1E40AF] font-black">✓</span> PAGO ÚNICO sin mensualidades
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#1E40AF] font-black">✓</span> Lectura universal con smartphone
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#1E40AF] font-black">✓</span> Homologado Agrocalidad / IATA
                </span>
              </div>

            </div>

            {/* BLOQUE VISUAL MULTIMEDIA DERECHO: TUTORA CON CORGI + MICRO-PETCÉDULA 3D */}
            <div className="lg:col-span-6 flex justify-center items-end relative h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[620px] self-end">
              
              {/* Resplandor suave decorativo de fondo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-white/60 rounded-full blur-3xl pointer-events-none"></div>

              {/* MICRO-TARJETA FLOTANTE 3D VIBRANTE (REFERENCIA OFICIAL PET ID ECUADOR - CORGI) */}
              <div className="absolute bottom-4 right-2 z-30 w-[240px] h-[145px] md:w-[260px] md:h-[155px] rounded-xl p-2.5 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(30,64,175,0.3)] border border-white/20 transform rotate-1 -rotate-y-6 rotate-x-6 scale-95 lg:scale-100 hover:scale-105 hover:rotate-0 transition-all duration-500 ease-out select-none group bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0284C7]">
                
                {/* Trama de vectores lineales en ondas de seguridad */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="security-waves-3d" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 0 10 Q 10 0, 20 10 T 40 10" fill="none" stroke="#38BDF8" strokeWidth="0.7" />
                      <path d="M 0 15 Q 10 5, 20 15 T 40 15" fill="none" stroke="#FBBF24" strokeWidth="0.7" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#security-waves-3d)" />
                </svg>

                {/* Reflejo brillante de plástico PVC plastificado */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none rounded-xl"></div>

                {/* Header Institucional de la Cédula */}
                <div className="flex items-center justify-between pb-1 border-b border-white/20 gap-1 relative z-10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex flex-col h-4.5 w-1 rounded-full overflow-hidden flex-shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                      <div className="h-1/2 w-full bg-[#FBBF24]"></div>
                      <div className="h-1/2 w-full bg-[#0072CE]"></div>
                    </div>
                    <div className="flex flex-col justify-center leading-tight min-w-0">
                      <span className="text-[7px] font-black uppercase text-white tracking-wide leading-none truncate brightness-125 drop-shadow-xs">
                        REPÚBLICA DEL ECUADOR
                      </span>
                      <span className="text-[5.5px] font-extrabold uppercase text-sky-200 tracking-tighter leading-none truncate mt-0.5 drop-shadow-xs">
                        IDENTIFICACIÓN Y REGISTRO DE ANIMALES DE COMPAÑÍA
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 flex-shrink-0 pl-1">
                    <span className="text-[9.5px] font-black tracking-tighter text-white leading-none drop-shadow-xs">
                      Pet<span className="text-[#FBBF24] drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">ID</span>
                    </span>
                    <span className="text-[6.5px] leading-none">🐾</span>
                  </div>
                </div>

                {/* Distribución de Datos en Alta Densidad */}
                <div className="grid grid-cols-12 gap-1.5 mt-1 items-center flex-1 min-h-0 relative z-10">
                  
                  {/* Foto Corgi */}
                  <div className="col-span-4 flex flex-col items-center justify-center">
                    <div className="relative rounded-lg p-0.5 bg-gradient-to-b from-white/60 via-white/20 to-sky-400/40 shadow-md">
                      <img
                        src="/corgi.jpg"
                        alt="MAX - Perro Corgi Valés"
                        className="w-[55px] h-[65px] rounded-lg border border-white/40 shadow-inner object-cover object-top pointer-events-none"
                      />
                    </div>
                    <p className="text-[5.5px] font-medium text-slate-200 tracking-tighter text-center leading-tight mt-0.5 drop-shadow-xs">
                      Microchip: 123456789012345
                    </p>
                  </div>

                  {/* Datos del Censo y Chip Físico Dorado */}
                  <div className="col-span-8 flex items-center justify-between min-w-0 pl-0.5 h-full py-0.5">
                    
                    <div className="flex-1 flex flex-col justify-between text-left space-y-0.5 min-w-0 pr-1">
                      <div className="leading-tight">
                        <span className="text-[6.5px] text-white/70 font-bold uppercase">NOMBRE: </span>
                        <span className="text-[7.5px] font-bold text-white tracking-tight drop-shadow-xs">MAX</span>
                      </div>
                      <div className="leading-tight">
                        <span className="text-[6.5px] text-white/70 font-bold uppercase">ESPECIE: </span>
                        <span className="text-[7.5px] font-bold text-white drop-shadow-xs">CANINA</span>
                      </div>
                      <div className="leading-tight">
                        <span className="text-[6.5px] text-white/70 font-bold uppercase">RAZA: </span>
                        <span className="text-[7.5px] font-bold text-white truncate inline-block max-w-[65px] sm:max-w-[78px] align-bottom drop-shadow-xs">CORGI VALÉS</span>
                      </div>
                      <div className="leading-tight">
                        <span className="text-[6.5px] text-white/70 font-bold uppercase">SEXO: </span>
                        <span className="text-[7.5px] font-bold text-white drop-shadow-xs">MACHO</span>
                      </div>
                      <div className="leading-tight">
                        <span className="text-[6.5px] text-white/70 font-bold uppercase">F. DE NACIMIENTO: </span>
                        <span className="text-[7.5px] font-bold text-white drop-shadow-xs">06-MAY-2026</span>
                      </div>
                    </div>

                    {/* Detalle de Microchip Físico Inteligente Dorado con Resplandor */}
                    <div className="flex flex-col items-center justify-center flex-shrink-0 w-8 py-0.5 border-l border-white/20 pl-1">
                      <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] w-4.5 h-3.5 rounded-sm border border-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-amber-900/70 -translate-y-1/2"></div>
                        <div className="absolute inset-y-0 left-1/3 w-px bg-amber-900/70"></div>
                        <div className="absolute inset-y-0 right-1/3 w-px bg-amber-900/70"></div>
                        <div className="w-1.5 h-1 rounded-2xs border border-amber-900/80 bg-amber-200/90 z-10 flex items-center justify-center">
                          <span className="text-[3px] font-black text-amber-950 leading-none">ISO</span>
                        </div>
                      </div>
                      <span className="text-[4px] font-black text-amber-300 tracking-tight leading-none mt-1 drop-shadow-xs">
                        11784/85
                      </span>
                    </div>

                  </div>

                </div>

              </div>

              {/* CONTENEDOR ANCLADO AL PISO CON MOVIMIENTO ULTRA-DINÁMICO INFINITO (MEGA-FLOAT) */}
              <div className="relative w-full h-full flex items-end justify-center self-end animate-[mega-float_4.5s_ease-in-out_infinite] origin-bottom will-change-transform">
                <img
                  src="/hero-tutor-corgi.png"
                  alt="Tutora sosteniendo al perro Corgi protegido con microchip y PETCÉDULA RUACE PET593"
                  priority="true"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="relative z-10 w-full h-auto max-h-[580px] lg:scale-105 select-none saturate-110 brightness-100 contrast-102 filter drop-shadow-lg object-contain object-bottom origin-bottom block"
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          BLOQUE 2: PROCESO EN 3 SIMPLES PASOS
          ========================================================================= */}
      <section id="pasos" className="py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-block py-1 px-3.5 rounded-full bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider">
              Proceso Ágil y Transparente
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E40AF] tracking-tight">
              Protege a tu Mejor Amigo en 3 Simples Pasos
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Diseñamos una experiencia ágil y libre de complicaciones para que tu mascota quede identificada y protegida con respaldo veterinario oficial en todo el país.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Paso 1 */}
            <div className="group bg-[#FFFBEB] hover:bg-white rounded-3xl p-8 border-2 border-transparent hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 text-center relative flex flex-col justify-between">
              <div>
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#FBBF24] group-hover:text-slate-900 transition-all duration-300 mx-auto">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="absolute -top-2 right-1/2 translate-x-8 bg-[#FBBF24] text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-slate-900 shadow">
                    01
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#1E40AF] mb-3">
                  01. Registro en Línea
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Completa el formulario en 2 minutos con los datos de tu peludo y contacto. Es inmediato, en línea y sin trámites engorrosos ni filas.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-[#1E40AF]">
                Sin filas ni papeleos →
              </div>
            </div>

            {/* Paso 2 */}
            <div className="group bg-[#FFFBEB] hover:bg-white rounded-3xl p-8 border-2 border-transparent hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 text-center relative flex flex-col justify-between">
              <div>
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#FBBF24] group-hover:text-slate-900 transition-all duration-300 mx-auto">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="absolute -top-2 right-1/2 translate-x-8 bg-[#FBBF24] text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-slate-900 shadow">
                    02
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#1E40AF] mb-3">
                  02. Agenda Implantación en Villaflora / a Domicilio
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Coordinamos tu cita en nuestra sede de Villaflora (Quito Sur) o con brigada veterinaria colegiada a domicilio en todo el país. Rápido e indoloro como una vacuna.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-[#1E40AF]">
                Rápido, seguro e indoloro →
              </div>
            </div>

            {/* Paso 3 */}
            <div className="group bg-[#FFFBEB] hover:bg-white rounded-3xl p-8 border-2 border-transparent hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 text-center relative flex flex-col justify-between">
              <div>
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#FBBF24] group-hover:text-slate-900 transition-all duration-300 mx-auto">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <span className="absolute -top-2 right-1/2 translate-x-8 bg-[#FBBF24] text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-slate-900 shadow">
                    03
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#1E40AF] mb-3">
                  03. Entrega de PETCÉDULA e Historial QR
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Recibes su PETCÉDULA física plastificada con código QR inteligente. Conéctala a su perfil médico activo 24/7 de por vida sin mensualidades.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-[#1E40AF]">
                Protegido de por vida · Pago Único →
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          BLOQUE 3: FORMULARIO FILTRO (EXPEDIENTE RUACE PET593) - COMPACTADO
          Conexión asíncrona a Supabase (ruace_pet539_leads), cualificación de leads,
          casilla obligatoria Ley LOPDP Ecuador 2026 y feedback en tiempo real.
          ========================================================================= */}
      <section id="registro" className="relative py-12 lg:py-16 bg-gradient-to-b from-[#FFFBEB] via-white to-[#FFFBEB]/50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Encabezado del Formulario */}
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="inline-block py-0.5 px-3 rounded-full bg-white border border-[#FBBF24] text-[#1E40AF] text-[11px] font-black uppercase tracking-wider shadow-xs">
              Expediente Oficial RUACE PET593
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E40AF] tracking-tight">
              Ingresa los datos de tu peludito para agendar su identificación
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Nuestros médicos veterinarios colegiados validarán la disponibilidad y coordinarán la colocación del microchip o la emisión de su PETCÉDULA física de forma segura y sin dolor.
            </p>
          </div>

          {/* CONTENEDOR CENTRALIZADO DEL FORMULARIO FILTRO COMPACTO */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-5 md:p-6 border border-slate-100 overflow-hidden relative">
            
            {/* Header del Formulario en Azul Primario RUACE PET593 */}
            <div className="bg-[#1E40AF] -mx-5 -mt-5 md:-mx-6 md:-mt-6 p-4 sm:p-5 text-white mb-5 rounded-t-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FBBF24] block">
                    Formulario de Captación Oficial
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    Expediente RUACE PET593
                  </h3>
                </div>
                <span className="bg-[#FFFBEB] text-[#1E40AF] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#FBBF24] uppercase shadow-xs">
                  Cobertura Nacional · Ecuador
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-1 leading-snug">
                Completa los datos en 2 minutos para agendar la colocación o activar su PETCÉDULA con respaldo veterinario oficial.
              </p>
            </div>

            {/* Mensajes de Estado (Success / Error) */}
            {statusMessage && (
              <div
                className={`mb-4 p-3.5 rounded-xl border text-xs transition-all ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none">{statusMessage.type === 'success' ? '✓' : '⚠️'}</span>
                  <div>
                    <p className="font-bold">{statusMessage.type === 'success' ? 'Registro Exitoso' : 'Atención'}</p>
                    <p className="mt-0.5 leading-relaxed">{statusMessage.text}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario conectado a Supabase con Grid de Alta Densidad */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Fila 1: Datos del Tutor - Nomenclatura Fase 2 (grid grid-cols-1 md:grid-cols-2 gap-4) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre_completo" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Tutor (Nombres y Apellidos) *
                  </label>
                  <input
                    type="text"
                    id="nombre_completo"
                    name="nombre_completo"
                    required
                    value={formData.nombre_completo || formData.owner_name}
                    onChange={handleChange}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full h-10 px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 placeholder-slate-400 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    WhatsApp / Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    required
                    value={formData.whatsapp || formData.owner_phone}
                    onChange={handleChange}
                    placeholder="Ej. +593 99 594 3723"
                    className="w-full h-10 px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 placeholder-slate-400 bg-white"
                  />
                </div>
              </div>

              {/* Fila 2: Empresa/Negocio y Presupuesto Estimado - Nomenclatura Fase 2 (grid grid-cols-1 md:grid-cols-2 gap-4) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="empresa_negocio" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Veterinaria de tu mascota (Opcional)
                  </label>
                  <input
                    type="text"
                    id="empresa_negocio"
                    name="empresa_negocio"
                    value={formData.empresa_negocio}
                    onChange={handleChange}
                    placeholder="Veterinaria de tu mascota (Opcional)"
                    className="w-full h-10 px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 placeholder-slate-400 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="presupuesto_estimado" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    RANGO DE INVERSIÓN PLANIFICADO *
                  </label>
                  <select
                    id="presupuesto_estimado"
                    name="presupuesto_estimado"
                    required
                    value={formData.presupuesto_estimado}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 bg-white font-medium"
                  >
                    <option value="basico">Entre $25 y $45</option>
                    <option value="completo">Entre $45 y $80</option>
                    <option value="premium">Más de $80</option>
                  </select>
                </div>
              </div>

              {/* Fila 3: Contacto (full-width) */}
              <div>
                <label htmlFor="owner_email" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="owner_email"
                  name="owner_email"
                  required
                  value={formData.owner_email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full h-10 px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 placeholder-slate-400 bg-white"
                />
              </div>

              {/* Fila 3: Datos de Mascota (grid grid-cols-1 md:grid-cols-2 gap-4) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pet_name" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Nombre Mascota *
                  </label>
                  <input
                    type="text"
                    id="pet_name"
                    name="pet_name"
                    required
                    value={formData.pet_name}
                    onChange={handleChange}
                    placeholder="Ej. Max, Luna, Toby"
                    className="w-full h-10 px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 placeholder-slate-400 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="tipo_mascota" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Tipo de Mascota *
                  </label>
                  <select
                    id="tipo_mascota"
                    name="tipo_mascota"
                    required
                    value={formData.tipo_mascota || formData.pet_type || 'perro'}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 bg-white font-medium"
                  >
                    <option value="perro">🐕 Perro (Canino)</option>
                    <option value="gato">🐈 Gato (Felino)</option>
                    <option value="otro">🐾 Otro animal de compañía (Conejo, hurón, mini-pig, etc.)</option>
                  </select>
                </div>
              </div>

              {/* Fila 4: Servicio y Estado de Identificación (grid grid-cols-1 md:grid-cols-2 gap-4) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="service_type" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Servicio que Requiere Contratar *
                  </label>
                  <select
                    id="service_type"
                    name="service_type"
                    required
                    value={formData.service_type || 'Combo Completo'}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 bg-white font-medium"
                  >
                    <option value="Combo Completo">Combo Completo</option>
                    <option value="PETCÉDULA Física">PETCÉDULA Física</option>
                    <option value="Perfil Digital">Perfil Digital</option>
                    <option value="Implantación Profesional de Microchip">Implantación Profesional de Microchip</option>
                    <option value="Pet Shop RUACE 593">Pet Shop RUACE 593</option>
                    <option value="Peluquería Canina PET593">Peluquería Canina PET593</option>
                    <option value="Asesoría para Viajes">Asesoría para Viajes</option>
                    <option value="Certificado de Tenencia Responsable">Certificado de Tenencia Responsable</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="estado_identificacion" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    ESTADO ACTUAL DE IDENTIFICACIÓN *
                  </label>
                  <select
                    id="estado_identificacion"
                    name="estado_identificacion"
                    required
                    value={formData.estado_identificacion || formData.current_status || 'ninguno'}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 bg-white font-medium"
                  >
                    <option value="ninguno">Sin Microchip</option>
                    <option value="solo_placa">Solo Placa Externa</option>
                    <option value="ya_identificado">Ya tiene Microchip</option>
                  </select>
                </div>
              </div>

              {/* Fila 5: Canal de Cierre (full-width) */}
              <div>
                <label htmlFor="contact_method" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Canal de Contacto Preferido *
                </label>
                <select
                  id="contact_method"
                  name="contact_method"
                  required
                  value={formData.contact_method}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-sm text-slate-800 bg-white font-medium"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Llamada Telefónica">Llamada Telefónica</option>
                  <option value="Correo Electrónico">Correo Electrónico</option>
                </select>
              </div>

              {/* CASILLA OBLIGATORIA: LEY LOPDP ECUADOR 2026 EN LÍNEA COMPACTA */}
              <div className="pt-1">
                <div className="flex items-center gap-2.5 bg-[#FFFBEB] px-3.5 py-2.5 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF] cursor-pointer shrink-0"
                  />
                  <div className="text-[11px] sm:text-xs text-slate-700 flex flex-wrap items-center gap-x-1.5 leading-tight">
                    <label htmlFor="termsAccepted" className="cursor-pointer font-bold text-slate-900">
                      Acepto la Política de Privacidad y Tratamiento de Datos (Ley LOPDP Ecuador 2026) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-[#1E40AF] hover:underline font-bold inline-block"
                    >
                      Ver términos y derechos ARCO
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTÓN SUBMIT COMPACTO */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-6 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 font-black text-sm shadow-md shadow-[#FBBF24]/20 transition-all hover:scale-[1.005] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-amber-400 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Registrando en Supabase...</span>
                    </>
                  ) : (
                    <span>Enviar Solicitud de Registro Oficial →</span>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                  PAGO ÚNICO · Sin suscripciones ocultas · Respaldo veterinario colegiado en todo el país
                </p>
              </div>

            </form>

            {/* BLOQUE DE TRUST BADGES */}
            <div className="-mx-5 -mb-5 md:-mx-6 md:-mb-6 mt-4 bg-[#FFFBEB] border-t border-amber-200/90 px-4 py-3 rounded-b-2xl">
              <div className="flex flex-wrap items-center justify-around gap-2 text-[11px] font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#1E40AF] font-black">●</span> Norma ISO 11784/85
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-emerald-600 font-black">●</span> PAGO ÚNICO (Sin Mensualidades)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#1E40AF] font-black">●</span> Red Nacional Ecuador
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          BLOQUE 4: HISTORIAS FELICES (LUCY, ROCKY Y BELLA) JUNTO A LA BARRA DE CONTADORES ACTUALIZADA
          Barra horizontal: +45,000 Mascotas Identificadas en el Censo Real
          +120 Cédulas Perros | +142 Cédulas Gatos | +963 Cuidado Animal | +147 Clientes Satisfechos
          Testimonios interactivos y composición fotográfica de tutores.
          ========================================================================= */}
      <section id="testimonios" className="border-b border-slate-200">
        
        {/* BARRA HORIZONTAL DE MÉTRICAS OFICIALES RUACE PET593 */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0284C7] py-10 border-y border-sky-400/20 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/15">
              
              {/* Métrica 0: Censo Real */}
              <div className="pt-4 sm:pt-0 px-3 flex flex-col items-center col-span-2 sm:col-span-1">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FBBF24] tracking-tight drop-shadow-md">
                  +45,000
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-100 mt-2 flex items-center gap-1.5">
                  <span className="text-base">📋</span> Censo Real
                </span>
              </div>

              {/* Métrica 1 */}
              <div className="pt-4 sm:pt-0 px-3 flex flex-col items-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FBBF24] tracking-tight drop-shadow-md">
                  +120
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-100 mt-2 flex items-center gap-1.5">
                  <span className="text-base">🐶</span> Cédulas Perros
                </span>
              </div>

              {/* Métrica 2 */}
              <div className="pt-4 sm:pt-0 px-3 flex flex-col items-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FBBF24] tracking-tight drop-shadow-md">
                  +142
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-100 mt-2 flex items-center gap-1.5">
                  <span className="text-base">🐱</span> Cédulas Gatos
                </span>
              </div>

              {/* Métrica 3 */}
              <div className="pt-4 sm:pt-0 px-3 flex flex-col items-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FBBF24] tracking-tight drop-shadow-md">
                  +963
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-100 mt-2 flex items-center gap-1.5">
                  <span className="text-base">🏥</span> Cuidado Animal
                </span>
              </div>

              {/* Métrica 4 */}
              <div className="pt-4 sm:pt-0 px-3 flex flex-col items-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FBBF24] tracking-tight drop-shadow-md">
                  +147
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-100 mt-2 flex items-center gap-1.5">
                  <span className="text-base">⭐</span> Clientes Satisfechos
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* CONTENEDOR DE HISTORIAS FELICES (NUESTROS TESTIMONIOS) */}
        <div className="py-20 lg:py-28 bg-[#FFFBEB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="inline-block py-1 px-3.5 rounded-full bg-white border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider shadow-sm">
                Historias Felices · Prueba Social Real
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E40AF] tracking-tight">
                Nuestros Testimonios
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Historias reales de tutores que aseguraron la identidad y el retorno de sus peluditos con el sistema oficial de RUACE PET593.
              </p>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LADO IZQUIERDO (lg:col-span-7): ACORDEÓN COLAPSABLE VERTICAL INTERACTIVO */}
            <div className="lg:col-span-7 space-y-4">
              {testimonials.map((testimonio, idx) => {
                const isOpen = openTestimonial === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all duration-300 bg-white overflow-hidden ${
                      isOpen
                        ? 'border-[#1E40AF] shadow-xl ring-2 ring-[#1E40AF]/10'
                        : 'border-slate-200 hover:border-amber-300 shadow-sm'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTestimonial(idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer bg-white"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="text-2xl shrink-0 p-2 rounded-xl bg-[#FFFBEB] border border-amber-200">
                          {testimonio.emoji}
                        </span>
                        <div className="truncate">
                          <h3 className={`text-base sm:text-lg font-black transition-colors ${
                            isOpen ? 'text-[#1E40AF]' : 'text-slate-900'
                          }`}>
                            {testimonio.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {testimonio.petInfo} · {testimonio.tutor}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex text-[#FBBF24] text-xs">
                          {"★".repeat(5)}
                        </div>
                        <span
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-base shrink-0 transition-all ${
                            isOpen
                              ? 'bg-[#1E40AF] text-[#FBBF24] rotate-180'
                              : 'bg-[#FFFBEB] text-[#1E40AF] border border-[#FBBF24]'
                          }`}
                        >
                          {isOpen ? '−' : '+'}
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-slate-700 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50 animate-fadeIn">
                        <div className="text-2xl text-[#FBBF24] font-serif leading-none mb-2">“</div>
                        <p className="font-medium text-slate-700 leading-relaxed mb-4">
                          {testimonio.story}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/60 text-xs">
                          <span className="font-bold text-[#1E40AF]">
                            ✓ Procedimiento: {testimonio.procedure}
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {testimonio.badge}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LADO DERECHO (lg:col-span-5): COMPOSICIÓN FOTOGRÁFICA REAL DE TUTORES ABRAZANDO A SUS MASCOTAS */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-[#1E3A8A] to-slate-900 p-6 sm:p-8 text-white min-h-[460px] flex flex-col justify-between">
                
                {/* Glow decorativo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBBF24]/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Composición Fotográfica con Imágenes de Tutores y Mascotas */}
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[#FBBF24] text-xs font-black uppercase tracking-wider border border-white/20">
                      ❤️ Vínculo Inseparable
                    </span>
                    <span className="text-xs font-black text-amber-200">
                      Calificación 5.0 / 5.0
                    </span>
                  </div>

                  {/* Collage fotográfico */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 items-stretch">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/30 shadow-md bg-slate-900/40">
                      <img
                        src="/gato-y-duena.png"
                        alt="Tutora abrazando a su gato bengalí identificado con microchip oficial"
                        className="w-full h-full object-cover rounded-xl shadow-sm aspect-square hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/30 shadow-md bg-white flex items-center justify-center">
                      <img
                        src="/gato-bengali-pata.png"
                        alt="Gato bengalí identificado con sistema RUACE PET593"
                        className="w-full h-full object-cover rounded-xl shadow-sm aspect-square hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug mt-2">
                    "La tranquilidad de saber que siempre podrán regresar a casa."
                  </h3>
                </div>

                {/* Tarjeta inferior con estadísticas de satisfacción */}
                <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs font-black text-amber-200">
                    <span>+147 Clientes Satisfechos</span>
                    <span className="text-[#FBBF24]">100% Retorno Seguro</span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#FBBF24] h-full w-full rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-tight">
                    Microchip subcutáneo biocompatible y PETCÉDULA física con QR dinámico en Villaflora y brigadas a domicilio.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

      {/* =========================================================================
          BLOQUE 5: ACORDEÓN FAQ INTERACTIVO
          ========================================================================= */}
      <section id="faq" className="py-20 lg:py-28 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16 space-y-3">
            <span className="inline-block py-1 px-3.5 rounded-full bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider">
              Resolvemos tus Inquietudes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E40AF] tracking-tight">
              Preguntas Frecuentes sobre Identificación Animal
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Todo lo que necesitas saber sobre el microchip ISO, la cédula física y la protección en todo el país.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 bg-white ${
                    isOpen
                      ? 'border-[#1E40AF] shadow-xl'
                      : 'border-slate-200 hover:border-amber-300 shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <span className={`text-base sm:text-lg font-black transition-colors ${
                      isOpen ? 'text-[#1E40AF]' : 'text-slate-800'
                    }`}>
                      {faq.q}
                    </span>
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-base shrink-0 transition-all ${
                        isOpen
                          ? 'bg-[#1E40AF] text-[#FBBF24] rotate-180'
                          : 'bg-[#FFFBEB] text-[#1E40AF] border border-[#FBBF24]'
                      }`}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 animate-fadeIn">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* MODAL DETALLES POLÍTICA DE PRIVACIDAD LOPDP ECUADOR 2026 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h4 className="font-black text-[#1E40AF] text-base">Tratamiento de Datos Personales · Ecuador 2026</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                En cumplimiento con la <strong>Ley Orgánica de Protección de Datos Personales (LOPDP) de la República del Ecuador</strong>, vigente en 2026:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Finalidad Exclusiva:</strong> La información captada (nombre, teléfono, correo y datos de la mascota) será empleada con el único fin de coordinar la emisión de cédula, implantación de microchip y soporte zoosanitario.</li>
                <li><strong>Confidencialidad:</strong> RUACE PET593 no comercializa, transfiere ni cede tus datos a terceros con propósitos publicitarios.</li>
                <li><strong>Derechos ARCO:</strong> Como titular, conservas en todo momento el derecho de acceso, rectificación, cancelación y oposición respecto a tus datos personales.</li>
                <li><strong>Seguridad de la Información:</strong> Los registros se transmiten de manera encriptada a nuestra base de datos en Supabase Cloud.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setTermsAccepted(true);
                  setShowPrivacyModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-black text-xs shadow-md transition"
              >
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REQUERIMIENTO 3: FOOTER INSTITUCIONAL DE ALTA FIDELIDAD (4 COLUMNAS)
          - Columna 1: Logo oficial PET 593 ID, dirección física Villaflora y teléfono 096 305 0719.
          - Columna 2: Menú de navegación (Inicio, Nosotros, Servicios con dropdown Microchip, Contacto).
          - Columna 3: Canales de soporte con Teléfono (096 305 0719), Correo (info@pet593.com), Correo (ventas@pet593.com).
          - Columna 4: Boletín ("Suscripción a boletín" con botón amarillo "Suscríbete").
          ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
            
            {/* COLUMNA 1 (lg:col-span-4): MARCA Y DIRECCIÓN */}
            <div className="lg:col-span-4 space-y-4">
              <a href="#hero" className="inline-block group">
                <img
                  src="/pet593-logo.png"
                  alt="PET 593 ID - Registro Oficial de Mascotas Ecuador"
                  className="h-12 w-auto object-contain brightness-110"
                />
              </a>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Organismo especializado en la emisión de cédulas de identidad animal, implantación de microchips homologados ISO 11784/85 y asesoría técnica zoosanitaria en Ecuador.
              </p>
              
              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#FBBF24] text-base shrink-0 mt-0.5">📍</span>
                  <span className="leading-snug">
                    <strong className="text-white block font-bold">Sede Central Villaflora:</strong>
                    Calles Francisco Londoño OE-1224 Y Pedro de Alfaro (Villaflora), Quito, Ecuador
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#FBBF24] text-base shrink-0">📞</span>
                  <a href="tel:0963050719" className="hover:text-[#FBBF24] transition-colors font-bold text-white">
                    096 305 0719
                  </a>
                </div>
              </div>
            </div>

            {/* COLUMNA 2 (lg:col-span-3): MENÚ DE NAVEGACIÓN Y SERVICIOS CON DROPDOWN */}
            <div className="lg:col-span-3 space-y-3">
              <h5 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                Menú de Navegación
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#hero" className="hover:text-[#FBBF24] transition-colors font-medium flex items-center gap-1.5">
                    <span>›</span> Inicio
                  </a>
                </li>
                <li>
                  <a href="#bienestar" className="hover:text-[#FBBF24] transition-colors font-medium flex items-center gap-1.5">
                    <span>›</span> Nosotros
                  </a>
                </li>
                
                {/* Servicios con Dropdown / Submenú Funcional */}
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                    className="w-full text-left flex items-center justify-between text-xs font-bold text-white hover:text-[#FBBF24] transition-colors cursor-pointer py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>›</span> Servicios
                    </span>
                    <span className={`text-[10px] transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {servicesDropdownOpen && (
                    <ul className="pl-4 mt-1.5 space-y-2 border-l border-slate-800 text-slate-400 text-[11px] animate-fadeIn">
                      <li>
                        <a href="#bienestar" className="hover:text-[#FBBF24] transition-colors block">
                          • Implantación Microchip ISO 11784/85
                        </a>
                      </li>
                      <li>
                        <a href="#pasos" className="hover:text-[#FBBF24] transition-colors block">
                          • PETCÉDULA Física Plastificada QR
                        </a>
                      </li>
                      <li>
                        <a href="#pasos" className="hover:text-[#FBBF24] transition-colors block">
                          • Cédulas para Perros (+120 registradas)
                        </a>
                      </li>
                      <li>
                        <a href="#pasos" className="hover:text-[#FBBF24] transition-colors block">
                          • Cédulas para Gatos (+142 registradas)
                        </a>
                      </li>
                      <li>
                        <a href="#registro" className="hover:text-[#FBBF24] transition-colors block">
                          • Asesoría Pet Travel Agrocalidad / IATA
                        </a>
                      </li>
                    </ul>
                  )}
                </li>

                <li>
                  <a href="#testimonios" className="hover:text-[#FBBF24] transition-colors font-medium flex items-center gap-1.5">
                    <span>›</span> Testimonios
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#FBBF24] transition-colors font-medium flex items-center gap-1.5">
                    <span>›</span> Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <a href="#registro" className="hover:text-[#FBBF24] transition-colors font-bold text-[#FBBF24] flex items-center gap-1.5">
                    <span>›</span> Contacto / Registro
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMNA 3 (lg:col-span-2): CANALES DE SOPORTE */}
            <div className="lg:col-span-2 space-y-3">
              <h5 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                Canales de Soporte
              </h5>
              <ul className="space-y-3 text-xs">
                <li>
                  <a
                    href="tel:0963050719"
                    className="flex items-center gap-2 hover:text-[#FBBF24] transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-[#FBBF24] flex items-center justify-center shrink-0 group-hover:bg-[#1E40AF]">
                      📱
                    </span>
                    <div>
                      <span className="block text-[10px] text-slate-400">Teléfono</span>
                      <strong className="text-white font-bold">096 305 0719</strong>
                    </div>
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:info@pet593.com"
                    className="flex items-center gap-2 hover:text-[#FBBF24] transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-[#FBBF24] flex items-center justify-center shrink-0 group-hover:bg-[#1E40AF]">
                      ✉️
                    </span>
                    <div>
                      <span className="block text-[10px] text-slate-400">Correo General</span>
                      <strong className="text-white font-bold">info@pet593.com</strong>
                    </div>
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:ventas@pet593.com"
                    className="flex items-center gap-2 hover:text-[#FBBF24] transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-[#FBBF24] flex items-center justify-center shrink-0 group-hover:bg-[#1E40AF]">
                      💼
                    </span>
                    <div>
                      <span className="block text-[10px] text-slate-400">Ventas & Brigadas</span>
                      <strong className="text-white font-bold">ventas@pet593.com</strong>
                    </div>
                  </a>
                </li>

                <li className="pt-1 text-[11px] text-slate-400">
                  <span className="text-[#FBBF24] font-bold">Horario:</span> Lunes a Sábado 8:30 AM - 6:30 PM
                </li>
              </ul>
            </div>

            {/* COLUMNA 4 (lg:col-span-3): BOLETÍN INFORMATIVO */}
            <div className="lg:col-span-3 space-y-3">
              <h5 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                Suscripción a Boletín
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recibe novedades de bioseguridad, convocatorias de brigadas veterinarias a domicilio en tu sector y recordatorios de vacunas.
              </p>

              {newsletterSubscribed ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <span>✓</span> ¡Gracias por suscribirte al boletín oficial de Pet 593!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#FBBF24] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 font-black text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    Suscríbete
                  </button>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Cero spam. Tus datos están protegidos bajo la Ley LOPDP Ecuador 2026.
                  </p>
                </form>
              )}
            </div>

          </div>

          {/* BARRA INFERIOR DEL FOOTER */}
          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} RUACE PET593 · Sede Villaflora · Cumplimiento LOPDP Ecuador 2026. Todos los derechos reservados.</p>
            <p>Conectado directamente a Supabase · Tabla: <span className="font-mono text-[#FBBF24]">ruace_pet539_leads</span></p>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          REQUERIMIENTO 3: BOTÓN FLOTANTE (FLOATING ACTION BUTTON) DE WHATSAPP
          Esquina inferior derecha de la pantalla, conectado al número oficial 096 305 0719
          ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Tooltip flotante */}
        <div className="hidden md:flex items-center bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-xl border border-slate-700 whitespace-nowrap animate-pulse">
          <span>💬 ¿Consultas sobre la Petcédula? Chatea aquí</span>
        </div>

        {/* Botón Circular Oficial de WhatsApp */}
        <a
          href="https://wa.me/593963050719?text=Hola,%20deseo%20informaci%C3%B3n%20sobre%20la%20identificaci%C3%B3n%20y%20PETC%C3%89DULA%20para%20mi%20mascota."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp al 096 305 0719"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/50 hover:scale-110 active:scale-95 transition-all duration-300 relative group"
        >
          {/* Anillo de pulso sutil */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none"></span>

          {/* Ícono de WhatsApp SVG oficial */}
          <svg className="w-8 h-8 sm:w-9 sm:h-9 fill-current relative z-10" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>
      </div>

    </div>
  );
}
