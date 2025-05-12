// student-grid.config.ts
import { ColDef } from 'ag-grid-community';
import { ImageCellRendererComponent } from '../../image-cell-renderer/image-cell-renderer.component';
import { StudentPrefix } from '../../../models/student-prefix.enum';
import { ButtonCellRendererComponent } from '../../button-cell-renderer/button-cell-renderer.component';
import { StudentImageCellEditorComponent } from '../../student-image-cell-editor/student-image-cell-editor.component';
import { ImageRoundCellRendererComponent } from '../../image-round-cell-renderer/image-round-cell-renderer.component';

export const getStudentColumnDefs = (
  onDeleteClick: (data: any) => void,
): ColDef[] => {
  return [
    {
      headerName: 'รูป',
      field: 'image',
      editable: true,
      cellRenderer: ImageCellRendererComponent,
      cellEditor: StudentImageCellEditorComponent, // Add the custom editor
      autoHeight: true, // This column will auto-adjust height
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    {
      headerName: 'รูปวงกลม',
      field: 'imageRound',
      cellRenderer: ImageRoundCellRendererComponent,
      autoHeight: true, // This column will auto-adjust height
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    {
      headerName: 'คำนำหน้า',
      field: 'prefix',
      //   cellEditor: PrefixSelectEditorComponent,
      valueFormatter: (params) => params.value,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [StudentPrefix.Mr, StudentPrefix.Miss],
      },
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    {
      headerName: 'ชื่อ',
      field: 'firstName',
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    {
      headerName: 'นามสกุล',
      field: 'lastName',
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    {
      headerName: 'ชื่อเล่น',
      field: 'nickName',
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    {
      headerName: 'ลบ',
      editable: false,
      cellRenderer: ButtonCellRendererComponent,
      cellRendererParams: {
        onClick: onDeleteClick,
      },
    },
  ];
};

// Optional: Create an index.ts file to export all grid configs
export * from './student-grid.config';
