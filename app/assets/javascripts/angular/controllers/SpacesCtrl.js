cbecc.controller('SpacesCtrl', ['$scope', '$location', 'uiGridConstants', 'toaster', 'Shared', 'Enums', 'data', 'constData', 'doorData', 'fenData', 'spaceFunctionDefaults', 'stories', 'spaces', 'constructionDefaults', function ($scope, $location, uiGridConstants, toaster, Shared, Enums, data, constData, doorData, fenData, spaceFunctionDefaults, stories, spaces, constructionDefaults) {
  $scope.data = {
    constData: constData,
    doorData: doorData,
    fenData: fenData,
    spaceFunctionDefaults: spaceFunctionDefaults,
    stories: stories,
    spaces: spaces,
    constructionDefaults: constructionDefaults[0] || {},
    surfaces: [],
    subsurfaces: []
  };

  // Lookup construction defaults
  _.each(['interior_wall', 'exterior_wall', 'underground_wall', 'interior_floor', 'exterior_floor', 'underground_floor', 'roof', 'door', 'skylight', 'window'], function (type) {
    var library = 'constData';
    if (type == 'door') {
      library = 'doorData';
    } else if (type == 'window' || type == 'skylight') {
      library = 'fenData';
    }
    var id = $scope.data.constructionDefaults[type];
    if (id != null) {
      $scope.data.constructionDefaults[type] = _.find($scope.data[library], {
        id: id
      });
    } else {
      $scope.data.constructionDefaults[type] = null;
    }
  });

  // Load saved spaces
  var surfaceIndex = 0;
  _.each($scope.data.spaces, function (space, spaceIndex) {
    _.each(['interior_walls', 'exterior_walls', 'underground_walls', 'interior_floors', 'exterior_floors', 'underground_floors', 'roofs'], function (surfaceType) {
      _.each(space[surfaceType], function (surface) {
        _.each(['doors', 'skylights', 'windows'], function (subsurfaceType) {
          _.each(surface[subsurfaceType], function (subsurface) {
            subsurface.space = spaceIndex;
            subsurface.surface = surfaceIndex;
            subsurface.building_story_id = space.building_story_id;
            var constructionDefault = $scope.data.constructionDefaults[subsurfaceType.slice(0, -1)];
            if (constructionDefault) {
              subsurface.constructionDefault = constructionDefault.id;
            } else {
              subsurface.constructionDefault = null;
            }
            subsurface.construction_library_id = subsurface.construction_library_id || subsurface.constructionDefault;
            $scope.data.subsurfaces.push(subsurface);
          });
          delete surface[subsurfaceType];
        });
        surface.space = spaceIndex;
        if (surfaceType == 'interior_floors') {
          surface.type = 'Floor';
          surface.boundary = 'Interior';
          _.find($scope.data.spaces, function(space, spaceIndex) {
            if (surface.adjacent_space_reference == space.name) {
              surface.adjacent_space_reference = spaceIndex;
              return true;
            }
            return false;
          });
        } else if (surfaceType == 'exterior_floors') {
          surface.type = 'Floor';
          surface.boundary = 'Exterior';
        } else if (surfaceType == 'underground_floors') {
          surface.type = 'Floor';
          surface.boundary = 'Underground';
        } else if (surfaceType == 'interior_walls') {
          surface.type = 'Wall';
          surface.boundary = 'Interior';
          _.find($scope.data.spaces, function(space, spaceIndex) {
            if (surface.adjacent_space_reference == space.name) {
              surface.adjacent_space_reference = spaceIndex;
              return true;
            }
            return false;
          });
        } else if (surfaceType == 'exterior_walls') {
          surface.type = 'Wall';
          surface.boundary = 'Exterior';
        } else if (surfaceType == 'underground_walls') {
          surface.type = 'Wall';
          surface.boundary = 'Underground';
        } else if (surfaceType == 'roofs') {
          surface.type = 'Roof';
          surface.boundary = null;
        }
        surface.building_story_id = space.building_story_id;
        var constructionDefault = $scope.data.constructionDefaults[surfaceType.slice(0, -1)];
        if (constructionDefault) {
          surface.constructionDefault = constructionDefault.id;
        } else {
          surface.constructionDefault = null;
        }
        surface.construction_library_id = surface.construction_library_id || surface.constructionDefault;
        $scope.data.surfaces.push(surface);
        surfaceIndex++;
      });
      delete space[surfaceType];
    });

    var defaults = _.find($scope.data.spaceFunctionDefaults, {
      name: space.space_function
    });
    space.occupant_density_default = defaults.occupant_density;
    space.hot_water_heating_rate_default = defaults.hot_water_heating_rate;
    space.receptacle_power_density_default = defaults.receptacle_power_density;
    space.exhaust_per_area_default = defaults.exhaust_per_area;
    space.exhaust_air_changes_per_hour_default = defaults.exhaust_air_changes_per_hour;
    space.total_exhaust = Shared.calculateTotalExhaust(space);

    space.function_schedule_group = defaults.function_schedule_group == '- specify -' ? null : defaults.function_schedule_group;
    space.ventilation_per_person = defaults.ventilation_per_person;
    space.ventilation_per_area = defaults.ventilation_per_area;
    space.ventilation_air_changes_per_hour = defaults.ventilation_air_changes_per_hour;
  });

  $scope.data.storiesArr = [];
  $scope.data.storiesHash = {};
  _.each($scope.data.stories, function (story) {
    $scope.data.storiesArr.push({
      id: story.id,
      value: story.name
    });
    $scope.data.storiesHash[story.id] = story.name;
  });

  $scope.data.constHash = {};
  _.each($scope.data.constData, function (construction) {
    $scope.data.constHash[construction.id] = construction.name;
  });
  $scope.data.doorHash = {};
  _.each($scope.data.doorData, function (door) {
    $scope.data.doorHash[door.id] = door.name;
  });
  $scope.data.fenHash = {};
  _.each($scope.data.fenData, function (fenestration) {
    $scope.data.fenHash[fenestration.id] = fenestration.name;
  });
  $scope.data.subsurfaceConstHash = _.merge($scope.data.doorHash, $scope.data.fenHash);

  $scope.tabs = [{
    heading: 'Spaces',
    path: '/spaces',
    route: 'requirebuilding.spaces.main'
  }, {
    heading: 'Space Type Settings',
    path: '/spaces/settings',
    route: 'requirebuilding.spaces.settings'
  }, {
    heading: 'Surfaces',
    path: '/spaces/surfaces',
    route: 'requirebuilding.spaces.surfaces'
  }, {
    heading: 'Subsurfaces',
    path: '/spaces/subsurfaces',
    route: 'requirebuilding.spaces.subsurfaces'
  }, {
    heading: 'Ventilation & Exhaust',
    path: '/spaces/ventilation',
    route: 'requirebuilding.spaces.ventilation'
  }, {
    heading: 'Electric Process Loads',
    path: '/spaces/loads',
    route: 'requirebuilding.spaces.loads'
  }, {
    heading: 'Natural Gas',
    path: '/spaces/gas',
    route: 'requirebuilding.spaces.gas'
  }, {
    heading: 'Lighting',
    path: '/spaces/lighting',
    route: 'requirebuilding.spaces.lighting'
  }];

  function updateActiveTab() {
    // Reset tabs if the main nav button is clicked or the page is refreshed
    $scope.tabs.filter(function (element) {
      var regex = new RegExp('^/projects/[0-9a-f]{24}/buildings/[0-9a-f]{24}' + element.path + '$');
      if (regex.test($location.path())) element.active = true;
    });
  }

  updateActiveTab();
  $scope.$on('$locationChangeSuccess', function () {
    // Update active subtab
    updateActiveTab();
  });

  // Buttons
  $scope.data.selectAll = function (gridApi) {
    gridApi.selection.selectAllVisibleRows();
  };
  $scope.data.clearAll = function (gridApi) {
    gridApi.selection.clearSelectedRows();
  };

  $scope.data.addSpace = function (input) {
    var space = {
      name: "Space " + ($scope.data.spaces.length + 1),
      floor_to_ceiling_height: null,
      building_story_id: $scope.data.stories[0].id,
      area: null,
      conditioning_type: Enums.enums.spaces_conditioning_type_enums[0],
      envelope_status: Enums.enums.spaces_envelope_status_enums[0],
      lighting_status: Enums.enums.spaces_lighting_status_enums[0],
      space_function: Enums.enums.spaces_space_function_enums[0],

      process_electrical_power_density: null,
      commercial_refrigeration_epd: null,
      elevator_count: null,
      escalator_count: null,
      process_electrical_radiation_fraction: null,
      process_electrical_latent_fraction: null,
      process_electrical_lost_fraction: null,
      elevator_lost_fraction: null,
      escalator_lost_fraction: null,

      gas_equipment_power_density: null,
      process_gas_power_density: null,
      process_gas_radiation_fraction: null,
      process_gas_latent_fraction: null,
      process_gas_lost_fraction: null
    };

    if (!_.isEmpty(input)) {
      _.merge(space, input);
    }

    var defaults = _.find($scope.data.spaceFunctionDefaults, {
      name: space.space_function
    });
    space.occupant_density = defaults.occupant_density;
    space.occupant_density_default = defaults.occupant_density;
    space.hot_water_heating_rate = defaults.hot_water_heating_rate;
    space.hot_water_heating_rate_default = defaults.hot_water_heating_rate;
    space.receptacle_power_density = defaults.receptacle_power_density;
    space.receptacle_power_density_default = defaults.receptacle_power_density;
    space.exhaust_per_area = defaults.exhaust_per_area;
    space.exhaust_per_area_default = defaults.exhaust_per_area;
    space.exhaust_air_changes_per_hour = defaults.exhaust_air_changes_per_hour;
    space.exhaust_air_changes_per_hour_default = defaults.exhaust_air_changes_per_hour;
    space.total_exhaust = Shared.calculateTotalExhaust(space);

    space.function_schedule_group = defaults.function_schedule_group == '- specify -' ? null : defaults.function_schedule_group;
    space.ventilation_per_person = defaults.ventilation_per_person;
    space.ventilation_per_area = defaults.ventilation_per_area;
    space.ventilation_air_changes_per_hour = defaults.ventilation_air_changes_per_hour;

    $scope.data.spaces.push(space);
  };
  $scope.data.duplicateSpace = function (selected) {
    var selectedSpace = selected.space;
    var spaceIndex = $scope.data.spaces.indexOf(selectedSpace);

    $scope.data.spaces.push({
      name: "Space " + ($scope.data.spaces.length + 1),
      floor_to_ceiling_height: selectedSpace.floor_to_ceiling_height,
      building_story_id: selectedSpace.building_story_id,
      area: selectedSpace.area,
      conditioning_type: selectedSpace.conditioning_type,
      envelope_status: selectedSpace.envelope_status,
      lighting_status: selectedSpace.lighting_status,
      space_function: selectedSpace.space_function,

      occupant_density: selectedSpace.occupant_density,
      occupant_density_default: selectedSpace.occupant_density_default,
      hot_water_heating_rate: selectedSpace.hot_water_heating_rate,
      hot_water_heating_rate_default: selectedSpace.hot_water_heating_rate_default,
      receptacle_power_density: selectedSpace.receptacle_power_density,
      receptacle_power_density_default: selectedSpace.receptacle_power_density_default,
      exhaust_per_area: selectedSpace.exhaust_per_area,
      exhaust_per_area_default: selectedSpace.exhaust_per_area_default,
      exhaust_air_changes_per_hour: selectedSpace.exhaust_air_changes_per_hour,
      exhaust_air_changes_per_hour_default: selectedSpace.exhaust_air_changes_per_hour_default,
      exhaust_per_space: selectedSpace.exhaust_per_space,
      total_exhaust: selectedSpace.total_exhaust,

      function_schedule_group: selectedSpace.function_schedule_group,
      ventilation_per_person: selectedSpace.ventilation_per_person,
      ventilation_per_area: selectedSpace.ventilation_per_area,
      ventilation_air_changes_per_hour: selectedSpace.ventilation_air_changes_per_hour,

      process_electrical_power_density: selectedSpace.process_electrical_power_density,
      commercial_refrigeration_epd: selectedSpace.commercial_refrigeration_epd,
      elevator_count: selectedSpace.elevator_count,
      escalator_count: selectedSpace.escalator_count,
      process_electrical_radiation_fraction: selectedSpace.process_electrical_radiation_fraction,
      process_electrical_latent_fraction: selectedSpace.process_electrical_latent_fraction,
      process_electrical_lost_fraction: selectedSpace.process_electrical_lost_fraction,
      elevator_lost_fraction: selectedSpace.elevator_lost_fraction,
      escalator_lost_fraction: selectedSpace.escalator_lost_fraction,

      gas_equipment_power_density: selectedSpace.gas_equipment_power_density,
      process_gas_power_density: selectedSpace.process_gas_power_density,
      process_gas_radiation_fraction: selectedSpace.process_gas_radiation_fraction,
      process_gas_latent_fraction: selectedSpace.process_gas_latent_fraction,
      process_gas_lost_fraction: selectedSpace.process_gas_lost_fraction
    });

    var surfaces = _.filter($scope.data.surfaces, function (surface) {
      return surface.space == spaceIndex;
    });
    _.each(surfaces, function (surface) {
      $scope.data.duplicateSurface({surface: surface}, $scope.data.spaces.length - 1);
    });
  };
  $scope.data.deleteSpace = function (selected, gridApi) {
    var spaceIndex = $scope.data.spaces.indexOf(selected.space);

    // Delete subsurfaces
    _.eachRight($scope.data.surfaces, function (surface, surfaceIndex) {
      // Update adjacent spaces
      if (surface.boundary == 'Interior') {
        if (surface.adjacent_space_reference == spaceIndex) {
          surface.adjacent_space_reference = null;
        } else if (surface.adjacent_space_reference > spaceIndex) {
          surface.adjacent_space_reference--;
        }
      }

      if (surface.space == spaceIndex) {
        // Delete subsurfaces
        $scope.data.subsurfaces = _.difference($scope.data.subsurfaces, _.where($scope.data.subsurfaces, {'surface': surfaceIndex}));

        // Update subsurface surface parent
        _.each($scope.data.subsurfaces, function (subsurface) {
          if (subsurface.surface > surfaceIndex) {
            subsurface.surface--;
          }
        });
      }
    });

    // Delete surfaces
    $scope.data.surfaces = _.difference($scope.data.surfaces, _.where($scope.data.surfaces, {'space': spaceIndex}));

    // Update subsurface/surface parents
    _.each($scope.data.subsurfaces, function (subsurface) {
      if (subsurface.space > spaceIndex) {
        subsurface.space--;
      }
    });
    _.each($scope.data.surfaces, function (surface) {
      if (surface.space > spaceIndex) {
        surface.space--;
      }
    });

    $scope.data.spaces.splice(spaceIndex, 1);
    if (spaceIndex > 0) {
      gridApi.selection.toggleRowSelection($scope.data.spaces[spaceIndex - 1]);
    } else {
      selected.space = null;
    }
  };

  $scope.data.addSurface = function (type, boundary, spaceIndex) {
    if (spaceIndex === undefined) {
      spaceIndex = 0;
    }

    var name = $scope.data.spaces[spaceIndex].name + ' ' + type;
    var surfaceType = type;

    if (type == 'Wall' || type == 'Floor') {
      var len = _.filter($scope.data.surfaces, function (surface) {
        return surface.space == spaceIndex && surface.type == type;
      }).length;
      name += ' ' + (len + 1);
      surfaceType = boundary + ' ' + surfaceType;
    }
    var constructionDefault = $scope.data.constructionDefaults[surfaceType.toLowerCase().replace(' ', '_')];
    if (constructionDefault) {
      constructionDefault = constructionDefault.id;
    } else {
      constructionDefault = null;
    }
    $scope.data.surfaces.push({
      name: name,
      space: spaceIndex,
      type: type,
      boundary: boundary,
      surface_type: surfaceType,
      building_story_id: $scope.data.spaces[spaceIndex].building_story_id,
      area: null,
      azimuth: null,
      construction_library_id: constructionDefault,
      constructionDefault: constructionDefault,
      adjacent_space_reference: null,
      tilt: null,
      height: null,
      perimeter_exposed: null
    });
    if (boundary == 'Interior') {
      var surfaceIndex = $scope.data.surfaces.length - 1;
      $scope.data.surfaces[surfaceIndex].adjacencyOptions = $scope.data.compatibleAdjacentSpaces(surfaceIndex);
    }
  };
  $scope.data.restoreSpaceTypeSettingsDefaults = function (gridApi) {
    _.each($scope.data.spaces, function (space) {
      space.occupant_density = space.occupant_density_default;
      space.hot_water_heating_rate = space.hot_water_heating_rate_default;
      space.receptacle_power_density = space.receptacle_power_density_default;
    });
    gridApi.core.notifyDataChange(gridApi.grid, uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedSpaceTypeSettingsValues = function () {
    return !_.isEmpty(_.find($scope.data.spaces, function (space) {
      return (space.occupant_density !== space.occupant_density_default ||
      space.hot_water_heating_rate !== space.hot_water_heating_rate_default ||
      space.receptacle_power_density !== space.receptacle_power_density_default);
    }));
  };
  $scope.data.restoreSurfaceConstructionDefaults = function (gridApi) {
    _.each($scope.data.surfaces, function (surface) {
      if (surface.constructionDefault) {
        surface.construction_library_id = surface.constructionDefault;
      }
    });
    gridApi.core.notifyDataChange(gridApi.grid, uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedSurfaceConstructionDefaults = function () {
    return !_.isEmpty(_.find($scope.data.surfaces, function (surface) {
      if (!surface.constructionDefault) return false;
      return (surface.construction_library_id !== surface.constructionDefault);
    }));
  };
  $scope.data.restoreSubsurfaceConstructionDefaults = function (gridApi) {
    _.each($scope.data.subsurfaces, function (subsurface) {
      if (subsurface.constructionDefault) {
        subsurface.construction_library_id = subsurface.constructionDefault;
      }
    });
    gridApi.core.notifyDataChange(gridApi.grid, uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedSubsurfaceConstructionDefaults = function () {
    return !_.isEmpty(_.find($scope.data.subsurfaces, function (subsurface) {
      if (!subsurface.constructionDefault) return false;
      return (subsurface.construction_library_id !== subsurface.constructionDefault);
    }));
  };
  $scope.data.restoreSpaceTypeExhaustDefaults = function (gridApi) {
    _.each($scope.data.spaces, function (space) {
      space.exhaust_per_area = space.exhaust_per_area_default;
      space.exhaust_air_changes_per_hour = space.exhaust_air_changes_per_hour_default;
      $scope.data.updateTotalExhaust(space);
    });
    gridApi.core.notifyDataChange(gridApi.grid, uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedSpaceTypeExhaustValues = function () {
    return !_.isEmpty(_.find($scope.data.spaces, function (space) {
      return (space.exhaust_per_area !== space.exhaust_per_area_default || space.exhaust_air_changes_per_hour !== space.exhaust_air_changes_per_hour_default);
    }));
  };
  $scope.data.duplicateSurface = function (selected, newParent) {
    var selectedSurface = selected.surface;
    var spaceIndex = newParent === undefined ? selectedSurface.space : newParent;
    var surfaceIndex = $scope.data.surfaces.indexOf(selectedSurface);

    var name = $scope.data.spaces[spaceIndex].name + ' ' + selectedSurface.type;
    if (selectedSurface.type == 'Wall' || selectedSurface.type == 'Floor') {
      var len = _.filter($scope.data.surfaces, function (surface) {
        return surface.space == spaceIndex && surface.type == selectedSurface.type;
      }).length;
      name += ' ' + (len + 1);
    }

    $scope.data.surfaces.push({
      name: name,
      space: selectedSurface.space,
      type: selectedSurface.type,
      boundary: selectedSurface.boundary,
      surface_type: selectedSurface.surface_type,
      building_story_id: selectedSurface.building_story_id,
      area: selectedSurface.area,
      azimuth: selectedSurface.azimuth,
      construction_library_id: selectedSurface.construction_library_id,
      constructionDefault: selectedSurface.constructionDefault,
      adjacent_space_reference: selectedSurface.adjacent_space_reference,
      tilt: selectedSurface.tilt,
      height: selectedSurface.height,
      perimeter_exposed: selectedSurface.perimeter_exposed
    });

    var subsurfaces = _.filter($scope.data.subsurfaces, function (subsurface) {
      return subsurface.surface == surfaceIndex;
    });
    _.each(subsurfaces, function (subsurface) {
      $scope.data.duplicateSubsurface({subsurface: subsurface}, $scope.data.surfaces.length - 1);
    });
  };
  $scope.data.deleteSurface = function (selected, gridApi) {
    var surfaceIndex = $scope.data.surfaces.indexOf(selected.surface);

    // Delete subsurfaces
    $scope.data.subsurfaces = _.difference($scope.data.subsurfaces, _.where($scope.data.subsurfaces, {'surface': surfaceIndex}));

    // Update subsurface parents
    _.each($scope.data.subsurfaces, function (subsurface) {
      if (subsurface.surface > surfaceIndex) {
        subsurface.surface--;
      }
    });

    $scope.data.surfaces.splice(surfaceIndex, 1);
    if (surfaceIndex > 0) {
      gridApi.selection.toggleRowSelection($scope.data.surfaces[surfaceIndex - 1]);
    } else {
      selected.surface = null;
    }
  };

  $scope.data.addSubsurface = function (type, surfaceIndex) {
    if (surfaceIndex === undefined) {
      var surface = _.find($scope.data.surfaces, function (surface) {
        if (type == 'Door') {
          return surface.type == 'Wall' && surface.boundary != 'Underground';
        } else if (type == 'Window') {
          return surface.type == 'Wall' && surface.boundary == 'Exterior';
        } else if (type == 'Skylight') {
          return surface.type == 'Roof';
        }
      });
      surfaceIndex = $scope.data.surfaces.indexOf(surface);
    }

    var spaceOptions = [];
    var surfaceOptions = [];
    if (type == 'Door') {
      spaceOptions = $scope.data.doorCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: $scope.data.surfaces[surfaceIndex].space}).surfaces;
    } else if (type == 'Window') {
      spaceOptions = $scope.data.windowCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: $scope.data.surfaces[surfaceIndex].space}).surfaces;
    } else if (type == 'Skylight') {
      spaceOptions = $scope.data.skylightCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: $scope.data.surfaces[surfaceIndex].space}).surfaces;
    }

    var constructionDefault = $scope.data.constructionDefaults[type.toLowerCase()];
    if (constructionDefault) {
      constructionDefault = constructionDefault.id;
    } else {
      constructionDefault = null;
    }
    $scope.data.subsurfaces.push({
      name: $scope.data.surfaces[surfaceIndex].name + ' ' + type,
      space: $scope.data.surfaces[surfaceIndex].space,
      spaceOptions: spaceOptions,
      surface: surfaceIndex,
      surfaceOptions: surfaceOptions,
      type: type,
      building_story_id: $scope.data.spaces[$scope.data.surfaces[surfaceIndex].space].building_story_id,
      area: null,
      construction_library_id: constructionDefault,
      constructionDefault: constructionDefault
    });
  };
  $scope.data.duplicateSubsurface = function (selected, newParent) {
    var selectedSubsurface = selected.subsurface;

    var surface = newParent === undefined ? selectedSubsurface.surface : newParent;
    var space = $scope.data.surfaces[surface].space;

    $scope.data.subsurfaces.push({
      name: selectedSubsurface.name,
      space: space,
      surface: surface,
      type: selectedSubsurface.type,
      building_story_id: selectedSubsurface.building_story_id,
      area: selectedSubsurface.area,
      construction_library_id: selectedSubsurface.construction_library_id,
      constructionDefault: selectedSubsurface.constructionDefault
    });
  };
  $scope.data.deleteSubsurface = function (selected, gridApi) {
    var subsurfaceIndex = $scope.data.subsurfaces.indexOf(selected.subsurface);
    $scope.data.subsurfaces.splice(subsurfaceIndex, 1);
    if (subsurfaceIndex > 0) {
      gridApi.selection.toggleRowSelection($scope.data.subsurfaces[subsurfaceIndex - 1]);
    } else {
      selected.subsurface = null;
    }
  };

  $scope.data.compatibleAdjacentSpaces = function (surfaceIndex) {
    var compatibleAdjacentSpaces = [];
    var surface = $scope.data.surfaces[surfaceIndex];

    if (surface.boundary == 'Interior') {
      var storyId = $scope.data.spaces[surface.space].building_story_id;
      if (surface.type == 'Wall') {
        _.each($scope.data.spaces, function (space, spaceIndex) {
          if (space.building_story_id == storyId && spaceIndex != surface.space) {
            compatibleAdjacentSpaces.push({
              id: spaceIndex,
              value: space.name
            });
          }
        });
      } else if (surface.type == 'Floor') {
        var storyIndex = null;
        _.find($scope.data.storiesArr, function (story, key) {
          if (story.id == storyId) {
            storyIndex = key;
            return true;
          }
          return false;
        });
        if (storyIndex) {
          var storyBelow = $scope.data.storiesArr[storyIndex - 1].id;
          _.each($scope.data.spaces, function (space, spaceIndex) {
            if (space.building_story_id == storyBelow) {
              compatibleAdjacentSpaces.push({
                id: spaceIndex,
                value: space.name
              });
            }
          });
        }
      }
    }
    return compatibleAdjacentSpaces;
  };
  $scope.data.allCompatibleAdjacentSpaces = function () {
    var compatibleAdjacentSpaces = {};
    _.each($scope.data.surfaces, function (surface, surfaceIndex) {
      if (surface.boundary == 'Interior') {
        compatibleAdjacentSpaces[surfaceIndex] = $scope.data.compatibleAdjacentSpaces(surfaceIndex);
      }
    });
    return compatibleAdjacentSpaces;
  };

  $scope.data.doorCompatibleSpaces = function () {
    var doorCompatibleSpaces = [];
    _.each($scope.data.surfaces, function (surface, index) {
      if (surface.type == 'Wall' && surface.boundary != 'Underground') {
        if (_.isEmpty(_.find(doorCompatibleSpaces, {id: surface.space}))) {
          doorCompatibleSpaces.push({
            id: surface.space,
            value: $scope.data.spaces[surface.space].name,
            surfaces: []
          });
        }
        doorCompatibleSpaces[doorCompatibleSpaces.length - 1].surfaces.push({
          id: index,
          value: surface.name
        });
      }
    });
    return doorCompatibleSpaces;
  };
  $scope.data.windowCompatibleSpaces = function () {
    var windowCompatibleSpaces = [];
    _.each($scope.data.surfaces, function (surface, index) {
      if (surface.type == 'Wall' && surface.boundary == 'Exterior') {
        if (_.isEmpty(_.find(windowCompatibleSpaces, {id: surface.space}))) {
          windowCompatibleSpaces.push({
            id: surface.space,
            value: $scope.data.spaces[surface.space].name,
            surfaces: []
          });
        }
        windowCompatibleSpaces[windowCompatibleSpaces.length - 1].surfaces.push({
          id: index,
          value: surface.name
        });
      }
    });
    return windowCompatibleSpaces;
  };
  $scope.data.skylightCompatibleSpaces = function () {
    var skylightCompatibleSpaces = [];
    _.each($scope.data.surfaces, function (surface, index) {
      if (surface.type == 'Roof') {
        if (_.isEmpty(_.find(skylightCompatibleSpaces, {id: surface.space}))) {
          skylightCompatibleSpaces.push({
            id: surface.space,
            value: $scope.data.spaces[surface.space].name,
            surfaces: []
          });
        }
        skylightCompatibleSpaces[skylightCompatibleSpaces.length - 1].surfaces.push({
          id: index,
          value: surface.name
        });
      }
    });
    return skylightCompatibleSpaces;
  };

  $scope.data.updateTotalExhaust = function (space) {
    space.total_exhaust = Shared.calculateTotalExhaust(space);
  };

  // save
  $scope.submit = function () {
    console.log("submit");

    var spaces = angular.copy($scope.data.spaces);
    var surfaces = angular.copy($scope.data.surfaces);
    var subsurfaces = angular.copy($scope.data.subsurfaces);
    _.each(spaces, function (space) {
      space.surfaces = [];
    });
    _.each(surfaces, function (surface, surfaceIndex) {
      if (surface.adjacent_space_reference != null) {
        surface.adjacent_space_reference = $scope.data.spaces[surface.adjacent_space_reference].name
      }
      surface.subsurfaces = _.where(subsurfaces, {'surface': surfaceIndex});
      spaces[surface.space].surfaces.push(surface);
    });

    var params = Shared.defaultParams();
    params.data = spaces;
    data.bulkSync('spaces', params).then(success).catch(failure);


    function success(response) {
      toaster.pop('success', 'Spaces successfully saved');
    }

    function failure(response) {
      console.log("failure", response);
      toaster.pop('error', 'An error occurred while saving', response.statusText);
    }
  };

}]);
