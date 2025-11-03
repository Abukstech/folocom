import { Test, TestingModule } from '@nestjs/testing';
import { AssistedSourcingService } from './assisted-sourcing.service';

describe('AssistedSourcingService', () => {
  let service: AssistedSourcingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistedSourcingService],
    }).compile();

    service = module.get<AssistedSourcingService>(AssistedSourcingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
