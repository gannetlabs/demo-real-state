# Plan: MVP Demo SaaS para Inmobiliarias - "PropIA"

## Contexto
El cliente necesita una demo MVP visualmente impactante para mostrar en llamadas de ventas con inmobiliarias. La plataforma automatiza la generación y publicación de contenido multicanal a partir de una sola carga de propiedad. Debe funcionar sin backend, con datos simulados, y ser 100% confiable para demos en vivo.

## Stack Tecnológico
- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **shadcn/ui** - Componentes UI (Tabs, Sidebar, Dialog, Cards, etc.)
- **Zustand** - Estado con persistencia en localStorage
- **motion** (Framer Motion) - Animaciones y transiciones
- **lucide-react** - Iconos
- **@dnd-kit** - Drag & drop para calendario
- **Sonner** - Notificaciones toast
- **date-fns** - Utilidades de fechas

## Estructura de Carpetas

```
src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Redirect a /login
│   ├── globals.css                   # Tailwind + CSS custom properties
│   ├── login/page.tsx                # Pantalla 1: Login
│   └── (dashboard)/
│       ├── layout.tsx                # Shell: sidebar + topbar
│       ├── page.tsx                  # Pantalla 2: Dashboard
│       ├── propiedades/nueva/page.tsx  # Pantalla 3: Formulario
│       ├── generar/[propertyId]/page.tsx  # Pantalla 4: Generación IA
│       ├── contenido/[propertyId]/page.tsx  # Pantalla 5: Preview
│       ├── calendario/[propertyId]/page.tsx  # Pantalla 6: Calendario
│       └── confirmacion/[propertyId]/page.tsx  # Pantalla 7: Confirmación
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── layout/                       # Sidebar, Topbar, UserMenu
│   ├── login/                        # LoginForm
│   ├── dashboard/                    # StatsCards, RecentProperties, WelcomeBanner
│   ├── property/                     # PropertyForm, PhotoDropzone, PhotoPreviewGrid
│   ├── generation/                   # GenerationProgress, ProgressStep, AITypingEffect
│   ├── content/                      # ContentTabs, ContentCard, 7 platform mockups
│   ├── calendar/                     # WeeklyCalendar, CalendarSlot, CalendarEvent
│   ├── confirmation/                 # PublicationSummary, SuccessAnimation
│   └── shared/                       # PageHeader, StepIndicator, LoadingSpinner
├── store/
│   ├── use-auth-store.ts
│   ├── use-property-store.ts
│   ├── use-content-store.ts
│   └── use-calendar-store.ts
├── data/
│   ├── mock-properties.ts            # 2-3 propiedades pre-cargadas
│   ├── mock-content.ts               # Contenido generado simulado (7 plataformas)
│   ├── mock-user.ts                  # Usuario demo
│   └── platforms.ts                  # Definiciones de plataformas
├── types/
│   ├── property.ts
│   ├── content.ts
│   ├── calendar.ts
│   └── user.ts
└── lib/
    ├── utils.ts                      # cn() utility
    ├── constants.ts
    └── storage.ts
```

## Pantallas (7 screens)

### 1. Login (`/login`)
- Split layout: panel izquierdo con branding/gradiente azul oscuro, panel derecho con formulario
- Email + password, validación básica (campos no vacíos)
- Animaciones de entrada con motion

### 2. Dashboard (`/(dashboard)`)
- Sidebar de navegación + topbar con avatar
- Banner de bienvenida, 4 tarjetas de stats (propiedades, contenido, publicaciones, tiempo ahorrado)
- Tabla de propiedades recientes con badges de estado
- Botón prominente "Nueva Propiedad" (color gold/amber)

### 3. Formulario de Propiedad (`/propiedades/nueva`)
- Step indicator horizontal (Paso 1 de 5)
- Dropzone para fotos con preview grid
- Campos: título, ubicación, precio, m², dormitorios, baños, descripción
- Botón "Generar Contenido con IA" con ícono Sparkles

### 4. Generación de Contenido (`/generar/[id]`)
- **Pantalla más impactante visualmente**
- 8 pasos secuenciales con spinners y checks animados (~500ms cada uno)
- Efecto typewriter mostrando texto generándose en vivo
- Ícono central de IA pulsante, partículas/sparkles de fondo
- Auto-navega a preview al completar

