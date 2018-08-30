import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {AlertController} from 'ionic-angular';
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";

@Injectable()
export class ShareDataService {
    btconn: boolean;
    gettingDevices: Boolean;
    private devices: any[] = [];

    somethingHappen: Subject<boolean> = new Subject<boolean>();
    private devicesSubject: Subject<any> = new Subject<any>();

    constructor(private alertCtrl: AlertController,
                private bluetoothSerial: BluetoothSerial) {
        this.bluetoothSerial.enable();
    }

    ifsomethingHappen(): Observable<any> {
        return this.somethingHappen.asObservable();
    }

    startScanning() {
        this.devices = [];
        this.gettingDevices = true;

        this.bluetoothSerial.list().then((success) => {
                this.devices = success;
                this.gettingDevices = false;

                this.bluetoothSerial.discoverUnpaired().then((successUn) => {
                        this.devices.concat(successUn);

                        this.devicesSubject.next(this.devices);
                    },
                    (err) => {
                        console.log(err);
                    });
            },
            (err) => {

            });
    }

    success = (data) => alert(data);
    fail = (error) => alert(error);

    disconnect() {
        let alert = this.alertCtrl.create({
            title: 'Disconnect?',
            message: 'Do you want to Disconnect?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Disconnect',
                    handler: () => {
                        this.bluetoothSerial.disconnect();
                    }
                }
            ]
        });
        alert.present();
    }

    send_data() {
        this.bluetoothSerial.write("Datos enviados" + '\n')
            .then(
                (success) => {
                    this.success(success);
                },
                (fail) => this.fail(fail)
            );
    }

    received_data(msg) {
        alert('Message received ' + msg);
    }

    connectBt(address) {
        this.bluetoothSerial.connect(address).subscribe(res => this.send_data());
        this.bluetoothSerial.readRSSI().then((success) => this.success(success), (fail) => this.fail(fail));
    }

    getDevices(): Observable<any> {
        return this.devicesSubject.asObservable();
    }
}