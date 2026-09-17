import { PHASE_03_CONTENT_PART_1 } from './phase03ContentPart1';
import { PHASE_03_CONTENT_PART_2 } from './phase03ContentPart2';
import { PHASE_03_CONTENT_PART_3 } from './phase03ContentPart3';

export const PHASE_03_CONTENT: Record<string, { title: string; content: string }> = {
  ...PHASE_03_CONTENT_PART_1,
  ...PHASE_03_CONTENT_PART_2,
  ...PHASE_03_CONTENT_PART_3
};
