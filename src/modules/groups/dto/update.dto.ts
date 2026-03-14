import { PartialType } from "@nestjs/swagger";
import { CreateGroupDto } from "./create.dto.groups";

export class UpdateGroupDto extends PartialType(CreateGroupDto){}