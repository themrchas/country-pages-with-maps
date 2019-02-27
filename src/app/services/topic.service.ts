import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  selectedTopic = new BehaviorSubject<any>(null);

  constructor() {}

  getTopic(topicId) {
    return ConfigProvider.settings.topics.find(item => item.topicId.toLowerCase() === topicId.toLowerCase());
  }

  getTopics() {
    return ConfigProvider.settings.topics;
  }

  changeTopic(topicId) {
    this.selectedTopic.next(this.getTopic(topicId));
  }
}
