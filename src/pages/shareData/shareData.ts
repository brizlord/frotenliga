import {Component, OnInit} from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import {File} from '@ionic-native/file';
import {DataService} from "../../app/services/data.service";
import {FileChooser} from '@ionic-native/file-chooser';
import {HomePage} from "../home/home";

@Component({
    selector: 'page-shareData',
    templateUrl: 'shareData.html'
})
export class ShareDataPage implements OnInit {
    devices: any[] = [];
    gettingDevices: Boolean;

    constructor(private toastCtrl: ToastController,
                private dataSvc: DataService,
                private file: File,
                private fileChooser: FileChooser,
                public navCtrl: NavController) {
    }

    ngOnInit() {
    }

    saveFile() {
        this.createDirectory();
    }

    createDirectory() {
        this.file.checkDir(this.file.externalRootDirectory, 'Frotenliga')
            .then(_ => this.saveDataJSON(this.file.externalRootDirectory + '/Frotenliga'))
            .catch(err => {
                this.file.createDir(this.file.externalRootDirectory, 'Frotenliga', true)
                    .then(() => this.saveDataJSON(this.file.externalRootDirectory + '/Frotenliga'));
            });
    }

    saveDataJSON(path) {
        let data = this.dataSvc.exportableData();

        this.file.checkFile(path, 'frotenligaDatos.json')
            .then(ok => {
                this.file.removeFile(path, 'frotenligaDatos.json');
                this.file.writeFile(path, 'frotenligaDatos.json', JSON.stringify(data), {replace: true});
                this.showMessage("Se exportó correctamente los datos", 6000);
            })
            .catch(err => {
                this.file.writeFile(path, 'frotenligaDatos.json', JSON.stringify(data), {replace: true});
                this.showMessage("Se exportó correctamente los datos", 6000);
            });
    }

    loadFile() {
        this.fileChooser.open()
            .then(uri => {
                let tmp = uri.split('/');
                tmp.splice(tmp.length - 1, 1);
                let path = tmp.join('/');

                let file = uri.split('/')[uri.split('/').length - 1];

                this.file.readAsText(path, file)
                    .then(res => {
                        if (this.dataSvc.importData(res)) {
                            this.showMessage('Se importó correctamente toda la información.',6000);
                        }
                        else
                            this.showMessage('Ocurrió un error al importar la información.',6000);
                    });
            });
    }

    showMessage(message, duration) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: duration
        });
        toast.present();
    }
}
