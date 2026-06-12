// evaEngine.ts
// Lógica determinística para Eva IA conectada a Supabase

export type Career = {
  id: string;
  name: string;
  slug: string;
  area: string;
  modality: string;
  duration?: string | null;
  monthly_price?: number | string | null;
  enrollment_price?: number | string | null;
  description?: string | null;
};

export type EvaIntent = {
  modality?: "En línea" | "Presencial" | "Sabatina" | null;
  area?: string | null;
  careerName?: string | null;
};

export type EvaConversationState = {
  intent: EvaIntent;
  pendingAction?: string | null;
};

export type EvaResponse = {
  text: string;
  nextState: EvaConversationState;
};

const ONLINE_SYNONYMS = [
  "online",
  "on line",
  "en linea",
  "en línea",
  "remoto",
  "remota",
  "remotos",
  "remotas",
  "virtual",
  "virtuales",
  "a distancia",
  "desde casa",
];

const PRESENTIAL_SYNONYMS = [
  "presencial",
  "en campus",
  "en salon",
  "en salón",
  "fisico",
  "físico",
];

const SATURDAY_SYNONYMS = [
  "sabatina",
  "sabados",
  "sábados",
  "fin de semana",
];

const AREA_SYNONYMS: Record<string, string[]> = {
  Salud: ["salud", "medicina", "nutricion", "nutrición", "psicologia", "psicología", "enfermeria", "enfermería"],
  Derecho: ["derecho", "legal", "abogado", "abogacia", "abogacía", "juridico", "jurídico"],
  Negocios: ["negocios", "empresa", "empresas", "administracion", "administración", "mercadotecnia", "ventas", "marketing", "internacionales"],
  Gastronomía: ["gastronomia", "gastronomía", "cocina", "chef", "culinaria"],
  Tecnología: ["tecnologia", "tecnología", "sistemas", "computacion", "computación", "ingenieria", "ingeniería", "programacion", "programación", "software"],
};

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(input: string, words: string[]): boolean {
  return words.some((word) => input.includes(normalizeText(word)));
}

function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined || price === "") return "";
  const value = typeof price === "number" ? price : Number(price);
  if (Number.isNaN(value)) return "";
  return `$${value.toLocaleString("es-MX")}/mes`;
}

function detectArea(normalized: string): string | null {
  for (const [area, synonyms] of Object.entries(AREA_SYNONYMS)) {
    if (includesAny(normalized, synonyms)) return area;
  }
  return null;
}

// Specific career name fragments — when detected, reset inherited modality
const SPECIFIC_CAREER_TRIGGERS = [
  "nutricion",
  "enfermeria",
  "psicologia",
  "gastronomia",
  "sistemas computacionales",
  "ingenieria en sistemas",
  "ingenieria sistemas",
  "mercadotecnia",
  "negocios internacionales",
  "ventas y mercadotecnia",
  "administracion y desarrollo",
  "desarrollo empresarial",
];

export function detectsSpecificCareer(userInput: string): boolean {
  const n = normalizeText(userInput);
  // "derecho" handled separately — matches its own area without overlap
  return (
    SPECIFIC_CAREER_TRIGGERS.some((t) => n.includes(normalizeText(t))) ||
    // standalone "derecho" (not part of a modality phrase)
    /\bderecho\b/.test(n)
  );
}

function mergeIntent(
  prev: EvaIntent,
  detected: Partial<EvaIntent>,
  resetModality = false,
): EvaIntent {
  return {
    // explicit reset → null; new value → use it; else inherit
    modality: resetModality ? null : (detected.modality ?? prev.modality ?? null),
    area: detected.area ?? prev.area ?? null,
    careerName: detected.careerName ?? prev.careerName ?? null,
  };
}

function detectIntent(
  userInput: string,
  previousIntent: EvaIntent,
): EvaIntent {
  const normalized = normalizeText(userInput);

  const detected: Partial<EvaIntent> = {};

  // Detect modality in current message
  let hasModalityInMessage = false;
  if (includesAny(normalized, ONLINE_SYNONYMS)) {
    detected.modality = "En línea";
    hasModalityInMessage = true;
  } else if (includesAny(normalized, PRESENTIAL_SYNONYMS)) {
    detected.modality = "Presencial";
    hasModalityInMessage = true;
  } else if (includesAny(normalized, SATURDAY_SYNONYMS)) {
    detected.modality = "Sabatina";
    hasModalityInMessage = true;
  }

  const detectedArea = detectArea(normalized);
  if (detectedArea) {
    detected.area = detectedArea;
  }

  // If a specific career is named WITHOUT a modality in the same message → reset inherited modality
  const careerDetected = detectsSpecificCareer(userInput);
  const resetModality = careerDetected && !hasModalityInMessage;
  if (careerDetected) detected.careerName = normalized; // flag it

  return mergeIntent(previousIntent, detected, resetModality);
}

function filterCareers(careers: Career[], intent: EvaIntent): Career[] {
  let filtered = [...careers];

  if (intent.modality) {
    filtered = filtered.filter(
      (career) => normalizeText(career.modality) === normalizeText(intent.modality!),
    );
  }

  if (intent.area) {
    filtered = filtered.filter(
      (career) => normalizeText(career.area) === normalizeText(intent.area!),
    );
  }

  return filtered;
}

function groupCareersByArea(careers: Career[]): Record<string, Career[]> {
  return careers.reduce<Record<string, Career[]>>((acc, career) => {
    const area = career.area || "General";
    if (!acc[area]) acc[area] = [];
    acc[area].push(career);
    return acc;
  }, {});
}

