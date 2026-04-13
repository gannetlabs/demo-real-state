import { GeneratedContent, ContentPlatform } from "@/types/content";
import { Property } from "@/types/property";

export function generateMockContent(property: Property): GeneratedContent[] {
  const ts = new Date().toISOString();
  return [
    {
      id: `cnt-${property.id}-web`,
      propertyId: property.id,
      platform: "web_listing",
      status: "generated",
      title: property.title,
      body: `${property.description}\n\n**Características principales:**\n- Superficie: ${property.sqm} m²\n- Dormitorios: ${property.bedrooms}\n- Baños: ${property.bathrooms}\n- Ubicación: ${property.location}\n\n**Destacados del barrio:**\nZona premium con acceso a transporte público, centros comerciales y espacios verdes. Ideal tanto para uso residencial como inversión. La zona ha experimentado una valorización constante del 12% anual en los últimos 3 años.\n\n**Condiciones de venta:**\nPrecio: ${property.currency} ${property.price.toLocaleString()}\nAcepta financiación bancaria. Escritura inmediata. Apto crédito hipotecario.\n\nContactanos para coordinar una visita personalizada.`,
      callToAction: "Agendar visita",
      createdAt: ts,
    },
    {
      id: `cnt-${property.id}-blog`,
      propertyId: property.id,
      platform: "blog_article",
      status: "generated",
      title: `¿Por qué invertir en ${property.location.split(",")[0]}? Descubrí esta oportunidad única`,
      body: `El mercado inmobiliario en ${property.location.split(",")[0]} sigue consolidándose como una de las mejores opciones de inversión en Argentina. En García & Asociados, identificamos oportunidades que combinan calidad de vida con retorno de inversión.\n\nHoy te presentamos **${property.title}**, una propiedad de ${property.sqm} m² que redefine lo que significa vivir bien.\n\n## ¿Qué hace especial a esta propiedad?\n\n${property.description}\n\nCon ${property.bedrooms} dormitorios y ${property.bathrooms} baños, esta propiedad se adapta perfectamente tanto para familias como para profesionales que buscan un espacio premium.\n\n## El valor de la ubicación\n\n${property.location} es sinónimo de calidad de vida. Acceso directo a las principales vías de comunicación, oferta gastronómica de primer nivel y una comunidad en constante crecimiento hacen de esta zona una apuesta segura.\n\n## Inversión inteligente\n\nA un precio de **${property.currency} ${property.price.toLocaleString()}**, esta propiedad representa una oportunidad de inversión con un potencial de valorización superior al promedio del mercado.\n\n**¿Querés conocerla?** Contactanos y coordinamos una visita sin compromiso.`,
      hashtags: ["#inmobiliaria", "#inversión", "#propiedades", `#${property.location.split(",")[0].replace(/\s/g, "")}`],
      createdAt: ts,
    },
    {
      id: `cnt-${property.id}-igcarousel`,
      propertyId: property.id,
      platform: "instagram_carousel",
      status: "generated",
      title: `${property.title} ✨`,
      body: `${property.sqm}m² de puro diseño en ${property.location} 🏠\n\n💰 ${property.currency} ${property.price.toLocaleString()}\n🛏 ${property.bedrooms} dormitorios | 🚿 ${property.bathrooms} baños\n\n${property.description.substring(0, 150)}...\n\n📩 Link en bio para más info\n¡No te la pierdas!`,
      hashtags: [
        "#propiedadesargentina",
        "#inmobiliaria",
        "#departamento",
        "#inversiones",
        "#realestate",
        `#${property.location.split(",")[0].replace(/\s/g, "").toLowerCase()}`,
        "#hogar",
        "#vivienda",
        "#argentina",
        "#bienesraices",
      ],
      slides: [
        { id: "s1", imageIndex: 0, caption: `✨ ${property.title}`, order: 0 },
        { id: "s2", imageIndex: 1, caption: `${property.sqm}m² · ${property.bedrooms} dorm · ${property.bathrooms} baños`, order: 1 },
        { id: "s3", imageIndex: 2, caption: `📍 ${property.location}`, order: 2 },
        { id: "s4", imageIndex: 0, caption: `💰 ${property.currency} ${property.price.toLocaleString()} · Contactanos`, order: 3 },
      ],
      callToAction: "Ver más detalles",
      createdAt: ts,
    },
    {
      id: `cnt-${property.id}-igstory`,
      propertyId: property.id,
      platform: "instagram_story",
      status: "generated",
      title: "NUEVA PROPIEDAD 🔥",
      body: `🏠 ${property.title}\n\n📍 ${property.location}\n💰 ${property.currency} ${property.price.toLocaleString()}\n📐 ${property.sqm}m²\n\n⬆️ Deslizá para más info`,
      callToAction: "Ver propiedad",
      createdAt: ts,
    },
    {
      id: `cnt-${property.id}-fb`,
      propertyId: property.id,
      platform: "facebook_post",
      status: "generated",
      title: `🏠 Nueva propiedad disponible en ${property.location}`,
      body: `¡Tenemos algo especial para vos! 🎉\n\n**${property.title}**\n\n📍 ${property.location}\n💰 ${property.currency} ${property.price.toLocaleString()}\n📐 ${property.sqm} m² · 🛏 ${property.bedrooms} dormitorios · 🚿 ${property.bathrooms} baños\n\n${property.description}\n\n¿Te interesa? Dejanos un comentario o escribinos por privado para coordinar una visita. ¡Las mejores oportunidades no esperan! ⏰\n\n👉 García & Asociados Propiedades\n📞 +54 11 5555-0100\n🌐 www.garciaasociados.com`,
      hashtags: ["#inmobiliaria", "#propiedades", "#buenosaires", "#oportunidad"],
      callToAction: "Contactar ahora",
      createdAt: ts,
    },
    {
      id: `cnt-${property.id}-li`,
      propertyId: property.id,
      platform: "linkedin_post",
      status: "generated",
      title: `Oportunidad de inversión: ${property.title}`,
      body: `En García & Asociados seguimos identificando las mejores oportunidades del mercado inmobiliario argentino.\n\nHoy compartimos una propiedad que destaca por su ubicación estratégica y su potencial de valorización:\n\n📌 ${property.title}\n📍 ${property.location}\n💰 ${property.currency} ${property.price.toLocaleString()}\n📐 ${property.sqm} m²\n\n${property.description}\n\nEl segmento premium en ${property.location.split(",")[0]} ha mostrado un crecimiento sostenido, con una demanda que supera ampliamente la oferta disponible. Esta propiedad representa una oportunidad tanto para uso personal como para inversión con renta.\n\nSi estás evaluando opciones de inversión inmobiliaria o conocés a alguien que pueda estar interesado, no dudes en contactarnos.\n\n#RealEstate #Inversiones #MercadoInmobiliario #Argentina #Propiedades`,
      callToAction: "Solicitar información",
      createdAt: ts,
    },
    {
      id: `cnt-${property.id}-tt`,
      propertyId: property.id,
      platform: "tiktok_script",
      status: "generated",
      title: `🎬 Tour: ${property.title}`,
      body: `Guión para video de 30 segundos - ${property.title}`,
      scriptSections: [
        {
          id: "sc1",
          timestamp: "0:00 - 0:03",
          instruction: "Toma aérea o exterior del edificio/propiedad. Texto en pantalla con precio.",
          narration: `¿Buscás vivir en ${property.location.split(",")[0]}? Mirá esto.`,
        },
        {
          id: "sc2",
          timestamp: "0:03 - 0:08",
          instruction: "Paneo lento del living/espacio principal. Mostrar amplitud.",
          narration: `${property.sqm} metros cuadrados de puro diseño y confort.`,
        },
        {
          id: "sc3",
          timestamp: "0:08 - 0:15",
          instruction: "Cortes rápidos: cocina, dormitorio, baño. Transiciones dinámicas.",
          narration: `${property.bedrooms} dormitorios, ${property.bathrooms} baños, todo pensado al detalle.`,
        },
        {
          id: "sc4",
          timestamp: "0:15 - 0:22",
          instruction: "Toma del mejor feature (vista, terraza, pileta). Cámara lenta.",
          narration: `Y lo mejor... el detalle que lo hace único.`,
        },
        {
          id: "sc5",
          timestamp: "0:22 - 0:30",
          instruction: "Texto en pantalla: precio + contacto. Logo de la inmobiliaria.",
          narration: `${property.currency} ${property.price.toLocaleString()}. Link en bio. No te la pierdas.`,
        },
      ],
      callToAction: "Link en bio",
      createdAt: ts,
    },
  ];
}

