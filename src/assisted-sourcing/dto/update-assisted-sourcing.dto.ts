import { PartialType } from '@nestjs/swagger';
import { CreateAssistedSourcingDto } from './create-assisted.dto';


export class UpdateAssistedSourcingDto extends PartialType(
  CreateAssistedSourcingDto,
) {}