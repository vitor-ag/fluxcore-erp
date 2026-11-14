import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WorkspacePage } from '../workspace/workspace-page';
import { PageStateComponent } from '../../shared/ui/page-state/page-state.component';
import { RecordFormComponent } from '../../shared/ui/record-form/record-form.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-estoque-page',
  standalone: true,
  imports: [
    PageStateComponent,
    RecordFormComponent,
    ButtonComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    CurrencyPipe,
    FormsModule,
  ],
  templateUrl: './estoque.page.html',
  styleUrl: './estoque.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstoquePage extends WorkspacePage {}