export const alternateContent: Record<ContentPlatform, { title: string; body: string }> = {
  web_listing: {
    title: "Versión alternativa",
    body: "Descubrí esta propiedad excepcional que combina ubicación privilegiada con diseño contemporáneo. Cada espacio fue pensado para maximizar la luminosidad natural y el confort. Una inversión inteligente en una zona de alta demanda con proyección de valorización sostenida.",
  },
  blog_article: {
    title: "El nuevo estándar de vida premium en Buenos Aires",
    body: "Buenos Aires no deja de sorprender con propuestas inmobiliarias que elevan el estándar de calidad de vida. En este artículo, analizamos por qué las propiedades premium siguen siendo la inversión más segura del mercado argentino y cómo esta propiedad en particular se destaca del resto.",
  },
  instagram_carousel: {
    title: "Tu próximo hogar te espera 🏡",
    body: "Diseño + ubicación + precio justo = la combinación perfecta.\n\nEsta propiedad tiene TODO lo que estás buscando. Deslizá para ver cada detalle 👉\n\n📩 Escribinos para coordinar tu visita",
  },
  instagram_story: {
    title: "OPORTUNIDAD ÚNICA 🚨",
    body: "Solo por esta semana\n\n🔥 Propiedad exclusiva\n📍 Zona premium\n💰 Precio increíble\n\n⬆️ Swipe up para más info",
  },
  facebook_post: {
    title: "¡No dejes pasar esta oportunidad!",
    body: "Sabemos que encontrar la propiedad ideal no es fácil. Por eso, en García & Asociados seleccionamos solo las mejores opciones del mercado.\n\nEsta propiedad combina todo lo que buscás: ubicación, diseño, amplitud y un precio que se ajusta al valor real del mercado.\n\n¿Querés conocerla en persona? Escribinos y coordinamos una visita esta semana.",
  },
  linkedin_post: {
    title: "Análisis de mercado: por qué este es el momento de invertir",
    body: "Los indicadores del mercado inmobiliario argentino muestran señales claras de recuperación en el segmento premium. En este contexto, compartimos una propiedad que representa una oportunidad de inversión con fundamentos sólidos.\n\nLos datos respaldan la decisión: crecimiento sostenido de precios, demanda en alza y un contexto macroeconómico que favorece la inversión en ladrillos.",
  },
  tiktok_script: {
    title: "POV: Encontraste tu depto soñado",
    body: "Versión alternativa con enfoque POV y storytelling emocional.",
  },
};
