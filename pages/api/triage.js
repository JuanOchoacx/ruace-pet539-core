import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Consolidado en un solo skill de IA

const GoogleGenAI = GoogleGenerativeAI;

// Inicialización de los únicos 2 módulos activos del ecosistema
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Abm7RRtKLhITutAvDjkViw_PPh1w5XL'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { lead_id, owner_name, pet_name, current_status, pet_travel_intent } = req.body || {};

  try {
    // SKILL ACTIVO 1: Motor Predictivo de IA (Google AI / Anthropic)
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key de IA no configurada en el entorno');
    }

    const ai = new GoogleGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Actúas como el asesor comercial predictivo de la marca RUACE PET539 en Quito, Ecuador.
      Analiza estas variables del lead: Tutor: ${owner_name || 'el tutor'}, Mascota: ${pet_name || 'la mascota'}, Estado: ${current_status || 'Sin microchip'}, Viaje: ${pet_travel_intent || 'No'}.
      Genera una sugerencia de venta ultra-corta (máximo 25 palabras) en español. Si viaja pronto, prioriza urgencia por microchip ISO. Si usa solo placa, resalta el riesgo de pérdida según el Scraping de la Fase 1. Mantén estricto anonimato institucional.
    `;

    const aiResponse = await model.generateContent(prompt);
    const adviceText = aiResponse.response.text().trim();

    // SKILL ACTIVO 2: Persistencia y Sincronización en Base de Datos (Supabase)
    if (req.body?.owner_email) {
      const { error } = await supabase
        .from('leads')
        .update({ pet_travel_intent: adviceText }) // Sincronizado con la columna visible de destino
        .eq('owner_email', req.body.owner_email);

      if (error) {
        console.warn('Advertencia al actualizar en Supabase:', error.message);
      }
    } else if (lead_id && !String(lead_id).startsWith('demo-')) {
      const { error } = await supabase
        .from('leads')
        .update({ pet_travel_intent: adviceText })
        .eq('id', lead_id);

      if (error) {
        console.warn('Advertencia al actualizar en Supabase:', error.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      advice: adviceText, 
      triage: adviceText 
    });
  } catch (error) {
    console.error('Error en el backend unificado:', error);
    
    // Fallback inteligente según reglas de negocio de RUACE PET539
    let fallbackAdvice = "Sugerencia: Contactar de inmediato vía WhatsApp para ofrecer microchip ISO de seguridad.";
    const travel = (pet_travel_intent || '').toLowerCase();
    const status = (current_status || '').toLowerCase();

    if (travel.includes('corto') || travel.includes('internacional') || travel.includes('próximo')) {
      fallbackAdvice = "🚨 Urgencia Pet Travel: Priorizar microchip homologado ISO 15 dígitos por plazos de Agrocalidad y aerolíneas.";
    } else if (status.includes('placa')) {
      fallbackAdvice = "⚡ Alto Riesgo: Reemplazar placa externa con microchip subdérmico y PETCÉDULA física ante riesgo de pérdida en Quito.";
    }

    // Persistencia de fallback en Supabase si aplica
    if (req.body?.owner_email) {
      try {
        await supabase
          .from('leads')
          .update({ pet_travel_intent: fallbackAdvice })
          .eq('owner_email', req.body.owner_email);
      } catch (err) {
        console.warn('Fallback sync warning by email:', err.message);
      }
    } else if (lead_id && !String(lead_id).startsWith('demo-')) {
      try {
        await supabase
          .from('leads')
          .update({ pet_travel_intent: fallbackAdvice })
          .eq('id', lead_id);
      } catch (err) {
        console.warn('Fallback sync warning by id:', err.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      advice: fallbackAdvice, 
      triage: fallbackAdvice 
    });
  }
}
