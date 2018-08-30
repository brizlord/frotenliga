import {Component, OnInit} from '@angular/core';
import {AlertController, NavController, ToastController} from 'ionic-angular';
import {DataService} from "../../app/services/data.service";
import {NewMatchday} from "../newMatchday/newMatchday";
import {ConfigPage} from "../config/config";
import {PlayerProfile} from "../playerProfile/playerProfile";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage implements OnInit {
    oneMatchLeft: boolean;
    seasonEnd: boolean;

    plusfrotatores: any[] = [];
    assistances: any [] = [];
    spy: any [] = [];
    lennadores: any [] = [];
    matchdays: string;
    season: string;
    mvpPlayerSeason: any[] = [];

    chartGoals: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };

    constructor(public navCtrl: NavController,
                public dataSvc: DataService,
                public alertCtrl: AlertController,
                public toastCtrl: ToastController) {
        this.loadData();
    }

    ngOnInit() {
        this.setAlert();

        this.dataSvc.ifsomethingHappen()
            .subscribe((res: Response) => {
                this.loadData();
            });

    }

    loadData() {
        this.dataSvc.loadConfig();

        this.season = this.dataSvc.getCurrentSeason();

        this.plusfrotatores = this.dataSvc.getPlusFrotatore(this.season);
        this.assistances = this.dataSvc.getAsistidores(this.season);
        this.spy = this.dataSvc.getSpies(this.season);
        this.lennadores = this.dataSvc.getLenadores(this.season);

        this.dataSvc.openLastMatchday(this.season);

        this.matchdays = this.dataSvc.matchday;

        this.mvpPlayerSeason = this.dataSvc.getRatingPlayer(this.season);

        this.loadGoalsSeasonCompareChart();
    }

    openNewMatchday() {
        if ((parseInt(this.dataSvc.matchday) < this.dataSvc.config.totalCountMatches) || this.dataSvc.matchday === null) {
            this.navCtrl.push(NewMatchday, {
                season: this.season
            });
        }
        else {
            this.newSeasonAlert();
        }
    }

    loadGoalsSeasonCompareChart() {
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
                    backgroundColor: 'rgba(148,159,177,0.6)',
                    borderColor: 'rgba(255,255,255,1)',
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

        let allSeasons = this.dataSvc.getSeasons();

        allSeasons = allSeasons.reverse();

        for (let s of allSeasons) {
            this.chartGoals.lineChartLabels.push(s.season);

            let goals: number = 0;
            let tmpMd = this.dataSvc.getSeasonMatchdays(s.season);

            for (let md of tmpMd) {
                if (md.md <= this.matchdays) {
                    for (let player of  md.games[0].players) {
                        goals += (parseInt(player.goals));
                    }
                }
            }

            goalsArray.push(goals);
        }

        this.chartGoals.lineChartData.push({data: goalsArray, label: 'Goles / Termporadas'});
    }

    setAlert() {
        if (this.dataSvc.config.totalCountMatches != null) {
            if (parseInt(this.dataSvc.matchday) > 0) {
                this.oneMatchLeft = ((this.dataSvc.config.totalCountMatches - parseInt(this.dataSvc.matchday)) == 1) ? true : false;
                this.seasonEnd = ((this.dataSvc.config.totalCountMatches - parseInt(this.dataSvc.matchday)) == 0) ? true : false;

                let message = ((this.dataSvc.config.totalCountMatches - parseInt(this.dataSvc.matchday)) >= 2) ? ("Restan " + (this.dataSvc.config.totalCountMatches - parseInt(this.dataSvc.matchday)) + " partidos") : '';
                this.showMatchesLeftToast(6000, message);
            }
        }
        else {
            if (this.dataSvc.userLogged) {
                this.showMatchesLeftToast(9000, "Configure la cantidad de partidos que se van a jugar por temporadas");

                this.navCtrl.push(ConfigPage, {
                    season: this.season
                });
            }
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
                            this.navCtrl.push(NewMatchday, {
                                season: this.season
                            });
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

    showMatchesLeftToast(duration, message) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: duration
        });
        toast.present();
    }

    showPlayerProfile(playerName) {
        this.navCtrl.push(PlayerProfile, {
            playerName: playerName
        });
    }

    Login() {
        let prompt = this.alertCtrl.create({
            title: 'Login',
            inputs: [
                {
                    name: 'user',
                    placeholder: 'Usuario'
                }, {
                    name: 'pass',
                    placeholder: 'Contraseña',
                    type: 'password'
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Entrar',
                    handler: data => {
                        if (!this.dataSvc.login({nick: data.user, pass: data.pass})) {
                            this.showMatchesLeftToast(6000, "Usuario o contraseña incorrecta");
                        }
                        else{
                            this.setAlert();
                        }
                    }
                }
            ]
        });
        prompt.present();
    }
}
