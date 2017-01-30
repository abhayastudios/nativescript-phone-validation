import {Injectable} from '@angular/core';

@Injectable()
export class AuthProvider {

  constructor() {
  }

  public doLogin(user:string,pass:string) {
    return new Promise((resolve, reject) => {
      /* your authentication logic here */
      setTimeout(() => reject(), 1000);
    });
  }

  public doRegister(user:string, country:string, name:string) {
    return new Promise((resolve, reject) => {
      /* your registration logic here */
      setTimeout(() => resolve(), 1000);
    });
  };

  public sendSmsVerification(phone) {
    /* your send SMS logic here */
  }
}
	
