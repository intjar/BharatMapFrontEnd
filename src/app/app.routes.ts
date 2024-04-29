import { Routes } from '@angular/router';

import { TableReportComponent } from './reports/table-report/table-report.component';
import { GraphReportComponent } from './reports/graph-report/graph-report.component';
import { StateMapComponent } from './reports/map-report/state-map/state-map.component';
import { IndiaMapComponent } from './reports/map-report/india-map/india-map.component';
import { DistrictMapComponent } from './reports/map-report/district-map/district-map.component';
import { TestMapComponent } from './reports/test-map/test-map.component';

export const routes: Routes = [
    // {path:'', redirectTo:'/test-map', pathMatch:'full' },
    // {path: 'test-map', component: TestMapComponent},

    {path:'', redirectTo:'/table-report', pathMatch:'full' },
    {path:'home', redirectTo:'/table-report', pathMatch:'full' },
    {path: 'table-report', component: TableReportComponent},
    {path: 'graph-report', component: GraphReportComponent},
    {path: 'map-report', component: IndiaMapComponent},
    {path: 'state-map', component: StateMapComponent},
    {path: 'district-map', component: DistrictMapComponent}
];

