import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido. Utiliza POST.' });
  }

  const { owner_name, pet_name, pet_type, current_status, pet_travel_intent } = req.body || {};

  // Regla de Oro de Anonimato y Privacidad
  const sanitizedOwner = (owner_name || 'el tutor').split(' ')[0];
  const sanitizedPet = pet_name || 'la mascota';
  const sanitizedType = pet_type || 'animal de compañía';
  const sanitizedStatus = current_status || 'Sin microchip';
  const sanitizedTravel = pet_travel_intent || 'No';

  try {
    const prompt = `
      Actúas como Asesor Predictivo de Cierre para la marca oficial RUACE PET539 en Quito, Ecuador.
      Analiza las siguientes variables cualificadas del lead:
      - Tutor: ${sanitizedOwner}
      - Mascota: ${sanitizedPet} (${sanitizedType})
      - Estado actual de identificación: ${sanitizedStatus}
      - Intención de viaje: ${sanitizedTravel}

      Instrucciones estrictas:
      1. Genera un consejo táctico y persuasivo de ventas en español para el asesor comercial (máximo 2 frases, menos de 30 palabras).
      2. Si la intención de viaje es próxima/corto plazo, prioriza urgentemente el Microchip Homologado ISO 11784/85 por plazos de Agrocalidad y aerolíneas.
      3. Si el estado actual es 'Solo placa', enfatiza el alto riesgo de desprendimiento en Quito y ofrece la PETCÉDULA física con microchip permanente.
      4. Si no tiene microchip ni cédula, ofrece el registro integral inmediato para evitar extravíos.
      5. Respeta rigurosamente la regla de oro de anonimato: no utilices datos personales externos ni nombres completos.
    `;

    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: prompt,
      temperature: 0.3,
    });

    return res.status(200).json({ 
      advice: text.trim(),
      triage: text.trim() 
    });
  } catch (error) {
    console.error('Error en el motor de triage IA:', error);
    
    // Fallback inteligente según reglas de negocio de RUACE PET539
    let fallbackTip = `Sugerencia: Contactar a ${sanitizedOwner} vía WhatsApp para coordinar la colocación del microchip permanente para ${sanitizedPet}.`;
    
    const travelLow = sanitizedTravel.toLowerCase();
    const statusLow = sanitizedStatus.toLowerCase();
    
    if (travelLow.includes('corto') || travelLow.includes('internacional') || travelLow.includes('próximo')) {
      fallbackTip = `🚨 Urgencia Pet Travel: ${sanitizedOwner} viaja pronto con ${sanitizedPet}. Ofrece microchip ISO 15 dígitos por plazos de Agrocalidad.`;
    } else if (statusLow.includes('placa')) {
      fallbackTip = `⚡ Alto Riesgo: ${sanitizedPet} solo usa placa externa. Enfatiza a ${sanitizedOwner} el microchip subdérmico inviolable ante pérdidas.`;
    }

    return res.status(200).json({ 
      advice: fallbackTip,
      triage: fallbackTip,
      fallback: true 
    });
  }
}
