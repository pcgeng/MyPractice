import {Component, Injector, enableProdMode} from "@angular/core";

import { GlobalsService, RefreshService, I18nService }   from "./shared/index";
import { ActionDevService } from "./services/testing/action-dev.service";
import { environment } from "../environments/environment";

@Component({
   selector: "my-app",
   styleUrls: ["./app.component.scss"],
   templateUrl: "./app.component.html",
   providers: [ ]
})
export class AppComponent {

   constructor(public  gs: GlobalsService,
               private injector: Injector,
               private refreshService: RefreshService,
               private i18nService: I18nService) {

      // Refresh handler to be used in plugin mode
      this.gs.getWebPlatform().setGlobalRefreshHandler(this.refresh.bind(this), document);

      // Manual injection of ActionDevService, used in webPlatformStub
      if (!this.gs.isPluginMode()) {
         this.injector.get(ActionDevService);
      }

      // Start the app in english by default (dev mode)
      // In plugin mode the current locale is passed as parameter
      this.i18nService.initLocale("en");
   }

   refresh(): void {
      this.refreshService.refreshView();
   }
}
