const { defineCapacitorConfig } = require('@quasar/app-vite/capacitor');

module.exports = defineCapacitorConfig({
  appId: '<%= scope.appId %>',
  appName: '<%= scope.appName %>'
});
