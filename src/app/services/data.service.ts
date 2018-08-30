import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Player} from "../interfaces/player.interface";
import {SQLite} from '@ionic-native/sqlite';
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {Config} from "../interfaces/Config";

@Injectable()
export class DataService {
    players: Player[] = [];
    matchday: string;
    private idMatch: string;
    private gamesTmp: any[] = [];
    private op: string = "";

    userLogged: boolean;

    plusfrotatore: any[] = [];
    asistidores: any[] = [];
    spies: any[] = [];
    lennadores: any[] = [];

    seasons: any[] = [];

    somethingHappen: Subject<boolean> = new Subject<boolean>();

    config: Config;

    constructor(private sqlite: SQLite) {
        this.config = this.loadConfig();
        this.checkValidLogin();
    }

    loadConfig() {
        if (JSON.parse(localStorage.getItem('config'))) {
            this.config = JSON.parse(localStorage.getItem('config'));
            return this.config;
        }
        else {
            return new Config();
        }
    }

    saveConfig(config) {
        if (config.totalCountMatches < parseInt(this.matchday)) {
            return {
                isValid: false,
                message: "La cantidad de partidos debe ser mayor que el número de jornadas jugadas hasta la fecha en esta temporada"
            };
        }
        else {

            this.saveData('config', config);

            this.somethingHappen.next(true);

            return {
                isValid: true,
                message: "Configuración Guardada"
            };
        }
    }

    ifsomethingHappen(): Observable<any> {
        return this.somethingHappen.asObservable();
    }

    sortMatchdaysArray(matchdays) {
        return matchdays.sort(function (a, b) {
            return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
        });
    }

    saveDataPlayersGames(player) {
        let games: any[] = [];

        if (localStorage.getItem("games"))
            games = JSON.parse(localStorage.getItem("games"));

        if (games.length == 0) {
            games.push({idMatch: this.idMatch, players: this.players});
        }
        else {
            let existGame: boolean = false;

            let itGames = 0;
            for (let g of games) {
                if (g.idMatch == this.idMatch) {
                    existGame = true;
                    this.players = g.players;
                    break;
                }

                itGames++;
            }

            if (!existGame) {
                games.push({idMatch: this.idMatch, players: this.players});
            }
            else {
                let it = 0;
                for (let p of this.players) {
                    if (p.name == player.name) {
                        this.players.splice(it, 1);
                        break;
                    }

                    it++;
                }
                games[itGames].players.push(player);
            }
        }

        if (this.op != "newMatchday") {
            this.saveData('games', games);
        }
        else {
            this.gamesTmp = games;
        }
    }

    openLastMatchday(currentSeason) {
        let matchdays: any[] = [];

        if (localStorage.getItem("matchdays")) {
            matchdays = JSON.parse(localStorage.getItem("matchdays"));
            matchdays = matchdays.filter(mtd => mtd.season === currentSeason);

            if (matchdays.length > 0) {

                let games: any[] = [];

                if (JSON.parse(localStorage.getItem("games")))
                    games = JSON.parse(localStorage.getItem("games"));

                if (games.length > 0) {
                    for (let g of games) {
                        if (g.idMatch == matchdays[matchdays.length - 1].id) {

                            this.players = g.players;
                            this.matchday = matchdays[matchdays.length - 1].matchday;
                            this.idMatch = matchdays[matchdays.length - 1].id;
                        }
                    }
                }
            }
        }
    }

    NewMatchday(season) {
        let matchdays: any[] = [];

        if (localStorage.getItem("matchdays"))
            matchdays = JSON.parse(localStorage.getItem("matchdays"));

        matchdays = matchdays.filter(m => m.season == season);

        matchdays = matchdays.sort(function (a, b) {
            return (a.id > b.id) ? -1 : (a.id < b.id) ? 1 : 0;
        });

        this.idMatch = Date.now().toString();
        this.matchday = (matchdays.length > 0) ? (matchdays[0].matchday + 1) : 1;

        this.op = "newMatchday";
        this.showPlayers(this.idMatch);
    }

