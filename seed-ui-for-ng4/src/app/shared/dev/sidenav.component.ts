import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Subscription } from "rxjs/Subscription";

import { GlobalsService, RefreshService,
         AppAlertService}   from "../index";
import { Host, HostService } from "../../services/index";
import { NavService } from "../../services/nav.service";
import { ChassisService } from "../../services/chassis/chassis.service";
import { Chassis } from "../../services/chassis/chassis.model";

/**
 * Sidenav component visible only in plugin mode and shared by all views
 */
@Component({
   selector: "sidenav",
   styleUrls: ["./sidenav.component.scss"],
   templateUrl: "./sidenav.component.html"
})
export class SidenavComponent  implements OnInit, OnDestroy {
   hosts: Host[];
   chassisList: Chassis[];
   selectedHost = -1;
   selectedChassis = -1;
   private subscription: Subscription;
   // ToDo: use case for accessing parent component?
   @Input() parent;

   constructor(public gs: GlobalsService,
               private appAlertService: AppAlertService,
               private chassisService: ChassisService,
               private hostService: HostService,
               public navService: NavService,
               private refreshService: RefreshService) {
      this.subscription = refreshService.refreshObservable$.subscribe(
            () => this.refreshView());
   }

   selectHost(hostId, index): void {
      this.selectedHost = index;
      this.selectedChassis = -1;
      this.navService.showObjectView(hostId, "host");
   }

   selectChassis(chassisId, index): void {
      this.selectedHost = -1;
      this.selectedChassis = index;
      this.navService.showObjectView(chassisId, "chassis", "summary");
   }

   refreshView(): void {
      this.hostService.getHosts()
            .then(hosts => {
               this.hosts = hosts;
               if (this.hosts.length === 0) {
                  this.appAlertService.showInfo("No hosts found");
               }
            })
            .catch(errorMsg =>  this.appAlertService.showError(errorMsg));

      // get chassis sorted by name
      this.chassisService.getChassisList(true)
            .then(chassisList => {
               this.chassisList = chassisList;
            })
            .catch(errorMsg =>  this.appAlertService.showError(errorMsg));
   }

   ngOnInit(): void {
      this.refreshView();
   }

   ngOnDestroy(): void {
      this.subscription.unsubscribe();
   }
}

