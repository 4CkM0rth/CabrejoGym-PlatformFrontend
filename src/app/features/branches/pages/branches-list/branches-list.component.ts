import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BranchService } from '@core/services/branch.service';
import { Branch } from '@core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './branches-list.component.html',
  styleUrls: ['./branches-list.component.scss']
})
export class BranchesListComponent implements OnInit {
  branches$!: Observable<Branch[]>;

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.branches$ = this.branchService.getBranches();
  }

  getBranchImage(branch: Branch): string {
    if (branch.images && branch.images.length > 0) {
      const primaryImage = branch.images.find(img => img.isPrimary);
      return primaryImage ? primaryImage.url : branch.images[0].url;
    }
    return 'assets/images/placeholder.svg';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.svg';
  }
}