    saveNewMatchday() {
        this.getSeasons();

        let date: Date = new Date();

        let matchdays: any[] = [];

        if (localStorage.getItem("matchdays"))
            matchdays = JSON.parse(localStorage.getItem("matchdays"));

        if (matchdays.filter(res => res.id === this.idMatch).length == 0) {
            matchdays.push({
                id: this.idMatch,
                season: this.seasons[0].season,
                matchday: this.matchday,
                date:
                date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
            });

            matchdays = this.sortMatchdaysArray(matchdays);

            this.saveData('matchdays', matchdays);

            this.saveData('games', this.gamesTmp);

            this.removeMatchdayNotPlayed(this.getCurrentSeason());

            this.somethingHappen.next(true);

            this.op = "";
        }
    }

    removeMatchdayNotPlayed(season) {
        let tmp: any[] = this.getSeasonMatchdays(season);
        let matchdTmp: any[] = JSON.parse(localStorage.getItem('matchdays'));

        for (let i = 0; i < tmp.length; i++) {
            if (tmp[i].games.length == 0) {

                tmp = matchdTmp.filter((m => m.matchday === tmp[i].md && m.season === season));
                break;
            }
        }

        // for (let i = 0; i < tmp.length; i++) {
        matchdTmp = matchdTmp.filter((m => m.id !== tmp[0].id));

        // matchdTmp.push(tmp);

        console.log(matchdTmp);
        this.saveData('matchdays', matchdTmp);

        // }


        console.log(JSON.parse(localStorage.getItem('matchdays')));
    }

    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    showPlayers(idMatchday) {
        let games: any[] = [];

        if (localStorage.getItem("games"))
            games = JSON.parse(localStorage.getItem("games"));

        let existMatch: boolean = false;

        for (let g of games) {
            if (g.idMatch == idMatchday) {
                existMatch = true;
                this.players = g.players;
            }
        }

        if (!existMatch)
            this.players = [];
    }

    getPlusFrotatore(season) {
        let players: any[] = [];
        let goals: any[] = [];
        let matches: any[] = [];

        let seasonMatchday: any[] = [];

        seasonMatchday = this.getSeasonMatchdays(season);

        for (let md of seasonMatchday) {
            for (let p of md.games[0].players) {
                let index = players.indexOf(p.name.toUpperCase());
                if (index >= 0) {
                    if (p.goals > 0) {
                        goals[index] = (parseInt(goals[index]) + parseInt(p.goals));
                    }

                    matches[index] += 1;
                }
                else {
                    if (p.goals > 0) {
                        players.push(p.name.toUpperCase());
                        goals.push(parseInt(p.goals));
                    }

                    matches.push(1);
                }
            }
        }

        let objectPlayers: any[] = [];

        for (let i = 0; i < players.length; i++) {
            if (goals[i] > 0) {
                objectPlayers.push({
                    name: players[i],
                    goals: goals[i],
                    avg: Math.round((goals[i] / matches[i]) * 10) / 10
                });
            }
        }

        this.plusfrotatore = objectPlayers.sort(function (a, b) {
            return (a.goals > b.goals) ? -1 : ((b.goals > a.goals) ? 1 : (a.avg > b.avg) ? -1 : ((b.avg > a.avg) ? 1 : 0));
        });

        return this.plusfrotatore;
    }

    getAsistidores(season) {
        let games: any[] = [];
        let players: any[] = [];
        let ass: any[] = [];
        let matches: any[] = [];

        let seasonMatchday: any[] = [];

        seasonMatchday = this.getSeasonMatchdays(season);

        for (let md of seasonMatchday) {
            for (let p of md.games[0].players) {
                let index = players.indexOf(p.name.toUpperCase());
                if (index >= 0) {
                    if (p.assistance > 0) {
                        ass[index] = (parseInt(ass[index]) + parseInt(p.assistance));
                    }

                    matches[index] += 1;
                }
                else {
                    if (p.assistance > 0) {
                        players.push(p.name.toUpperCase());
                        ass.push(parseInt(p.assistance));
                    }

                    matches.push(1);
                }
            }
        }

        let objectPlayers: any[] = [];

        for (let i = 0; i < players.length; i++) {
            if (ass[i] > 0) {
                objectPlayers.push({
                    name: players[i],
                    assistances: ass[i],
                    avg: Math.round((ass[i] / matches[i]) * 10) / 10
                });
            }
        }

        this.asistidores = objectPlayers.sort(function (a, b) {
            return (a.assistances > b.assistances) ? -1 : ((b.assistances > a.assistances) ? 1 : (a.avg > b.avg) ? -1 : ((b.avg > a.avg) ? 1 : 0));
        });
        return this.asistidores;
    }

