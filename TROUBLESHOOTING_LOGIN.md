# Troubleshooting - Error 401 después del Login

## Problema
Después de hacer login con un usuario ADMIN, las peticiones subsiguientes (como `/api/cart`) reciben error 401 Unauthorized.

## Diagnóstico

### 1. Verificar que el token se guarda correctamente

Abre la consola del navegador (F12) y verifica:

```javascript
// Después del login, ejecuta en la consola:
localStorage.getItem('token')
localStorage.getItem('user')
```

Deberías ver:
- `token`: Un string largo (JWT)
- `user`: Un objeto JSON con los datos del usuario

### 2. Verificar que el interceptor JWT está funcionando

En la consola del navegador, después del login, deberías ver logs como:
```
Login successful, token saved: true
JWT Interceptor: Adding token to request http://localhost:8080/api/cart
```

Si ves:
```
JWT Interceptor: No token or auth endpoint
```
Significa que el token no está disponible cuando se hace la petición.

### 3. Verificar el formato del token en las peticiones

En las DevTools del navegador:
1. Ve a la pestaña "Network"
2. Haz login
3. Busca la petición a `/api/cart`
4. En "Request Headers", verifica que exista:
   ```
   Authorization: Bearer <tu-token-aquí>
   ```

### 4. Verificar que el backend está recibiendo el token

En los logs del backend (consola donde corre Spring Boot), deberías ver logs de autenticación.

Si el backend rechaza el token, puede ser por:
- Token expirado
- Token inválido
- Clave secreta diferente entre generación y validación

## Soluciones Implementadas

### Solución 1: Delay en la recarga del carrito
Agregamos un pequeño delay (100ms) después del login para asegurar que el token esté completamente guardado antes de recargar el carrito.

```typescript
setTimeout(() => {
  this.cartService.reloadCart();
  this.isLoading = false;
  this.router.navigateByUrl(this.returnUrl);
}, 100);
```

### Solución 2: Logging mejorado
Agregamos logs en:
- `AuthService.login()`: Confirma que el token se guardó
- `jwtInterceptor`: Muestra si el token se está agregando a las peticiones

### Solución 3: Orden de interceptores
Cambiamos el orden para que `jwtInterceptor` se ejecute primero:
```typescript
withInterceptors([jwtInterceptor, mockInterceptor, errorInterceptor, loadingInterceptor])
```

## Pasos para Probar

1. Limpia el localStorage:
   ```javascript
   localStorage.clear()
   ```

2. Recarga la página (F5)

3. Intenta hacer login con tu usuario ADMIN

4. Observa la consola del navegador para ver los logs

5. Verifica en Network que el header `Authorization` se está enviando

## Si el problema persiste

### Opción A: Verificar credenciales del usuario ADMIN

Asegúrate de que el usuario existe en la base de datos y tiene el rol ADMIN:

```sql
SELECT u.email, u.first_name, u.last_name, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'tu-email@ejemplo.com';
```

### Opción B: Verificar configuración JWT del backend

En `application.properties` o `application.yml`:
```properties
jwt.secret=tu-clave-secreta
jwt.expiration=86400000  # 24 horas en milisegundos
```

### Opción C: Crear un nuevo usuario ADMIN

Si el usuario está corrupto, crea uno nuevo:

```sql
-- Insertar usuario
INSERT INTO users (email, password, first_name, last_name, birth_date, created_at, updated_at)
VALUES ('admin@cabrejogym.com', '$2a$10$...', 'Admin', 'User', '1990-01-01', NOW(), NOW());

-- Obtener el ID del usuario recién creado
SELECT id FROM users WHERE email = 'admin@cabrejogym.com';

-- Obtener el ID del rol ADMIN
SELECT id FROM roles WHERE name = 'ADMIN';

-- Asignar rol ADMIN al usuario
INSERT INTO user_roles (user_id, role_id)
VALUES (<user_id>, <role_id>);
```

Nota: La contraseña debe estar hasheada con BCrypt. Puedes usar un generador online o crear un endpoint temporal en el backend.

## Logs Útiles

### Frontend (Consola del Navegador)
```
Login successful, token saved: true
JWT Interceptor: Adding token to request http://localhost:8080/api/cart
```

### Backend (Consola de Spring Boot)
```
JWT token is valid for user: admin@cabrejogym.com
User authenticated successfully: admin@cabrejogym.com
```

## Contacto

Si después de seguir estos pasos el problema persiste, proporciona:
1. Screenshot de la consola del navegador
2. Screenshot de la pestaña Network mostrando la petición fallida
3. Logs del backend (últimas 50 líneas)
