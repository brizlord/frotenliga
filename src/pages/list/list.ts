import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ModalController} from 'ionic-angular';
import {DataPlayerModal} from "../modals/dataPlayerModal/dataPlayerModal";
import {DataService} from "../../app/services/data.service";
import {Player} from "../../app/interfaces/player.interface";
import {PlayerProfile} from "../playerProfile/playerProfile";

@Component({
    selector: 'page-list',
    templateUrl: 'list.html'
})
export class ListPage {
    selectedItem: any;
    icons: string[];
    items: Array<{ title: string, note: string, icon: string }>;
    players: Player[];
    matchday: string;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public modalCtrl: ModalController,
                private dataSvc: DataService) {
        // If we navigated to this page, we will have an item available as a nav param
        this.selectedItem = navParams.get('item');

        this.matchday = this.selectedItem.md;
        // this.dataSvc.openLastMatchday();
        // this.matchday = this.dataSvc.matchday;
        // this.players = this.dataSvc.players;
        this.players = this.selectedItem.games[0].players;

        this.sort();
    }

    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(ListPage, {
            item: item
        });
    }

    // showDataPlayerModal(ops, selectedPlayer) {
    //     if (ops == 'edit') {
    //         let modal = this.modalCtrl.create(DataPlayerModal, selectedPlayer);
    //         modal.present();
    //     }
    //     else {
    //         let modal = this.modalCtrl.create(DataPlayerModal);
    //         modal.present();
    //     }
    // }
    //
    sort() {
        if (this.players.length > 0) {
            this.players = this.players.sort(function (a, b) {
                return (a.goals > b.goals) ? -1 : ((b.goals > a.goals) ? 1 : 0);
            });
        }
    }

    showPlayerProfile(playerName) {
        this.navCtrl.push(PlayerProfile, {
            playerName: playerName
        });
    }
}
