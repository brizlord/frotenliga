import {Component, ViewChild} from '@angular/core';
import {Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HomePage} from '../pages/home/home';
import {ListPage} from '../pages/list/list';
import {NewMatchday} from "../pages/newMatchday/newMatchday";
import {SeasonsPage} from "../pages/seasons/seasons";
import {ConfigPage} from "../pages/config/config";
import {HistoryPage} from "../pages/history/history";
import {ShareDataPage} from "../pages/shareData/shareData";
import {PlayerProfile} from "../pages/playerProfile/playerProfile";
import {DataService} from "./services/data.service";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = HomePage;

    pages: Array<{ title: string, component: any, icon: string }>;

    constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public dataSvc: DataService) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            {title: 'Inicio', component: HomePage, icon: 'home'},
            {title: 'Historia', component: HistoryPage, icon: 'stats'},
            // {title: 'Amistosos', component: SeasonsPage, icon: 'calendar'},
            {title: 'Temporadas', component: SeasonsPage, icon: 'trophy'},
            {title: 'Compartir Datos', component: ShareDataPage, icon: 'swap'},
        ];

    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }

    logout() {
        this.dataSvc.logout();
        this.dataSvc.checkValidLogin();
        this.nav.setRoot(HomePage);
    }

    openPageConfig() {
        this.nav.setRoot(ConfigPage);
    }
}
