import {Component,OnInit,ElementRef,ViewChild} from '@angular/core';
import {isAndroid} from 'platform';
import {ModalDialogParams} from "nativescript-angular/modal-dialog";
import {PhoneNumberProvider} from '../providers/phonenumber';

// child component containing contact search modal
@Component({
  template: `
    <StackLayout backgroundColor="white">
      <GridLayout rows="auto" columns="50 * 50" class="header">
        <Label text="Select Country" col="1" class="center header-text"></Label>
        <Button text="&#xf00d;" col="2" class="fa header-text close-button" (tap)="params.closeCallback(null)"></Button>
      </GridLayout>
      <SearchBar #searchBar hint="Search" (propertyChange)="searchCountryCode($event)" (loaded)="preventFocus()"></SearchBar>
      <ListView [items]="countriesFound" style="margin:10;" rowHeight="75">
        <template let-item="item">
          <!-- template wrapped in StackLayout for class list-item to take effect -->
          <StackLayout>
            <GridLayout columns="40 *" rows="auto,auto" (tap)="selectCountry(item)" class="list-item">
              <Image *ngIf="item.flag" [src]="'data:image/png;base64,'+item.flag" row="0" col="0" class="flag"></Image>
              <Label [text]="item.name" row="0" col="1" class="country-name"></Label>
              <Label [text]="'+'+item.dialCode" row="1" col="1" class="country-dialcode"></Label>
            </GridLayout>
          </StackLayout>
        </template>
      </ListView>
    </StackLayout>
  `,
  styles: [`
    .header { background-color:#0d88ff; }
    .header-text { color:white; font-size: 22; vertical-align:center; }
    .close-button { width:30; }
    .list-item { margin-top:10; }
    .flag { border-radius: 10; width:30; }
    .country-name { color:black; }
    .country-dialcode { margin-top:5; color:#999999; }
  `]
})
export class CountryCodeModal implements OnInit {
  @ViewChild('searchBar') searchBar: ElementRef; // get reference to search bar
  
  public countriesFound : Array<any> = [];

  constructor(private params: ModalDialogParams, public phonenumber: PhoneNumberProvider) {}

  ngOnInit() {
    this.countriesFound = this.phonenumber.countries;
  }
  
  public searchCountryCode(event) {
    let regex = new RegExp(event.value, 'i');
    this.countriesFound = this.phonenumber.countries.filter((country) => regex.test(country.name));
  }

  public selectCountry(country) {
    this.params.closeCallback({ iso2: country.iso2, dialCode: country.dialCode});
  }

  /*
     SearchBar automatically gains focus when loaded on Android and triggers soft keyboard
     This method dismisses clears focus and dismisses soft keyboard
     this.searchBar needs to defined as ViewChild
  */
  private preventFocus() {
    if (isAndroid) {
      setTimeout(() => {
        this.searchBar.nativeElement.android.clearFocus(); // clears focus and dismisses soft keyboard
      },10);
    }
  }
}