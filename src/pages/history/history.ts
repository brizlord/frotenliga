import {Component, OnInit} from '@angular/core';
import {AlertController, NavController, ToastController} from 'ionic-angular';
import {DataService} from "../../app/services/data.service";
import {PlayerProfile} from "../playerProfile/playerProfile";

@Component({
    selector: 'page-history',
    templateUrl: 'history.html'
})
export class HistoryPage implements OnInit {
    plusfrotatores: any[] = [];
    assistances: any [] = [];
    spy: any [] = [];
    lennadores: any [] = [];
    totalMatchdays: number = 0;
    seasons: any[] = [];
    totalGoals: number = 0;
    totalAss: number = 0;
    playersMoreGames: any[] = [];
    mostMvpPlayer: any[] = [];

    chartGoals: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };

    constructor(public navCtrl: NavController,
                public dataSvc: DataService,
                public alertCtrl: AlertController,
                public toastCtrl: ToastController) {
        this.loadData();
    }

    ngOnInit() {
        // this.setAlert();

        this.dataSvc.ifsomethingHappen()
            .subscribe((res: Response) => {
                this.loadData();
            });
    }

    loadData() {
        this.seasons = this.dataSvc.getSeasons();

        let tmp: any = {
            plusf: [],
            ass: [],
            lenn: [],
            spies: [],
            matchdaysP: []
        };

        for (let season of this.seasons) {
            tmp.plusf = tmp.plusf.concat(this.dataSvc.getPlusFrotatore(season.season));
            tmp.ass = tmp.ass.concat(this.dataSvc.getAsistidores(season.season));
            tmp.spies = tmp.spies.concat(this.dataSvc.getSpies(season.season));
            tmp.lenn = tmp.lenn.concat(this.dataSvc.getLenadores(season.season));


            tmp.matchdaysP = tmp.matchdaysP.concat(this.dataSvc.getSeasonMatchdays(season.season));

            this.totalMatchdays += this.dataSvc.getSeasonMatchdays(season.season).length;
        }

        for (let plus of tmp.plusf) {
            if (this.plusfrotatores.filter(p => p.name === plus.name).length == 0) {
                let objectPlus: any = {
                    name: plus.name,
                    goals: 0,
                    avg: 0
                };

                for (let tmP of tmp.plusf.filter(p => p.name === plus.name)) {
                    objectPlus.goals += parseInt(tmP.goals);
                    objectPlus.avg += parseFloat(tmP.avg);
                }

                objectPlus.avg = (objectPlus.avg / tmp.plusf.filter(p => p.name === plus.name).length);

                this.plusfrotatores.push(objectPlus);

                this.totalGoals += objectPlus.goals;
            }
        }

        this.plusfrotatores = this.plusfrotatores.sort(function (a, b) {
            return (a.goals > b.goals) ? -1 : ((a.goals < b.goals) ? 1 : 0);
        });

        for (let ass of tmp.ass) {
            if (this.assistances.filter(p => p.name === ass.name).length == 0) {
                let objectPlus: any = {
                    name: ass.name,
                    assistances: 0,
                    avg: 0
                };


                for (let tmP of tmp.ass.filter(p => p.name === ass.name)) {
                    objectPlus.assistances += parseInt(tmP.assistances);
                    objectPlus.avg += parseFloat(tmP.avg);
                }

                objectPlus.avg = (objectPlus.avg / tmp.ass.filter(p => p.name === ass.name).length);

                this.assistances.push(objectPlus);

                this.totalAss += objectPlus.assistances;
            }
        }

        this.assistances = this.assistances.sort(function (a, b) {
            return (a.assistances > b.assistances) ? -1 : ((a.assistances < b.assistances) ? 1 : 0);
        });


        for (let sp of tmp.spies) {
            if (this.spy.filter(p => p.name === sp.name).length == 0) {
                let objectPlus: any = {
                    name: sp.name,
                    autogoals: 0,
                    avg: 0
                };

                for (let tmP of tmp.spies.filter(p => p.name === sp.name)) {
                    objectPlus.autogoals += parseInt(tmP.autogoals);
                    // objectPlus.avg += parseFloat(tmP.avg);
                }

                // objectPlus.avg = (objectPlus.avg / tmp.ass.filter(p => p.name === ass.name).length);

                this.spy.push(objectPlus);
            }
        }

        this.spy = this.spy.sort(function (a, b) {
            return (a.autogoals > b.autogoals) ? -1 : ((a.autogoals < b.autogoals) ? 1 : 0);
        });

        for (let l of tmp.lenn) {
            if (this.lennadores.filter(p => p.name === l.name).length == 0) {
                let objectPlus: any = {
                    name: l.name,
                    totalCards: 0,
                    yCards: 0,
                    rCards: 0
                };

                for (let tmP of tmp.lenn.filter(p => p.name === l.name)) {
                    objectPlus.yCards += parseInt(tmP.yCards);
                    objectPlus.rCards += parseInt(tmP.rCards);

                    objectPlus.totalCards += (parseInt(tmP.yCards) + parseInt(tmP.rCards));
                    // objectPlus.avg += parseFloat(tmP.avg);
                }

                // objectPlus.avg = (objectPlus.avg / tmp.ass.filter(p => p.name === ass.name).length);

                this.lennadores.push(objectPlus);
            }
        }

        this.lennadores = this.lennadores.sort(function (a, b) {
            return (a.totalCards > b.totalCards) ? -1 : ((a.totalCards < b.totalCards) ? 1 : 0);
        });

        let players: any[] = [];
        for (let m of tmp.matchdaysP) {
            players = players.concat(m.games[0].players);
        }

        for (let p of players) {
            if (this.playersMoreGames.filter(res => res.name === p.name.toUpperCase()).length == 0) {
                let objectPlus: any = {
                    name: p.name.toUpperCase(),
                    totalGames: 0,
                };

                for (let tmP of players.filter(res => res.name === p.name)) {
                    objectPlus.totalGames += 1;
                }

                this.playersMoreGames.push(objectPlus);

                let objectMVP: any = {
                    name: p.name.toUpperCase(),
                    totalMVP: 0,
                };

                for (let tmP of players.filter(res => res.name.toUpperCase() === p.name.toUpperCase())) {
                    if (tmP.MVP.length > 0)
                        objectMVP.totalMVP += 1;
                }

                if (objectMVP.totalMVP > 0)
                    this.mostMvpPlayer.push(objectMVP);
            }
        }

        this.mostMvpPlayer = this.mostMvpPlayer.sort(function (a, b) {
            return (a.totalMVP > b.totalMVP) ? -1 : ((a.totalMVP < b.totalMVP) ? 1 : 0);
        });


        this.playersMoreGames = this.playersMoreGames.sort(function (a, b) {
            return (a.totalGames > b.totalGames) ? -1 : ((a.totalGames < b.totalGames) ? 1 : 0);
        });

        // this.dataSvc.openLastMatchday(this.season);

        // this.matchdays = this.dataSvc.matchday;

        // this.mvpPlayerSeason = this.dataSvc.getRatingPlayer(this.season);

        // this.loadGoalsSeasonCompareChart();
    }

    //
    // loadGoalsSeasonCompareChart() {
    //     this.chartGoals = {
    //         lineChartType: 'line',
    //         lineChartLegend: true,
    //         lineChartOptions: {
    //             responsive: true,
    //             legend: {
    //                 labels: {
    //                     // This more specific font property overrides the global property
    //                     fontColor: 'white'
    //                 }
    //             },
    //             scales: {
    //                 yAxes: [{
    //                     ticks: {
    //                         fontColor: 'white'
    //                     },
    //                 }],
    //                 xAxes: [{
    //                     ticks: {
    //                         fontColor: 'white'
    //                     },
    //                 }]
    //             }
    //         },
    //         lineChartColors: [
    //             { // grey
    //                 backgroundColor: 'rgba(148,159,177,0.6)',
    //                 borderColor: 'rgba(255,255,255,1)',
    //                 pointBackgroundColor: 'rgba(148,159,177,1)',
    //                 pointBorderColor: '#fff',
    //                 pointHoverBackgroundColor: '#fff',
    //                 pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //             },
    //             { // dark grey
    //                 backgroundColor: 'rgba(77,83,96,0.2)',
    //                 borderColor: 'rgba(77,83,96,1)',
    //                 pointBackgroundColor: 'rgba(77,83,96,1)',
    //                 pointBorderColor: '#fff',
    //                 pointHoverBackgroundColor: '#fff',
    //                 pointHoverBorderColor: 'rgba(77,83,96,1)'
    //             },
    //             { // grey
    //                 backgroundColor: 'rgba(148,159,177,0.2)',
    //                 borderColor: 'rgba(148,159,177,1)',
    //                 pointBackgroundColor: 'rgba(148,159,177,1)',
    //                 pointBorderColor: '#fff',
    //                 pointHoverBackgroundColor: '#fff',
    //                 pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //             }
    //         ],
    //         lineChartLabels: [],
    //         lineChartData: []
    //     };
    //
    //     let goalsArray: any[] = [];
    //
    //     let allSeasons = this.dataSvc.getSeasons();
    //
    //     allSeasons = allSeasons.reverse();
    //
    //     for (let s of allSeasons) {
    //         this.chartGoals.lineChartLabels.push(s.season);
    //
    //         let goals: number = 0;
    //         let tmpMd = this.dataSvc.getSeasonMatchdays(s.season);
    //
    //         for (let md of tmpMd) {
    //             if (md.md <= this.matchdays) {
    //                 for (let player of  md.games[0].players) {
    //                     goals += (parseInt(player.goals));
    //                 }
    //             }
    //         }
    //
    //         goalsArray.push(goals);
    //     }
    //
    //     this.chartGoals.lineChartData.push({data: goalsArray, label: 'Goles / Termporadas'});
    // }
    //
    // setAlert() {
    //     if (this.dataSvc.config.totalCountMatches != null) {
    //         if (parseInt(this.dataSvc.matchday) > 0) {
    //             this.oneMatchLeft = ((this.dataSvc.config.totalCountMatches - parseInt(this.dataSvc.matchday)) == 1) ? true : false;
    //             this.seasonEnd = ((this.dataSvc.config.totalCountMatches - parseInt(this.dataSvc.matchday)) == 0) ? true : false;
    //
    //             let message = ((this.dataSvc.config.totalCountMatches - parseInt(this.dataSvc.matchday)) >= 2) ? ("Restan " + (this.dataSvc.config.totalCountMatches - parseInt(this.dataSvc.matchday)) + " partidos") : '';
    //             this.showMatchesLeftToast(6000, message);
    //         }
    //     }
    //     else {
    //         this.showMatchesLeftToast(9000, "Configure la cantidad de partidos que se van a jugar por temporadas");
    //
    //         this.navCtrl.push(ConfigPage, {
    //             season: this.season
    //         });
    //     }
    // }
    //
    // newSeasonAlert() {
    //     let prompt = this.alertCtrl.create({
    //         title: 'Nueva Temporada',
    //         message: "Entre la nueva temporada que se va a jugar",
    //         inputs: [
    //             {
    //                 name: 'season',
    //                 placeholder: 'Temporada'
    //             },
    //         ],
    //         buttons: [
    //             {
    //                 text: 'Cancelar',
    //                 handler: data => {
    //                     console.log('Cancel clicked');
    //                 }
    //             },
    //             {
    //                 text: 'Guardar',
    //                 handler: data => {
    //                     if (!this.dataSvc.newSeason(data)) {
    //                         this.errorNewSeasonAlert();
    //                     }
    //                     else {
    //                         this.navCtrl.push(NewMatchday, {
    //                             season: this.season
    //                         });
    //                     }
    //                 }
    //             }
    //         ]
    //     });
    //     prompt.present();
    // }
    //
    // errorNewSeasonAlert() {
    //     let confirm = this.alertCtrl.create({
    //         title: 'Error',
    //         message: 'Esta temporada se está jugando o ya se jugó.',
    //         buttons: [
    //             {
    //                 text: 'Aceptar',
    //                 handler: () => {
    //                 }
    //             }
    //         ]
    //     });
    //     confirm.present();
    // }


    showPlayerProfile(playerName) {
        this.navCtrl.push(PlayerProfile, {
            playerName: playerName
        });
    }
}
