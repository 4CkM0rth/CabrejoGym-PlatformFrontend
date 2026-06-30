import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BranchService } from '@core/services/branch.service';
import { NotificationService } from '@core/services/notification.service';
import { Branch, MembershipPlan } from '@core/models';

@Component({
  selector: 'app-memberships-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressBarModule, MatSlideToggleModule
  ],
  templateUrl: './memberships-dialog.component.html',
  styleUrls: ['./memberships-dialog.component.scss']
})
export class MembershipsDialogComponent implements OnInit {
  branch: Branch;
  plans: MembershipPlan[] = [];
  loading = true;
  saving = false;
  form = { name: '', description: '', price: 0, durationMonths: 1, isPopular: false };

  constructor(
    public dialogRef: MatDialogRef<MembershipsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { branch: Branch },
    private branchService: BranchService,
    private notificationService: NotificationService
  ) {
    this.branch = data.branch;
  }

  ngOnInit(): void { this.loadPlans(); }

  loadPlans(): void {
    this.loading = true;
    this.branchService.getMembershipPlans(this.branch.id).subscribe({
      next: (plans) => { this.plans = plans; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addPlan(): void {
    if (!this.form.name.trim() || !this.form.price) return;
    this.saving = true;
    this.branchService.createMembershipPlan(this.branch.id, {
      name: this.form.name.trim(),
      description: this.form.description.trim() || undefined,
      price: this.form.price,
      durationMonths: this.form.durationMonths,
      isPopular: this.form.isPopular
    }).subscribe({
      next: () => {
        this.form = { name: '', description: '', price: 0, durationMonths: 1, isPopular: false };
        this.saving = false;
        this.loadPlans();
      },
      error: () => { this.saving = false; this.notificationService.error('Error al crear plan'); }
    });
  }

  togglePlanStatus(plan: MembershipPlan): void {
    this.branchService.updateMembershipPlan(plan.id, { active: !plan.active }).subscribe({
      next: () => { plan.active = !plan.active; },
      error: () => { this.notificationService.error('Error al cambiar estado'); }
    });
  }

  deletePlan(plan: MembershipPlan): void {
    if (confirm(`¿Eliminar "${plan.name}"?`)) {
      this.branchService.deleteMembershipPlan(plan.id).subscribe({
        next: () => this.loadPlans(),
        error: () => this.notificationService.error('Error al eliminar plan')
      });
    }
  }

  close(): void {
    this.dialogRef.close(true);
  }
}
