import { Test, TestingModule } from '@nestjs/testing';
import { AssistedSourcingController } from './assisted-sourcing.controller';

describe('AssistedSourcingController', () => {
  let controller: AssistedSourcingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssistedSourcingController],
    }).compile();

    controller = module.get<AssistedSourcingController>(AssistedSourcingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
