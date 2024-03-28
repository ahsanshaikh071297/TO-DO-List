import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainDaashboardComponent } from './main-daashboard/main-daashboard.component';

const routes: Routes = [
  { path: '', component: MainDaashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
