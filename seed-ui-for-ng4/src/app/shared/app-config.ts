// Application level constants can be kept here
export interface AppConfig {
   getMockDataUrl: any;

   pluginName: string;
   bundleName: string;
   packageName: string;

   hostProperties: string[];
   chassisProperties: string[];  // [removable-chassis-code]
}

export const APP_CONFIG: AppConfig = {
   // Mock data URL used by data services and i18n.service
   // => json-server url in dev mode
   getMockDataUrl: function() {
      return "http://localhost:3000";
   },

   // Names used during the plugin generation:
   // - You can change these values at a later time and they will be used by all .ts and .html code.
   pluginName: "seed-ui",
   bundleName: "com_emc_org",
   packageName: "com.emc.org",

   // List of properties for the Host monitor view
   hostProperties: ["name", "overallStatus", "hardware.systemInfo.model", "vm"],

   // Chassis properties used in various views
   chassisProperties: ["name", "dimensions", "serverType"]
};
