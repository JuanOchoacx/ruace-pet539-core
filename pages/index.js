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
        text: `¡Excelente noticia! Los datos de ${formData.pet_name} han sido registrados con éxito en el sistema RUACE PET593. Un asesor veterinario se comunicará contigo vía ${formData.contact_method}.`,
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

  // DATOS DEL ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ) - RESOLUCIÓN DIRECTA DE OBJECIONES CLAVE
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
      a: 'Una vez completado el registro en línea, nuestro equipo veterinario te contacta de inmediato por WhatsApp para agendar tu cita en nuestra sede de Villaflora (Quito Sur) o coordinar la brigada de implantación a domicilio en cualquier sector del país.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#FBBF24] selection:text-slate-900">
      <Head>
        <title>RUACE PET593 | Identificación y Cédulas Oficiales para Mascotas en Ecuador</title>
        <meta
          name="description"
          content="Protege a tu mascota en Ecuador con microchip subdérmico oficial ISO 11784/85, PETCÉDULA física con QR médico dinámico y asesoría Pet Travel en todo el país."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* WRAPPER STICKY TOP: BANNER + NAVBAR */}
      <div className="sticky top-0 z-50">
        {/* TOP BAR BANNER (PET TRAVEL ADVISORY) */}
        <div className="bg-[#FBBF24] text-slate-900 text-xs sm:text-sm py-2 px-4 text-center font-black shadow-sm flex items-center justify-center gap-2 border-b border-amber-400">
          <span className="text-base inline-block">✈️</span>
          <span>¿Viajas pronto con tu peludito? Asesoría Pet Travel sin costo con tu registro RUACE PET593 en todo el país.</span>
          <a
            href="#registro"
            className="ml-2 inline-flex items-center gap-1 bg-[#1E40AF] hover:bg-blue-900 text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full transition-colors shadow-xs"
          >
            <span>Pedir Asesoría</span>
            <span>→</span>
          </a>
        </div>

        {/* NAVBAR CON IDENTIDAD OFICIAL RUACE PET593 */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="#" className="flex items-center gap-2.5 group">
                <img
                  src="/pet593-logo.png"
                  alt="PET 593 ID - Registro e Identificación Oficial de Mascotas"
                  className="h-12 w-auto object-contain md:h-14 transition-transform duration-300 hover:scale-105"
                />
              </a>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 text-sm font-bold text-slate-700">
              <a href="#pasos" className="hover:text-[#1E40AF] transition-colors">¿Cómo Funciona?</a>
              <a href="#registro" className="hover:text-[#1E40AF] transition-colors">Registro Oficial</a>
              <a href="#historias" className="hover:text-[#1E40AF] transition-colors">Historias Felices</a>
              <a href="#faq" className="hover:text-[#1E40AF] transition-colors">Preguntas Frecuentes</a>
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
          BLOQUE 1: HERO SECTION (OPTIMIZADO)
          Lienzo pastel #E0F2FE, doodles lineales, ilustración animada de tutora
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
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-[#1E40AF] tracking-tight leading-tight">
                Dale a tu peludito una identidad indestructible y asegura su regreso a casa.
              </h1>

              {/* PÁRRAFO DESCRIPTIVO: DOLOR DE COSTOS OCULTOS Y BUROCRACIA */}
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
                  href="#pasos"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-full bg-white hover:bg-slate-50 text-[#1E40AF] font-bold text-sm sm:text-base shadow-md shadow-sky-900/5 border-2 border-[#1E40AF]/20 transition-all hover:scale-105 active:scale-95 gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[#1E40AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>¿Cómo Funciona?</span>
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

              {/* CONTENEDOR ANCLADO AL PISO CON MOVIMIENTO SUTIL DE FLOTADO */}
              <div className="relative w-full h-full flex items-end justify-center animate-float origin-bottom will-change-transform">
                <img
                  src="/hero-tutor-corgi.png"
                  alt="Tutora sosteniendo al perro Corgi protegido con microchip y PETCÉDULA RUACE PET593"
                  priority="true"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="relative z-10 w-full h-auto max-h-[580px] lg:scale-105 select-none saturate-110 brightness-100 contrast-102 filter drop-shadow-[0_25px_40px_rgba(30,64,175,0.15)] object-contain object-bottom origin-bottom block"
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          BLOQUE 2: PROCESO EN 3 SIMPLES PASOS
          Flujo transparente y libre de burocracia para mitigar fricciones:
          01. Registro en Línea
          02. Agenda Implantación en Villaflora / a Domicilio
          03. Entrega de PETCÉDULA e Historial QR
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
              Diseñamos una experiencia ágil y libre de burocracia para que tu mascota quede identificada y protegida con respaldo veterinario oficial en todo el país.
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

          <div className="mt-12 text-center">
            <a
              href="#registro"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm text-slate-900 bg-[#FBBF24] hover:bg-[#F59E0B] shadow-lg shadow-[#FBBF24]/30 transition-all hover:scale-105 cursor-pointer"
            >
              <span>Comenzar con el Paso 01 Ahora</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

        </div>
      </section>

      {/* =========================================================================
          BLOQUE 3: FORMULARIO FILTRO (EXPEDIENTE RUACE PET593)
          Conexión asíncrona a Supabase (ruace_pet539_leads), cualificación de leads,
          casilla obligatoria Ley LOPDP Ecuador 2026 y feedback en tiempo real.
          ========================================================================= */}
      <section id="registro" className="relative py-16 lg:py-20 bg-gradient-to-b from-[#FFFBEB] via-white to-[#FFFBEB]/50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Encabezado del Formulario */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="inline-block py-1 px-3.5 rounded-full bg-white border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider shadow-xs">
              Expediente Oficial RUACE PET593
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E40AF] tracking-tight">
              Ingresa los datos de tu peludito para agendar su identificación
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Nuestros médicos veterinarios colegiados validarán la disponibilidad y coordinarán el implante del microchip o la emisión de su PETCÉDULA física.
            </p>
          </div>

          {/* CONTENEDOR CENTRALIZADO DEL FORMULARIO FILTRO */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#1E40AF]/15 overflow-hidden relative transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(30,64,175,0.25)]">
              
              {/* Header del Formulario en Azul Primario RUACE PET593 */}
              <div className="bg-[#1E40AF] p-6 sm:p-7 text-white text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FBBF24] block">
                      Formulario de Captación Oficial
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Expediente RUACE PET593
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

                {/* Correo Electrónico */}
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

                {/* BOTÓN SUBMIT */}
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
                    PAGO ÚNICO · Sin suscripciones ocultas · Respaldo veterinario colegiado en todo el país
                  </p>
                </div>

              </form>

              {/* BLOQUE DE TRUST BADGES */}
              <div className="bg-[#FFFBEB] border-t border-amber-200/90 px-6 py-4">
                <div className="flex flex-wrap items-center justify-around gap-2 text-xs font-bold text-slate-700">
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

        </div>
      </section>

      {/* =========================================================================
          BLOQUE 4: HISTORIAS FELICES (PRUEBA SOCIAL)
          Testimonios específicos enfocados en mitigar dolores reales:
          1. Escape resuelto (Familia Mantilla & Rocky)
          2. Inspección aduanera en 5 min en Tababela (Paola S. & Mía)
          3. Viaje a Galápagos sin contratiempos (Sofía R. & Milo)
          ========================================================================= */}
      <section id="historias" className="py-20 lg:py-28 bg-[#FFFBEB] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-block py-1 px-3.5 rounded-full bg-white border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wider shadow-sm">
              +45,000 Mascotas Identificadas · Casos Reales
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E40AF] tracking-tight">
              Historias Felices: Familias que Recuperaron su Tranquilidad
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Casos reales de escapes y viajes internacionales resueltos con éxito gracias a la red RUACE PET593 en todo el país.
            </p>
          </div>

          {/* Cuadrícula de 3 Testimonios Clave */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Historia 1: Caso de Escape Resuelto (Rocky) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#1E40AF]/25 shadow-xl relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#FBBF24]/15 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] text-xs font-black uppercase tracking-wide">
                    🚨 Escape Resuelto
                  </span>
                  <div className="flex items-center gap-1 text-[#FBBF24] text-sm">
                    {"★".repeat(5)}
                    <span className="text-xs font-black text-slate-800 ml-1">5.0</span>
                  </div>
                </div>

                <div className="text-3xl text-[#FBBF24] font-serif leading-none mb-3">“</div>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium mb-6">
                  A Rocky lo asustaron unos fuegos artificiales y salió del portón. Estuvimos cuatro horas recorriendo Monteserrín desesperados. Una familia vecina lo encontró, vio su <strong className="text-[#1E40AF] font-bold">PETCÉDULA física plastificada</strong>, escaneó el código QR y nos llamó de inmediato por WhatsApp. Sin este sistema, no sabemos si habría regresado a casa.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1E40AF] text-[#FBBF24] flex items-center justify-center font-black text-lg shadow-md shadow-[#1E40AF]/20">
                    🐕
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Familia Mantilla & Rocky</h4>
                    <p className="text-xs text-slate-500">Golden Retriever (3 años) · Ecuador</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ✓ En Casa
                </span>
              </div>
            </div>

            {/* Historia 2: Inspección Aduanera en 5 Minutos (Tababela) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md hover:border-[#1E40AF] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide">
                    ✈️ Aeropuerto Tababela
                  </span>
                  <div className="flex text-[#FBBF24] text-xs">{"★".repeat(5)}</div>
                </div>

                <div className="text-3xl text-[#1E40AF] font-serif leading-none mb-2">“</div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Teníamos programada nuestra mudanza a España y en el counter nos pidieron el microchip homologado ISO 15 dígitos y la ficha técnica de Agrocalidad. RUACE PET593 nos coordinó la cita a domicilio y nos entregó el expediente listo. <strong className="text-slate-900 font-bold">Pasamos la inspección aduanera en 5 minutos</strong> sin ninguna observación ni retraso.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] flex items-center justify-center font-bold text-sm">
                  🐱
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Paola S. & Mía</h4>
                  <p className="text-[11px] text-slate-500">Felina Siamesa · Vuelo Internacional</p>
                </div>
              </div>
            </div>

            {/* Historia 3: Viaje a Galápagos sin Contratiempos (Milo) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md hover:border-[#1E40AF] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide">
                    🏝️ Galápagos Bioseguridad
                  </span>
                  <div className="flex text-[#FBBF24] text-xs">{"★".repeat(5)}</div>
                </div>

                <div className="text-3xl text-[#1E40AF] font-serif leading-none mb-2">“</div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Para viajar a las islas la regulación de la ABG y Agrocalidad es súper rigurosa. El carnet oficial RUACE PET593 y la lectura instantánea del microchip permitieron que los inspectores validaran todo el historial de vacunas en 30 segundos. Viajar en cabina con Milo fue seguro, ágil y totalmente libre de contratiempos.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FBBF24] text-[#1E40AF] flex items-center justify-center font-bold text-sm">
                  🐾
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Sofía R. & Milo</h4>
                  <p className="text-[11px] text-slate-500">Schnauzer · Control Zoosanitario Aprobado</p>
                </div>
              </div>
            </div>

          </div>

          {/* Banner CTA al pie de historias */}
          <div className="mt-12 text-center">
            <a
              href="#registro"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm text-slate-900 bg-[#FBBF24] hover:bg-[#F59E0B] shadow-lg shadow-[#FBBF24]/30 transition-all hover:scale-105 cursor-pointer"
            >
              <span>Asegurar la Identidad de mi Mascota Ahora</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

        </div>
      </section>

      {/* =========================================================================
          BLOQUE 5: ACORDEÓN FAQ INTERACTIVO
          Resolución directa de objeciones críticas del dataset:
          - Dolor de la implantación (indoloro, rápido como una vacuna)
          - Tarifas/cobros recurrentes (PAGO ÚNICO, sin mensualidades ni tarifas sorpresa)
          - Homologación internacional ISO 11784/85 para Agrocalidad / IATA
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

          <div className="mt-12 text-center p-6 bg-[#FFFBEB] rounded-2xl border border-amber-200">
            <p className="text-sm font-bold text-slate-800">
              ¿Tienes alguna duda específica sobre tu caso o viaje?
            </p>
            <a
              href="https://wa.me/593964180420?text=Hola,%20tengo%20una%20consulta%20espec%C3%ADfica%20sobre%20el%20servicio%20RUACE%20PET593."
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

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-[#1E40AF] flex items-center justify-center text-[#FBBF24] font-bold">
                  🐾
                </div>
                <span className="font-black text-xl tracking-tight text-white">RUACE PET593</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                Iniciativa especializada en identificación animal permanente, emisión de cédulas físicas con código QR médico y gestión técnica Pet Travel en Ecuador.
              </p>
              <div className="text-xs text-slate-500">
                Sede oficial Villaflora (Quito Sur) y brigadas veterinarias a domicilio con cobertura en todo el país.
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Navegación</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#pasos" className="hover:text-[#FBBF24] transition-colors">¿Cómo Funciona?</a></li>
                <li><a href="#registro" className="hover:text-[#FBBF24] transition-colors">Expediente RUACE PET593</a></li>
                <li><a href="#historias" className="hover:text-[#FBBF24] transition-colors">Historias Felices</a></li>
                <li><a href="#faq" className="hover:text-[#FBBF24] transition-colors">Preguntas Frecuentes</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Contacto Nacional</h5>
              <ul className="space-y-2 text-xs">
                <li>WhatsApp: +593 96 418 0420</li>
                <li>Sede: Villaflora (Quito Sur)</li>
                <li>Atención: Lunes a Sábado 8:30 AM - 6:30 PM</li>
                <li>Ecuador (Cobertura Nacional)</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} RUACE PET593 · Cumplimiento LOPDP Ecuador 2026. Todos los derechos reservados.</p>
            <p>Conectado directamente a Supabase · Tabla: <span className="font-mono text-[#FBBF24]">ruace_pet539_leads</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
