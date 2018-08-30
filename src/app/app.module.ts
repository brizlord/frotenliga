import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SQLite} from "@ionic-native/sqlite";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {Hotspot} from "@ionic-native/hotspot";
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';

import{ChartsModule} from "ng2-charts";

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {ConfigPage} from '../pages/config/config';
import {ListPage} from '../pages/list/list';
import {HistoryPage} from '../pages/history/history';
import {DataPlayerModal} from "../pages/modals/dataPlayerModal/dataPlayerModal";
import {NewMatchday} from "../pages/newMatchday/newMatchday";
import {SeasonsPage} from "../pages/seasons/seasons";
import {ShareDataPage } from "../pages/shareData/shareData";
import {PlayerProfile} from "../pages/playerProfile/playerProfile";

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {DataService} from "./services/data.service";
import {ShareDataService } from "./services/shareData.service";

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ListPage,
        DataPlayerModal,
        NewMatchday,
        SeasonsPage,
        ConfigPage,
        HistoryPage,ShareDataPage,
        PlayerProfile

    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        ChartsModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ListPage,
        DataPlayerModal,
        NewMatchday,
        SeasonsPage,
        ConfigPage,
        HistoryPage,
        ShareDataPage,
        PlayerProfile
    ],
    providers: [
        StatusBar,
        SplashScreen,
        SQLite,
        DataService,
        BluetoothSerial,
        ShareDataService,
        Hotspot,
        File,
        FileChooser,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}
