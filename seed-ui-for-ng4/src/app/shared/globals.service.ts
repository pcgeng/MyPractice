import { Injectable }  from "@angular/core";
import { Headers } from "@angular/http";

import { APP_CONFIG }  from "./app-config";
import { WebPlatform } from "./vSphereClientSdkTypes";
import { webPlatformStub } from "./dev/webPlatformStub";

// Localstorage item names
const liveDataItem = APP_CONFIG.pluginName + "-liveData";
const devUiItem = APP_CONFIG.pluginName + "-devUI";
const sidenavItem = APP_CONFIG.pluginName + "-sidenav";
const viewInfoItem = APP_CONFIG.pluginName + "-viewInfo";
const clientIdItem = APP_CONFIG.pluginName + "-clientId";


/**
 * Internal flags used by GlobalsService.  Do not import or modify!
 * Use the GlobalsService API below instead.
 * Use app-config.ts for application configuration
 */
export class Globals {
   readonly pluginMode: boolean;
   readonly testMode: boolean;

   // The WEB_PLATFORM global object giving access to SDK 6.5  APIs
   readonly webPlatform: WebPlatform;

   constructor() {
      // pluginMode is set to true when the app runs inside an iFrame, i.e. inside the vSphere Client
      // (this assumes the app itself doesn't use iFrames, which is the normal case)
      this.pluginMode = (window.self !== window.parent);

      this.testMode = window["self"].parent.location.port.indexOf("9876") === 0;

      // WEB_PLATFORM global is defined on the vSphere Client window, except for older versions and dev mode
      this.webPlatform = window.parent["WEB_PLATFORM"] ||
            ((this.pluginMode || this.testMode) ? this.getOldVersionPlatform() : webPlatformStub);

      // Patch for setGlobalRefreshHandler API added in 6.5
      if (this.webPlatform.getClientType() === "flex") {
         this.webPlatform.setGlobalRefreshHandler = function (handler) {
            window.parent["WEB_PLATFORM.refresh" + window.name] = handler;
         };
      }
   }

   // Case of Web Client version < 6.0u3 where the WEB_PLATFORM global didn't exist yet
   getOldVersionPlatform(): WebPlatform {
      let webPlatformElement: any = window.parent.document.getElementById("container_app");
      if (window["jasmine"] && !webPlatformElement) {
         // Dummy element for jasmine tests
         webPlatformElement = {};
      }
      if (window.navigator.userAgent.indexOf("Chrome/") >= 0) {
         // Chrome browser needs a real JS object
         webPlatformElement = Object.create(webPlatformElement);
      }
      webPlatformElement.getRootPath = function() { return "/vsphere-client"; };
      webPlatformElement.getClientType = function() { return "flex"; };
      webPlatformElement.getClientVersion = function() { return "6.0"; };
      return webPlatformElement;
   }
}

/**
 *  A service dealing with application globals which facilitate the mixed-mode
 *  approach of plugin development: dev mode (standalone app) and plugin mode.
 */
@Injectable()
export class GlobalsService {
   private liveData = false;
   private sidenav = false;
   private viewInfo = true;
   private devUI = true;
   private clientId: string;
   private readonly webContextPath: string;

   // The locale id of the vSphere Client, or "en" by default in standalone
   public locale = "en";

   constructor(private globals: Globals) {
      // liveData is always true in production.
      // Then it is true by default when running as a plugin, and false by default when running standalone
      this.liveData = !this.isLocalhostDevMode() ? true :
            this.isPluginMode() ? (localStorage.getItem(liveDataItem) === "false" ? false : true) :
            (localStorage.getItem(liveDataItem) === "true" ? true : false);

      if (this.isPluginMode()) {
         this.sidenav = false;
         this.devUI = false;

      } else {
         // Dev mode defaults: re-use what was last saved in browser local storage
         this.sidenav = (localStorage.getItem(sidenavItem) === "true" ? true : false);
         this.viewInfo = (localStorage.getItem(viewInfoItem) === "true" ? true : false);
         this.clientId = localStorage.getItem(clientIdItem);
      }
      this.webContextPath = this.getWebPlatform().getRootPath() + "/" + APP_CONFIG.pluginName;
   }

   /**
    * @return true when the app runs as a plugin inside vSphere Client,
    *       false when it runs standalone during development.
    */
   public isPluginMode(): boolean {
      return this.globals.pluginMode;
   }

   /**
    * @return the WEB_PLAFORM object containing SDK 6.5 APIs
    */
   public getWebPlatform(): WebPlatform {
      return this.globals.webPlatform;
   }

   /**
    * @return the context path for this plugin object.
    */
   public getWebContextPath(): string {
      return this.webContextPath;
   }

   /**
    * @return true when pluginMode is true, or when testing live data in dev mode
    */
   public useLiveData(): boolean {
      return this.liveData;
   }

   public toggleLiveData(): void {
      // Possible only in dev mode or when testing plugin mode on localhost
      if (this.isLocalhostDevMode()) {
         this.liveData = !this.liveData;
         localStorage.setItem(liveDataItem, "" + this.liveData);
      }
   }

   /**
    * @return true to show all dev UI elements, false to hide them.
    *       Always return false in plugin mode.
    */
   public showDevUI(): boolean {
      return this.devUI;
   }

   public toggleDevUI(): void {
      if (!this.isPluginMode()) {
         this.devUI = !this.devUI;
         localStorage.setItem(devUiItem, "" + this.devUI);
      }
   }

   /**
    * @return true to show the sidenav component in dev mode.
    *          Always return false in plugin mode, or when showDevUI is false.
    */
   public showSidenav(): boolean {
      return this.sidenav && this.devUI;
   }

   public toggleSidenav(): void {
      if (!this.isPluginMode()) {
         this.sidenav = !this.sidenav;
         localStorage.setItem(sidenavItem, "" + this.sidenav);
      }
   }

   /**
    * @return true to show the viewInfo component in standalone mode.
    */
   public showViewInfo(): boolean {
      return this.viewInfo;
   }

   public toggleViewInfo(): void {
      if (!this.isPluginMode()) {
         this.viewInfo = !this.viewInfo;
         localStorage.setItem(viewInfoItem, "" + this.viewInfo);
      }
   }

   /**
    *  Sets the vSphere Client session id used for accessing live data in dev mode
    */
   public setClientId(id): void {
      if (!this.isPluginMode()) {
         this.clientId = id;
         localStorage.setItem(clientIdItem, this.clientId);
      }
   }

   public getClientId(): string {
      return this.clientId;
   }

   /**
    * Flag for checking both the dev mode or a local environment
    *
    * @returns true if the app is running standalone, or as a plugin in a local environment
    */
   isLocalhostDevMode(): boolean {
      return !this.isPluginMode() ||
         window["self"].parent.location.href.indexOf("https://localhost:9443/") === 0;
   }

   /**
    * Get the necessary headers in case of dev mode + live data mode
    *
    * @returns an empty object if live data is turned off, or in plugin mode. Else this returns
    * http headers with the current clientId in order to authorize requests to the local Virgo server.
    * This is a simple way to access live data in dev mode which relies on a valid vSphere client session
    * (i.e. vSphere object data for instance)
    *
    * - clientId must have been initialized beforehand (see clientid.component)
    * - this function is harmless in pluginMode because it returns an empty header.
    */
   getHttpHeaders(): any {
      if (!this.useLiveData() || this.isPluginMode()) {
         return { };
      }
      return { headers: new Headers({"webClientSessionId": this.getClientId()}) };
   }
}
