import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './features/environment-tool-1/components/student-group-list/student-group-list.component'
      ).then((m) => m.StudentGroupListComponent),
  },
];
