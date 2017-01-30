import {Component,ElementRef,ViewChild,ViewContainerRef,OnInit} from '@angular/core';
import {ModalDialogService, ModalDialogOptions} from "nativescript-angular/modal-dialog";
import {isAndroid} from 'platform';
import * as Toast from 'nativescript-toasts';

import {AuthProvider} from "../providers/auth"
import {CountryCodeModal} from '../components/country-code-modal';
import {PhoneNumberProvider} from '../providers/phonenumber';

let Sim = require('nativescript-telephony');

@Component({
  template: `
    <GridLayout>
      <!-- Registration Form -->
      <StackLayout *ngIf="!showVerificationStep" class="parent-container">
        <Label textWrap="false" text="What's your number?" class="headline center"></Label>
        <Label textWrap="true" text="Don't worry we won't pass it\nto anyone else" class="headline-sub center"></Label>
        <GridLayout columns="100 * 30" rows="auto" style="margin-top:40;">
          <StackLayout orientation="horizontal" row="0" col="0" (tap)="showCountryCodeModal()" style="vertical-align:center;">
            <Image *ngIf="flagImage" [src]="'data:image/png;base64,'+flagImage" class="flag"></Image>
            <Label [text]="countryDialCode" class="country-code"></Label>
            <Label text="&#xf0d7;" class="fa country-code-caret"></Label>
          </StackLayout>
          <TextField row="0" col="1" [(ngModel)]="phoneNumber" hint="Mobile Phone Number" #phoneField (textChange)="handleLeadingZero($event)"></TextField>
          <Label row="0" col="2" text="&#xf058;" [ngClass]="validateNumber() ? 'fa phone-valid' : 'fa phone-invalid'">
          </Label>
        </GridLayout>
        <TextField [text]="displayName" (propertyChange)="displayName=$event.value" hint="Full Name" style="margin-top:40;"></TextField>
        <Button text="Sign up" (tap)="doRegister()" class="app-btn" style="margin-top:40; width:150"></Button>
      </StackLayout>

      <!-- Verification Step -->
      <StackLayout *ngIf="showVerificationStep" class="parent-container">
        <Label textWrap="false" text="Phone Verification" class="headline center"></Label>
        <Label textWrap="true" text="We just texted you a code,\nenter it below to finish the sign up" class="headline-sub center"></Label>
        <TextField [(ngModel)]="verificationCode" hint="Verification Code" class="verification-code"></TextField>
        <Button text="Verify" (tap)="doVerifyCode()" class="app-btn" style="margin-top:40; width:150"></Button>
      </StackLayout>

      <!-- Activity Indicator -->
      <StackLayout class="dimmer" [visibility]="spinner ? 'visible' : 'collapsed'"></StackLayout>
      <GridLayout rows="*" [visibility]="spinner ? 'visible' : 'collapsed'">
        <ActivityIndicator busy="true" width="80" height="80"></ActivityIndicator>
      </GridLayout>
    </GridLayout>
  `,
  styles: [`
    .parent-container { margin:20; }
    .headline { margin-top:30; font-size:31; color: #0d88ff; }
    .headline-sub { margin:10 0; font-size:20; }
    .phone-valid { color: green; font-size: 30; }
    .phone-invalid { color: #e6e6e6; font-size: 30; }
    .flag { border-radius: 10; width:30; }
    .country-code { margin-left:3; font-size: 16; }
    .country-code-caret { color: #999999; font-size: 16; margin-left:3; vertical-align: center; }
    .verification-code { margin-top:40; text-align:center; width:200; }
    .dimmer { opacity: 0.5; background-color: black; }
  `]
})
export class LoginPage implements OnInit {
  @ViewChild('phoneField') phoneField: ElementRef; // get reference to phoneField