    getSpies(season) {
        let games: any[] = [];
        let players: any[] = [];
        let spies: any[] = [];

        let seasonMatchday: any[] = [];

        seasonMatchday = this.getSeasonMatchdays(season);

        for (let md of seasonMatchday) {
            for (let p of md.games[0].players) {
                let index = players.indexOf(p.name.toUpperCase());
                if (index >= 0) {
                    if (p.autogoals > 0) {
                        spies[index] = (parseInt(spies[index]) + parseInt(p.autogoals));
                    }
                }
                else {
                    if (p.autogoals > 0) {
                        players.push(p.name.toUpperCase());
                        spies.push(parseInt(p.autogoals));
                    }
                }
            }
        }

        let objectPlayer: any[] = [];
        for (let i = 0; i < players.length; i++) {
            if (spies[i] > 0) {
                objectPlayer.push({
                    name: players[i],
                    autogoals: spies[i]
                });
            }
        }

        this.spies = objectPlayer.sort(function (a, b) {
            return (a.autogoals > b.autogoals) ? -1 : ((b.autogoals > a.autogoals) ? 1 : 0);
        });

        return this.spies;
    }

    getLenadores(season) {
        let games: any[] = [];
        let players: any[] = [];
        let fightersY: any[] = [];
        let fightersR: any[] = [];

        let seasonMatchday: any[] = [];

        seasonMatchday = this.getSeasonMatchdays(season);

        for (let md of seasonMatchday) {
            for (let p of md.games[0].players) {
                let index = players.indexOf(p.name.toUpperCase());
                if (index >= 0) {
                    if (p.yellowCards > 0) {
                        fightersY[index] = (parseInt(fightersY[index]) + parseInt(p.yellowCards));
                    }

                    if (p.redCards > 0) {
                        fightersR[index] = (parseInt(fightersR[index]) + parseInt(p.redCards));
                    }
                }
                else {
                    // if (p.yellowCards > 0 || p.redCards > 0) {
                    players.push(p.name.toUpperCase());
                    // }
                    // if (p.yellowCards > 0) {
                    fightersY.push(parseInt(p.yellowCards));
                    // }

                    // if (p.redCards > 0) {
                    fightersR.push(parseInt(p.redCards));
                    // }
                }
            }
        }

        let objectPlayer: any[] = [];

        for (let i = 0; i < players.length; i++) {
            if ((fightersY[i] + fightersR[i]) > 0) {
                objectPlayer.push({
                    name: players[i],
                    totalCards: (fightersY[i] + fightersR[i]),
                    yCards: fightersY[i],
                    rCards: fightersR[i]
                });
            }
        }

        this.lennadores = objectPlayer.sort(function (a, b) {
            return (a.totalCards > b.totalCards) ? -1 : ((b.totalCards > a.totalCards) ? 1 : 0);
        });

        return this.lennadores;
    }

    getAllPlayersSeason(season) {
        let players: any[] = [];
        let goals: any[] = [];
        let ass: any[] = [];
        let matches: any[] = [];

        let seasonMatchday: any[] = [];

        seasonMatchday = this.getSeasonMatchdays(season);

        for (let md of seasonMatchday) {
            for (let p of md.games[0].players) {
                let index = players.indexOf(p.name);
                if (index >= 0) {
                    goals[index] = (parseInt(goals[index]) + parseInt(p.goals));

                    ass[index] = (parseInt(ass[index]) + parseInt(p.assistance));

                    matches[index] += 1;
                }
                else {
                    players.push(p.name);
                    goals.push(parseInt(p.goals));
                    ass.push(parseInt(p.assistance));

                    matches.push(1);
                }
            }
        }


        let objectPlayers: any[] = [];

        for (let i = 0; i < players.length; i++) {
            objectPlayers.push({
                name: players[i],
                goals: goals[i],
                assistances: ass[i],
                matches: matches[i],
                avg: Math.round(((goals[i] + ass[i]) / matches[i]) * 10) / 10
            });
        }

        objectPlayers = objectPlayers.sort(function (a, b) {
            return (a.avg > b.avg) ? -1 : ((b.avg > a.avg) ? 1 : 0);
        });

        return objectPlayers;
    }

