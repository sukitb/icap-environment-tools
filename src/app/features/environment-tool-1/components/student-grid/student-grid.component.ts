import {
  Component,
  EventEmitter,
  Input,
  model,
  Output,
  signal,
} from '@angular/core';
import { Student } from '../../models/student.model';
import { getStudentColumnDefs } from './grid-config/student-grid.config';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import {
  AllCommunityModule,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  type ColDef,
} from 'ag-grid-community'; // Column Definition Type Interface
import { JsonPipe } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { StudentPrefix } from '../../models/student-prefix.enum';
import { v4 as uuidv4 } from 'uuid';
import { mockStudents } from './grid-config/students.mock';
import { NzFlexModule } from 'ng-zorro-antd/flex';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-student-grid',
  imports: [AgGridAngular, NzButtonModule, NzFlexModule],
  templateUrl: './student-grid.component.html',
  styleUrl: './student-grid.component.css',
})
export class StudentGridComponent {
  students = model<Student[]>([]);
  // @Output() studentsChange = new EventEmitter<Student[]>();

  groupName: string = '';

  columnDefs: ColDef[] = [];
  private gridApi!: GridApi;

  rowData: Student[] = [];

  ngOnInit() {
    this.columnDefs = getStudentColumnDefs(this.deleteRow.bind(this));
  }

  getStudentsRowData() {}

  private emitChanges(): void {
    // Get current data from grid
    // const currentData: Student[] = [];
    // this.gridApi.forEachNode((node) => {
    //   if (node.data) {
    //     currentData.push(node.data);
    //   }
    // });
    // this.studentsChange.emit(currentData);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    // this.gridApi.addEventListener('cellValueChanged', () => {
    //   this.emitChanges();
    // });
  }

  onExport() {
    this.gridApi.exportDataAsCsv({
      fileName: 'student-data.csv',
      columnKeys: ['image', 'prefix', 'firstName', 'lastName', 'nickName'],
    });
  }

  onCellValueChanged(event: any) {
    // this.gridApi.refreshCells();
    // this.emitChanges();
  }

  onAddRow() {
    const newRow: Student = {
      id: uuidv4(),
      image: '',
      imageRound: '',
      prefix: StudentPrefix.Mr,
      firstName: '',
      lastName: '',
      nickName: '',
    };
    this.gridApi.applyTransaction({ add: [newRow] });
    // this.emitChanges();
  }

  deleteRow(data: any) {
    const rowNode = this.gridApi.getRowNode(data.id);
    if (rowNode) {
      this.gridApi.applyTransaction({ remove: [rowNode.data] });
      // this.emitChanges();
    }
  }
}
