import { Component, OnInit, HostListener } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';
import { MetricsService } from '../services/metrics.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  feedbackUrl: string;
  constructor(private metricsService: MetricsService) { }

  ngOnInit() {
    this.feedbackUrl = ConfigProvider.settings.feedbackUrl;
  }

  @HostListener('click', ['$event']) onclick(event: any) {
    this.metricsService.sendClickMetrics('Feedback', event, '.feedback').subscribe();
  }

}
