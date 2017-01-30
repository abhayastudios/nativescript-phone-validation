/// <reference path="./node_modules/tns-core-modules/tns-core-modules.d.ts" /> Needed for autocompletion and compilation.
declare var phonenumbers: any; // declare google-libphonenumber typings

/* 
   add typings for ES6 features in Nativescript
*/
declare interface Array<T> {
  find(predicate: (element: T, index?: number, array?: Array<T>) => boolean): T;
  findIndex(predicate: (element: T, index?: number, array?: Array<T>) => boolean): number;
}
declare interface ObjectConstructor {
  assign(target: any, ...sources: any[]): any;
}

/*
   add typings for accessing Android native platform
*/
declare var android: any;
declare var java: any;