# Inversiones DCA

Inversiones DCA es una aplicación web **full‑stack** para planificar y seguir inversiones a largo plazo empleando aportaciones periódicas (DCA) y una cartera diversificada de ETFs. El objetivo de esta aplicación es ofrecer una vista unificada del patrimonio, planificar las aportaciones mensuales y realizar proyecciones de cara a alcanzar las metas financieras establecidas.

## Características principales

* **Dashboard general**: resumen del patrimonio, aportación del mes, rendimiento acumulado y alertas.
* **Planificador mensual**: creación y seguimiento de un plan de aportaciones periódicas. Al marcar un plan como hecho se generan transacciones automáticamente.
* **Calendario**: vista mensual/anual de aportaciones programadas y vencimientos de metas.
* **Cuentas y activos**: gestión de múltiples cuentas (brókers, efectivo) y activos (ETFs, índices, efectivo).
* **Transacciones**: registro manual e importación desde CSV/Excel. Cálculo de precio medio y costes.
* **Proyecciones y simulaciones**: cálculo de CAGR, XIRR y proyección determinista/Monte Carlo.
* **Rebalanceo**: sugerencias de órdenes de rebalanceo basadas en desviaciones respecto a la asignación objetivo.
* **Informes**: generación de informes mensuales y anuales en HTML/PDF, así como exportación de CSV.
* **Notificaciones**: recordatorios por email/in‑app sobre aportaciones pendientes y rebalanceos recomendados.
* **Internacionalización**: soporte para español (predeterminado) e inglés. Formatos locales de fecha y moneda.
* **Autenticación**: inicio de sesión mediante enlaces mágicos (correo electrónico) u OAuth (configurable) con [NextAuth](https://next-auth.js.org/).

## Tecnologías utilizadas

| Capa        | Tecnología                                   |
|-------------|----------------------------------------------|
| Front‑end   | [Next.js 14](https://nextjs.org) (App Router), TypeScript, [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev) |
| Gráficos    | [Recharts](https://recharts.org/)            |
| Back‑end    | Next.js Route Handlers (REST) o tRPC         |
| ORM         | [Prisma](https://www.prisma.io)              |
| Base de datos | PostgreSQL (Supabase o Neon)               |
| Autenticación | [NextAuth](https://next-auth.js.org/)       |
| Internacionalización | [next-intl](https://next-intl-docs.vercel.app/) |
| Tests       | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev) |
| CI/CD       | GitHub Actions + Vercel                      |

## Estructura del proyecto

```text
inversiones-dca/
├── prisma/
│   ├── schema.prisma     # Definición del modelo de datos
│   └── seed.ts           # Semillas de datos de demo
├── src/
│   ├── app/              # Rutas de la app (App Router)
│   │   ├── layout.tsx    # Layout principal con providers
│   │   ├── page.tsx      # Redirección al dashboard
│   │   └── ...           # Otras páginas (dashboard, planificador, etc.)
│   ├── lib/
│   │   ├── prisma.ts     # Cliente Prisma
│   │   ├── auth.ts       # Configuración de NextAuth
│   │   ├── calculations.ts # Utilidades de cálculo (CAGR, XIRR, proyecciones)
│   │   └── projections.ts  # Cálculo de proyecciones y Monte Carlo
│   └── ...
├── .env.example          # Variables de entorno ejemplo
├── next.config.mjs       # Configuración de Next.js
├── tailwind.config.js    # Configuración de Tailwind
├── postcss.config.js     # Configuración de PostCSS
├── tsconfig.json         # Configuración TypeScript
├── package.json          # Dependencias y scripts
└── README.md             # Este archivo
```

## Puesta en marcha

1. **Instalar dependencias**

   Clona el repositorio y ejecuta:

   ```sh
   npm install
   ```

2. **Configurar variables de entorno**

   Copia `.env.example` a `.env` y ajusta los valores. Necesitarás una URL de base de datos PostgreSQL válida (puede ser un servicio de Supabase) y las credenciales de NextAuth.

3. **Migrar y sembrar la base de datos**

   Ejecuta las migraciones y semillas con:

   ```sh
   npm run migrate
   npm run seed
   ```

4. **Levantar el servidor de desarrollo**

   Inicia el servidor de desarrollo con:

   ```sh
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`.

5. **Tests**

   Ejecuta las pruebas unitarias con:

   ```sh
   npm test
   ```

   Los tests end‑to‑end con Playwright se encuentran en `tests/e2e/` y pueden ejecutarse con `npx playwright test`.

## Cron y notificaciones

En `src/jobs/cron.ts` encontrarás un ejemplo de cron periódico (utilizando `setInterval` como mock) que recalcula proyecciones y envía recordatorios. En un entorno de producción se recomienda emplear servicios como Vercel Cron o Upstash QStash con un webhook seguro. Configura la variable `CRON_SECRET` y los endpoints protegidos para estos propósitos.

## Consideraciones

* Esta aplicación **no ejecuta órdenes en brókers ni ofrece asesoramiento financiero personalizado**.
* Los cálculos de proyección y simulación son orientativos y no garantizan resultados futuros.
* Asegúrate de cumplir con la normativa vigente (GDPR, MiFID II, etc.) al desplegar la aplicación en producción.

## Licencia

Este proyecto se proporciona como ejemplo educativo sin garantía de funcionamiento ni soporte. Puedes reutilizar el código bajo los términos de la licencia MIT.