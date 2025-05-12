import { StudentPrefix } from './student-prefix.enum';

export interface Student {
  id: string;
  prefix: StudentPrefix;
  firstName: string;
  lastName: string;
  nickName: string;
  image: string;
  imageRound: string;
}
