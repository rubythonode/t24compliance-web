cbecc.controller('SpacesSurfacesCtrl', ['$scope', 'uiGridConstants', 'Shared', 'ConstructionLibrary', function ($scope, uiGridConstants, Shared, ConstructionLibrary) {
  $scope.selected = {
    surface: null
  };

  $scope.applySettingsActive = false;

  $scope.dropdowns = [
    'Interior',
    'Exterior',
    'Underground'
  ];
  $scope.currentWallDropdown = 0;
  $scope.currentFloorDropdown = 0;

  $scope.spacesArr = [];
  $scope.spacesHash = {};
  _.each($scope.data.spaces, function (space, index) {
    $scope.spacesArr.push({
      id: index,
      value: space.name
    });
    $scope.spacesHash[index] = space.name;
  });

  // Initialize adjacent space dropdown options, update stories
  var compatibleAdjacentSpaces = $scope.data.allCompatibleAdjacentSpaces();
  _.each($scope.data.surfaces, function (surface, surfaceIndex) {
    surface.building_story_id = $scope.data.spaces[surface.space].building_story_id;
    if (surface.boundary == 'Interior') {
      surface.adjacencyOptions = compatibleAdjacentSpaces[surfaceIndex];
    }
  });

  // Surfaces UI Grid
  $scope.surfacesGridOptions = {
    columnDefs: [{
      name: 'name',
      displayName: 'Surface Name',
      enableHiding: false,
      cellEditableCondition: $scope.data.applySettingsCondition,
      filters: Shared.textFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'space',
      displayName: 'Space Name',
      enableHiding: false,
      cellEditableCondition: $scope.data.applySettingsCondition,
      editableCellTemplate: 'ui-grid/dropdownEditor',
      cellFilter: 'mapHash:grid.appScope.spacesHash',
      editDropdownOptionsArray: $scope.spacesArr,
      filters: Shared.enumFilter($scope.spacesHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.spacesArr)
    }, {
      name: 'surface_type',
      enableCellEdit: false,
      enableHiding: false,
      filters: Shared.textFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'building_story_id',
      displayName: 'Story',
      enableCellEdit: false,
      cellFilter: 'mapHash:grid.appScope.data.storiesHash',
      enableHiding: false,
      filters: Shared.enumFilter($scope.data.storiesHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.data.storiesHash)
    }, {
      name: 'area',
      secondLine: Shared.html('ft<sup>2</sup>'),
      enableHiding: false,
      cellEditableCondition: $scope.data.applySettingsCondition,
      type: 'number',
      filters: Shared.numberFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'azimuth',
      secondLine: Shared.html('&deg;'),
      enableHiding: false,
      type: 'number',
      cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (!(row.entity.type == 'Roof' || (row.entity.type == 'Wall' && row.entity.boundary == 'Exterior'))) {
          return 'disabled-cell';
        }
      },
      cellEditableCondition: function ($scope) {
        if ($scope.grid.appScope.applySettingsActive) return false;
        return ($scope.row.entity.type == 'Roof' || ($scope.row.entity.type == 'Wall' && $scope.row.entity.boundary == 'Exterior'));
      },
      filters: Shared.numberFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'construction_library_id',
      displayName: 'Construction',
      allowConstructionEdit: true,
      enableCellEdit: false,
      cellFilter: 'mapHash:grid.appScope.data.constHash',
      enableHiding: false,
      cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (!row.entity.construction_library_id) {
          return 'required-cell msg-select-a-construction';
        }
        if (row.entity.constructionDefault && row.entity.construction_library_id != row.entity.constructionDefault) {
          return 'modified-cell';
        }
      },
      cellTemplate: 'ui-grid/cbeccConstructionCell',
      filters: Shared.enumFilter($scope.data.constHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.data.constHash)
    }, {
      name: 'adjacent_space_reference',
      displayName: 'Adjacent Space',
      enableHiding: false,
      cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (row.entity.boundary != 'Interior') {
          return 'disabled-cell';
        }
        if (!row.entity.adjacencyOptions.length) {
          return 'error-cell msg-no-compatible-spaces';
        }
        if (row.entity.adjacent_space_reference == null) {
          return 'required-cell msg-select-adjacent-space';
        }
      },
      cellEditableCondition: function ($scope) {
        if ($scope.grid.appScope.applySettingsActive) return false;
        return $scope.row.entity.boundary == 'Interior' && $scope.row.entity.adjacencyOptions.length;
      },
      editableCellTemplate: 'ui-grid/dropdownEditor',
      cellFilter: 'mapHash:grid.appScope.spacesHash',
      editDropdownRowEntityOptionsArrayPath: 'adjacencyOptions',
      filters: Shared.enumFilter($scope.spacesHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.spacesArr)
    }, {
      name: 'tilt',
      secondLine: Shared.html('&deg;'),
      enableHiding: false,
      type: 'number',
      cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (row.entity.type != 'Roof') {
          return 'disabled-cell';
        }
      },
      cellEditableCondition: function ($scope) {
        if ($scope.grid.appScope.applySettingsActive) return false;
        return $scope.row.entity.type == 'Roof';
      },
      filters: Shared.numberFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'height',
      displayName: 'Wall Height',
      secondLine: Shared.html('ft'),
      enableHiding: false,
      type: 'number',
      cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (!(row.entity.type == 'Wall' && row.entity.boundary == 'Underground')) {
          return 'disabled-cell';
        }
      },
      cellEditableCondition: function ($scope) {
        if ($scope.grid.appScope.applySettingsActive) return false;
        return ($scope.row.entity.type == 'Wall' && $scope.row.entity.boundary == 'Underground');
      },
      filters: Shared.numberFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'perimeter_exposed',
      displayName: 'Exposed Perimeter',
      secondLine: Shared.html('ft'),
      enableHiding: false,
      type: 'number',
      cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (!(row.entity.type == 'Floor' && row.entity.boundary == 'Underground')) {
          return 'disabled-cell';
        }
      },
      cellEditableCondition: function ($scope) {
        if ($scope.grid.appScope.applySettingsActive) return false;
        return ($scope.row.entity.type == 'Floor' && $scope.row.entity.boundary == 'Underground');
      },
      filters: Shared.numberFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }],
    data: $scope.data.surfaces,
    enableCellEditOnFocus: true,
    enableFiltering: true,
    enableRowHeaderSelection: true,
    enableRowSelection: true,
    enableSelectAll: false,
    excessRows: 10,
    multiSelect: false,
    onRegisterApi: function (gridApi) {
      $scope.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        if (!$scope.applySettingsActive) {
          if (row.isSelected) {
            $scope.selected.surface = row.entity;
          } else {
            // No rows selected
            $scope.selected.surface = null;
          }
        }
      });
      gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
        if (newValue != oldValue) {
          Shared.setModified();

          var surfaceIndex = $scope.data.surfaces.indexOf(rowEntity);
          if (colDef.name == 'name') {
            var unique = Shared.checkUnique($scope.data.surfaces, newValue, surfaceIndex);
            if (!unique) rowEntity.name = oldValue;
          } else if (colDef.name == 'space') {
            $scope.updateSpace(rowEntity, surfaceIndex, newValue, oldValue);
          } else if (colDef.name == 'azimuth') {
            rowEntity.azimuth = Shared.fixPrecision(((newValue % 360) + 360) % 360);
          }
        }
      });
    }
  };

  $scope.updateSpace = function (rowEntity, surfaceIndex, newValue, oldValue) {
    // Update story
    rowEntity.building_story_id = $scope.data.spaces[newValue].building_story_id;

    // Update name
    var regex = '^' + $scope.spacesHash[oldValue] + ' ' + rowEntity.type;
    if (rowEntity.type == 'Wall' || rowEntity.type == 'Floor') {
      regex += ' [0-9]+';
    }
    regex += '$';
    if (new RegExp(regex).test(rowEntity.name)) {
      var name = $scope.spacesHash[newValue] + ' ' + rowEntity.type;
      if (rowEntity.type == 'Wall' || rowEntity.type == 'Floor') {
        var len = _.filter($scope.data.surfaces, function (surface) {
          return surface.space == newValue && surface.type == rowEntity.type;
        }).length;
        name += ' ' + len;
      }
      rowEntity.name = name;
    }

    // Update adjacent space
    if (rowEntity.boundary == 'Interior') {
      rowEntity.adjacent_space_reference = null;
      rowEntity.adjacencyOptions = $scope.data.compatibleAdjacentSpaces(surfaceIndex);
      $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
    }
  };

  // Buttons
  $scope.applySettings = function () {
    $scope.applySettingsActive = true;
    $scope.data.clearAll($scope.gridApi);
    $scope.surfacesGridOptions.enableSelectAll = true;
    $scope.surfacesGridOptions.multiSelect = true;

    $scope.surfacesGridOptions.columnDefs[2].enableFiltering = false;
    $scope.surfacesGridOptions.columnDefs[2].filters[0].noTerm = true;
    $scope.surfacesGridOptions.columnDefs[2].filters[0].term = $scope.selected.surface.surface_type;
    $scope.surfacesGridOptions.columnDefs[6].allowConstructionEdit = false;
    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  $scope.confirmApplySettings = function () {
    var selectedRowEntity = angular.copy($scope.selected.surface);
    var selectedSurfaceIndex = $scope.data.surfaces.indexOf($scope.selected.surface);

    _.each($scope.gridApi.selection.getSelectedGridRows(), function (row) {
      if (row.visible) {
        var rowEntity = row.entity;
        var surfaceIndex = $scope.data.surfaces.indexOf(rowEntity);

        if (surfaceIndex != selectedSurfaceIndex) {
          Shared.setModified();

          rowEntity.area = $scope.selected.surface.area;
          rowEntity.azimuth = $scope.selected.surface.azimuth;
          rowEntity.construction_library_id = $scope.selected.surface.construction_library_id;
          rowEntity.tilt = $scope.selected.surface.tilt;
          rowEntity.height = $scope.selected.surface.height;
          rowEntity.perimeter_exposed = $scope.selected.surface.perimeter_exposed;
        }
      }
    });
    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
    $scope.resetApplySettings();
  };

  $scope.resetApplySettings = function () {
    $scope.selected.surface = null;
    $scope.applySettingsActive = false;
    $scope.data.clearAll($scope.gridApi);
    $scope.surfacesGridOptions.enableSelectAll = false;
    $scope.surfacesGridOptions.multiSelect = false;

    $scope.surfacesGridOptions.columnDefs[2].enableFiltering = true;
    $scope.surfacesGridOptions.columnDefs[2].filters[0].noTerm = false;
    $scope.surfacesGridOptions.columnDefs[2].filters[0].term = '';
    $scope.surfacesGridOptions.columnDefs[6].allowConstructionEdit = true;
    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  $scope.changeConstruction = function (selectedSurface) {
    var type = selectedSurface.surface_type + ' Construction';
    var rowEntity = _.find($scope.data.constData, {
      id: selectedSurface.construction_library_id
    });
    ConstructionLibrary.openConstructionLibraryModal(type, rowEntity).then(function (selectedConstruction) {
      Shared.setModified();

      selectedSurface.construction_library_id = selectedConstruction.id;
      $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
    });
  };

}]);
