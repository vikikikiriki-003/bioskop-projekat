import { Component } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { CinemasModel } from '../../models/cinemas.model';
import { CinemasService } from '../../services/cinemas.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-cinemas',
  templateUrl: './cinemas.component.html',
  styleUrls: ['./cinemas.component.css'],
  standalone: true,
  imports: [MatTableModule, NgIf],
})
export class CinemasComponent {
  displayedColumns: string[] = ['id', 'name', 'country', 'city'];
  dataSource : CinemasModel[] = CinemasService.getCinemas()
}
