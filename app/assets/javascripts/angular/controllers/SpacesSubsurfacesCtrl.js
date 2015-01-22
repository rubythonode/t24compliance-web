cbecc.controller('SpacesSubsurfacesCtrl', ['$scope', 'uiGridConstants', 'Shared', 'ConstructionLibrary', function ($scope, uiGridConstants, Shared, ConstructionLibrary) {
  $scope.selected = {
    subsurface: null
  };

  $scope.applySettingsActive = false;

  $scope.editableCondition = function ($scope) {
    return !$scope.grid.appScope.applySettingsActive;
  };

  $scope.spacesArr = [];
  $scope.spacesHash = {};
  _.each($scope.data.spaces, function (space, index) {
    $scope.spacesArr.push({
      id: index,
      value: space.name,
      surfaces: []
    });
    $scope.spacesHash[index] = space.name;
  });

  $scope.surfacesArr = [];
  $scope.surfacesHash = {};
  _.each($scope.data.surfaces, function (surface, index) {
    $scope.surfacesArr.push({
      id: index,
      value: surface.name
    });
    $scope.surfacesHash[index] = surface.name;
  });

  $scope.doorCompatibleSpaces = $scope.data.doorCompatibleSpaces();
  $scope.windowCompatibleSpaces = $scope.data.windowCompatibleSpaces();
  $scope.skylightCompatibleSpaces = $scope.data.skylightCompatibleSpaces();

  // Initialize subsurface dropdown options, update spaces and stories
  _.each($scope.data.subsurfaces, function (subsurface) {
    subsurface.space = $scope.data.surfaces[subsurface.surface].space;
    subsurface.building_story_id = $scope.data.spaces[subsurface.space].building_story_id;
    if (subsurface.type == 'Door') {
      subsurface.spaceOptions = $scope.doorCompatibleSpaces;
      subsurface.surfaceOptions = _.find($scope.doorCompatibleSpaces, {id: subsurface.space}).surfaces;
    } else if (subsurface.type == 'Window') {
      subsurface.spaceOptions = $scope.windowCompatibleSpaces;
      subsurface.surfaceOptions = _.find($scope.windowCompatibleSpaces, {id: subsurface.space}).surfaces;
    } else if (subsurface.type == 'Skylight') {
      subsurface.spaceOptions = $scope.skylightCompatibleSpaces;
      subsurface.surfaceOptions = _.find($scope.skylightCompatibleSpaces, {id: subsurface.space}).surfaces;
    }
  });

  // Subsurfaces UI Grid
  $scope.subsurfacesGridOptions = {
    columnDefs: [{
      name: 'name',
      displayName: 'Subsurface Name',
      enableHiding: false,
      cellEditableCondition: $scope.editableCondition,
      filter: Shared.textFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'space',
      displayName: 'Space Name',
      enableHiding: false,
      editableCellTemplate: 'ui-grid/dropdownEditor',
      cellEditableCondition: $scope.editableCondition,
      cellFilter: 'mapHash:grid.appScope.spacesHash',
      editDropdownRowEntityOptionsArrayPath: 'spaceOptions',
      filter: Shared.enumFilter($scope.spacesHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.spacesArr)
    }, {
      name: 'surface',
      displayName: 'Surface Name',
      enableHiding: false,
      editableCellTemplate: 'ui-grid/dropdownEditor',
      cellEditableCondition: $scope.editableCondition,
      cellFilter: 'mapHash:grid.appScope.surfacesHash',
      editDropdownRowEntityOptionsArrayPath: 'surfaceOptions',
      filter: Shared.enumFilter($scope.surfacesHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.surfacesArr)
    }, {
      name: 'type',
      displayName: 'Subsurface Type',
      enableCellEdit: false,
      enableHiding: false,
      filter: Shared.textFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'building_story_id',
      displayName: 'Story',
      enableCellEdit: false,
      cellFilter: 'mapHash:grid.appScope.data.storiesHash',
      enableHiding: false,
      filter: Shared.enumFilter($scope.data.storiesHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'area',
      secondLine: Shared.html('ft<sup>2</sup>'),
      enableHiding: false,
      cellEditableCondition: $scope.editableCondition,
      type: 'number',
      filters: Shared.numberFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'construction_library_id',
      displayName: 'Construction',
      allowConstructionEdit: true,
      enableCellEdit: false,
      cellFilter: 'mapHash:grid.appScope.data.subsurfaceConstHash',
      enableHiding: false,
      cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (!row.entity.construction_library_id) {
          return 'required-cell';
        }
        if (row.entity.constructionDefault && row.entity.construction_library_id != row.entity.constructionDefault) {
          return 'modified-cell';
        }
      },
      cellTemplate: 'ui-grid/cbeccConstructionCell',
      filter: Shared.enumFilter($scope.data.subsurfaceConstHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.data.subsurfaceConstHash)
    }],
    data: $scope.data.subsurfaces,
    enableCellEditOnFocus: true,
    enableFiltering: true,
    enableRowHeaderSelection: true,
    enableRowSelection: true,
    multiSelect: false,
    onRegisterApi: function (gridApi) {
      $scope.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        if (!$scope.applySettingsActive) {
          if (row.isSelected) {
            $scope.selected.subsurface = row.entity;
          } else {
            // No rows selected
            $scope.selected.subsurface = null;
          }
        }
      });
      gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
        if (colDef.name == 'space' && newValue != oldValue) {
          if (rowEntity.type == 'Door') {
            rowEntity.surfaceOptions = _.find($scope.doorCompatibleSpaces, {id: newValue}).surfaces;
          } else if (rowEntity.type == 'Window') {
            rowEntity.surfaceOptions = _.find($scope.windowCompatibleSpaces, {id: newValue}).surfaces;
          } else if (rowEntity.type == 'Skylight') {
            rowEntity.surfaceOptions = _.find($scope.skylightCompatibleSpaces, {id: newValue}).surfaces;
          }
          rowEntity.surface = rowEntity.surfaceOptions[0].id;
          rowEntity.building_story_id = $scope.data.spaces[newValue].building_story_id;
        }
      });
    }
  };

  // Buttons
  $scope.applySettings = function () {
    $scope.applySettingsActive = true;
    $scope.data.clearAll($scope.gridApi);
    $scope.subsurfacesGridOptions.multiSelect = true;

    $scope.subsurfacesGridOptions.columnDefs[3].enableFiltering = false;
    $scope.subsurfacesGridOptions.columnDefs[3].filter.noTerm = true;
    $scope.subsurfacesGridOptions.columnDefs[3].filter.term = $scope.selected.subsurface.type;
    $scope.gridApi.core.notifyDataChange($scope.gridApi.grid, uiGridConstants.dataChange.COLUMN);
  };

  $scope.confirmApplySettings = function () {
    var replacement = {
      area: $scope.selected.subsurface.area,
      construction_library_id: $scope.selected.subsurface.construction_library_id
    };
    var rows = $scope.gridApi.selection.getSelectedRows();
    _.each(rows, function (row) {
      _.merge(row, replacement);
    });
    $scope.gridApi.core.notifyDataChange($scope.gridApi.grid, uiGridConstants.dataChange.EDIT);
    $scope.resetApplySettings();
  };

  $scope.resetApplySettings = function () {
    $scope.selected.subsurface = null;
    $scope.applySettingsActive = false;
    $scope.data.clearAll($scope.gridApi);
    $scope.subsurfacesGridOptions.multiSelect = false;

    $scope.subsurfacesGridOptions.columnDefs[3].enableFiltering = true;
    $scope.subsurfacesGridOptions.columnDefs[3].filter.noTerm = false;
    $scope.subsurfacesGridOptions.columnDefs[3].filter.term = '';
    $scope.gridApi.core.notifyDataChange($scope.gridApi.grid, uiGridConstants.dataChange.COLUMN);
  };

  $scope.changeConstruction = function (selectedSubsurface) {
    var type = selectedSubsurface.type + ' Construction';
    if (selectedSubsurface.type == 'Door') {
      var rowEntity = _.find($scope.data.doorData, {id: selectedSubsurface.construction_library_id});
      ConstructionLibrary.openDoorLibraryModal(type, rowEntity).then(function (selectedConstruction) {
        selectedSubsurface.construction_library_id = selectedConstruction.id;
        $scope.gridApi.core.notifyDataChange($scope.gridApi.grid, uiGridConstants.dataChange.EDIT);
      });
    } else {
      var rowEntity = _.find($scope.data.fenData, {id: selectedSubsurface.construction_library_id});
      ConstructionLibrary.openFenLibraryModal(type, rowEntity).then(function (selectedConstruction) {
        selectedSubsurface.construction_library_id = selectedConstruction.id;
        $scope.gridApi.core.notifyDataChange($scope.gridApi.grid, uiGridConstants.dataChange.EDIT);
      });
    }
  };

}]);
