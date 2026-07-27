services/billing-svc/
├── src/
│   ├── domain/                            # Framework-agnostic TypeScript core
│   │   ├── subscription/
│   │   │   ├── subscription.entity.ts
│   │   │   └── subscription.events.ts
│   │   ├── invoice/
│   │   │   ├── invoice.entity.ts
│   │   │   └── invoice.events.ts
│   │   ├── value-objects/
│   │   │   ├── money.vo.ts
│   │   │   └── plan.vo.ts
│   │   └── repositories/                  # Port interfaces
│   │       ├── subscription.repository.interface.ts
│   │       └── invoice.repository.interface.ts
│   │
│   ├── application/                       # Use cases & orchestration
│   │   ├── subscription/
│   │   │   └── commands/
│   │   │       ├── create-subscription.command.ts
│   │   │       └── create-subscription.handler.ts
│   │   ├── dtos/
│   │   │   └── create-subscription.dto.ts
│   │   └── ports/
│   │       └── payment-gateway.interface.ts
│   │
│   ├── infrastructure/                    # Adapters & external integrations
│   │   ├── stripe/
│   │   │   ├── stripe.service.ts
│   │   │   └── stripe-webhook.controller.ts
│   │   └── persistence/
│   │       └── repositories/
│   │           └── subscription.repository.ts
│   │
│   ├── modules/                           # NestJS Feature Modules
│   │   ├── subscription.module.ts
│   │   └── stripe.module.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── bun.lock
├── Dockerfile
├── package.json
└── tsconfig.json