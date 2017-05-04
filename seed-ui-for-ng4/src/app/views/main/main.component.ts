import { Component, Input, OnInit, OnDestroy, ViewChild, Inject, forwardRef } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { TabLink } from "clarity-angular";

import { EchoService, NavService }  from "../../services/index";
import { GlobalsService, RefreshService,
AppAlertService, I18nService }   from "../../shared/index";
import { WebPlatform } from "../../shared/vSphereClientSdkTypes";
import { DialogBoxComponent }  from "../../shared/dev/dialog-box.component";
import { Chassis } from "../../services/chassis/chassis.model";
import { ChassisService } from "../../services/chassis/chassis.service";

@Component({
   selector: "main-view",
   styleUrls: ["./main.component.scss"],
   templateUrl: "./main.component.html",
})
export class MainComponent implements OnInit, OnDestroy {
   chassisList: Chassis[];
   selectedChassis: Chassis;
   currentTabId: string;
   echoMsg: string;
   webPlatform: WebPlatform;
   @Input() echoModalOpened = false;
   private echoSubscription: Subscription;
   private refreshSubscription: Subscription;

   // Note: use @ViewChildren in case you have more than one dialogBox.
   @ViewChild(DialogBoxComponent) dialogBox: DialogBoxComponent;

   // Note: the syntax @Inject(forwardRef(() => EchoService)) is required for services in order to avoid
   // circular dependencies problems in main.component.spec.ts test, else we get this error:
   //   "Failed: Can't resolve all parameters for MainComponent: ([object Object], ?, [object Object], ...)"
   constructor(public gs: GlobalsService,
               @Inject(forwardRef(() => ChassisService)) private chassisService: ChassisService,
               @Inject(forwardRef(() => EchoService)) private echoService: EchoService,
               private appAlertService: AppAlertService,
               @Inject(forwardRef(() => NavService)) public nav: NavService,
               private refreshService: RefreshService,
               public  i18n: I18nService) {

      this.webPlatform = this.gs.getWebPlatform();

      // Subscribe to refreshService to handle the global refresh action
      this.refreshSubscription = refreshService.refreshObservable$.subscribe(
            () => this.refreshPage());
   }

   sendEcho(useLocalPopup: boolean): void {
      this.appAlertService.closeAlert();

      const echoMsg = this.i18n.translate("mainView.helloWorld");

      // Default implementation uses the Observable pattern.
      // - echoSubscription subscribes (listens) to the echoService observable
      // - one advantage here is that you can cancel the subscription if the response doesn't
      //   come back before the user goes to another page (see ngOnDestroy() below)
      this.echoSubscription = this.echoService.sendEcho(echoMsg).subscribe(
            msg => { this.openEchoModal(useLocalPopup, msg); },
            error => { this.appAlertService.showError(error); }
      );

      // Alternative version using a Promise instead of an Observable:
      // this.echoService.sendEchoVersion2("World!").then(msg => this.openEchoModal(useLocalPopup, msg));
   }

   sendEchoVersion2(useLocalPopup: boolean): void {
      this.echoService.sendEchoVersion2("World!")
         .then(msg => this.openEchoModal(useLocalPopup, msg))
         .catch(errorMsg => {
            this.appAlertService.showError(errorMsg);
         });
   }

   openEchoModal(useLocalPopup: boolean, msg: string) {
      this.echoMsg = msg;
      // Every visible text must be internationalized
      const title = this.i18n.translate("mainView.echoResponse");

      if (useLocalPopup) {
         this.echoModalOpened = true;
      } else if (this.gs.isPluginMode()) {
         // We use the openModalDialog API to create a real modal, but this comes with limitations:
         // - we can't pass the echoMsg parameter (only an objectId set to null here)
         // - there will be a small delay to display the content since it's a separate view
         const url = this.gs.getWebContextPath() + "/index.html?view=echo-modal";
         this.webPlatform.openModalDialog(title, url, 288, 150, null);
      } else {
         this.dialogBox.openEchoModal(this.echoMsg, title);
      }
   }

   onSubmitEcho(): void {
      this.echoModalOpened = false;
   }

   // [removable-chassis-code]
   gotoChassis(chassis: Chassis): void {
      this.nav.showObjectView(chassis.id, "chassis", "summary");
   }

   // [removable-chassis-code]
   editChassis(chassis: Chassis = null): void {
      const addingChassis: boolean = (chassis === null);
      const title = addingChassis ? this.i18n.translate("chassis.createAction") :
            this.i18n.translate("edit.chassis", chassis.name);

      if (this.gs.isPluginMode()) {
         // URL must include the actionUid because the modal dialog is invoked directly instead of
         // through a menu action (where actionUid is added automatically)
         const url = this.gs.getWebContextPath() + "/index.html?view=edit-chassis&actionUid=__packageName__.editChassis";
         this.webPlatform.openModalDialog(title, url, 576, 248, (chassis === null ? null : chassis.id));
      } else {
         this.dialogBox.openEditChassis(chassis, title);
      }
   }

   // [removable-chassis-code]
   deleteChassis(chassis: Chassis): void {
      if (this.gs.isPluginMode()) {
         // TODO make delete work in this mode
         this.appAlertService.showWarning("Delete is not implemented yet in plugin mode");
      } else {
         this.chassisService.delete(chassis)
               .then(res => {
                  this.refreshService.refreshView();
               });
      }
   }

   onTabSelected(event: TabLink) {
      this.currentTabId = event.id;
   }

   ngOnInit(): void {
      this.getChassisList();
   }

   ngOnDestroy(): void {
      this.refreshSubscription.unsubscribe();
      if (this.echoSubscription) {
         this.echoSubscription.unsubscribe();
      }
   }

   private refreshPage(): void {
      this.getChassisList();
   }

   // [removable-chassis-code]
   private getChassisList(): void {
      this.chassisService.getChassisList(true)
            .then(chassisList => {
               this.chassisList = chassisList;
               // this.resetSelected();
            })
            .catch(errorMsg => this.appAlertService.showError(errorMsg));
   }
}
