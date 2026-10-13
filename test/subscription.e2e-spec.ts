import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CqrsModule } from '@nestjs/cqrs';
import request from 'supertest';

import { SubscriptionController } from '../src/application/subscription/subscription.controller';
import { CreateSubscriptionHandler } from '../src/application/subscription/commands/create-subscription.handler';
import { CancelSubscriptionHandler } from '../src/application/subscription/commands/cancel-subscription.handler';
import { ChangePlanHandler } from '../src/application/subscription/commands/change-plan.handler';
import { GetSubscriptionHandler } from '../src/application/subscription/queries/get-subscription.handler';
import { SUBSCRIPTION_REPOSITORY } from '../src/domain/repositories/subscription.repository.interface';
import { PAYMENT_GATEWAY } from '../src/application/ports/payment-gateway.interface';
import { SubscriptionRepository } from '../src/infrastructure/persistence/repositories/subscription.repository';

describe('Subscription API (e2e)', () => {
  let app: NestFastifyApplication;
  const paymentGateway = {
    attachPaymentMethod: jest
      .fn()
      .mockResolvedValue({ externalCustomerId: 'cus_1' }),
    charge: jest.fn(),
    cancelExternalSubscription: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [SubscriptionController],
      providers: [
        CreateSubscriptionHandler,
        CancelSubscriptionHandler,
        ChangePlanHandler,
        GetSubscriptionHandler,
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useClass: SubscriptionRepository,
        },
        { provide: PAYMENT_GATEWAY, useValue: paymentGateway },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /subscriptions → tạo mới, trả về id', async () => {
    const res = await request(app.getHttpServer())
      .post('/subscriptions')
      .send({
        customerId: 'c1',
        planId: 'starter',
        paymentMethodId: 'pm_1',
        interval: 'monthly',
      })
      .expect(201);

    expect(res.body.subscriptionId).toBeDefined();
    expect(paymentGateway.attachPaymentMethod).toHaveBeenCalled();
  });

  it('POST /subscriptions → 400 khi thiếu field', async () => {
    await request(app.getHttpServer())
      .post('/subscriptions')
      .send({ customerId: 'c1' })
      .expect(400);
  });

  it('GET /subscriptions/:id → trả về subscription vừa tạo', async () => {
    const create = await request(app.getHttpServer())
      .post('/subscriptions')
      .send({
        customerId: 'c2',
        planId: 'pro',
        paymentMethodId: 'pm_2',
        interval: 'yearly',
      })
      .expect(201);

    const id = create.body.subscriptionId;
    const res = await request(app.getHttpServer())
      .get(`/subscriptions/${id}`)
      .expect(200);
    expect(res.body).toMatchObject({
      id,
      customerId: 'c2',
      plan: { id: 'pro-yearly' },
    });
  });

  it('GET /subscriptions/:id → 404 khi không tồn tại', async () => {
    await request(app.getHttpServer())
      .get('/subscriptions/khong-ton-tai')
      .expect(404);
  });

  it('PATCH /subscriptions/:id/plan → đổi plan', async () => {
    const create = await request(app.getHttpServer())
      .post('/subscriptions')
      .send({
        customerId: 'c3',
        planId: 'starter',
        paymentMethodId: 'pm_3',
        interval: 'monthly',
      })
      .expect(201);
    const id = create.body.subscriptionId;

    await request(app.getHttpServer())
      .patch(`/subscriptions/${id}/plan`)
      .send({ newPlanId: 'pro', interval: 'monthly' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/subscriptions/${id}`)
      .expect(200);
    expect(res.body.plan.id).toBe('pro-monthly');
  });

  it('DELETE /subscriptions/:id → huỷ', async () => {
    const create = await request(app.getHttpServer())
      .post('/subscriptions')
      .send({
        customerId: 'c4',
        planId: 'starter',
        paymentMethodId: 'pm_4',
        interval: 'monthly',
      })
      .expect(201);
    const id = create.body.subscriptionId;

    await request(app.getHttpServer())
      .delete(`/subscriptions/${id}`)
      .send({ reason: 'test' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/subscriptions/${id}`)
      .expect(200);
    expect(res.body.status).toBe('cancelled');
  });
});
