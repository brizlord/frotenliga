import {Component, OnInit} from '@angular/core';
import {AlertController, NavController, NavParams, ToastController} from 'ionic-angular';
import {DataService} from "../../app/services/data.service";

@Component({
    selector: 'page-playerProfile',
    templateUrl: 'playerProfile.html'
})
export class PlayerProfile implements OnInit {
    player: any = {};
    seasonsPlayed: any[] = [];
    globalCharacteristics: any = {
        globalAttack: 0,
        globalPrecission: 0,
        globalPartnership: 0,
        globalErrors: 0,
        globalLeader: 0,
        globalSkills: 0
    };

    rating: any[] = [];

    playerCharacteristics: any = {
        playerAttack: 0,
        playerPrecission: 0,
        playerPartnership: 0,
        playerErrors: 0,
        playerLeader: 0,
        playerSkills: 0
    };

    allPlayers: any[] = [];
    comparablePlayers: any[] = [];

    chartGoals: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };
    chartAssistances: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };
    chartAutogoals: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };
    chartYCards: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };
    chartRCards: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };
    chartMatches: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartLabels: Array<any>, lineChartData: Array<any> };
    chartProfileRadar: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartData: Array<any>, lineChartLabels: Array<any> };
    chartCompareProfileRadar: { lineChartType: string, lineChartLegend: boolean, lineChartColors: Array<any>, lineChartOptions: any, lineChartData: Array<any>, lineChartLabels: Array<any> };

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public dataSvc: DataService,
                public alertCtrl: AlertController,
                public toastCtrl: ToastController) {
        this.player = {
            name: "",
            goals: 0,
            assistances: 0,
            mvps: 0,
            autogoals: 0,
            yCards: 0,
            rCards: 0,
            matches: 0,
            goalsAvg: 0,
            rating: 0,
            playerCharacteristics: {
                playerAttack: 0,
                playerPrecission: 0,
                playerPartnership: 0,
                playerErrors: 0,
                playerLeader: 0,
                playerSkills: 0
            }
        };

        this.getGlobalCharacteristics();
        this.player = this.loadData(navParams.get("playerName"));
        this.loadSeasonCompareChart();
    }

    ngOnInit() {
        this.dataSvc.ifsomethingHappen()
            .subscribe((res: Response) => {
                this.getGlobalCharacteristics();
                this.loadData(this.navParams.get("playerName"));
                this.loadSeasonCompareChart();
            });
    }

    getGlobalCharacteristics() {
        let seasons = this.dataSvc.getSeasons();
        for (let season of seasons) {
            let matchdays = this.dataSvc.getSeasonMatchdays(season.season);

            for (let match of matchdays) {
                for (let p of match.games[0].players) {
                    this.globalCharacteristics.globalAttack += ( parseInt(p.goals) + parseInt(p.assistance));
                    this.globalCharacteristics.globalPrecission += parseInt(p.goals);
                    this.globalCharacteristics.globalPartnership += parseInt(p.assistance);
                    this.globalCharacteristics.globalErrors += ( parseInt(p.autogoals) + parseInt(p.yellowCards) + parseInt(p.redCards));
                    this.globalCharacteristics.globalLeader += ( (p.MVP.length > 0) ? 1 : 0);
                    this.globalCharacteristics.globalSkills += ( parseInt(p.goals) + parseInt(p.assistance) + ((p.MVP.length > 0) ? 1 : 0));

                    if (this.allPlayers.filter(res => res.name.toUpperCase() === p.name.toUpperCase()).length == 0) {
                        this.allPlayers.push(p);
                    }
                }
            }
        }
    }

    loadData(playerName) {
        let currentPlayer = {
            name: playerName,
            goals: 0,
            assistances: 0,
            mvps: 0,
            autogoals: 0,
            yCards: 0,
            rCards: 0,
            matches: 0,
            goalsAvg: 0,
            rating: 0,
            playerCharacteristics: {
                playerAttack: 0,
                playerPrecission: 0,
                playerPartnership: 0,
                playerErrors: 0,
                playerLeader: 0,
                playerSkills: 0
            }
        };
        let seasons = this.dataSvc.getSeasons();

        for (let season of seasons) {
            let currentSeason: any = {
                g: 0,
                a: 0,
                ag: 0,
                yc: 0,
                rc: 0,
                m: 0
            };

            let matchdays = this.dataSvc.getSeasonMatchdays(season.season);

            for (let match of matchdays) {
                let player = match.games[0].players.filter(p => p.name.toUpperCase() === playerName);

                if (player.length > 0) {
                    currentPlayer.goals += parseInt(player[0].goals);
                    currentPlayer.assistances += parseInt(player[0].assistance);
                    currentPlayer.autogoals += parseInt(player[0].autogoals);
                    currentPlayer.yCards += parseInt(player[0].yellowCards);
                    currentPlayer.rCards += parseInt(player[0].redCards);
                    currentPlayer.matches += 1;
                    if (player[0].MVP.length > 0)
                        this.player.mvps += 1;

                    currentSeason.g += parseInt(player[0].goals);
                    currentSeason.a += parseInt(player[0].assistance);
                    currentSeason.ag += parseInt(player[0].autogoals);
                    currentSeason.yc += parseInt(player[0].yellowCards);
                    currentSeason.rc += parseInt(player[0].redCards);
                    currentSeason.m += 1;
                }
            }

            this.allPlayers = this.allPlayers.filter(res => res.name.toUpperCase() !== this.navParams.get("playerName"));

            this.rating = this.rating.concat(this.dataSvc.getRatingPlayer(season.season));

            this.seasonsPlayed.push({
                [season.season]: {
                    goals: currentSeason.g,
                    assistances: currentSeason.a,
                    autogoals: currentSeason.ag,
                    yCards: currentSeason.yc,
                    rCards: currentSeason.rc,
                    matches: currentSeason.m
                }
            });
        }

        this.rating = this.rating.filter(r => r.player === currentPlayer.name);

        for (let r of this.rating) {
            currentPlayer.rating += r.rating;
        }

        currentPlayer.rating = Math.round((currentPlayer.rating / this.rating.length) * 100) / 100;

        currentPlayer.playerCharacteristics.playerAttack = ((currentPlayer.goals + currentPlayer.assistances) / this.globalCharacteristics.globalAttack) * 100;
        currentPlayer.playerCharacteristics.playerPrecission = ((currentPlayer.goals) / this.globalCharacteristics.globalPrecission) * 100;
        currentPlayer.playerCharacteristics.playerPartnership = ((currentPlayer.assistances) / this.globalCharacteristics.globalPartnership) * 100;
        currentPlayer.playerCharacteristics.playerErrors = (this.globalCharacteristics.globalErrors != 0) ? (((currentPlayer.yCards + currentPlayer.rCards + currentPlayer.autogoals) / this.globalCharacteristics.globalErrors) * 100) : 0;
        currentPlayer.playerCharacteristics.playerLeader = ((currentPlayer.mvps) / this.globalCharacteristics.globalLeader) * 100;
        currentPlayer.playerCharacteristics.playerSkills = ((currentPlayer.goals + currentPlayer.assistances + currentPlayer.mvps) / this.globalCharacteristics.globalSkills) * 100;

        currentPlayer.goalsAvg = (Math.round((currentPlayer.goals / currentPlayer.matches) * 100) / 100);

        this.comparablePlayers.push(currentPlayer);

        return currentPlayer;
    }

    loadSeasonCompareChart() {
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
        this.chartAssistances = {
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
        this.chartAutogoals = {
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
        this.chartYCards = {
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
        this.chartRCards = {
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
        this.chartMatches = {
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
        this.chartProfileRadar = {
            lineChartType: 'radar',
            lineChartLegend: false,
            lineChartOptions: {
                responsive: true,
                legend: {
                    display: false
                },
                scale: {
                    gridLines: {color: "white"},
                    pointLabels: {
                        fontColor: 'white',
                        display: false
                    }
                }
            },
            lineChartColors: [
                { // grey
                    backgroundColor: 'rgba(148,159,177,0.6)',
                    borderColor: 'rgba(40, 122, 40,1)',
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
            lineChartData: [],
            lineChartLabels: ['Ataque', 'Precisión', 'Trabajo en equipo', 'Errores', 'Liderazgo', 'Habilidad']
        };

        let goalsArray: any[] = [];
        let assArray: any[] = [];
        let agArray: any[] = [];
        let yCArray: any[] = [];
        let rCArray: any[] = [];
        let mArray: any[] = [];

        for (let item of this.seasonsPlayed) {
            let season = Object.keys(item);

            this.chartGoals.lineChartLabels.push(season[0]);
            this.chartAssistances.lineChartLabels.push(season[0]);
            this.chartAutogoals.lineChartLabels.push(season[0]);
            this.chartYCards.lineChartLabels.push(season[0]);
            this.chartRCards.lineChartLabels.push(season[0]);
            this.chartMatches.lineChartLabels.push(season[0]);

            goalsArray.push(item[season[0]].goals);
            assArray.push(item[season[0]].assistances);
            agArray.push(item[season[0]].autogoals);
            yCArray.push(item[season[0]].yCards);
            rCArray.push(item[season[0]].rCards);
            mArray.push(item[season[0]].matches);
        }

        this.chartGoals.lineChartLabels = this.chartGoals.lineChartLabels.reverse();
        this.chartAssistances.lineChartLabels = this.chartAssistances.lineChartLabels.reverse();
        this.chartAutogoals.lineChartLabels = this.chartAutogoals.lineChartLabels.reverse();
        this.chartYCards.lineChartLabels = this.chartYCards.lineChartLabels.reverse();
        this.chartRCards.lineChartLabels = this.chartRCards.lineChartLabels.reverse();
        this.chartMatches.lineChartLabels = this.chartMatches.lineChartLabels.reverse();

        goalsArray = goalsArray.reverse();
        assArray = assArray.reverse();
        agArray = agArray.reverse();
        yCArray = yCArray.reverse();
        rCArray = rCArray.reverse();
        mArray = mArray.reverse();

        this.chartGoals.lineChartData.push({data: goalsArray, label: 'Goles / Termporadas'});
        this.chartAssistances.lineChartData.push({data: assArray, label: 'Asistencias / Termporadas'});
        this.chartAutogoals.lineChartData.push({data: agArray, label: 'Autogoles / Termporadas'});
        this.chartYCards.lineChartData.push({data: yCArray, label: 'Tarjetas Amarillas / Termporadas'});
        this.chartRCards.lineChartData.push({data: rCArray, label: 'Tarjetas Rojas / Termporadas'});
        this.chartMatches.lineChartData.push({data: mArray, label: 'Partidos / Termporadas'});

        this.chartProfileRadar.lineChartData.push({
            label: ['Caracteristicas del Jugador'],
            data: [
                this.player.playerCharacteristics.playerAttack,
                this.player.playerCharacteristics.playerPrecission,
                this.player.playerCharacteristics.playerPartnership,
                this.player.playerCharacteristics.playerErrors,
                this.player.playerCharacteristics.playerLeader,
                this.player.playerCharacteristics.playerSkills
            ],
            pointRadius: 6,
            pointHitRadius: 6,
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            backgroundColor: '#fff',
            borderColor: '#fff',
            pointBackgroundColor: '#fff',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#fff'
        });
    }

    loadCompareProfileRadar() {
        // this.comparablePlayers = this.comparablePlayers.splice(1, this.comparablePlayers.length - 2);

        this.chartCompareProfileRadar = {
            lineChartType: 'radar',
            lineChartLegend: false,
            lineChartOptions: {
                responsive: true,
                legend: {
                    labels: {
                        fontColor: 'white'
                    }
                },
                scale: {
                    // gridLines: {color: "white"},
                    pointLabels: {
                        fontColor: 'white'
                    }
                }
            },
            lineChartColors: [],
            lineChartData: [],
            lineChartLabels: ['Ataque', 'Precisión', 'Trabajo en equipo', 'Errores', 'Liderazgo', 'Habilidad']
        };

        for (let p of this.comparablePlayers) {
            let randomValueR = Math.floor(Math.random() * (256));
            let randomValueG = Math.floor(Math.random() * (256));
            let randomValueB = Math.floor(Math.random() * (256));

            this.chartCompareProfileRadar.lineChartColors.push({  // grey
                borderColor: 'rgba(' + randomValueR + ', ' + randomValueG + ', ' + randomValueB + ',1)',
                pointBackgroundColor: 'rgba(148,159,177,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            });

            this.chartCompareProfileRadar.lineChartData.push({
                label: [p.name],
                data: [
                    p.playerCharacteristics.playerAttack,
                    p.playerCharacteristics.playerPrecission,
                    p.playerCharacteristics.playerPartnership,
                    p.playerCharacteristics.playerErrors,
                    p.playerCharacteristics.playerLeader,
                    p.playerCharacteristics.playerSkills
                ]
            });
        }
    }

    rerender: boolean;

    comparePlayer(player) {
        this.rerender = true;

        player.active = !player.active;

        if (player.active) {
            this.loadData(player.name.toUpperCase());
        }
        else {
            this.comparablePlayers = this.comparablePlayers.filter(res => res.name.toUpperCase() !== player.name.toUpperCase());
        }

        this.loadCompareProfileRadar();

    }

    showChart() {
        this.rerender = false;
    }
}
