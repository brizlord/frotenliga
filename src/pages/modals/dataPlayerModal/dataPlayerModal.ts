import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {AlertController} from 'ionic-angular';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import {Player} from "../../../app/interfaces/player.interface";
import {DataService} from "../../../app/services/data.service";

@Component({
    selector: 'page-dataPlayerModal',
    templateUrl: 'dataPlayerModal.html'
})
export class DataPlayerModal {
    player: Player;
    isMvp: boolean;
    matchday: string;

    constructor(public navCtrl: NavController,
                public viewCtrl: ViewController,
                public alertCtrl: AlertController,
                private sqlite: SQLite,
                private dataSvc: DataService,
                public params: NavParams) {

        if (this.params.data.hasOwnProperty('name')) {
            this.player = this.params.data;
        }
        else {
            this.player = new Player();
        }

        this.matchday = this.dataSvc.matchday;
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    savaData() {
        if (this.player.name != null) {
            this.refillPLayerData();

            this.updateCountMVP(this.dataSvc.matchday);

            // this.sqlite.create({
            //     name: 'frotenliga.db', // Name of the Database
            //     location: './assets/'
            // }).then((db: SQLiteObject) => {
            //     db.executeSql('INSERT INTO player VALUES(?,?,?,?,?)', [this.player.name, this.player.goals, this.player.assistance, this.player.autogoals, this.player.yellowCards, this.player.redCards])
            //         .then(res => {
            //                 console.log(res);
            //             }
            //         )
            // });

            let it = 0;
            for (let player of this.dataSvc.players) {
                if (player.name == this.player.name) {
                    this.dataSvc.players.splice(it, 1);

                    break;
                }

                it++;
            }

            this.dataSvc.players.push(this.player);

            this.dataSvc.saveDataPlayersGames(this.player);

            this
                .viewCtrl
                .dismiss();
        }

        else {
            this.showAlert();
        }
    }

    mvpChecked() {
        this.isMvp = !this.isMvp;
    }

    showAlert() {
        let alert = this.alertCtrl.create({
            title: 'Atención!',
            subTitle: 'Debe introducir al menos el nombre del jugador.',
            buttons: ['OK']
        });
        alert.present();
    }

    refillPLayerData() {
        if (!this.player.hasOwnProperty('goals')) {
            this.player.goals = 0;
        }
        if (!this.player.hasOwnProperty('assistance')) {
            this.player.assistance = 0;
        }
        if (!this.player.hasOwnProperty('autogoals')) {
            this.player.autogoals = 0;
        }
        if (!this.player.hasOwnProperty('yellowCards')) {
            this.player.yellowCards = 0;
        }
        if (!this.player.hasOwnProperty('redCards')) {
            this.player.redCards = 0;
        }
    }

    updateCountMVP(matchday) {
        let exist: boolean;
        let it = 0;

        if (this.player.MVP.length > 0) {
            for (let mvps of this.player.MVP) {
                if (mvps == matchday) {
                    exist = true;

                    this.player.MVP.splice(it, 1);
                    break;
                }

                it++;
            }
        }

        if (!exist) {
            if (this.isMvp) {
                this.player.MVP.push(matchday);
            }
        }
    }
}
