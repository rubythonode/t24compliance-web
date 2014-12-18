var cbecc = angular.module('cbecc', [
  'templates',
  'ngAnimate', 'ngResource', 'ngRoute',
  'toaster',
  'ui.grid', 'ui.grid.autoResize', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.selection',
  'ui.router', 'ui.router.stateHelper',
  'ui.bootstrap',
  'frapontillo.bootstrap-switch',
  'angularSpinner']);

cbecc.config([
  '$stateProvider', '$urlRouterProvider', 'stateHelperProvider', '$httpProvider', 'usSpinnerConfigProvider', function ($stateProvider, $urlRouterProvider, stateHelperProvider, $httpProvider, usSpinnerConfigProvider) {

    usSpinnerConfigProvider.setDefaults({
      lines: 13,
      length: 0,
      width: 22,
      radius: 60,
      speed: 2.2,
      trail: 60,
      shadow: false
    });

    var getBuilding = function ($q, Shared, Building) {
      if (Shared.getProjectId() === null) {
        return $q.reject('No project ID');
      }
      return Building.index({project_id: Shared.getProjectId()}).$promise.then(function (response) {
        if (response.hasOwnProperty('id')) {
          Shared.setBuildingId(response.id);
        } else {
          // Project with no building
          return $q.reject('No building ID');
        }
      }, function () {
        return $q.reject('No building ID');
      });
    };

    var getStoriesForBuildingTab = function ($q, $stateParams, Story, Shared, Building) {
      Shared.startSpinner();
      if (Shared.getBuildingId() === null) {
        if ($stateParams.hasOwnProperty('id')) {
          // buildingId, but no projectId
          Shared.setBuildingId($stateParams.id);
        } else {
          return getBuilding($q, Shared, Building).then(function () {
            return Story.index({
              building_id: Shared.getBuildingId()
            }).$promise;
          }, function (error) {
            if (error == 'No project ID') return $q.reject(error);
            // Ignore lack of buildingId on the building tab with a projectId
            return $q.when([]);
          });
        }
      }
      return Story.index({
        building_id: Shared.getBuildingId()
      }).$promise;
    };

    var getStories = function ($q, Story, Shared, Building) {
      Shared.startSpinner();
      if (Shared.getBuildingId() === null) {
        return getBuilding($q, Shared, Building).then(function () {
          console.log('getBuilding returned success');
          return Story.index({
            building_id: Shared.getBuildingId()
          }).$promise;
        });
      }
      return Story.index({
        building_id: Shared.getBuildingId()
      }).$promise;
    };

    var getConstructions = function ($q, Construction, Shared, Building) {
      Shared.startSpinner();
      // Construction data have no dependencies, but just to reduce latency:
      if (Shared.getBuildingId() === null) {
        return getBuilding($q, Shared, Building).then(function () {
          return Construction.index().$promise;
        });
      }
      return Construction.index().$promise;
    };

    var getConstructionDefaults = function ($q, ConstructionDefaults, Shared, Building) {
      Shared.startSpinner();
      if (Shared.getBuildingId() === null) {
        return getBuilding($q, Shared, Building).then(function () {
          return ConstructionDefaults.index({
            project_id: Shared.getProjectId()
          }).$promise;
        });
      }
      return ConstructionDefaults.index({
        project_id: Shared.getProjectId()
      }).$promise;
    };


    $urlRouterProvider.when('', '/').otherwise('404');

    $httpProvider.defaults.headers.common["X-CSRF-TOKEN"] = $("meta[name=\"csrf-token\"]").attr("content");

    stateHelperProvider
      .state({
        name: 'introduction',
        url: '/',
        templateUrl: 'introduction/introduction.html'
      })
      .state({
        name: 'project',
        url: '/projects',
        controller: 'ProjectCtrl',
        templateUrl: 'project/project.html'
      })
      .state({
        name: 'projectDetails',
        url: '/projects/{project_id:[0-9a-f]{24}}',
        controller: 'ProjectCtrl',
        templateUrl: 'project/project.html'
      })
      .state({
        name: 'building',
        url: '/projects/{project_id:[0-9a-f]{24}}/buildings',
        controller: 'BuildingCtrl',
        templateUrl: 'building/building.html',
        resolve: {
          data: getStoriesForBuildingTab
        }
      })
      .state({ //shouldn't be clickable without projectid
        name: 'buildingPlaceholder',
        url: '/buildings',
        controller: 'BuildingCtrl',
        templateUrl: 'building/building.html',
        resolve: {
          data: getStoriesForBuildingTab
        }
      })
      .state({
        name: 'buildingDetails',
        url: '/projects/{project_id:[0-9a-f]{24}}/buildings/{building_id:[0-9a-f]{24}}',
        controller: 'BuildingCtrl',
        templateUrl: 'building/building.html',
        resolve: {
          data: getStoriesForBuildingTab
        }
      })
      .state({
        name: 'constructions',
        url: '/constructions',
        controller: 'ConstructionsCtrl',
        templateUrl: 'constructions/constructions.html',
        resolve: {
          data: getConstructions,
          defaults: getConstructionDefaults
        }
      })
      .state({
        name: 'spaces',
        url: '/spaces',
        controller: 'SpacesCtrl',
        templateUrl: 'spaces/spaces.html',
        resolve: {
          storyData: getStories
        },
        children: [
          {
            name: 'main',
            url: '',
            templateUrl: 'spaces/main.html'
          },
          {
            name: 'settings',
            url: '/settings',
            templateUrl: 'spaces/settings.html'
          },
          {
            name: 'surfaces',
            url: '/surfaces',
            templateUrl: 'spaces/surfaces.html'
          },
          {
            name: 'subsurfaces',
            url: '/subsurfaces',
            templateUrl: 'spaces/subsurfaces.html'
          },
          {
            name: 'ventilation',
            url: '/ventilation',
            templateUrl: 'spaces/ventilation.html'
          },
          {
            name: 'loads',
            url: '/loads',
            templateUrl: 'spaces/loads.html'
          },
          {
            name: 'lighting',
            url: '/lighting',
            templateUrl: 'spaces/lighting.html'
          }
        ]
      })
      .state({
        name: 'systems',
        url: '/systems',
        controller: 'SystemsCtrl',
        templateUrl: 'systems/systems.html'
      })
      .state({
        name: 'zones',
        url: '/zones',
        controller: 'ZonesCtrl',
        templateUrl: 'zones/zones.html'
      })
      .state({
        name: 'review',
        url: '/review',
        controller: 'ReviewCtrl',
        templateUrl: 'review/review.html'
      })
      .state({
        name: 'compliance',
        url: '/compliance',
        controller: 'ComplianceCtrl',
        templateUrl: 'compliance/compliance.html'
      })
      .state({
        name: '404',
        url: '/404',
        templateUrl: '404/404.html'
      });
  }
]);

cbecc.run(['$rootScope', '$state', 'toaster', 'Shared', function ($rootScope, $state, toaster, Shared) {
  $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
    Shared.stopSpinner();
    if (error == 'No project ID') {
      toaster.pop('error', error, "Please create or open a project.");
      $state.go('project');
    } else if (error == 'No building ID') {
      toaster.pop('error', error, "Please create a building.");
      $state.go('building');
    } else {
      console.error('$stateChangeError - Unrecognized error message:', error);
    }
  });
}]);
