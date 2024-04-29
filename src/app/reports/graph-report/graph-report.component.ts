import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';


@Component({
  selector: 'app-graph-report',
  standalone: true,
  imports: [CommonModule,HighchartsChartModule],
  templateUrl: './graph-report.component.html',
  styleUrl: './graph-report.component.css'
})
export class GraphReportComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    series: [{
      data: [1, 2, 3,8,4,7,2,0,1,4,6,8,6,28,2,9,9,5],
      type: 'bar'
    }]
  };
}
