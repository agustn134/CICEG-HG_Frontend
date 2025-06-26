import { Component } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.html',
  styleUrls: ['./stats-card.css']
})
export class StatsCardComponent {
  // Inputs
  title: string = '';
  value: string = '';
  description: string = '';
  iconName: string = '';
  trendValue?: string;
  trendLabel?: string;
  positiveTrend: boolean = true;
}
