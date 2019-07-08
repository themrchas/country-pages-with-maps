import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private topicSubject = new BehaviorSubject<any>(null);
  private highlightedTileSubject = new BehaviorSubject<any>(null);
  selectedTopic = this.topicSubject.asObservable();
  highlightedTile = this.highlightedTileSubject.asObservable();

  constructor() {}

  getTopic(topicId) {
    return ConfigProvider.settings.topics.find(item => item.topicId.toLowerCase() === topicId.toLowerCase());
  }

  getTopics() {
    return ConfigProvider.settings.topics;
  }

  changeTopic(topicId) {
    this.topicSubject.next(this.getTopic(topicId));
  }

  highlightTile(tileId) {
    this.highlightedTileSubject.next(tileId);
  }
}
