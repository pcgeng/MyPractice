// External imports
import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { Component, DebugElement }    from "@angular/core";
import { By }           from "@angular/platform-browser";
import { ClarityModule } from "clarity-angular";

// Internal imports
import { EchoService, NavService }  from "../../services/index";
import { GlobalsService, RefreshService,
         AppAlertService, I18nService } from "../../shared/index";
import { MainComponent }     from "./index";
import { globalsServiceStub, appAlertServiceStub, chassisServiceStub,
         echoServiceStub, i18nServiceStub, navServiceStub } from "../../testing/service-stubs";
import { ChassisService } from "../../services/chassis/chassis.service";

// ---------- Testing stubs ------------

@Component({selector: "app-alert", template: ""})
class AppAlertStubComponent {}

@Component({selector: "app-header", template: ""})
class AppHeaderStubComponent {}

@Component({selector: "dialog-box", template: ""})
class DialogBoxStubComponent {}

@Component({selector: "sidenav", template: ""})
class SidenavStubComponent {}


// ----------- Testing vars ------------

let fixture: ComponentFixture<MainComponent>;
let comp: MainComponent;
let compElement;
let page: Page;

// -------------- Tests ----------------

describe("MainComponent", () => {

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [
            ClarityModule.forRoot()
         ],
         declarations: [
            MainComponent, AppAlertStubComponent,
            AppHeaderStubComponent, DialogBoxStubComponent,
            SidenavStubComponent
         ],
         providers: [ RefreshService,
            { provide: AppAlertService,   useValue: appAlertServiceStub },
            { provide: GlobalsService,    useValue: globalsServiceStub },
            { provide: ChassisService, useValue: chassisServiceStub },
            { provide: EchoService, useValue: echoServiceStub },
            { provide: I18nService, useValue: i18nServiceStub },
            { provide: NavService, useValue: navServiceStub }
         ]
      })
      .compileComponents()
      .then(createComponent);
   }));

   it("should instantiate MainComponent", () => {
      expect(fixture.componentInstance instanceof MainComponent).toBe(true,
            "should create MainComponent");
   });

   it("should display 3 buttons", () => {
      // fixture.detectChanges();
      const helloButtons = compElement.querySelectorAll(".card-block .btn");
      const settingsButton = compElement.querySelector(".content-area > .btn-link");
      expect(helloButtons.length).toEqual(2);
      expect(helloButtons[0].textContent).toBe("mainView.helloBtn1");
      expect(helloButtons[1].textContent).toBe("mainView.helloBtn2");
      expect(settingsButton.textContent).toBe("gotoSettings");
   });

   it("should call echoService.sendEcho for hello button 1", fakeAsync(() => {
      const helloButtons = compElement.querySelectorAll(".card-block .btn");
      helloButtons[0].click();
      expect(page.echoServiceSpy.calls.any()).toBe(true, "sendEcho called");
   }));

   it("should call navService.showSettingsView for settingsButton", fakeAsync(() => {
      const settingsButton = compElement.querySelector(".content-area > .btn-link");
      settingsButton.click();
      expect(page.navServiceSpy.calls.any()).toBe(true, "showSettingsView called");
   }));

   // Different implementation of the same tests. Works with Chrome but fails with PhantomJS.
   // Tests are excluded with "xit" on purpose, or you can comment them out.
   xit("should display 3 buttons", () => {
      expect(page.helloButtons.length).toEqual(2);
      expect(page.helloButtons[0].nativeElement.textContent).toBe("mainView.helloBtn1");
      expect(page.helloButtons[1].nativeElement.textContent).toBe("mainView.helloBtn2");
      expect(page.settingsButton.nativeElement.textContent).toBe("gotoSettings");
   });

   xit("should call echoService.sendEcho for hello button 1", fakeAsync(() => {
      page.helloButtons[0].triggerEventHandler("click", null);
      tick();
      expect(page.echoServiceSpy.calls.any()).toBe(true, "sendEcho called");
   }));

   xit("should call navService.showSettingsView for settingsButton", fakeAsync(() => {
      page.settingsButton.triggerEventHandler("click", null);
      tick();
      expect(page.navServiceSpy.calls.any()).toBe(true, "showSettingsView called");
   }));
});


// -------------- Helpers ----------------

function createComponent() {
   fixture = TestBed.createComponent(MainComponent);
   comp = fixture.componentInstance;
   compElement = fixture.debugElement.nativeElement;

   // Change detection triggers ngOnInit which loads page data
   fixture.detectChanges();

   // Build the page once data is loaded
   return fixture.whenStable().then(() => {
      fixture.detectChanges();
      page = new Page();
   });
}

class Page {
   helloButtons: DebugElement[];
   settingsButton: DebugElement;
   echoServiceSpy: jasmine.Spy;
   navServiceSpy: jasmine.Spy;

   constructor() {
      // Find the 3 buttons on the page with css rules
      // ToDo see why this doesn't work with PhantomJS. In the mean time we get buttons another way in tests above.
      this.helloButtons  = fixture.debugElement.queryAll(By.css(".btn-primary"));
      this.settingsButton  = fixture.debugElement.query(By.css(".btn-link"));

      // Get the component's injected service and spy on it
      const echoService = fixture.debugElement.injector.get(EchoService);
      this.echoServiceSpy = spyOn(echoService, "sendEcho").and.callThrough();
      const navService = fixture.debugElement.injector.get(NavService);
      this.navServiceSpy = spyOn(navService, "showSettingsView");
   };
}
