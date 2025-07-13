# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CICEG-HG-APP is an Angular 20 medical records management system for Hospital General San Luis de la Paz. It's a comprehensive clinical management application with modules for patient registration, medical documentation, and hospital administration.

## Development Commands

```bash
# Start development server
ng serve
# Or
npm start

# Build for production
ng build

# Run unit tests
ng test

# Generate new components/services
ng generate component component-name
ng generate service service-name

# Watch mode for development
ng build --watch --configuration development
```

## Project Architecture

### Core Technologies
- **Angular 20** with standalone components
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **RxJS** for reactive programming
- **Angular Router** for navigation

### Application Structure

The application follows a **medical domain-driven structure**:

```
src/app/
├── auth/                           # Authentication module
├── catalogos/                      # Medical catalogs (medicines, services, etc.)
├── documentos-clinicos/            # Clinical documents (notes, prescriptions, etc.)
├── gestion-expedientes/            # Patient record management
├── nuevo-paciente/                 # Multi-step patient registration wizard
├── personas/                       # Person management (patients, staff, admins)
├── notas-especializadas/           # Specialized medical notes
├── shared/                         # Shared components and layouts
├── services/                       # Business logic services
├── models/                         # TypeScript interfaces
├── guards/                         # Route protection
└── utils/                          # Helper utilities
```

## Service Architecture Patterns

### BaseService Pattern
All services extend `BaseService<T>` which provides:
- Standardized CRUD operations
- HTTP error handling with status code mapping
- Loading state management via BehaviorSubject
- Retry logic and timeout handling
- Common filtering and pagination

**Usage:**
```typescript
@Injectable({ providedIn: 'root' })
export class MyService extends BaseService<MyModel> {
  protected endpoint = '/my-resource';
  // Inherits all CRUD operations automatically
}
```

### State Management
- **WizardStateService** manages complex multi-step form state with session persistence
- **CatalogoService** handles medical catalogs with caching and fallback data
- Services use BehaviorSubject for reactive state updates

### API Integration
- Base URL: `http://localhost:3000/api`
- Standardized `ApiResponse<T>` interface
- Built-in timeout and retry mechanisms
- Graceful error handling with fallback to static data

## Key Application Features

### Wizard Patient Registration
Multi-step patient registration flow with validation:
1. Personal data (`paso-persona`)
2. Medical data (`paso-paciente`) 
3. Medical record creation (`paso-expediente`)
4. Clinical document selection and completion

Routes: `/app/nuevo-paciente/*`

### Medical Documentation System
Comprehensive clinical document management:
- Historia Clínica (Medical History)
- Notas de Evolución (Evolution Notes) 
- Notas de Urgencias (Emergency Notes)
- Prescripciones y Referencias (Prescriptions & Referrals)
- Consentimientos Informados (Informed Consent)

### Catalog Management
Medical reference data including:
- Medicamentos (Medications)
- Servicios Médicos (Medical Services)
- Tipos de Sangre (Blood Types)
- Estudios Médicos (Medical Studies)

## Component Patterns

### Shared Components
- **WizardLayout**: Handles multi-step form navigation with progress tracking
- **DashboardLayout**: Main application layout with sidebar navigation
- **ModernSidebar**: Responsive navigation component
- **CatalogoSelector**: Reusable dropdown for medical catalogs

### Form Handling
- Reactive forms with comprehensive validation
- Custom validators in `validation-helpers.ts`
- Form state persistence during wizard flows

## Authentication & Routing

### Current State
- Simple boolean-based authentication (placeholder)
- Route guards are defined but currently disabled
- All routes redirect to `/app/dashboard` as default

### Protected Routes Structure
```
/app/
├── dashboard                       # Main dashboard
├── nuevo-paciente/*               # Patient registration wizard
├── personas/*                     # People management
├── catalogos/*                    # Medical catalogs
├── documentos-clinicos/*          # Clinical documents
├── gestion-expedientes/*          # Patient records
└── notas-especializadas/*         # Specialized notes
```

## Styling & UI

### Tailwind CSS Configuration
- Custom hospital theme with medical-appropriate colors
- Responsive design patterns
- Component-specific CSS files for complex styling

### UI Patterns
- Dashboard cards with statistics
- Modal dialogs for data entry
- Progressive disclosure in wizard flows
- Accessible form controls with proper validation feedback

## Testing Strategy

### Current Setup
- Karma + Jasmine for unit testing
- Test files use `.spec.ts` extension
- Component testing with Angular Testing utilities

### Generate Tests
```bash
ng generate component component-name --spec
ng generate service service-name --spec
```

## Important Implementation Notes

### Data Models
- Comprehensive TypeScript interfaces in `models/`
- Medical domain-specific models (Paciente, HistoriaClinica, NotaEvolucion)
- Centralized model exports in `models/index.ts`

### Error Handling
- Centralized error handling in BaseService
- User-friendly error messages for medical staff
- Graceful degradation when backend services are unavailable

### Medical Validation
- Custom validators for medical data (vital signs, medical codes)
- Age-appropriate validation for pediatric vs adult patients
- Required field validation based on medical documentation standards

## Development Workflow

1. **New Features**: Follow the domain-driven module structure
2. **Services**: Extend BaseService for consistent patterns
3. **Components**: Use shared components for common UI patterns
4. **Models**: Add TypeScript interfaces to models/ directory
5. **Routing**: Follow the nested route structure for feature modules
6. **Styling**: Use Tailwind classes with component-specific CSS for complex layouts

## Future Enhancement Areas

- Implement proper JWT authentication system
- Add role-based access control for different medical staff levels
- Implement comprehensive audit logging for medical record changes
- Add real-time notifications for critical patient alerts
- Enhance offline capabilities for areas with poor connectivity