  private showVerificationStep: boolean = false;
  private countryCode: string; // ISO 2 char country code (e.g. US)
  private countryDialCode: string; // country dial code (e.g. 1)
  private phoneNumber: string = ''; // country local phone number entry from user
  private verificationCode: string = ''; // verification code entry from user
  private displayName: string = ''; // display name entered by user
  private flagImage: any;  // base64 encoded flag image currently displayed in form
  private spinner: boolean = false; // whether to show the activity indicator

  constructor(private auth:AuthProvider, private phonenumber:PhoneNumberProvider, private modal:ModalDialogService, private vcRef:ViewContainerRef) {
  }

  public ngOnInit() {
    Sim.Telephony().then((info) => {
      if (info.hasOwnProperty('countryCode')) { 
        this.countryCode = info['countryCode'] || 'us'; 
        this.countryDialCode = '+' + this.phonenumber.countries.find((c) => c['iso2']==this.countryCode)['dialCode'];
        this.setFlagImage();
      }
    }, (error) => {
      console.log('Unable to retrieve SIM info');
      // default to US
      this.countryCode = 'us'; 
      this.countryDialCode = '+1';
      this.setFlagImage();
    });
  }

  private doRegister() {
    if (!this.validateNumber()) { this.showToast('Please enter a valid cell phone number!'); return false; }
    if (this.displayName.trim().length<1) { this.showToast('Please enter your full name!'); return false; }
    this.spinner=true;
    this.auth.doRegister(this.username(),this.countryCode,this.displayName.trim()).then(() => {
      this.auth.sendSmsVerification(this.username());
      this.showVerificationStep = true;
      this.spinner=false;
    }, (error) => {
      this.showToast(error.message);
      this.spinner=false;
    });
  }

  private doVerifyCode() {
    this.spinner=true;
    this.auth.doLogin(this.username(),this.verificationCode.trim()).then(() => {
      /* registration & validation success -> lead user to main app page */
      //this.router.navigate(["/homepage"], { clearHistory: true })
    }, (error) => {
      console.dump(error);
      this.showToast('Verification failed!');
      this.spinner=false;
    });
  }

  private validateNumber() : boolean {
    return this.phonenumber.isValidMobile(this.username(),this.countryCode);
  }

  /* in this example the phonenumber in E164 format is used as username */
  private username() : string {
    let _phoneNumber = (this.phoneNumber===undefined) ? '' : this.phoneNumber.replace(/^(\(0\)|0)/,'');
    return this.countryDialCode+_phoneNumber;
  }

  private handleLeadingZero(event) {
    this.phoneNumber=event.value.replace(/^0/,'(0)');

    /*
       Valid for NativeScript 2.4 the cursor remains at beginning of TextField
       after changing the value on Android so need to manually put it at the end
    */
    if (isAndroid) {
      setTimeout(() => {
        this.phoneField.nativeElement.focus();
        android.text.Selection.setSelection(
          this.phoneField.nativeElement.android.getText(),
          this.phoneField.nativeElement.android.length()
        );
      },0);
    }
  }

  /* update the flag to show in the UI according to the currently set country */
  private setFlagImage() {
    let country = this.phonenumber.countries.find((c) => { return c.iso2 == this.countryCode; });
    this.flagImage = (country && country.hasOwnProperty('flag') && country.flag!==null ) ? country.flag : null;
  }

  private showCountryCodeModal() {
    let modalOptions = {
      viewContainerRef: this.vcRef,
      context: {}, // data to pass to modal in params
      fullscreen: true
    };

    this.modal.showModal(CountryCodeModal,modalOptions).then((result) => {
      //console.dump(result);
      if (result!==null && result.hasOwnProperty('iso2') && result.hasOwnProperty('dialCode')) {
        this.countryCode = result['iso2'];
        this.countryDialCode = '+' + result['dialCode'];
        this.setFlagImage();
      }
    });
  }

  private showToast(message:string) {
    Toast.show({
      text: message, 
      duration: Toast.DURATION.SHORT
    });
  }
}
