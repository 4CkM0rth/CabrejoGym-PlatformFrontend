# Arquitectura Frontend - Cabrejo Gym E-commerce

## Patrón de Arquitectura: MVVM (Model-View-ViewModel)

Este proyecto sigue el patrón MVVM de Angular, que es una variación del patrón MVC adaptada para aplicaciones frontend modernas.

## Estructura del Proyecto

```
src/app/
├── core/                    # Módulo Core - Servicios singleton y funcionalidad central
│   ├── guards/             # Guards de autenticación y autorización
│   ├── interceptors/       # HTTP Interceptors (JWT, Error, Loading)
│   ├── models/             # Interfaces y tipos TypeScript (Models)
│   └── services/           # Servicios de negocio (Business Logic)
│
├── features/               # Módulos de características (Feature Modules)
│   ├── account/           # Gestión de cuenta de usuario
│   ├── admin/             # Panel de administración
│   ├── auth/              # Autenticación (Login/Register)
│   ├── branches/          # Gestión de sedes
│   ├── cart/              # Carrito de compras
│   ├── checkout/          # Proceso de pago
│   ├── home/              # Página principal
│   ├── orders/            # Gestión de pedidos
│   └── products/          # Catálogo de productos
│
└── shared/                 # Componentes y utilidades compartidas
    ├── components/        # Componentes reutilizables (Header, Footer)
    ├── layout/            # Layout principal de la aplicación
    ├── directives/        # Directivas personalizadas
    └── pipes/             # Pipes personalizados
```

## Componentes de la Arquitectura MVVM

### 1. MODEL (Modelos)
**Ubicación:** `src/app/core/models/`

Los modelos definen la estructura de datos de la aplicación:
- Interfaces TypeScript
- Enums
- Tipos personalizados

**Ejemplo:**
```typescript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}
```

### 2. VIEW (Vistas)
**Ubicación:** `src/app/features/*/pages/*.component.html`

Las vistas son plantillas HTML que definen la UI:
- Templates HTML
- Directivas de Angular
- Binding de datos
- Event handlers

**Características:**
- Declarativas
- Sin lógica de negocio
- Solo presentación

### 3. VIEWMODEL (Componentes)
**Ubicación:** `src/app/features/*/pages/*.component.ts`

Los componentes actúan como ViewModels:
- Gestionan el estado de la vista
- Manejan la interacción del usuario
- Se comunican con los servicios
- Transforman datos para la vista

**Responsabilidades:**
- Inicialización de datos
- Manejo de formularios
- Navegación
- Validaciones de UI

### 4. SERVICES (Servicios)
**Ubicación:** `src/app/core/services/`

Los servicios contienen la lógica de negocio:
- Comunicación con el backend (HTTP)
- Gestión de estado
- Lógica de negocio reutilizable
- Singleton pattern

**Ejemplo:**
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  login(credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials);
  }
}
```

## Flujo de Datos

```
User Interaction (View)
    ↓
Component (ViewModel)
    ↓
Service (Business Logic)
    ↓
HTTP Request → Backend API
    ↓
Response
    ↓
Service processes data
    ↓
Component updates
    ↓
View renders
```

## Principios de Diseño

### 1. Separación de Responsabilidades
- **Views:** Solo presentación
- **Components:** Lógica de presentación
- **Services:** Lógica de negocio
- **Models:** Estructura de datos

### 2. Inyección de Dependencias
Todos los servicios usan el sistema de DI de Angular:
```typescript
constructor(
  private authService: AuthService,
  private router: Router
) {}
```

### 3. Observables y Programación Reactiva
- RxJS para manejo asíncrono
- Observables para streams de datos
- Operators para transformación

### 4. Lazy Loading
Los módulos de características se cargan bajo demanda:
```typescript
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes')
}
```

## Convenciones de Código

### Nomenclatura
- **Componentes:** `*.component.ts`
- **Servicios:** `*.service.ts`
- **Guards:** `*.guard.ts`
- **Interceptors:** `*.interceptor.ts`
- **Models:** `index.ts` (barrel export)

### Estructura de Componentes
```typescript
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [...],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss']
})
export class FeatureNameComponent implements OnInit {
  // 1. Propiedades públicas
  // 2. Propiedades privadas
  // 3. Constructor con DI
  // 4. Lifecycle hooks
  // 5. Métodos públicos
  // 6. Métodos privados
}
```

### Estructura de Servicios
```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  private apiUrl = `${environment.apiUrl}/feature`;
  
  constructor(private http: HttpClient) {}
  
  // Métodos públicos que retornan Observables
  getAll(): Observable<Feature[]> {
    return this.http.get<Feature[]>(this.apiUrl);
  }
}
```

## Interceptors

### 1. JWT Interceptor
Agrega el token de autenticación a todas las peticiones HTTP.

### 2. Error Interceptor
Maneja errores HTTP globalmente y muestra mensajes al usuario.

### 3. Loading Interceptor
Gestiona el estado de carga global de la aplicación.

## Guards

### 1. Auth Guard
Protege rutas que requieren autenticación.

### 2. Role Guard
Protege rutas basadas en roles de usuario (ADMIN, USER).

## Estado de la Aplicación

### Estado Local
- Gestionado por componentes
- Formularios reactivos
- Variables de componente

### Estado Compartido
- BehaviorSubject en servicios
- Observables para comunicación entre componentes
- LocalStorage para persistencia

## Mejores Prácticas

1. **Un componente, una responsabilidad**
2. **Servicios singleton para lógica compartida**
3. **Componentes standalone para mejor tree-shaking**
4. **Lazy loading para optimización**
5. **Tipado fuerte con TypeScript**
6. **Manejo de errores consistente**
7. **Unsubscribe de observables (async pipe preferido)**
8. **Validaciones en formularios reactivos**
9. **Estilos encapsulados por componente**
10. **Código limpio y documentado**

## Sincronización con Backend

El frontend está completamente sincronizado con el backend Java Spring Boot:
- DTOs coinciden con las entidades del backend
- Enums sincronizados
- Validaciones consistentes
- Manejo de errores unificado

## Testing (Futuro)

```
src/app/
├── *.spec.ts          # Unit tests
└── e2e/               # End-to-end tests
```

## Deployment

El proyecto se compila con:
```bash
ng build --configuration production
```

Genera archivos optimizados en `dist/` listos para deployment.
