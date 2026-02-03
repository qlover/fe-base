import { inject } from './Container';
import { RouteService } from './RouteService';
import type { RouteServiceInterface } from '@/interfaces/RouteServiceInterface';

export class UserService {
  constructor(
    @inject(RouteService) readonly routeService: RouteServiceInterface
  ) {}
}
