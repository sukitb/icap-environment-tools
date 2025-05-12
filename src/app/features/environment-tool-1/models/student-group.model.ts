import { Student } from './student.model';

export interface StudentGroup {
  id: string;
  name: string;
  image: string;
  students: Student[];
}