### 5. Preview de Contenido (`/contenido/[id]`)
- Tabs para 7 tipos de contenido
- Mockups visuales por plataforma:
  - Web: layout de ficha inmobiliaria
  - Blog: artículo estilo Medium
  - Instagram Carousel: frame de teléfono con carrusel
  - Instagram Story: frame vertical 9:16
  - Facebook: card estilo post de FB
  - LinkedIn: card estilo post profesional
  - TikTok: guión con timestamps y direcciones
- Acciones por pieza: Aprobar, Editar, Regenerar
- Badge "X de 7 aprobados"

### 6. Calendario Semanal (`/calendario/[id]`)
- Grid de 5 columnas (Lunes a Viernes)
- Publicaciones pre-asignadas:
  - Lun: Facebook (10:00)
  - Mar: Instagram Story (12:00)
  - Mié: Instagram Carousel/Reel (18:00)
  - Jue: LinkedIn (09:00)
  - Vie: TikTok (17:00)
- Drag & drop con @dnd-kit para reorganizar
- Botón "Confirmar Calendario"

### 7. Confirmación Final (`/confirmacion/[id]`)
- Resumen de todas las publicaciones programadas
- Botón "Confirmar y Programar Publicaciones"
- Modal de éxito: checkmark animado SVG + confetti CSS + mensaje de confirmación
- "Volver al Dashboard"

## Paleta de Colores
- **Primary:** Navy Blue (#1a2332, #243447)
- **Accent:** Gold/Amber (#d4a853, #c9962b) - para CTAs principales
- **Tech accent:** Teal (#2dd4bf)
- **Background:** Cool White (#f8fafc), Slate (#f1f5f9)
- **Success:** Emerald (#10b981)
- **Text:** Slate-900 (#0f172a), Slate-500 (#64748b)

## Datos Mock
- **Usuario:** "Martín García", inmobiliaria "García & Asociados Propiedades"
- **Propiedades pre-cargadas:** 3 propiedades argentinas (Puerto Madero, Nordelta, Palermo Soho)
- **Contenido:** Templates con interpolación de datos de propiedad, versiones alternativas para "Regenerar"
- **Imágenes:** Placeholder images en `public/images/` (propiedades estilo argentino)

## Orden de Implementación

### Fase 1: Scaffolding
1. create-next-app + shadcn/ui init + dependencias
2. Tailwind config con paleta custom (CSS vars)
3. Types en `src/types/`
4. Zustand stores con persist
5. Root layout (fuentes, metadata)

### Fase 2: Auth & Shell
6. Login page completa
7. Dashboard layout (sidebar + topbar)
8. Dashboard page (stats, propiedades recientes)

### Fase 3: Flujo Core
9. Formulario de propiedad con foto dropzone
10. Datos mock (propiedades, contenido, plataformas)
11. Pantalla de generación con animaciones
12. Preview de contenido con 7 mockups

### Fase 4: Calendario & Cierre
13. Calendario semanal con drag & drop
14. Página de confirmación
15. Animación de éxito

### Fase 5: Pulido
16. Animaciones finales en todas las pantallas
17. Polish visual en mockups de plataformas
18. Pre-seed de datos para que el dashboard luzca poblado
19. Test end-to-end del flujo completo

## Verificación
1. `npm run dev` - verificar que compila sin errores
2. Flujo completo: Login > Dashboard > Nueva Propiedad > Generar > Preview > Calendario > Confirmar
3. Verificar animaciones fluidas en pantalla de generación
4. Verificar drag & drop en calendario
5. Verificar persistencia en localStorage (recargar no pierde datos)
6. Verificar responsividad en 1920x1080 y 1440x900

## Archivos Críticos
- `src/store/use-property-store.ts` - Estado central de propiedades
- `src/data/mock-content.ts` - Contenido simulado realista en español
- `src/app/(dashboard)/layout.tsx` - Shell del dashboard
- `src/components/generation/generation-progress.tsx` - Pantalla de generación (más visual)
- `src/components/content/content-tabs.tsx` - Orquestador de preview de contenido
