import {Component, OnInit} from '@angular/core';
import {AlertController, App, NavController, NavParams, ViewController} from 'ionic-angular';
import {ModalController} from 'ionic-angular';
import {DataPlayerModal} from "../modals/dataPlayerModal/dataPlayerModal";
import {DataService} from "../../app/services/data.service";
import {Player} from "../../app/interfaces/player.interface";

@Component({
    selector: 'page-newMatchday',
    templateUrl: 'newMatchday.html'
})
export class NewMatchday implements OnInit {
    players: Player[];
    matchday: string;
    savedData: boolean = false;
    season: string;

    constructor(public modalCtrl: ModalController,
                private dataSvc: DataService,
                public alertCtrl: AlertController,
                public appCtrl: App,
                public navParams: NavParams) {

        this.season = this.navParams.get('season');

        this.dataSvc.NewMatchday(this.season);

        this.matchday = this.dataSvc.matchday;
        this.players = this.dataSvc.players;

        this.sort();
    }

    ngOnInit() {
        this.appCtrl.viewWillLeave.subscribe(viewCtrl => {
            if (viewCtrl.component.name == "NewMatchday") {
                if (this.players.length > 0) {
                    this.dataSvc.saveNewMatchday();
                }
                // else {
                //     if (parseInt(this.dataSvc.matchday) > 1)
                //         this.dataSvc.matchday = (parseInt(this.dataSvc.matchday) - 1).toString();
                // }
            }
        })
    }

    showDataPlayerModal(ops, selectedPlayer) {
        if (ops == 'edit') {
            let modal = this.modalCtrl.create(DataPlayerModal, selectedPlayer);
            modal.present();
        }
        else {
            let modal = this.modalCtrl.create(DataPlayerModal);
            modal.present();
        }
    }

    sort() {
        this.players = this.players.sort(function (a, b) {
            return (a.goals > b.goals) ? -1 : ((b.goals > a.goals) ? 1 : 0);
        });
    }

    // showAlert() {
    //     let confirm = this.alertCtrl.create({
    //         title: 'Atención!',
    //         message: 'No se ha guardado la información. Desea guardarla automáticamente?',
    //         buttons: [
    //             {
    //                 text: 'Cancelar',
    //                 handler: () => {
    //
    //                 }
    //             },
    //             {
    //                 text: 'Aceptar',
    //                 handler: () => {
    //                     this.dataSvc.saveNewMatchday();
    //
    //                     this.savedData = true;
    //                 }
    //             }
    //         ]
    //     });
    //     confirm.present();
    // }
}
