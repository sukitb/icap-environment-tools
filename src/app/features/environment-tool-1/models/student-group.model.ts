import { Student } from './student.model';

export interface Group {
  id: string;
  name: string;
  image: string;
  students: Student[];
}
