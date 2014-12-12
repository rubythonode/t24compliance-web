cbecc.controller('BuildingCtrl', [
  '$scope', '$rootScope', '$window', '$stateParams', '$resource', '$location', 'flash', 'Building', 'Shared', function ($scope, $rootScope, $window, $stateParams, $resource, $location, flash, Building, Shared) {

     // check on project, if undefined, redirect
    if (Shared.getProjectId() == null)
    {
        $location.path("/project");
    }
    console.log("Current ProjectID: ", Shared.getProjectId());
    $scope.projectId = Shared.getProjectId();

    // new vs edit (check if bld already saved and load that one)
    if ($stateParams.id) {
      Shared.setBuildingId($stateParams.id);
      $scope.building = Building.show({project_id: $scope.projectId, id: $stateParams.id});
      console.log('building retrieved by stateParams: ', $stateParams.id);
    }
    else if (Shared.getBuildingId() != null) {
      $scope.building = Building.show({project_id: $scope.projectId, id: Shared.getBuildingId()});
      console.log('building retrieved by getBuildingId:', Shared.getBuildingId());
    }
    else {
      buildings = Building.index({project_id: $scope.projectId});
      // I don't know why, but this syntax on the index action is important
      buildings.$promise.then(function(data) {
        console.log('buildings: ', data);
        if (data.length > 0) {
          $scope.building = data[0];
          Shared.setBuildingId($scope.building.id);
          console.log('building retrieved by project id (bld exists): ', $scope.building.id);
        }
        else {
          $scope.building = new Building();
          console.log('no buildings associated wiht this project, creating new one');
        }
      });

    }

    // save
    $scope.submit = function () {
      console.log("submit");

      function success(response) {
        the_id = typeof response['id'] === "undefined" ? response['_id'] : response['id'];

        // go back to form with id of what was just saved
        $location.path("/building/" + the_id);

      }

      function failure(response) {
        console.log("failure", response);

        _.each(response.data, function (errors, key) {
          _.each(errors, function (e) {
            $scope.form[key].$dirty = true;
            $scope.form[key].$setValidity(e, false);
          });
        });
      }

      // set project ID
      $scope.building.project_id = Shared.getProjectId();
      console.log('checkbox: ', $scope.building.relocatable_public_school_building);
      if ($scope.building.relocatable_public_school_building == true)
      {
        $scope.building.relocatable_public_school_building = 1;
      }
      else {
        $scope.building.relocatable_public_school_building = 0;
      }

      // create vs update
      if (Shared.getBuildingId() != null) {
        Building.update({project_id: $scope.projectId}, $scope.building, success, failure);
      } else {
        Building.create({project_id: $scope.projectId}, $scope.building, success, failure);
      }

    };

  }
]);
