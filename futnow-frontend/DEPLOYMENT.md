# 🚀 Despliegue de FutNow MVP

Este documento recoge la hoja de ruta definitiva para el Tribunal Universitario sobre cómo se despliega orgánicamente esta aplicación React + Vite en la infraestructura de la nube, apoyado sobre **Vercel** para frontend y **Supabase** para backend.

## 1. Por qué Vercel (Frente a Netlify)
Se ha seleccionado **Vercel** por encima de Netlify por los siguientes motivos arquitectónicos para este MVP:
- Integración Nivel Cero con Vite y repositorios GitHub (compilación en menos de 30 segundos).
- Diagnóstico nativo del compilador TSC: protege de colapsar la producción si hay algún tipado erróneo.
- El fichero anexo `vercel.json` (que ya está incluido en el repo) asegura que las Rutas SPA actúen puramente del lado del cliente, evitando errores "404 Not Found" característicos de Netlify si se olvida configurar el `_redirects`.

## 2. Variables de Entorno Requeridas en Vercel
En la pestaña *Settings > Environment Variables* de tu proyecto en Vercel debidamente vinculado a tu GitHub, deberás inyectar únicamente dos constantes. Nunca subas tu `.env` local al repositorio.

| CLAVE | DESCRIPCIÓN | ORIGEN SUPABASE |
|-------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Endpoint maestro de tu BBDD. | *Project Settings > API > URL* |
| `VITE_SUPABASE_ANON_KEY` | Llave anónima pública JWT. | *Project Settings > API > anon public* |

## 3. Checklist Definitiva de Certificación MVP (TFG)
Verifica esto con tu tutor o tribunal en la prueba final de la aplicación desplegada:

🟢 **Seguridad y Accesos**
- [ ] Logro Registrar un Usuario sin errores.
- [ ] Logro hacer Login (Acceso) y se persisten mis credenciales (Session).
- [ ] La consola central no emite errores 404 ni 500 al arrancar la pantalla de Inicio.

🟢 **Ajustes de Identidad**
- [ ] Puedo revisar y cargar mi Perfil (`/profile`).
- [ ] Consigo sobreescribir mi "Nickname" e instalar mi Avatar y Posición.

🟢 **Transacciones de Dominio Deportivo**
- [ ] Logro Crear un Partido y automáticamente aparece listado globalmente.
- [ ] Acceso a los Detalles del partido y sus variables de estado cuadran.
- [ ] Acción Reservar: Logro Apuntarme a un evento (`join_match`) y mi firma consta en el Array.
- [ ] Acción Revocar: Puedo Ceder Mi Plaza y desapuntarme (`leave_match`) y salir limpio del panel.

🟢 **Ciclos de Vida de los Partidos**
- [ ] El organizador nativo logra ejecutar la orden "Clausurar Evento" correctamente (Partido -> Cancelado).
- [ ] El historial (`/my-matches`) documenta certeramente qué organicé y dónde asistí.

🟢 **Privilegios Jerárquicos y Escalado RLS**
- [ ] Rol Normal: Oculto panel Administrador de la cabecera e imposibilitado de romper partidos ajenos.
- [ ] Rol Admin: Visibilidad absoluta técnica en `/admin`.
- [ ] Operación Admin: El Administrador puede "Forzar Suspensión" sobre perfiles básicos con éxito transaccional aséptico RPC.
- [ ] RLS Operativo: El usuario Suspendido sufre UX Capada en Frontal y su consola bloquea accesos RPC de edición o apunte.
