import { Property } from "@/types/property";

export const mockProperties: Property[] = [
  {
    id: "prop-1",
    title: "Departamento premium en Puerto Madero",
    location: "Puerto Madero, Buenos Aires",
    price: 285000,
    currency: "USD",
    sqm: 85,
    bedrooms: 2,
    bathrooms: 2,
    description:
      "Exclusivo departamento de 2 ambientes en el corazón de Puerto Madero. Vista panorámica al río, amenities de primer nivel incluyendo piscina, gimnasio y seguridad 24 horas. Pisos de porcelanato, cocina integrada con electrodomésticos de alta gama. Cochera cubierta incluida.",
    photos: [
      { id: "ph-1", url: "/images/prop1-1.jpg", alt: "Living comedor", order: 0 },
      { id: "ph-2", url: "/images/prop1-2.jpg", alt: "Dormitorio principal", order: 1 },
      { id: "ph-3", url: "/images/prop1-3.jpg", alt: "Vista al río", order: 2 },
    ],
    status: "scheduled",
    createdAt: "2026-04-05T10:00:00Z",
    updatedAt: "2026-04-05T14:30:00Z",
  },
  {
    id: "prop-2",
    title: "Casa con jardín en Nordelta",
    location: "Nordelta, Tigre",
    price: 420000,
    currency: "USD",
    sqm: 220,
    bedrooms: 4,
    bathrooms: 3,
    description:
      "Espectacular casa en barrio privado de Nordelta. Amplios espacios, jardín con piscina, parrilla y quincho. Living doble altura, suite principal con vestidor y baño en suite. Calefacción central y alarma perimetral. A metros de colegios y centro comercial.",
    photos: [
      { id: "ph-4", url: "/images/prop2-1.jpg", alt: "Frente de la casa", order: 0 },
      { id: "ph-5", url: "/images/prop2-2.jpg", alt: "Jardín con piscina", order: 1 },
      { id: "ph-6", url: "/images/prop2-3.jpg", alt: "Living doble altura", order: 2 },
    ],
    status: "content_generated",
    createdAt: "2026-04-03T09:00:00Z",
    updatedAt: "2026-04-04T11:00:00Z",
  },
  {
    id: "prop-3",
    title: "PH reciclado en Palermo Soho",
    location: "Palermo Soho, Buenos Aires",
    price: 195000,
    currency: "USD",
    sqm: 65,
    bedrooms: 1,
    bathrooms: 1,
    description:
      "PH reciclado a nuevo con terraza propia en la mejor zona de Palermo Soho. Techos altos, ladrillo expuesto, pisos de madera originales. Terraza de 20m² con parrilla. Luminoso, silencioso y a pasos de las mejores propuestas gastronómicas y culturales.",
    photos: [
      { id: "ph-7", url: "/images/prop3-1.jpg", alt: "Interior PH", order: 0 },
      { id: "ph-8", url: "/images/prop3-2.jpg", alt: "Terraza", order: 1 },
    ],
    status: "draft",
    createdAt: "2026-04-07T16:00:00Z",
    updatedAt: "2026-04-07T16:00:00Z",
  },
];
