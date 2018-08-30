import {Component, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
import {DataService} from "../../app/services/data.service";
import {ToastController} from 'ionic-angular';
import {Config} from "../../app/interfaces/Config";

@Component({
    selector: 'page-config',
    templateUrl: 'config.html'
})
export class ConfigPage implements OnInit {
    config: Config= {
        totalCountMatches: 0
    };

    constructor(public navCtrl: NavController,
                private dataSvc: DataService,
                public toastCtrl: ToastController) {
        this.config = this.dataSvc.loadConfig();
    }

    ngOnInit() {
        this.dataSvc.ifsomethingHappen()
            .subscribe(res => {
                this.config = this.dataSvc.loadConfig();
            });
    }

    saveConfig() {
        if (this.config != {}) {
            if (this.config.totalCountMatches > 0) {
                let result = this.dataSvc.saveConfig(this.config);
                if (result.isValid) {
                    this.showToast(3000, result.message);
                }
                else {
                    this.showToast(9000, result.message);
                }
            }
            else {
                this.showToast(6000, "Debe jugarse al menos 1 partido en la temporada");
            }
        }
    }

    showToast(duration, message) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: duration
        });
        toast.present();
    }
}
