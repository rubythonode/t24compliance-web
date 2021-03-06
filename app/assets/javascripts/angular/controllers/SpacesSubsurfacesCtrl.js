cbecc.controller('SpacesSubsurfacesCtrl', ['$scope', 'uiGridConstants', 'Shared', 'ConstructionLibrary', function ($scope, uiGridConstants, Shared, ConstructionLibrary) {
  $scope.selected = {
    subsurface: null
  };

  $scope.applySettingsActive = false;

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
      cellEditableCondition: $scope.data.applySettingsCondition,
      filters: Shared.textFilter(),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'space',
      displayName: 'Space Name',
      enableHiding: false,
      editableCellTemplate: 'ui-grid/dropdownEditor',
      cellEditableCondition: $scope.data.applySettingsCondition,
      cellFilter: 'mapHash:grid.appScope.spacesHash',
      editDropdownRowEntityOptionsArrayPath: 'spaceOptions',
      filters: Shared.enumFilter($scope.spacesHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.spacesArr)
    }, {
      name: 'surface',
      displayName: 'Surface Name',
      enableHiding: false,
      editableCellTemplate: 'ui-grid/dropdownEditor',
      cellEditableCondition: $scope.data.applySettingsCondition,
      cellFilter: 'mapHash:grid.appScope.surfacesHash',
      editDropdownRowEntityOptionsArrayPath: 'surfaceOptions',
      filters: Shared.enumFilter($scope.surfacesHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.surfacesArr)
    }, {
      name: 'type',
      displayName: 'Subsurface Type',
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
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
    }, {
      name: 'area',
      secondLine: Shared.html('ft<sup>2</sup>'),
      enableHiding: false,
      cellEditableCondition: $scope.data.applySettingsCondition,
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
      filters: Shared.enumFilter($scope.data.subsurfaceConstHash),
      headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
      sortingAlgorithm: Shared.sort($scope.data.subsurfaceConstHash)
    }],
    data: $scope.data.subsurfaces,
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
            $scope.selected.subsurface = row.entity;
          } else {
            // No rows selected
            $scope.selected.subsurface = null;
          }
        }
      });
      gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
        if (newValue != oldValue) {
          Shared.setModified();

          var subsurfaceIndex = $scope.data.subsurfaces.indexOf(rowEntity);
          if (colDef.name == 'name') {
            var unique = Shared.checkUnique($scope.data.subsurfaces, newValue, subsurfaceIndex);
            if (!unique) rowEntity.name = oldValue;
          } else if (colDef.name == 'space') {
            $scope.updateSpace(rowEntity, subsurfaceIndex, newValue, oldValue);
          }
        }
      });
    }
  };

  $scope.updateSpace = function (rowEntity, subsurfaceIndex, newValue, oldValue) {
    if (rowEntity.type == 'Door') {
      rowEntity.surfaceOptions = _.find($scope.doorCompatibleSpaces, {id: newValue}).surfaces;
    } else if (rowEntity.type == 'Window') {
      rowEntity.surfaceOptions = _.find($scope.windowCompatibleSpaces, {id: newValue}).surfaces;
    } else if (rowEntity.type == 'Skylight') {
      rowEntity.surfaceOptions = _.find($scope.skylightCompatibleSpaces, {id: newValue}).surfaces;
    }
    rowEntity.surface = rowEntity.surfaceOptions[0].id;
    rowEntity.building_story_id = $scope.data.spaces[newValue].building_story_id;
  };

  // Buttons
  $scope.applySettings = function () {
    $scope.applySettingsActive = true;
    $scope.data.clearAll($scope.gridApi);
    $scope.subsurfacesGridOptions.enableSelectAll = true;
    $scope.subsurfacesGridOptions.multiSelect = true;

    $scope.subsurfacesGridOptions.columnDefs[3].enableFiltering = false;
    $scope.subsurfacesGridOptions.columnDefs[3].filters[0].noTerm = true;
    $scope.subsurfacesGridOptions.columnDefs[3].filters[0].term = $scope.selected.subsurface.type;
    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  $scope.confirmApplySettings = function () {
    var selectedRowEntity = angular.copy($scope.selected.subsurface);
    var selectedSubsurfaceIndex = $scope.data.subsurfaces.indexOf($scope.selected.subsurface);

    _.each($scope.gridApi.selection.getSelectedGridRows(), function (row) {
      if (row.visible) {
        var rowEntity = row.entity;
        var subsurfaceIndex = $scope.data.subsurfaces.indexOf(rowEntity);

        if (subsurfaceIndex != selectedSubsurfaceIndex) {
          Shared.setModified();

          rowEntity.area = $scope.selected.subsurface.area;
          rowEntity.construction_library_id = $scope.selected.subsurface.construction_library_id;
        }
      }
    });
    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
    $scope.resetApplySettings();
  };

  $scope.resetApplySettings = function () {
    $scope.selected.subsurface = null;
    $scope.applySettingsActive = false;
    $scope.data.clearAll($scope.gridApi);
    $scope.subsurfacesGridOptions.enableSelectAll = false;
    $scope.subsurfacesGridOptions.multiSelect = false;

    $scope.subsurfacesGridOptions.columnDefs[3].enableFiltering = true;
    $scope.subsurfacesGridOptions.columnDefs[3].filters[0].noTerm = false;
    $scope.subsurfacesGridOptions.columnDefs[3].filters[0].term = '';
    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  $scope.changeConstruction = function (selectedSubsurface) {
    var type = selectedSubsurface.type + ' Construction';
    if (selectedSubsurface.type == 'Door') {
      var rowEntity = _.find($scope.data.doorData, {id: selectedSubsurface.construction_library_id});
      ConstructionLibrary.openDoorLibraryModal(type, rowEntity).then(function (selectedConstruction) {
        Shared.setModified();

        selectedSubsurface.construction_library_id = selectedConstruction.id;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
      });
    } else {
      var rowEntity = _.find($scope.data.fenData, {id: selectedSubsurface.construction_library_id});
      ConstructionLibrary.openFenLibraryModal(type, rowEntity).then(function (selectedConstruction) {
        Shared.setModified();

        selectedSubsurface.construction_library_id = selectedConstruction.id;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
      });
    }
  };

}]);
