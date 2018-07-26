import { Component, OnInit } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  feedbackUrl: string;
  constructor() { }

  ngOnInit() {
    this.feedbackUrl = ConfigProvider.settings.feedbackUrl;
  }

}
