import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AuthProvider } from "./providers/auth"
import { CountryCodeModal } from './components/country-code-modal';
import { LoginPage } from "./pages/login";
import { PhoneNumberProvider } from "./providers/phonenumber"

@NgModule({
    declarations: [
      CountryCodeModal,
      LoginPage
    ],
    bootstrap: [LoginPage],
    entryComponents: [
      CountryCodeModal
    ],
    imports: [NativeScriptModule],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      AuthProvider,
     PhoneNumberProvider,
    ]
})
export class AppModule { }