function renderCareersByArea(careers: Career[]): string {
  if (!careers.length) {
    return "No encontré carreras con ese criterio en este momento.";
  }

  const grouped = groupCareersByArea(careers);
  const lines: string[] = ["Estas son las carreras disponibles:\n"];

  Object.entries(grouped).forEach(([area, items]) => {
    lines.push(`${area}:`);
    items.forEach((career) => {
      lines.push(`• ${career.name}`);
    });
    lines.push("");
  });

  lines.push("¿Te interesa alguna en particular?");
  return lines.join("\n");
}

function renderOnlineCareers(careers: Career[]): string {
  if (!careers.length) {
    return "No contamos con carreras en línea en este momento.";
  }

  const lines: string[] = ["Tenemos estas carreras 100% en línea:\n"];

  careers.forEach((career) => {
    const price = formatPrice(career.monthly_price);
    lines.push(`• ${career.name} — ${price || "Precio por confirmar"}`);
    lines.push("");
  });

  lines.push(
    "Clases en vivo mar/jue 20:00–22:00 hrs + grabaciones. Mismo título y validez SEP que presencial. ¿Te interesa alguna?",
  );

  return lines.join("\n");
}

function renderPresentialCareers(careers: Career[]): string {
  if (!careers.length) {
    return "No encontré carreras presenciales en este momento.";
  }

  const lines: string[] = ["Estas son nuestras carreras presenciales:\n"];

  careers.forEach((career) => {
    lines.push(`• ${career.name} — ${formatPrice(career.monthly_price) || "Precio por confirmar"}`);
  });

  lines.push("\n¿Te interesa alguna?");
  return lines.join("\n");
}

function renderSaturdayCareers(careers: Career[]): string {
  if (!careers.length) {
    return "No encontré carreras sabatinas en este momento.";
  }

  const lines: string[] = ["Estas son nuestras opciones sabatinas:\n"];

  careers.forEach((career) => {
    lines.push(`• ${career.name} — ${formatPrice(career.monthly_price) || "Precio por confirmar"}`);
  });

  lines.push("\n¿Quieres que te explique cómo funcionan los horarios?");
  return lines.join("\n");
}

function renderAreaRecommendation(area: string, careers: Career[]): string {
  if (!careers.length) {
    return `No encontré carreras del área de ${area} en este momento.`;
  }

  const lines: string[] = [`Estas son las carreras del área de ${area}:\n`];

  careers.forEach((career) => {
    lines.push(`• ${career.name} — ${career.modality}`);
  });

  lines.push("\n¿Quieres que te recomiende la mejor opción según tu perfil?");
  return lines.join("\n");
}

export function renderFallback(): string {
  return [
    "Puedo ayudarte con:",
    "",
    "• Carreras disponibles",
    "• Costos y becas",
    "• Requisitos de inscripción",
    "• Modalidades",
    "",
    "¿Qué te gustaría saber?",
  ].join("\n");
}

export function asksForPrograms(normalized: string): boolean {
  return (
    normalized.includes("carreras") ||
    normalized.includes("programas") ||
    normalized.includes("opciones") ||
    normalized.includes("que tienen") ||
    normalized.includes("que ofrecen") ||
    normalized.includes("tienen")
  );
}

function asksForRecommendation(normalized: string): boolean {
  return (
    normalized.includes("cual recomiendas") ||
    normalized.includes("cual me conviene") ||
    normalized.includes("no se cual") ||
    normalized.includes("trabajo") ||
    normalized.includes("no tengo tiempo")
  );
}

export function buildEvaResponse(
  userInput: string,
  careers: Career[],
  previousState?: EvaConversationState,
): EvaResponse {
  const prevState: EvaConversationState = previousState ?? {
    intent: {
      modality: null,
      area: null,
      careerName: null,
    },
  };

  const normalized = normalizeText(userInput);
  const intent = detectIntent(userInput, prevState.intent);

  // 1. Si ya detectamos modalidad en línea, priorizar SIEMPRE esa ruta.
  if (intent.modality === "En línea") {
    const onlineCareers = filterCareers(careers, { modality: "En línea" });
    return {
      text: renderOnlineCareers(onlineCareers),
      nextState: { intent },
    };
  }

  // 2. Presencial
  if (intent.modality === "Presencial") {
    const presentialCareers = filterCareers(careers, { modality: "Presencial" });
    return {
      text: renderPresentialCareers(presentialCareers),
      nextState: { intent },
    };
  }

  // 3. Sabatina
  if (intent.modality === "Sabatina") {
    const saturdayCareers = filterCareers(careers, { modality: "Sabatina" });
    return {
      text: renderSaturdayCareers(saturdayCareers),
      nextState: { intent },
    };
  }

  // 4. Área específica
  if (intent.area) {
    const areaCareers = filterCareers(careers, { area: intent.area });
    return {
      text: renderAreaRecommendation(intent.area, areaCareers),
      nextState: { intent },
    };
  }

  // 5. Recomendación básica por intención de flexibilidad
  if (asksForRecommendation(normalized)) {
    const onlineCareers = filterCareers(careers, { modality: "En línea" });

    if (onlineCareers.length) {
      return {
        text: [
          "Si buscas flexibilidad para trabajar o estudiar a tu ritmo, te recomiendo estas opciones en línea 👇",
          "",
          ...onlineCareers.map(
            (career) => `• ${career.name} — ${formatPrice(career.monthly_price) || "Precio por confirmar"}`,
          ),
          "",
          "¿Quieres que te diga cuál te conviene más según tu perfil?",
        ].join("\n"),
        nextState: {
          intent: {
            ...intent,
            modality: "En línea",
          },
        },
      };
    }
  }

  // 6. Si solo pregunta por carreras en general
  if (asksForPrograms(normalized)) {
    return {
      text: renderCareersByArea(careers),
      nextState: { intent },
    };
  }

  // 7. Fallback final
  return {
    text: renderFallback(),
    nextState: { intent },
  };
}
