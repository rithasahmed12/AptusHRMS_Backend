import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const TenantInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] as string;
    const domain = request.headers['x-domain'] as string;

    if (!tenantId || !domain) {
      throw new UnauthorizedException('No Header Token available');
    }

    return { tenantId, domain };
  },
);