    getSeasons() {
        if (localStorage.getItem("seasons")) {
            this.seasons = JSON.parse(localStorage.getItem("seasons"));
            return this.seasons;
        }
        else {
            this.seasons = [];
            return [];
        }
    }

    newSeason(season) {
        this.getSeasons();

        if (this.seasons.filter(
                data => data.season == season.season).length == 0) {
            this.seasons.push(season);

            this.seasons = this.seasons.sort(function (a, b) {
                return ((a.season > b.season) ? -1 : (a.season < b.season) ? 1 : 0);
            });

            this.saveData('seasons', this.seasons);

            this.players = [];
            this.matchday = null;
            this.idMatch = null;

            this.openLastMatchday(season);

            this.somethingHappen.next(true);

            return true;
        }
        else {
            return false;
        }
    }

    getSeasonMatchdays(season) {
        let matchdays: any[] = [];
        let tmp: Array<{ md: string, games: any[] }> = [];

        if (localStorage.getItem("matchdays"))
            matchdays = JSON.parse(localStorage.getItem("matchdays"));

        let games: any[] = [];
        if (JSON.parse(localStorage.getItem("games")))
            games = JSON.parse(localStorage.getItem("games"));


        if (matchdays.length > 0) {

            matchdays = matchdays.filter(m =>
                m.season == season
            );

            for (let m of matchdays) {

                tmp.push({
                    md: m.matchday,
                    games: games.filter(g => g.idMatch == m.id)
                });
            }
        }

        return tmp;
    }

    getCurrentSeason() {
        if (localStorage.getItem("seasons"))
            return JSON.parse(localStorage.getItem("seasons"))[0].season;
    }

    // getRatingPlayer1(season) {
    //     let currentSeason = this.getSeasonMatchdays(season);
    //     let tmpMVP: [{ playerName: string, elo: number }] = [];
    //
    //     for (let md of currentSeason) {
    //         for (let player of md.games[0].players) {
    //             let elo: number = 0;
    //
    //             if (tmpMVP.filter(p => p.playerName == player.name).length > 0) {
    //                 elo += ((parseInt(player.goals) * 5) + (parseInt(player.assistances) * 3) + (parseInt(player.autogoals) * (-1)) + (parseInt(player.yellowCards) * (-1)) + (parseInt(player.redCards) * (-2)) + ((player.mvp.length > 0) ? 4 : 0));
    //             }
    //             else {
    //                 elo = ((parseInt(player.goals) * 5) + (parseInt(player.assistance) * 3) + (parseInt(player.autogoals) * (-1)) + (parseInt(player.yellowCards) * (-1)) + (parseInt(player.redCards) * (-2)) + ((player.MVP.length > 0) ? 4 : 0));
    //             }
    //
    //             tmpMVP.push({
    //                 player: player.name,
    //                 elo: elo
    //             });
    //         }
    //     }
    //
    //
    //     tmpMVP = tmpMVP.sort(function (a, b) {
    //         return (a.elo > b.elo) ? -1 : ((a.elo < b.elo) ? 1 : 0);
    //     });
    //
    //     console.log(tmpMVP);
    //
    //     return tmpMVP;
    // }

