# Gestor de revisión y mantenimiento de aulas escolares

Aplicación web administrativa para reportar y dar seguimiento a daños en infraestructura educativa.

**Slogan:** "Cuidar el aula es cuidar el futuro".

## Acceso de prueba

Puedes iniciar sesión con cualquiera de estas cuentas:

- Correo: `coordinacion@escuela.edu`
- Contraseña: `AulaSegura2026`

o

- Correo: `mantenimiento@escuela.edu`
- Contraseña: `Mantto123`

## Inicio rápido

1. Instala dependencias con `npm install`.
2. Levanta la app con `npm run dev`.
3. Abre `http://localhost:5173/` en tu navegador.
4. Inicia sesión con correo y contraseña válidos.
5. Completa el captcha visual y entra al panel.

## ¿Cómo funciona el captcha?

Antes de entrar al dashboard, debes seleccionar exactamente:

- `Banco`
- `Ventana`
- `Puerta`

Importante: el captcha es solo una verificación de acceso y **no limita** los elementos que puedes reportar en mantenimiento.

## Seguridad y validaciones

- Si el correo no existe, la app muestra un mensaje específico.
- Si la contraseña es incorrecta, la app lo notifica.
- Si hay 5 intentos fallidos, el acceso se bloquea durante 60 minutos.
- El contador de intentos y bloqueo se guarda en `localStorage`.

## Cómo reportar una incidencia

1. En el dashboard, selecciona el aula.
2. En el formulario del aula, captura:
   - Elemento afectado.
   - Descripción del daño.
   - Prioridad (Alta, Media o Normal).
3. Presiona **Guardar reporte**.
4. Verifica el historial de incidencias en esa misma aula.

## Elementos de mantenimiento disponibles

La app permite reportar:

- Banco
- Pizarrón
- Puerta
- Ventana
- Pared
- Techo
- Piso
- Iluminación
- Contactos eléctricos
- Ventilación
- Otro (con campo para especificar)

## Prioridades y colores

- **Alta:** naranja (urgente).
- **Media:** amarillo (atención).
- **Normal:** verde (operativa).

Las aulas con prioridad alta se muestran primero para facilitar la atención inmediata.

## Estado de red

- Si no hay internet, verás aviso de **Conexión inestable**.
- Si guardar tarda demasiado, verás **Tiempo de espera agotado**.
- Cuando vuelve la conexión, el estado regresa a estable.

## Recuperación de cuenta

Desde el login, usa **Restablecer cuenta (correo o teléfono)** e ingresa:

- Correo vinculado, o
- Teléfono vinculado.

La app valida si el dato existe y muestra confirmación.

## Nota técnica

Actualmente la persistencia es local (navegador) usando `localStorage`.
Si necesitas entorno multiusuario real, el siguiente paso recomendado es conectar Supabase o Firebase.
