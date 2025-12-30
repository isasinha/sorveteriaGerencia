# Angular Development Guidelines

## Arquitetura
- Use Standalone Components (Angular 17+)
- Evite NgModules quando possível
- Organize por features, não por tipo de arquivo

## State Management
- Prefira Signals para estado reativo
- Use RxJS apenas para operações assíncronas complexas
- Evite subscribe() desnecessários, use async pipe

## Performance
- Use OnPush change detection
- Implemente lazy loading
- Use trackBy em *ngFor

## Estilo de Código
- Use TypeScript strict mode
- Siga naming conventions: 
  - Componentes: kebab-case.component.ts
  - Serviços: kebab-case.service.ts
- Sempre tipifique retornos de funções