    getRatingPlayer(season) {
        let pf = this.getPlusFrotatore(season);
        let ass = this.getAsistidores(season);
        let spies = this.getSpies(season);
        let lennadores = this.getLenadores(season);

        let totalGoals: number = 0;
        let totalAssistances: number = 0;
        let totalAutogoals: number = 0;
        let totalYc: number = 0;
        let totalRc: number = 0;

        let tmpMVP: any[] = [];

        // GOALS
        for (let player of pf) {

            totalGoals += (parseInt(player.goals));

            tmpMVP.push({
                player: player.name,
                goals: parseInt(player.goals)
            });
        }

        // ASSISTANCES
        for (let player of ass) {
            totalAssistances += (parseInt(player.assistances));

            if (tmpMVP.filter(p => p.player == player.name).length > 0) {
                tmpMVP.filter(p => p.player == player.name)[0].ass = (parseInt(player.assistances));
            }
            else {
                tmpMVP.push({
                    player: player.name,
                    ass: parseInt(player.assistances)
                });
            }
        }

        // AUTOGOALS
        for (let player of spies) {
            totalAutogoals += (parseInt(player.autogoals));

            if (tmpMVP.filter(p => p.player == player.name).length > 0) {
                tmpMVP.filter(p => p.player == player.name)[0].autogoals = (parseInt(player.autogoals));
            }
            else {
                tmpMVP.push({
                    player: player.name,
                    autogoals: parseInt(player.autogoals)
                });
            }
        }

        // LENNA
        for (let player of lennadores) {
            totalYc += (parseInt(player.yCards));
            totalRc += (parseInt(player.rCards));

            if (tmpMVP.filter(p => p.player == player.name).length > 0) {
                tmpMVP.filter(p => p.player == player.name)[0].yellowCards = (parseInt(player.yCards));
                tmpMVP.filter(p => p.player == player.name)[0].redCards = (parseInt(player.rCards));
            }
            else {
                tmpMVP.push({
                    player: player.name,
                    yellowCards: parseInt(player.yCards),
                    redCards: parseInt(player.rCards)
                });
            }
        }

        let totalRating: number = 0;

        for (let item of tmpMVP) {
            item.rating = 0;

            if (item.hasOwnProperty("goals") && totalGoals > 0)
                item.rating += (item.goals / totalGoals);

            if (item.hasOwnProperty("ass") && totalAssistances > 0)
                item.rating += (item.ass / totalAssistances);

            if (item.hasOwnProperty("autogoals") && totalAutogoals > 0 && item.autogoals > 0)
                item.rating -= (Math.pow(item.autogoals / totalAutogoals, 4));

            if (item.hasOwnProperty("yellowCards") && totalYc > 0 && item.yellowCards > 0)
                item.rating -= (Math.pow(item.yellowCards / totalYc, 5));

            if (item.hasOwnProperty("redCards") && totalRc > 0 && item.redCards > 0)
                item.rating -= (Math.pow(item.redCards / totalRc, 6));

            item.rating = Math.round((item.rating) * 100) / 100;

            totalRating += (item.rating);
        }

        if (totalRating > 0) {
            for (let item of tmpMVP) {
                item.rating = Math.round((item.rating / totalRating) * 1000) / 10;

                // if (item.rating < 0) {
                //     item.rating *= (-1);
                // }
            }

            tmpMVP = tmpMVP.sort(function (a, b) {
                return (a.rating > b.rating) ? -1 : ((a.rating < b.rating) ? 1 : 0);
            });

            return tmpMVP;
        }
        else {
            return [];
        }
    }

    exportableData() {
        return {
            config: localStorage.getItem('config'),
            seasons: localStorage.getItem('seasons'),
            matchdays: localStorage.getItem('matchdays'),
            games: localStorage.getItem('games')
        };
    }

    importData(data) {
        try {
            data = JSON.parse(data);

            let keysArray = Object.keys(data);
            for (let k of keysArray) {
                localStorage.setItem(k, data[k]);
            }

            return true;
        }
        catch (ex) {
            return false;
        }
    }

    login(user) {
        if (user.nick == 'admin' && user.pass == 'adminfroten') {
            localStorage.setItem('userLogged', JSON.stringify(true));
            this.userLogged = true;

            return true;
        }

        return false;
    }

    logout() {
        localStorage.removeItem('userLogged');
    }

    checkValidLogin() {
        this.userLogged = JSON.parse(localStorage.getItem('userLogged'));
        return JSON.parse(localStorage.getItem('userLogged'));
    }
}