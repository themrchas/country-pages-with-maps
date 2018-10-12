import { Component, OnInit, HostListener } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  navConfig: any;
  navTemplate: string;
  leftMenus: Array<any>;
  currentUser: string;
  myProfileUrl: string;
  helpDeskMenu: any;
  navbarCollapsed: boolean;
  env: string;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.navConfig = ConfigProvider.settings.navMenuConfig;

    // Using the selector, find the html for the dropdown
    this.leftMenus = this.navConfig.leftMenus.map(function(leftMenu) {
      leftMenu.templateHtml = $(leftMenu.templateSelector).html();
      return leftMenu;
    });

    // Update the IT Help menu
    this.helpDeskMenu = this.navConfig.helpDeskMenu;
    this.helpDeskMenu.templateHtml = $(this.helpDeskMenu.templateSelector).html();

    // Update the user account link
    this.userService.getCurrentUser(ConfigProvider.settings.userWebURL).subscribe({
        next: x => { this.currentUser = x.Title; }
    });
    this.myProfileUrl = this.navConfig.myProfileUrl;

    this.adjustNavbarMenus();

    this.env = ConfigProvider.env;
  }

  // change the navbar menus to be clickable when navbar collapsed, otherwise hoverable
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.adjustNavbarMenus();
  }

  adjustNavbarMenus() {
    if ($(window).width() > 768) {
      this.navbarCollapsed = false;
      $('.dropdown').removeClass('open');
    } else {
      this.navbarCollapsed = true;
    }
  }
}
