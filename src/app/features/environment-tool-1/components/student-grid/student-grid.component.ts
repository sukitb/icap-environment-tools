import {
  Component,
  EventEmitter,
  Input,
  model,
  Output,
  signal,
  ViewChild,
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
import { NzButtonModule } from 'ng-zorro-antd/button';
import { StudentPrefix } from '../../models/student-prefix.enum';
import { v4 as uuidv4 } from 'uuid';
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

  groupName: string = '';

  columnDefs: ColDef[] = [];
  private gridApi!: GridApi;

  rowData: Student[] = [];

  ngOnInit() {
    this.columnDefs = getStudentColumnDefs(this.deleteRow.bind(this));
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onExport() {
    this.gridApi.exportDataAsCsv({
      fileName: 'student-data.csv',
      columnKeys: ['image', 'prefix', 'firstName', 'lastName', 'nickName'],
    });
  }

  // New method to get current grid data
  getCurrentStudents(): Student[] {
    if (!this.gridApi) return [];

    // Get all rows from the grid
    const rowData: Student[] = [];
    this.gridApi.forEachNode((node) => {
      if (node.data) {
        rowData.push(node.data);
      }
    });

    return rowData;
  }

  onCellValueChanged(event: any) {
    // Remove any data emitting code here
    // The data will stay in the grid without notifying parent
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
  }

  deleteRow(data: any) {
    const rowNode = this.gridApi.getRowNode(data.id);
    if (rowNode) {
      this.gridApi.applyTransaction({ remove: [rowNode.data] });
    }
  }
}
