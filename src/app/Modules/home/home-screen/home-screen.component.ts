import {Component, OnInit} from '@angular/core';
import {PrimaryButtonComponent} from "../../shared/base-components/buttons/primary-button/primary-button.component";
import {CommonModule} from "@angular/common";

let ipcRenderer: any;
if (typeof window !== 'undefined' && window.require) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

@Component({
  selector: 'app-home-screen',
  standalone: true,
  imports: [
    PrimaryButtonComponent,
    CommonModule,
  ],
  templateUrl: './home-screen.component.html',
  styleUrl: './home-screen.component.css'
})
export class HomeScreenComponent implements OnInit {
  time: string = '00:00:00'; // Displayed time in HH:mm:ss format
  intervalId: any = 0;
  elapsedTime: any = 0;
  trackedTime: any = 0;
  displayReport: boolean = false;
  disableButton: boolean = false;
  inactivityTime: number = 0;
  activityPercentage: any;
  trackedSeconds: number = 0;
  activeTime: number = 0;
  formatedActiveTime: any = 0;
  formatedInactivityTime: any = 0;

  constructor() {

  }

  ngOnInit() {
    this.setupInactivityListener();
  }

  start() {
    if (this.intervalId) {
      return; // Timer is already running or paused
    }
    this.trackedTime = '00:00:00';
    this.formatedActiveTime = '00:00:00';
    this.formatedInactivityTime = '00:00:00';
    this.activityPercentage = '0.00';

    this.disableButton = !this.disableButton;
    // Start the timer and update every second
    this.intervalId = setInterval(() => {
      this.elapsedTime++;
      this.time = this.formatTime(this.elapsedTime);

      // Start taking screenshots after 10 seconds
      if (this.elapsedTime % 10 === 0) {
        ipcRenderer.send('start-screenshot');
      }

    }, 1000);
    ipcRenderer.send('start-screenshot');
    ipcRenderer.send('start-tracking');
    this.inactivityTime = 0;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.trackedTime = this.time;
    this.activeTime = this.trackedSeconds - this.inactivityTime;
    this.activityPercentage = ((this.activeTime / this.trackedSeconds) * 100).toFixed(2);
    this.disableButton = !this.disableButton;
    this.formatedActiveTime = this.formatTime(this.activeTime);
    this.formatedInactivityTime = this.formatTime(this.inactivityTime);

    this.elapsedTime = 0;
    this.time = '00:00:00';
    this.displayReport = true;
    ipcRenderer.send('stop-screenshot');
    ipcRenderer.send('stop-tracking');
  }


  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    this.trackedSeconds = seconds;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)}`;
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }


  setupInactivityListener() {
    ipcRenderer.on('inactivity-time', () => {
      this.inactivityTime += 1;
    });
  }

}
