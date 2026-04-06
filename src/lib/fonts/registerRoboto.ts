import jsPDF from 'jspdf';
import { ROBOTO_REGULAR_B64, ROBOTO_BOLD_B64 } from './robotoBase64';

export function registerRoboto(doc: jsPDF): void {
  doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR_B64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

  doc.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD_B64);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
}
