import {Component, OnInit} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {ModalController} from 'ionic-angular';
import {DataPlayerModal} from "../modals/dataPlayerModal/dataPlayerModal";
import {DataService} from "../../app/services/data.service";
import {Player} from "../../app/interfaces/player.interface";
import {ListPage} from "../list/list";
import {PlayerProfile} from "../playerProfile/playerProfile";

@Component({
    selector: 'page-seasons',
    templateUrl: 'seasons.html'
})
export class SeasonsPage {
    selectedItem: any;
    itemList: any[] = [];
    title: string;
    ops: string;
    bestOne: { playersSeason: any[], plusF: any[], ass: any[], spies: any[], lennadores: any[] };
    tabOp: string = 'matchdays';
    totalGoals: number = 0;

    chartGoals: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public modalCtrl: ModalController,
                private dataSvc: DataService,
                public alertCtrl: AlertController) {

        this.selectedItem = navParams.get('item');

        if (!this.selectedItem) {
            this.itemList = this.dataSvc.getSeasons();

            this.title = "Temporadas";
            this.ops = "seasons";
        }
        else {
            if (this.selectedItem.hasOwnProperty("season")) {
                this.title = "Temporada " + this.selectedItem.season;

                this.itemList = this.dataSvc.getSeasonMatchdays(this.selectedItem.season);

                this.ops = "mdSeason";

                this.bestOne = {
                    playersSeason: this.dataSvc.getAllPlayersSeason(this.selectedItem.season),
                    plusF: this.dataSvc.getPlusFrotatore(this.selectedItem.season),
                    ass: this.dataSvc.getAsistidores(this.selectedItem.season),
                    spies: this.dataSvc.getSpies(this.selectedItem.season),
                    lennadores: this.dataSvc.getLenadores(this.selectedItem.season)
                };

                for (let pf of this.bestOne.plusF) {
                    this.totalGoals += parseInt(pf.goals);
                }

                this.loadGoalsChart();
            }
        }
    }

    itemTapped(item) {
        if (this.ops == "mdSeason") {
            this.navCtrl.push(ListPage, {
                item: item
            });
        } else {
            this.navCtrl.push(SeasonsPage, {
                item: item
            });
        }
    }

    newSeasonAlert() {
        let prompt = this.alertCtrl.create({
            title: 'Nueva Temporada',
            message: "Entre la nueva temporada que se va a jugar",
            inputs: [
                {
                    name: 'season',
                    placeholder: 'Temporada'
                },
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Guardar',
                    handler: data => {
                        if (!this.dataSvc.newSeason(data)) {
                            this.errorNewSeasonAlert();
                        }
                        else {
                            this.itemList = this.dataSvc.getSeasons();
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    errorNewSeasonAlert() {
        let confirm = this.alertCtrl.create({
            title: 'Error',
            message: 'Esta temporada se está jugando o ya se jugó.',
            buttons: [
                {
                    text: 'Aceptar',
                    handler: () => {
                    }
                }
            ]
        });
        confirm.present();
    }

    loadGoalsChart() {
        this.chartGoals = {
            lineChartType: 'line',
            lineChartLegend: true,
            lineChartOptions: {
                responsive: true,
                legend: {
                    labels: {
                        // This more specific font property overrides the global property
                        fontColor: 'white'
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: 'white'
                        },
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: 'white'
                        },
                    }]
                }
            },
            lineChartColors: [
                { // grey
                    backgroundColor: 'rgba(148,159,177,0.2)',
                    borderColor: 'rgba(148,159,177,1)',
                    pointBackgroundColor: 'rgba(148,159,177,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                },
                { // dark grey
                    backgroundColor: 'rgba(77,83,96,0.2)',
                    borderColor: 'rgba(77,83,96,1)',
                    pointBackgroundColor: 'rgba(77,83,96,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(77,83,96,1)'
                },
                { // grey
                    backgroundColor: 'rgba(148,159,177,0.2)',
                    borderColor: 'rgba(148,159,177,1)',
                    pointBackgroundColor: 'rgba(148,159,177,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                }
            ],
            lineChartLabels: [],
            lineChartData: []
        };

        let goalsArray: any[] = [];

        for (let md of this.itemList) {
            this.chartGoals.lineChartLabels.push(md.md);

            let total = 0;
            for (let player of md.games[0].players) {
                total = (total + parseInt(player.goals));
            }

            goalsArray.push(total);
        }

        this.chartGoals.lineChartData.push({data: goalsArray, label: 'Goles / Jornadas'});
    }

    round(number) {
        return Math.round(number);
    }

    showPlayerProfile(playerName) {
        this.navCtrl.push(PlayerProfile, {
            playerName: playerName
        });
    }
}
