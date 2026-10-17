'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';

// Inicialización del cliente Supabase con variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Abm7RRtKLhITutAvDjkViw_PPh1w5XL';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  // Estado del formulario con los campos exactos de la tabla 'ruace_pet539_leads'
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    pet_name: '',
    pet_type: 'Perro',
    current_status: 'Sin microchip ni cédula',
    pet_travel_intent: 'No planeo viajar (Protección a nivel nacional)',
    contact_method: 'WhatsApp',
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // Primer FAQ abierto por defecto
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      // Inserción automática en la tabla 'ruace_pet539_leads'
      const { data, error } = await supabase
        .from('ruace_pet539_leads')
        .insert([
          {
            owner_name: formData.owner_name.trim(),
            owner_phone: formData.owner_phone.trim(),
            owner_email: formData.owner_email.trim().toLowerCase(),
            pet_name: formData.pet_name.trim(),
            pet_type: formData.pet_type,
            current_status: formData.current_status,
            pet_travel_intent: formData.pet_travel_intent,
            contact_method: formData.contact_method,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        throw error;
      }

      setStatusMessage({
        type: 'success',
        text: `¡Excelente noticia! Los datos de ${formData.pet_name} han sido registrados con éxito en el sistema RUACE PET539. Un asesor veterinario se comunicará contigo vía ${formData.contact_method}.`,
      });

      // Limpiar formulario tras éxito
      setFormData({
        owner_name: '',
        owner_phone: '',
        owner_email: '',
        pet_name: '',
        pet_type: 'Perro',
        current_status: 'Sin microchip ni cédula',
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

  // DATOS DEL ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ) - RESPUESTAS DIRECTAS Y SIN TECNICISMOS
  const faqs = [
    {
      q: '¿La colocación del microchip le duele a mi mascota?',
      a: 'No duele. Es un procedimiento tan rápido y sencillo como ponerle una vacuna rutinaria. El microchip es del tamaño de un granito de arroz, se implanta bajo la piel en segundos por un médico veterinario acreditado y tu peludito ni lo siente.',
    },
    {
      q: '¿El microchip es un rastreador GPS con batería?',
      a: 'No, no es un GPS y no lleva baterías. Los microchips veterinarios son dispositivos pasivos de por vida: nunca se descargan ni se cambian. Cualquier veterinaria o albergue puede leer el chip con un escáner, y cualquier persona con un celular puede escanear el código QR de su PETCÉDULA física para llamarte de inmediato.',
    },
    {
      q: '¿Qué es y qué incluye la PETCÉDULA física?',
      a: 'Es una cédula física plastificada de alta durabilidad con la foto de tu peludo, su código oficial de microchip y un código QR inteligente. Al escanearla con cualquier smartphone, muestra su carnet de vacunas y tus contactos de emergencia.',
    },
    {
      q: '¿Tiene algún costo mensual o cobro recurrente?',
      a: 'Ninguno. No hay mensualidades ni suscripciones. El registro oficial y el perfil digital están activos 24/7 para toda la vida. Además, puedes actualizar tus números telefónicos o dirección en Ecuador de forma gratuita cuando lo desees.',
    },
    {
      q: '¿Sirve para viajar con mi mascota al exterior o a Galápagos?',
      a: 'Sí. Nuestros microchips están homologados bajo la norma internacional ISO 11784/11785, que es el estándar obligatorio exigido por Agrocalidad en Ecuador, aerolíneas y autoridades internacionales para emitir los certificados zoosanitarios de viaje.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#FBBF24] selection:text-slate-900">
      <Head>
        <title>RUACE PET539 | Identificación y Cédulas Oficiales para Mascotas en Ecuador</title>
        <meta
          name="description"
          content="Protege a tu mascota en Ecuador con microchip subdérmico oficial, cédula física con QR médico dinámico y asesoría especializada Pet Travel a nivel nacional e internacional."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* WRAPPER STICKY TOP: BANNER + NAVBAR */}
      <div className="sticky top-0 z-50">
        {/* TOP BAR BANNER (REFERENCIA 3 - PET STATION) - FONDO AMARILLO ACENTO Y TEXTO NEGRO */}
        <div className="bg-[#FBBF24] text-slate-900 text-xs sm:text-sm py-2 px-4 text-center font-black shadow-sm flex items-center justify-center gap-2 border-b border-amber-400">
          <span className="text-base inline-block">✈️</span>
          <span>¿Viajas pronto con tu peludito? Obtén hoy tu consulta de asesoría Pet Travel sin costo con tu registro en todo el país.</span>
          <a
            href="#registro"
            className="ml-2 inline-flex items-center gap-1 bg-[#1E40AF] hover:bg-blue-900 text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full transition-colors shadow-xs"
          >
            <span>Pedir Asesoría</span>
            <span>→</span>
          </a>
        </div>

        {/* NAVBAR */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1E40AF] flex items-center justify-center text-[#FBBF24] shadow-md shadow-[#1E40AF]/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-[#1E40AF]">RUACE</span>
                <span className="bg-[#FFFBEB] text-[#1E40AF] text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border border-[#FBBF24]">
                  PET539
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Registro Animal & Cédulas Oficiales Ecuador</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-6 text-sm font-bold text-slate-700">
            <a href="#pasos" className="hover:text-[#1E40AF] transition-colors">¿Cómo Funciona?</a>
            <a href="#beneficios" className="hover:text-[#1E40AF] transition-colors">Beneficios</a>
            <a href="#por-que" className="hover:text-[#1E40AF] transition-colors">¿Por Qué Asegurar?</a>
            <a href="#historias" className="hover:text-[#1E40AF] transition-colors">Historias Felices</a>
            <a href="#compromiso" className="hover:text-[#1E40AF] transition-colors">Compromiso</a>
            <a href="#faq" className="hover:text-[#1E40AF] transition-colors">FAQ</a>
            <a href="#registro" className="hover:text-[#1E40AF] transition-colors">Registro</a>
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

      {/* HERO ORGÁNICO ASIMÉTRICO (ESTILO HERO VOLUNTARIOS - FONDO PASTEL #E0F2FE & DOODLES) */}
      <section className="relative overflow-hidden bg-[#E0F2FE] py-16 lg:py-24 border-b border-sky-200/70">
        
        {/* DOODLES Y ELEMENTOS VECTORIALES LINEALES (POSICIONAMIENTO ABSOLUTO) */}
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
        <div className="absolute top-28 right-16 sm:right-32 text-[#1E40AF]/35 pointer-events-none hidden sm:block">
          <svg className="w-16 h-16 rotate-12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeDasharray="3 3" d="M3 17c4-8 10-10 18-2" />
            <circle cx="21" cy="15" r="2" fill="currentColor" />
          </svg>
        </div>

        {/* Doodle 4: Destello / Chispa de protección inferior izquierda */}
        <div className="absolute bottom-12 left-10 text-[#F59E0B]/70 pointer-events-none">
          <svg className="w-8 h-8 rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" />
          </svg>
        </div>

        {/* Doodle 5: Huellita derecha flotante */}
        <div className="absolute bottom-16 right-10 sm:right-20 text-[#1E40AF]/25 pointer-events-none hidden lg:block">
          <svg className="w-12 h-12 rotate-[25deg]" fill="currentColor" viewBox="0 0 24 24">
            <ellipse cx="12" cy="15" rx="4" ry="4.5" />
            <circle cx="6.5" cy="9.5" r="2" />
            <circle cx="10" cy="7" r="2" />
            <circle cx="14" cy="7" r="2" />
            <circle cx="17.5" cy="9.5" r="2" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* LATERAL IZQUIERDO: PLASTA DE COLOR SÓLIDA / FORMA GEOMÉTRICA ABSTRACTA QUE ENMARCA LA MASCOTA */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-sm sm:max-w-md">
                
                {/* FORMA GEOMÉTRICA ABSTRACTA / PLASTA DE COLOR SÓLIDA DE ACENTO */}
                <div className="absolute -top-5 -left-5 sm:-top-8 sm:-left-8 w-64 sm:w-72 h-64 sm:h-72 bg-[#1E40AF] rounded-[2.5rem] rotate-[-7deg] shadow-xl pointer-events-none"></div>
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-52 sm:w-60 h-52 sm:h-60 bg-[#FBBF24] rounded-full opacity-90 pointer-events-none"></div>

                {/* CONTENEDOR PRINCIPAL: VIDEO DINÁMICO & TARJETA DE PROTECCIÓN VETERINARIA */}
                <div className="relative bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-sky-100 overflow-hidden space-y-4">
                  
                  {/* Banner superior de la Cédula Animal */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#1E40AF]">
                        RUACE PET539 · REGISTRO ACTIVO
                      </span>
                    </div>
                    <span className="bg-[#E0F2FE] text-[#1E40AF] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-sky-300">
                      ECUADOR
                    </span>
                  </div>

                  {/* CONTENEDOR DE VIDEO DINÁMICO EN LA NUBE (LIBRE DE DERECHOS DE AUTOR) */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-200 shadow-md group">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    >
                      <source
                        src="https://cdn.jsdelivr.net/gh/luiantav/dog-island@main/videos/dog1.mp4"
                        type="video/mp4"
                      />
                      <source
                        src="https://cdn.jsdelivr.net/gh/luiantav/dog-island@main/videos/dog2.mp4"
                        type="video/mp4"
                      />
                      Tu navegador no soporta la reproducción de video HTML5.
                    </video>

                    {/* Overlay sutil para realzar los badges flotantes */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Badge flotante superior: Vínculo Seguro */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1.5 text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold">En Vivo · Vínculo Activo</span>
                    </div>

                    {/* Badge flotante inferior de microchip inviolable */}
                    <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-lg border border-slate-200/90 flex items-center gap-2">
                      <span className="text-sm">🔒</span>
                      <span className="text-[10px] font-black text-slate-800">Chip ISO 11784/85</span>
                    </div>

                    {/* Badge flotante inferior derecho: Escaneo QR */}
                    <div className="absolute bottom-2.5 right-2.5 bg-[#FBBF24] px-2.5 py-1 rounded-xl shadow-lg border border-amber-400 flex items-center gap-1 text-slate-950">
                      <span className="text-xs">📲</span>
                      <span className="text-[10px] font-black">Escaneo QR</span>
                    </div>
                  </div>

                  {/* Fila de Especificaciones Clave de la Identidad */}
                  <div className="grid grid-cols-2 gap-2 text-left pt-1">
                    <div className="bg-[#E0F2FE]/60 rounded-xl p-2.5 border border-sky-200">
                      <p className="text-[10px] text-sky-800 font-bold uppercase">Lectura Móvil</p>
                      <p className="text-xs font-black text-[#1E40AF]">QR 24/7 sin App</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200">
                      <p className="text-[10px] text-amber-800 font-bold uppercase">Mantenimiento</p>
                      <p className="text-xs font-black text-slate-900">0$ Mensualidades</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* LATERAL DERECHO: CONTENIDOS CALIBRADOS CON EL SCRAPING DE APIFY (SECCIÓN 1) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left order-1 lg:order-2">
              
              {/* KICKER SUPERIOR: AUTORIDAD INMEDIATA FRENTE AL VACÍO INSTITUCIONAL */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#1E40AF]/30 text-[#1E40AF] text-xs sm:text-sm font-black shadow-sm tracking-wider uppercase">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#1E40AF] animate-ping"></span>
                CENSO NACIONAL DE IDENTIFICACIÓN MASCOTA
              </div>

              {/* TÍTULO PRINCIPAL: DOLOR DE PÉRDIDA EN TIPOGRAFÍA AZUL PROFUNDO DESTACADA */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-[#1E40AF] tracking-tight leading-tight">
                Dale a tu peludito una identidad indestructible y asegura su regreso a casa.
              </h1>

              {/* PÁRRAFO DESCRIPTIVO: DOLOR DE COSTOS OCULTOS Y BUROCRACIA */}
              <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl">
                El microchip permanente y su <strong className="text-[#1E40AF] font-black">PETCÉDULA física</strong> se vinculan a un perfil digital activo 24/7. Sin mensualidades ocultas. Homologado bajo la norma internacional ISO 11784/85 para lectura inmediata en Ecuador y procesos Pet Travel.
              </p>

              {/* BOTÓN DE ACCIÓN PRINCIPAL (TWO-STEP OPT-IN CON ESTILO REDONDEADO Y SMOOTH SCROLL) */}
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

              {/* ACREDITACIONES DIRECTAS DEL SCRAPING */}
              <div className="pt-4 border-t border-sky-300/80 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-600 font-bold">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#1E40AF]">✓</span> Sin mensualidades ni tarifas sorpresa
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#1E40AF]">✓</span> Lectura universal con cualquier celular
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#1E40AF]">✓</span> Homologado para viajar con Agrocalidad
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* BLOQUE DE CAPTACIÓN MOFU: FORMULARIO DE CUALIFICACIÓN INTELIGENTE (TWO-STEP OPT-IN) */}
      <section id="registro" className="relative py-16 lg:py-20 bg-gradient-to-b from-[#FFFBEB] via-white to-[#FFFBEB]/50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Encabezado de Transición hacia el Formulario */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="inline-block py-1 px-3.5 rounded-full bg-white border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider shadow-xs">
              Paso 2: Registro y Cualificación Oficial
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E40AF] tracking-tight">
              Ingresa los datos de tu peludito para agendar su identificación
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Nuestros médicos veterinarios colegiados validarán la disponibilidad y coordinarán el implante del microchip o la emisión de su PETCÉDULA física.
            </p>
          </div>

          {/* CONTENEDOR FLOTANTE CENTRALIZADO DEL FORMULARIO FILTRO */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#1E40AF]/15 overflow-hidden relative transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(30,64,175,0.25)]">
              
              {/* Header del Formulario en Azul Primario PET593 */}
              <div className="bg-[#1E40AF] p-6 sm:p-7 text-white text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FBBF24] block">
                      Formulario de Captación Oficial
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Expediente RUACE PET539
                    </h3>
                  </div>
                  <span className="bg-[#FFFBEB] text-[#1E40AF] text-[11px] font-black px-3 py-1 rounded-full border border-[#FBBF24] uppercase shadow-sm">
                    Cobertura Nacional · Ecuador
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-100/90 mt-2 leading-relaxed">
                  Completa los datos en 2 minutos para agendar la colocación o activar su PETCÉDULA con respaldo veterinario oficial.
                </p>
              </div>

              {/* Mensajes de Estado (Success / Error) */}
              {statusMessage && (
                <div
                  className={`m-5 p-4 rounded-xl border text-xs transition-all ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base">{statusMessage.type === 'success' ? '✓' : '⚠️'}</span>
                    <div>
                      <p className="font-bold">{statusMessage.type === 'success' ? 'Registro Exitoso' : 'Atención'}</p>
                      <p className="mt-0.5 leading-relaxed">{statusMessage.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario conectado a Supabase */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                
                {/* Fila: Propietario y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="owner_name" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Tutor / Propietario *
                    </label>
                    <input
                      type="text"
                      id="owner_name"
                      name="owner_name"
                      required
                      value={formData.owner_name}
                      onChange={handleChange}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-xs text-slate-800 placeholder-slate-400 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="owner_phone" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      id="owner_phone"
                      name="owner_phone"
                      required
                      value={formData.owner_phone}
                      onChange={handleChange}
                      placeholder="Ej. +593 99 594 3723"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-xs text-slate-800 placeholder-slate-400 bg-white"
                    />
                  </div>
                </div>

                {/* Correo */}
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-xs text-slate-800 placeholder-slate-400 bg-white"
                  />
                </div>

                {/* Fila: Nombre Mascota y Tipo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-xs text-slate-800 placeholder-slate-400 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="pet_type" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Tipo de Mascota *
                    </label>
                    <select
                      id="pet_type"
                      name="pet_type"
                      required
                      value={formData.pet_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-xs text-slate-800 bg-white font-medium"
                    >
                      <option value="Perro">🐶 Perro (Canino)</option>
                      <option value="Gato">🐱 Gato (Felino)</option>
                      <option value="Conejo">🐰 Conejo</option>
                      <option value="Ave / Exótico">🦜 Ave o Exótico</option>
                      <option value="Otro">🐾 Otro animal</option>
                    </select>
                  </div>
                </div>

                {/* Estado Actual */}
                <div>
                  <label htmlFor="current_status" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Estado Actual de Identificación *
                  </label>
                  <select
                    id="current_status"
                    name="current_status"
                    required
                    value={formData.current_status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-xs text-slate-800 bg-white font-medium"
                  >
                    <option value="Sin microchip ni cédula">Sin microchip ni cédula (Deseo colocación en Ecuador)</option>
                    <option value="Solo placa">Solo placa externa (Deseo microchip y cédula)</option>
                    <option value="Tiene microchip, requiere Cédula RUACE">Ya tiene microchip, pero requiere Cédula Física y Placa QR</option>
                    <option value="Requiere actualización de datos">Requiere actualización de tutor / cambio de domicilio</option>
                    <option value="Mascota extraviada (Reporte Urgente)">Mascota extraviada (Reporte de urgencia en red nacional)</option>
                  </select>
                </div>

                {/* Fila: Viaje y Canal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pet_travel_intent" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Intención de Viaje *
                    </label>
                    <select
                      id="pet_travel_intent"
                      name="pet_travel_intent"
                      required
                      value={formData.pet_travel_intent}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-xs text-slate-800 bg-white font-medium"
                    >
                      <option value="No planeo viajar (Protección a nivel nacional)">Solo protección a nivel nacional</option>
                      <option value="Viaje Internacional próximo (USA / Europa / LATAM)">Viaje Internacional (USA / Europa)</option>
                      <option value="Viaje Nacional / Galápagos">Viaje a Galápagos o Nacional</option>
                      <option value="Necesito asesoría completa Agrocalidad & IATA">Asesoría Agrocalidad & IATA</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact_method" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Canal de Contacto *
                    </label>
                    <select
                      id="contact_method"
                      name="contact_method"
                      required
                      value={formData.contact_method}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 outline-none transition text-xs text-slate-800 bg-white font-medium"
                    >
                      <option value="WhatsApp">💬 WhatsApp (Inmediato)</option>
                      <option value="Llamada Telefónica">📞 Llamada Telefónica</option>
                      <option value="Correo Electrónico">✉️ Correo Electrónico</option>
                    </select>
                  </div>
                </div>

                {/* CASILLA OBLIGATORIA: LEY LOPDP ECUADOR 2026 */}
                <div className="pt-2">
                  <div className="flex items-start gap-2.5 bg-[#FFFBEB] p-3 rounded-xl border border-amber-200">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      name="termsAccepted"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF] mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="text-[11px] text-slate-700 leading-snug">
                      <label htmlFor="termsAccepted" className="cursor-pointer font-bold text-slate-900">
                        Acepto la Política de Privacidad y Tratamiento de Datos (Ley LOPDP Ecuador) *
                      </label>
                      <div className="mt-0.5">
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-[10px] text-[#1E40AF] hover:underline font-bold"
                        >
                          Ver términos legales y derechos ARCO (LOPDP 2026)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTÓN SUBMIT EN AMARILLO ACENTO #FBBF24 */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-[#FBBF24]/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-amber-400 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Registrando en Supabase...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Solicitud de Registro Oficial</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-2.5">
                    Sin suscripciones ocultas · Respaldo veterinario colegiado en todo el país
                  </p>
                </div>

              </form>

              {/* BLOQUE HORIZONTAL DE INSIGNIAS DE CONFIANZA (TRUST BADGES) */}
              <div className="bg-[#FFFBEB] border-t border-amber-200/90 px-6 py-4">
                <div className="flex flex-wrap items-center justify-around gap-2 text-xs font-bold text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[#1E40AF] font-black">●</span> Norma ISO 11784/85
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-emerald-600 font-black">●</span> Sin Mensualidades
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[#1E40AF] font-black">●</span> Red Nacional Ecuador
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* NUEVA SECCIÓN: PROTEGE A TU MEJOR AMIGO EN 3 SIMPLES PASOS */}
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
              Diseñamos una experiencia libre de burocracia para que tu mascota quede identificada y protegida con respaldo veterinario en todo el país.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Paso 1 */}
            <div className="group bg-[#FFFBEB] hover:bg-white rounded-3xl p-8 border-2 border-transparent hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 text-center relative flex flex-col justify-between">
              <div>
                <div className="relative mb-6">
                  {/* Contenedor Circular Interactivo */}
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
                  01. Regístralo en Línea
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Completa el formulario en 2 minutos con los datos de tu peludo y contacto. Es rápido, en línea y sin trámites engorrosos.
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
                  {/* Contenedor Circular Interactivo */}
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
                  02. Agenda la Implantación
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Coordinamos con un veterinario colegiado en clínica aliada o en tu casa a nivel nacional. El microchip se coloca en segundos, es como una vacuna.
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
                  {/* Contenedor Circular Interactivo */}
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
                  03. Activa su PETCÉDULA
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Recibes su PETCÉDULA física plastificada con código QR inteligente. Conéctala a su perfil médico activo 24/7 sin pagos mensuales.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-[#1E40AF]">
                Protegido de por vida →
              </div>
            </div>

          </div>

          <div className="mt-12 text-center">
            <a
              href="#registro"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm text-slate-900 bg-[#FBBF24] hover:bg-[#F59E0B] shadow-lg shadow-[#FBBF24]/30 transition-all hover:scale-105"
            >
              <span>Comenzar con el Paso 01 Ahora</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

        </div>
      </section>

      {/* SECCIÓN 3: BENEFICIOS CLAVE */}
      <section id="beneficios" className="py-20 bg-[#FFFBEB] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs sm:text-sm font-black text-[#1E40AF] uppercase tracking-widest mb-2">
              Tecnología y Respaldo Veterinario
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tres Pilares para Proteger a tu Mascota a Nivel Nacional
            </h3>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              El sistema RUACE PET539 combina identificación subdérmica permanente, perfil médico en la nube y acompañamiento en normativas de viaje para el bienestar integral de tu animal de compañía.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Beneficio 1 */}
            <div className="group bg-white hover:bg-slate-50 rounded-3xl p-8 border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center mb-6 shadow-md shadow-[#1E40AF]/20">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-[#1E40AF] mb-3">
                  Identidad Inviolable
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Un microchip del tamaño de un granito de arroz colocado de forma segura. No se borra ni se pierde jamás.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> Código numérico único de 15 dígitos irrepetible
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> Homologación internacional ISO 11784 e ISO 11785
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> Compatible con todas las clínicas veterinarias del país
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-[#1E40AF] flex items-center">
                Identificación de por vida →
              </div>
            </div>

            {/* Beneficio 2 */}
            <div id="cedula" className="group bg-white hover:bg-slate-50 rounded-3xl p-8 border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center mb-6 shadow-md shadow-[#1E40AF]/20">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-[#1E40AF] mb-3">
                  Historial Médico QR
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Escanea su PETCÉDULA física con cualquier smartphone para ver vacunas y contactos en emergencias.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> PETCÉDULA plastificada de alta resistencia
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> Acceso a vacunas y tratamientos 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> Contacto inmediato con el tutor sin apps extra
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-[#1E40AF] flex items-center">
                Lectura directa con smartphone →
              </div>
            </div>

            {/* Beneficio 3 */}
            <div id="pettravel" className="group bg-white hover:bg-slate-50 rounded-3xl p-8 border-2 border-slate-200 hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center mb-6 shadow-md shadow-[#1E40AF]/20">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-[#1E40AF] mb-3">
                  Certificación Pet Travel
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Microchips homologados bajo la norma internacional ISO. Asesoría y documentos listos para viajar.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> Orientación para Certificados Zoosanitarios Agrocalidad
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> Cumplimiento con aerolíneas y normativas IATA
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#1E40AF] font-bold">✓</span> Acompañamiento en viajes a Galápagos y al exterior
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-[#1E40AF] flex items-center">
                Viaja informado y con respaldo →
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* MÓDULO DE VALOR (4 COLUMNAS): ¿POR QUÉ ASEGURAR LA IDENTIDAD DE TU PELUDITO HOY? */}
      <section id="por-que" className="py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-block py-1 px-3.5 rounded-full bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider">
              Protección Integral Definitiva
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E40AF] tracking-tight">
              ¿Por qué asegurar la identidad de tu peludito hoy?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Descubre las cuatro razones fundamentales por las que las placas tradicionales quedaron en el pasado para las familias responsables en todo el país.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Columna 1: Cero pérdida de placas */}
            <div className="group bg-[#FFFBEB] hover:bg-white rounded-3xl p-7 border-2 border-transparent hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-[#1E40AF] border border-amber-200 group-hover:border-[#1E40AF] text-[#1E40AF] group-hover:text-[#FBBF24] flex items-center justify-center mb-6 shadow-sm transition-colors duration-300">
                  {/* Ilustración lineal: Escudo con chip inviolable vs placa rota */}
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1E40AF] bg-white px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-3">
                  01 · Permanente
                </span>
                <h3 className="text-lg font-black text-[#1E40AF] mb-2.5">
                  Cero pérdida de placas
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Las placas metálicas se oxidan, caen o son retiradas. El microchip subdérmico es biocompatible, invisible y acompaña a tu peludito durante toda su vida.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-[#1E40AF]">
                100% Inmune a extravíos →
              </div>
            </div>

            {/* Columna 2: Historial médico unificado */}
            <div className="group bg-[#FFFBEB] hover:bg-white rounded-3xl p-7 border-2 border-transparent hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-[#1E40AF] border border-amber-200 group-hover:border-[#1E40AF] text-[#1E40AF] group-hover:text-[#FBBF24] flex items-center justify-center mb-6 shadow-sm transition-colors duration-300">
                  {/* Ilustración lineal: Expediente médico y lectura QR */}
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1E40AF] bg-white px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-3">
                  02 · Perfil Activo
                </span>
                <h3 className="text-lg font-black text-[#1E40AF] mb-2.5">
                  Historial médico unificado
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Vacunas, desparasitaciones y alergias en un perfil en la nube. Cualquier persona escanea la PETCÉDULA con su celular para asistirlo en segundos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-[#1E40AF]">
                Lectura con smartphone 24/7 →
              </div>
            </div>

            {/* Columna 3: Viajes sin burocracia */}
            <div className="group bg-[#FFFBEB] hover:bg-white rounded-3xl p-7 border-2 border-transparent hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-[#1E40AF] border border-amber-200 group-hover:border-[#1E40AF] text-[#1E40AF] group-hover:text-[#FBBF24] flex items-center justify-center mb-6 shadow-sm transition-colors duration-300">
                  {/* Ilustración lineal: Avión / Globo internacional */}
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1E40AF] bg-white px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-3">
                  03 · Internacional
                </span>
                <h3 className="text-lg font-black text-[#1E40AF] mb-2.5">
                  Viajes sin burocracia
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Microchip homologado ISO 11784/85 exigido por Agrocalidad y aerolíneas para salir del país o volar a Galápagos sin trámites retenidos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-[#1E40AF]">
                Normativa IATA & Agrocalidad →
              </div>
            </div>

            {/* Columna 4: Propiedad legal protegida */}
            <div className="group bg-[#FFFBEB] hover:bg-white rounded-3xl p-7 border-2 border-transparent hover:border-[#1E40AF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-[#1E40AF] border border-amber-200 group-hover:border-[#1E40AF] text-[#1E40AF] group-hover:text-[#FBBF24] flex items-center justify-center mb-6 shadow-sm transition-colors duration-300">
                  {/* Ilustración lineal: Certificación legal y sello */}
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1E40AF] bg-white px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-3">
                  04 · Jurídico
                </span>
                <h3 className="text-lg font-black text-[#1E40AF] mb-2.5">
                  Propiedad legal protegida
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Asocia legalmente el código irrepetible de 15 dígitos al tutor en Ecuador, brindando respaldo jurídico fehaciente ante robos o disputas de custodia.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-[#1E40AF]">
                Respaldo oficial nacional →
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* MÓDULO DE VALOR: CUADRÍCULA ASIMÉTRICA DE "HISTORIAS FELICES" (TESTIMONIOS EN TODO EL PAÍS) */}
      <section id="historias" className="py-20 lg:py-28 bg-[#FFFBEB] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-block py-1 px-3.5 rounded-full bg-white border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider shadow-sm">
              Impacto Real en Familias de Todo el País
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E40AF] tracking-tight">
              Historias Felices: Familias que Recuperaron su Tranquilidad
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Casos reales de escapes y viajes internacionales resueltos con éxito gracias a la red RUACE PET539 en todo el país.
            </p>
          </div>

          {/* Cuadrícula Asimétrica */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Historia Principal Asimétrica (Col-Span 7) - Caso de Escape */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#1E40AF]/25 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FBBF24]/15 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wide">
                    🚨 Escape Resuelto · Retorno Seguro
                  </span>
                  <div className="flex items-center gap-1 text-[#FBBF24] text-sm">
                    {"★".repeat(5)}
                    <span className="text-xs font-black text-slate-800 ml-1">5.0 / 5.0</span>
                  </div>
                </div>

                <div className="text-4xl text-[#FBBF24] font-serif leading-none mb-3">“</div>
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium mb-6">
                  A Rocky lo asustaron unos fuegos artificiales y salió disparado cuando abrimos el portón. Estuvimos cuatro horas recorriendo Monteserrín con el corazón en la mano. Por fortuna, una familia vecina a 3 km lo encontró, vio su <strong className="text-[#1E40AF] font-bold">PETCÉDULA física plastificada</strong>, escaneó el código QR y nos llamó de inmediato por WhatsApp. Sin este sistema, en una ciudad tan grande y con tanto tráfico, no sabemos si habría regresado a casa.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center font-black text-lg shadow-md shadow-[#1E40AF]/20">
                    🐕
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Familia Mantilla & Rocky</h4>
                    <p className="text-xs text-slate-500">Tutor de Golden Retriever (3 años) · Ecuador</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  ✓ Reencuentro Confirmado
                </span>
              </div>
            </div>

            {/* Historia 2 Asimétrica (Col-Span 5) - Viaje Aduana */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md hover:border-[#1E40AF] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide">
                    ✈️ Pet Travel · Aeropuerto Tababela
                  </span>
                  <div className="flex text-[#FBBF24] text-xs">{"★".repeat(5)}</div>
                </div>

                <div className="text-3xl text-[#1E40AF] font-serif leading-none mb-2">“</div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Teníamos programada nuestra mudanza a España y en el counter de la aerolínea nos pidieron el microchip homologado ISO 15 dígitos y la ficha técnica de Agrocalidad. RUACE PET539 nos coordinó la cita veterinaria a domicilio y nos entregó el expediente listo. <strong className="text-slate-900 font-bold">Pasamos la inspección aduanera en 5 minutos</strong> sin ninguna observación ni retraso.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] flex items-center justify-center font-bold text-sm">
                  🐱
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Paola S. & Mía</h4>
                  <p className="text-[11px] text-slate-500">Tutora de Felina Siamesa · Vuelo Internacional</p>
                </div>
              </div>
            </div>

            {/* Historia 3 (Col-Span 6) - Parque La Carolina */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md hover:border-[#1E40AF] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide">
                    🏷️ Parque Recreativo · Cero Placas Perdidas
                  </span>
                  <div className="flex text-[#FBBF24] text-xs">{"★".repeat(5)}</div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Lucas solía perder sus placas metálicas jugando con otros perros; compramos tres en solo un año porque se rompían las anillas. Con el microchip subdérmico y la PETCÉDULA física, sabemos que su identificación real está bajo la piel y nunca se borrará. Nos devolvió la paz total al soltarlo en el parque.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center font-bold text-sm">
                  🐕
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">David E. & Lucas</h4>
                  <p className="text-[11px] text-slate-500">Tutor de Canino Mestizo · Ecuador</p>
                </div>
              </div>
            </div>

            {/* Historia 4 (Col-Span 6) - Viaje Galápagos */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md hover:border-[#1E40AF] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide">
                    🏝️ Bioseguridad · Vuelo Nacional Galápagos
                  </span>
                  <div className="flex text-[#FBBF24] text-xs">{"★".repeat(5)}</div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Para viajar a las islas la regulación de la ABG y Agrocalidad es súper estricta. El carnet oficial RUACE PET539 y la lectura instantánea del microchip permitieron que los inspectores revisaran todo el historial de vacunas en 30 segundos. Viajar en cabina con Milo fue seguro y fluido.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] flex items-center justify-center font-bold text-sm">
                  🐾
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Sofía R. & Milo</h4>
                  <p className="text-[11px] text-slate-500">Tutora de Schnauzer · Control Zoosanitario Aprobado</p>
                </div>
              </div>
            </div>

          </div>

          {/* Banner de llamada rápida al pie de historias */}
          <div className="mt-12 text-center">
            <a
              href="#registro"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm text-slate-900 bg-[#FBBF24] hover:bg-[#F59E0B] shadow-lg shadow-[#FBBF24]/30 transition-all hover:scale-105"
            >
              <span>Asegurar la Identidad de mi Mascota Ahora</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

        </div>
      </section>

      {/* NUEVA SECCIÓN: NUESTRO COMPROMISO (STORYTELLING EMOCIONAL & PANTALLA DIVIDIDA) */}
      <section id="compromiso" className="py-20 lg:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Columna Izquierda: Imagen y composición visual suavizada */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFBEB] bg-gradient-to-br from-[#1E40AF] to-slate-900 p-8 text-white min-h-[420px] flex flex-col justify-between">
                
                {/* Glow decorativo de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBBF24]/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[#FBBF24] text-xs font-black uppercase tracking-wider border border-white/20">
                    ❤️ Promesa de Cuidado Incondicional
                  </span>
                  <div className="text-5xl">🐶🐱</div>
                  <h3 className="text-2xl font-black text-white leading-tight">
                    "Un hogar nunca está completo sin la certeza de que tu mejor amigo está seguro."
                  </h3>
                </div>

                {/* Badge flotante de impacto */}
                <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2 mt-6">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                    <span>Mascotas Identificadas en el País</span>
                    <span className="text-[#FBBF24] font-black">+15.000</span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#FBBF24] h-full w-[94%] rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-slate-200">
                    99.8% de efectividad de retorno en casos de extravío reportados en la red nacional.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Storytelling Persuasivo */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider">
                Nuestro Compromiso con las Familias de Todo el País
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E40AF] tracking-tight leading-tight">
                Erradicar el miedo a perder a tu peludito:{' '}
                <span className="text-slate-900 relative">
                  nuestra verdadera misión.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                En cualquier lugar del país, perder de vista a tu perro o gato aunque sea un segundo genera una angustia inmensa. Un portón que quedó entreabierto, un susto por pirotecnia o un descuido en el parque no deberían convertirse en una pesadilla para siempre.
              </p>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                <strong className="text-[#1E40AF] font-bold">Nuestro compromiso es erradicar ese miedo en cada rincón del país.</strong> Diseñamos RUACE PET539 combinando la tecnología médica de un microchip inviolable con una PETCÉDULA física de fácil lectura ciudadana. Así garantizamos que cualquier vecino o veterinario de Ecuador pueda regresarte a tu compañero de vida de inmediato.
              </p>

              {/* Puntos de valor con checkmarks */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">
                    <strong className="text-slate-900">Respaldo Veterinario Colegiado:</strong> Todo procedimiento es avalado por médicos veterinarios acreditados a nivel nacional.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">
                    <strong className="text-slate-900">Actualización Permanente Gratuita:</strong> Modifica tus teléfonos o dirección sin costos extras para siempre.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">
                    <strong className="text-slate-900">Red Solidaria de Alerta Rápida:</strong> Notificación inmediata a clínicas y albergues de la zona ante reportes de pérdida.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="#registro"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-black text-sm text-slate-900 bg-[#FBBF24] hover:bg-[#F59E0B] shadow-md shadow-[#FBBF24]/30 transition-all hover:scale-105"
                >
                  Proteger a mi Mascota Ahora
                </a>
                <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  Toma menos de 2 minutos y asegura su retorno para siempre.
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* NUEVA SECCIÓN: ACORDEÓN INTERACTIVO DE PREGUNTAS FRECUENTES (FAQ) */}
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
                    className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors"
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

          <div className="mt-12 text-center p-6 bg-[#FFFBEB] rounded-2xl border border-amber-200">
            <p className="text-sm font-bold text-slate-800">
              ¿Tienes alguna duda específica sobre tu caso o viaje?
            </p>
            <a
              href="https://wa.me/593964180420?text=Hola,%20tengo%20una%20consulta%20espec%C3%ADfica%20sobre%20el%20servicio%20RUACE%20PET539."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-xs font-black text-[#1E40AF] hover:underline"
            >
              <span>Hablar directamente con un asesor veterinario por WhatsApp</span>
              <span>→</span>
            </a>
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
                <li><strong>Confidencialidad:</strong> RUACE PET539 no comercializa, transfiere ni cede tus datos a terceros con propósitos publicitarios.</li>
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

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-[#1E40AF] flex items-center justify-center text-[#FBBF24] font-bold">
                  🐾
                </div>
                <span className="font-black text-xl tracking-tight text-white">RUACE PET539</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                Iniciativa especializada en identificación animal permanente, emisión de cédulas físicas con código QR médico y gestión técnica Pet Travel en Ecuador.
              </p>
              <div className="text-xs text-slate-500">
                Puntos de atención veterinaria aliados y brigadas a domicilio con cobertura en todo el país.
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Servicios</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#pasos" className="hover:text-[#FBBF24] transition-colors">¿Cómo Funciona?</a></li>
                <li><a href="#beneficios" className="hover:text-[#FBBF24] transition-colors">Beneficios Oficiales</a></li>
                <li><a href="#por-que" className="hover:text-[#FBBF24] transition-colors">¿Por Qué Asegurar?</a></li>
                <li><a href="#historias" className="hover:text-[#FBBF24] transition-colors">Historias Felices</a></li>
                <li><a href="#compromiso" className="hover:text-[#FBBF24] transition-colors">Nuestro Compromiso</a></li>
                <li><a href="#faq" className="hover:text-[#FBBF24] transition-colors">Preguntas Frecuentes</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Contacto Nacional</h5>
              <ul className="space-y-2 text-xs">
                <li>WhatsApp: +593 96 418 0420</li>
                <li>Atención: Lunes a Sábado 8:30 AM - 6:30 PM</li>
                <li>Ecuador (Cobertura Nacional)</li>
                <li>Base de Datos: Supabase Cloud</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} RUACE PET539 · Cumplimiento LOPDP Ecuador 2026. Todos los derechos reservados.</p>
            <p>Conectado directamente a Supabase · Tabla: <span className="font-mono text-[#FBBF24]">ruace_pet539_leads</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
