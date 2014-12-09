cbecc.controller('ProjectCtrl', [
  '$scope', '$window', '$stateParams', '$resource', '$location', 'flash', 'Project', function ($scope, $window, $stateParams, $resource, $location, flash, Project) {

    // pull in global enum definitions
    $scope.project_compliance_type_enums = $window.project_compliance_type_enums;

    // project tabs
    $scope.status =
      {
        project_team: true,
        exceptional_condition: true
      };

    // new vs edit
    console.log($stateParams);
    if ($stateParams.id) {
      $scope.project = Project.show({ id: $stateParams.id });
      console.log('existing project');
    } else {
      $scope.project = new Project();
      console.log('new project');
    }

    // save
    $scope.submit = function () {
      console.log("submit");

      function success(response) {
        console.log("success", response);
        console.log($scope.project);
        console.log("_id is: ", response['_id'], "or id is: ", response['id']);
        the_id = typeof response['id'] === "undefined" ? response['_id'] : response['id'];

        // go back to form with id of what was just saved
        $location.path("/project/" + the_id);

      }

      function failure(response) {
        console.log("failure", response);

        _.each(response.data, function(errors, key) {
          _.each(errors, function(e) {
            $scope.form[key].$dirty = true;
            $scope.form[key].$setValidity(e, false);
          });
        });
      }

      if ($stateParams.id) {
        Project.update($scope.project, success, failure);
      } else {
        Project.create($scope.project, success, failure);
      }

    };


    //FORM TODO:  when saving, check if exceptional_condition_modeling is true.  If so, save exceptional_condition_narrative.
    // Exceptional_condition_modeling doesn't actually have a field


  }
]);
