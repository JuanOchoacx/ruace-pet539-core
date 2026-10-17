import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { owner_name, pet_name, pet_type, current_status, pet_travel_intent } = req.body;

  try {
    // Prompt de contexto corporativo neutral (Regla de Oro de Privacidad)
    const prompt = `
      Actúas como un Asesor Predictivo de Ventas para la marca corporativa RUACE PET539 en Quito, Ecuador.
      Analiza los siguientes datos cualificados de un lead de mascota:
      - Nombre del Tutor: ${owner_name}
      - Mascota: ${pet_name} (${pet_type})
      - Estado actual de identificación: ${current_status}
      - Intención de viaje internacional: ${pet_travel_intent}

      Genera un consejo táctico y persuasivo de ventas corto (máximo 2 frases, 30 palabras) en español. 
      Si la intención de viaje es a corto plazo, prioriza de forma urgente el microchip internacional ISO debido a plazos aeroportuarios.
      Si el estado actual es 'Solo placa', enfatiza el alto riesgo de pérdida detectado en la inteligencia de mercado local. No uses datos personales externos.
    `;

    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: prompt,
      temperature: 0.3,
    });

    return res.status(200).json({ advice: text.trim() });
  } catch (error) {
    console.error('Error en el motor predictivo:', error);
    return res.status(500).json({ advice: "Sugerencia: Contactar de inmediato vía WhatsApp para ofrecer el Kit de Identificación Permanente." });
  }
}
