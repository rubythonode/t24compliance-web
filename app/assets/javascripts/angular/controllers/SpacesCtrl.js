cbecc.controller('SpacesCtrl', ['$scope', '$log', '$location', 'uiGridConstants', 'toaster', 'Shared', 'Enums', 'data', 'constData', 'doorData', 'fenData', 'spaceFunctionDefaults', 'stories', 'spaces', 'constructionDefaults', 'luminaires', 'systems', 'zones', function ($scope, $log, $location, uiGridConstants, toaster, Shared, Enums, data, constData, doorData, fenData, spaceFunctionDefaults, stories, spaces, constructionDefaults, luminaires, systems, zones) {
  $scope.data = {
    constData: constData,
    doorData: doorData,
    fenData: fenData,
    spaceFunctionDefaults: spaceFunctionDefaults,
    stories: stories,
    spaces: spaces,
    systems: systems,
    zones: zones,
    constructionDefaults: constructionDefaults[0] || {},
    luminaires: luminaires,
    luminairesModified: false,
    surfaces: [],
    subsurfaces: [],
    lightingSystems: [],
    setFullscreen: Shared.setFullscreen,
    isFullscreen: Shared.isFullscreen
  };

  // pull out exhaust systems from systems
  $scope.data.exhausts = _.remove($scope.data.systems, {
    type: 'Exhaust'
  });

  $scope.data.lightingInputMethods = ['LPD', 'Luminaires'];
  $scope.data.lightingInputMethodsArr = [];
  _.each($scope.data.lightingInputMethods, function (lightingInputMethod) {
    $scope.data.lightingInputMethodsArr.push({
      id: lightingInputMethod,
      value: lightingInputMethod
    });
  });

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

  $scope.data.spacesWithLuminaires = function () {
    var spaces = [];
    _.each($scope.data.spaces, function (space, spaceIndex) {
      if (space.lighting_input_method == 'Luminaires') {
        spaces.push({
          id: spaceIndex,
          value: space.name
        });
      }
    });
    return spaces;
  };

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
          _.each($scope.data.spaces, function (space, spaceIndex) {
            if (surface.adjacent_space_reference == space.name) {
              surface.adjacent_space_reference = spaceIndex;
              return false;
            }
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
          _.each($scope.data.spaces, function (space, spaceIndex) {
            if (surface.adjacent_space_reference == space.name) {
              surface.adjacent_space_reference = spaceIndex;
              return false;
            }
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
      space.lighting_input_method = 'LPD';
      delete space[surfaceType];
    });

    _.each(space.interior_lighting_systems, function (lightingSystem) {
      space.lighting_input_method = 'Luminaires';
      lightingSystem.space = spaceIndex;
      lightingSystem.power_regulated = (lightingSystem.power_regulated == 1);
      var luminaire = lightingSystem.luminaire_reference[0];
      if (luminaire) {
        var luminaireIndex = null;
        _.each($scope.data.luminaires, function (luminaire, index) {
          if (lightingSystem.luminaire_reference[0] == luminaire.name) {
            luminaireIndex = index;
            return false;
          }
        });
        lightingSystem.luminaire_reference[0] = luminaireIndex;
        lightingSystem.power = $scope.data.luminaires[luminaireIndex].power * lightingSystem.luminaire_count[0];
      }
      $scope.data.lightingSystems.push(_.merge({space: spaceIndex}, lightingSystem));
    });
    delete space.interior_lighting_systems;

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

    space.commercial_refrigeration_epd_default = defaults.commercial_refrigeration_epd;

    space.gas_equipment_power_density_default = defaults.gas_equipment_power_density;

    space.interior_lighting_power_density_regulated_default = defaults.interior_lighting_power_density_regulated;
    space.interior_lighting_power_density_non_regulated_default = defaults.interior_lighting_power_density_non_regulated;
  });

  // Set spaceOptions
  var spaceOptions = $scope.data.spacesWithLuminaires();
  _.each($scope.data.lightingSystems, function (lightingSystem) {
    lightingSystem.spaceOptions = spaceOptions;
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

  $scope.data.lumHash = {};
  $scope.data.updateLumHash = function () {
    _.each($scope.data.luminaires, function (luminaire, luminaireIndex) {
      $scope.data.lumHash[luminaireIndex] = luminaire.name;
    });
  };
  $scope.data.updateLumHash();

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
    Shared.setModified();

    var space = {
      name: Shared.uniqueName($scope.data.spaces, _.template('Space <%= num %>')),
      floor_to_ceiling_height: $scope.data.stories[0].floor_to_ceiling_height,
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

    space.commercial_refrigeration_epd = defaults.commercial_refrigeration_epd;
    space.commercial_refrigeration_epd_default = defaults.commercial_refrigeration_epd;

    space.gas_equipment_power_density = defaults.gas_equipment_power_density;
    space.gas_equipment_power_density_default = defaults.gas_equipment_power_density;

    space.lighting_input_method = 'LPD';
    space.interior_lighting_power_density_regulated = defaults.interior_lighting_power_density_regulated;
    space.interior_lighting_power_density_regulated_default = defaults.interior_lighting_power_density_regulated;
    space.interior_lighting_power_density_non_regulated = defaults.interior_lighting_power_density_non_regulated;
    space.interior_lighting_power_density_non_regulated_default = defaults.interior_lighting_power_density_non_regulated;

    $scope.data.spaces.push(space);
  };
  $scope.data.duplicateSpace = function (selected) {
    Shared.setModified();

    var selectedSpace = selected.space;
    var spaceIndex = $scope.data.spaces.indexOf(selectedSpace);

    $scope.data.spaces.push({
      name: Shared.uniqueName($scope.data.spaces, _.template('Space <%= num %>')),
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
      commercial_refrigeration_epd_default: selectedSpace.commercial_refrigeration_epd_default,
      elevator_count: selectedSpace.elevator_count,
      escalator_count: selectedSpace.escalator_count,
      process_electrical_radiation_fraction: selectedSpace.process_electrical_radiation_fraction,
      process_electrical_latent_fraction: selectedSpace.process_electrical_latent_fraction,
      process_electrical_lost_fraction: selectedSpace.process_electrical_lost_fraction,
      elevator_lost_fraction: selectedSpace.elevator_lost_fraction,
      escalator_lost_fraction: selectedSpace.escalator_lost_fraction,

      gas_equipment_power_density: selectedSpace.gas_equipment_power_density,
      gas_equipment_power_density_default: selectedSpace.gas_equipment_power_density_default,
      process_gas_power_density: selectedSpace.process_gas_power_density,
      process_gas_radiation_fraction: selectedSpace.process_gas_radiation_fraction,
      process_gas_latent_fraction: selectedSpace.process_gas_latent_fraction,
      process_gas_lost_fraction: selectedSpace.process_gas_lost_fraction,

      lighting_input_method: selectedSpace.lighting_input_method,
      interior_lighting_power_density_regulated: selectedSpace.interior_lighting_power_density_regulated,
      interior_lighting_power_density_regulated_default: selectedSpace.interior_lighting_power_density_regulated_default,
      interior_lighting_power_density_non_regulated: selectedSpace.interior_lighting_power_density_non_regulated,
      interior_lighting_power_density_non_regulated_default: selectedSpace.interior_lighting_power_density_non_regulated_default
    });

    var surfaces = _.filter($scope.data.surfaces, {space: spaceIndex});
    _.each(surfaces, function (surface) {
      $scope.data.duplicateSurface({surface: surface}, $scope.data.spaces.length - 1);
    });

    if (selectedSpace.lighting_input_method == 'Luminaires') {
      var lightingSystems = _.filter($scope.data.lightingSystems, {space: spaceIndex});
      _.each(lightingSystems, function (lightingSystem) {
        $scope.data.duplicateLightingSystem({lightingSystem: lightingSystem}, $scope.data.spaces.length - 1);
      });
    }
  };
  $scope.data.deleteSpace = function (selected, gridApi) {
    Shared.setModified();

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
        _.remove($scope.data.subsurfaces, {'surface': surfaceIndex});

        // Update subsurface surface parent
        _.each($scope.data.subsurfaces, function (subsurface) {
          if (subsurface.surface > surfaceIndex) {
            subsurface.surface--;
          }
        });
      }
    });

    // Delete surfaces
    _.remove($scope.data.surfaces, {space: spaceIndex});

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

    // Delete lighting systems
    _.remove($scope.data.lightingSystems, {space: spaceIndex});

    // Updating lighting system parents
    _.each($scope.data.lightingSystems, function (lightingSystem) {
      if (lightingSystem.space > spaceIndex) {
        lightingSystem.space--;
      }
    });

    $scope.data.spaces.splice(spaceIndex, 1);
    while (spaceIndex > 0 && !gridApi.grid.rows[spaceIndex - 1].visible) spaceIndex--;
    if (spaceIndex > 0) {
      gridApi.selection.toggleRowSelection($scope.data.spaces[spaceIndex - 1]);
    } else {
      selected.space = null;
    }
  };

  $scope.data.addSurface = function (type, boundary, spaceIndex) {
    Shared.setModified();

    spaceIndex = spaceIndex || 0;
    var num = _.filter($scope.data.surfaces, {space: spaceIndex, type: type}).length + 1;
    var surfaceType = boundary ? boundary + ' ' + type : type;
    var constructionDefault = $scope.data.constructionDefaults[_.snakeCase(surfaceType)];
    constructionDefault = constructionDefault ? constructionDefault.id : null;

    var surface = {
      name: Shared.uniqueName($scope.data.surfaces, _.template($scope.data.spaces[spaceIndex].name + ' ' + type + ' <%= num %>'), num),
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
    };

    if ((boundary == 'Exterior' && type == 'Wall') || type == 'Roof') surface.azimuth = 0;
    if (boundary == 'Underground' && type == 'Floor') surface.perimeter_exposed = 0;

    $scope.data.surfaces.push(surface);
    if (boundary == 'Interior') {
      var surfaceIndex = $scope.data.surfaces.length - 1;
      $scope.data.surfaces[surfaceIndex].adjacencyOptions = $scope.data.compatibleAdjacentSpaces(surfaceIndex);
    }
  };
  $scope.data.restoreSpaceTypeSettingsDefaults = function (gridApi, space) {
    Shared.setModified();

    var restore = function (space) {
      space.occupant_density = space.occupant_density_default;
      space.hot_water_heating_rate = space.hot_water_heating_rate_default;
      space.receptacle_power_density = space.receptacle_power_density_default;
    };

    if (space) {
      restore(space);
    } else {
      _.each($scope.data.spaces, function (space) {
        restore(space);
      });
    }
    gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedSpaceTypeSettingsValues = function (space) {
    var modified = function (space) {
      return (space.occupant_density !== space.occupant_density_default ||
      space.hot_water_heating_rate !== space.hot_water_heating_rate_default ||
      space.receptacle_power_density !== space.receptacle_power_density_default);
    };

    if (space) {
      return modified(space);
    } else {
      return !_.isEmpty(_.find($scope.data.spaces, function (space) {
        return modified(space);
      }));
    }
  };
  $scope.data.restoreSurfaceConstructionDefaults = function (gridApi, surface) {
    Shared.setModified();

    var restore = function (surface) {
      if (surface.constructionDefault) {
        surface.construction_library_id = surface.constructionDefault;
      }
    };

    if (surface) {
      restore(surface);
    } else {
      _.each($scope.data.surfaces, function (surface) {
        restore(surface);
      });
    }
    gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedSurfaceConstructionDefaults = function (surface) {
    var modified = function (surface) {
      if (!surface.constructionDefault) return false;
      return (surface.construction_library_id !== surface.constructionDefault);
    };
    if (surface) {
      return modified(surface);
    } else {
      return !_.isEmpty(_.find($scope.data.surfaces, function (surface) {
        return modified(surface);
      }));
    }
  };
  $scope.data.restoreSubsurfaceConstructionDefaults = function (gridApi, subsurface) {
    Shared.setModified();

    var restore = function (subsurface) {
      if (subsurface.constructionDefault) {
        subsurface.construction_library_id = subsurface.constructionDefault;
      }
    };

    if (subsurface) {
      restore(subsurface);
    } else {
      _.each($scope.data.subsurfaces, function (subsurface) {
        restore(subsurface);
      });
    }
    gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedSubsurfaceConstructionDefaults = function (subsurface) {
    var modified = function (subsurface) {
      if (!subsurface.constructionDefault) return false;
      return (subsurface.construction_library_id !== subsurface.constructionDefault);
    };
    if (subsurface) {
      return modified(subsurface);
    } else {
      return !_.isEmpty(_.find($scope.data.subsurfaces, function (subsurface) {
        return modified(subsurface);
      }));
    }
  };
  $scope.data.restoreSpaceTypeExhaustDefaults = function (gridApi, space) {
    Shared.setModified();

    var restore = function (space) {
      space.exhaust_per_area = space.exhaust_per_area_default;
      space.exhaust_air_changes_per_hour = space.exhaust_air_changes_per_hour_default;
      $scope.data.updateTotalExhaust(space);
    };

    if (space) {
      restore(space);
    } else {
      _.each($scope.data.spaces, function (space) {
        restore(space);
      });
    }
    gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedSpaceTypeExhaustDefaults = function (space) {
    var modified = function (space) {
      return (space.exhaust_per_area !== space.exhaust_per_area_default || space.exhaust_air_changes_per_hour !== space.exhaust_air_changes_per_hour_default);
    };
    if (space) {
      return modified(space);
    } else {
      return !_.isEmpty(_.find($scope.data.spaces, function (space) {
        return modified(space);
      }));
    }
  };
  $scope.data.restoreRefrigerationDefaults = function (gridApi, space) {
    Shared.setModified();

    var restore = function (space) {
      space.commercial_refrigeration_epd = space.commercial_refrigeration_epd_default;
    };

    if (space) {
      restore(space);
    } else {
      _.each($scope.data.spaces, function (space) {
        restore(space);
      });
    }
    gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedRefrigerationDefaults = function (space) {
    var modified = function (space) {
      return (space.commercial_refrigeration_epd !== space.commercial_refrigeration_epd_default);
    };
    if (space) {
      return modified(space);
    } else {
      return !_.isEmpty(_.find($scope.data.spaces, function (space) {
        return modified(space);
      }));
    }
  };
  $scope.data.restoreGasDefaults = function (gridApi, space) {
    Shared.setModified();

    var restore = function (space) {
      space.gas_equipment_power_density = space.gas_equipment_power_density_default;
    };

    if (space) {
      restore(space);
    } else {
      _.each($scope.data.spaces, function (space) {
        restore(space);
      });
    }
    gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedGasDefaults = function (space) {
    var modified = function (space) {
      return (space.gas_equipment_power_density !== space.gas_equipment_power_density_default);
    };
    if (space) {
      return modified(space);
    } else {
      return !_.isEmpty(_.find($scope.data.spaces, function (space) {
        return modified(space);
      }));
    }
  };
  $scope.data.restoreLPDDefaults = function (gridApi, space) {
    Shared.setModified();

    var restore = function (space) {
      space.interior_lighting_power_density_regulated = space.interior_lighting_power_density_regulated_default;
      space.interior_lighting_power_density_non_regulated = space.interior_lighting_power_density_non_regulated_default;
    };

    if (space) {
      restore(space);
    } else {
      _.each($scope.data.spaces, function (space) {
        if (space.lighting_input_method == 'LPD') {
          restore(space);
        }
      });
    }
    gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };
  $scope.data.modifiedLPDDefaults = function (space) {
    var modified = function (space) {
      return space.lighting_input_method == 'LPD'
        && (space.interior_lighting_power_density_regulated != space.interior_lighting_power_density_regulated_default
        || space.interior_lighting_power_density_non_regulated != space.interior_lighting_power_density_non_regulated_default);
    };
    if (space) {
      return modified(space);
    } else {
      return !_.isEmpty(_.find($scope.data.spaces, function (space) {
        return modified(space);
      }));
    }
  };

  $scope.data.duplicateSurface = function (selected, newParent) {
    Shared.setModified();

    var selectedSurface = selected.surface;
    var spaceIndex = newParent === undefined ? selectedSurface.space : newParent;
    var surfaceIndex = $scope.data.surfaces.indexOf(selectedSurface);

    var name = $scope.data.spaces[spaceIndex].name + ' ' + selectedSurface.type;
    var num = _.filter($scope.data.surfaces, {space: spaceIndex, type: selectedSurface.type}).length + 1;

    $scope.data.surfaces.push({
      name: Shared.uniqueName($scope.data.surfaces, _.template($scope.data.spaces[spaceIndex].name + ' ' + selectedSurface.type + ' <%= num %>'), num),
      space: spaceIndex,
      type: selectedSurface.type,
      boundary: selectedSurface.boundary,
      surface_type: selectedSurface.surface_type,
      building_story_id: selectedSurface.building_story_id,
      area: selectedSurface.area,
      azimuth: selectedSurface.azimuth,
      construction_library_id: selectedSurface.construction_library_id,
      constructionDefault: selectedSurface.constructionDefault,
      adjacent_space_reference: null,
      tilt: selectedSurface.tilt,
      height: selectedSurface.height,
      perimeter_exposed: selectedSurface.perimeter_exposed
    });

    if (selectedSurface.boundary == 'Interior') {
      var newSurfaceIndex = $scope.data.surfaces.length - 1;
      $scope.data.surfaces[newSurfaceIndex].adjacencyOptions = $scope.data.compatibleAdjacentSpaces(newSurfaceIndex);
    }

    var subsurfaces = _.filter($scope.data.subsurfaces, {surface: surfaceIndex});
    _.each(subsurfaces, function (subsurface) {
      $scope.data.duplicateSubsurface({subsurface: subsurface}, $scope.data.surfaces.length - 1);
    });
  };
  $scope.data.deleteSurface = function (selected, gridApi) {
    Shared.setModified();

    var surfaceIndex = $scope.data.surfaces.indexOf(selected.surface);

    // Delete subsurfaces
    _.remove($scope.data.subsurfaces, {surface: surfaceIndex});

    // Update subsurface parents
    _.each($scope.data.subsurfaces, function (subsurface) {
      if (subsurface.surface > surfaceIndex) {
        subsurface.surface--;
      }
    });

    $scope.data.surfaces.splice(surfaceIndex, 1);
    while (surfaceIndex > 0 && !gridApi.grid.rows[surfaceIndex - 1].visible) surfaceIndex--;
    if (surfaceIndex > 0) {
      gridApi.selection.toggleRowSelection($scope.data.surfaces[surfaceIndex - 1]);
    } else {
      selected.surface = null;
    }
  };

  $scope.data.addSubsurface = function (type, surfaceIndex) {
    Shared.setModified();

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
    var spaceIndex = $scope.data.surfaces[surfaceIndex].space;

    var spaceOptions = [];
    var surfaceOptions = [];
    if (type == 'Door') {
      spaceOptions = $scope.data.doorCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: spaceIndex}).surfaces;
    } else if (type == 'Window') {
      spaceOptions = $scope.data.windowCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: spaceIndex}).surfaces;
    } else if (type == 'Skylight') {
      spaceOptions = $scope.data.skylightCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: spaceIndex}).surfaces;
    }

    var num = _.filter($scope.data.subsurfaces, {surface: surfaceIndex, type: type}).length + 1;
    var constructionDefault = $scope.data.constructionDefaults[type.toLowerCase()];
    constructionDefault = constructionDefault ? constructionDefault.id : null;
    $scope.data.subsurfaces.push({
      name: Shared.uniqueName($scope.data.subsurfaces, _.template($scope.data.surfaces[surfaceIndex].name + ' ' + type + ' <%= num %>'), num),
      space: spaceIndex,
      spaceOptions: spaceOptions,
      surface: surfaceIndex,
      surfaceOptions: surfaceOptions,
      type: type,
      building_story_id: $scope.data.spaces[spaceIndex].building_story_id,
      area: null,
      construction_library_id: constructionDefault,
      constructionDefault: constructionDefault
    });
  };
  $scope.data.duplicateSubsurface = function (selected, newParent) {
    Shared.setModified();

    var selectedSubsurface = selected.subsurface;

    var surfaceIndex = newParent === undefined ? selectedSubsurface.surface : newParent;
    var spaceIndex = $scope.data.surfaces[surfaceIndex].space;

    var spaceOptions = [];
    var surfaceOptions = [];
    if (selectedSubsurface.type == 'Door') {
      spaceOptions = $scope.data.doorCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: spaceIndex}).surfaces;
    } else if (selectedSubsurface.type == 'Window') {
      spaceOptions = $scope.data.windowCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: spaceIndex}).surfaces;
    } else if (selectedSubsurface.type == 'Skylight') {
      spaceOptions = $scope.data.skylightCompatibleSpaces();
      surfaceOptions = _.find(spaceOptions, {id: spaceIndex}).surfaces;
    }

    var num = _.filter($scope.data.subsurfaces, {surface: surfaceIndex, type: selectedSubsurface.type}).length + 1;
    $scope.data.subsurfaces.push({
      name: Shared.uniqueName($scope.data.subsurfaces, _.template($scope.data.surfaces[surfaceIndex].name + ' ' + selectedSubsurface.type + ' <%= num %>'), num),
      space: spaceIndex,
      spaceOptions: spaceOptions,
      surface: surfaceIndex,
      surfaceOptions: surfaceOptions,
      type: selectedSubsurface.type,
      building_story_id: $scope.data.spaces[spaceIndex].building_story_id,
      area: selectedSubsurface.area,
      construction_library_id: selectedSubsurface.construction_library_id,
      constructionDefault: selectedSubsurface.constructionDefault
    });
  };
  $scope.data.deleteSubsurface = function (selected, gridApi) {
    Shared.setModified();

    var subsurfaceIndex = $scope.data.subsurfaces.indexOf(selected.subsurface);
    $scope.data.subsurfaces.splice(subsurfaceIndex, 1);
    while (subsurfaceIndex > 0 && !gridApi.grid.rows[subsurfaceIndex - 1].visible) subsurfaceIndex--;
    if (subsurfaceIndex > 0) {
      gridApi.selection.toggleRowSelection($scope.data.subsurfaces[subsurfaceIndex - 1]);
    } else {
      selected.subsurface = null;
    }
  };

  $scope.data.addLuminaire = function () {
    Shared.setModified();
    $scope.data.luminairesModified = true;

    var luminaire = {
      name: Shared.uniqueName($scope.data.luminaires, _.template('Luminaire <%= num %>')),
      fixture_type: Enums.enums.luminaires_fixture_type_enums[1],
      lamp_type: Enums.enums.luminaires_lamp_type_enums[0],
      power: 0
    };
    _.merge(luminaire, $scope.data.luminaireHeatGain(luminaire.fixture_type));

    $scope.data.luminaires.push(luminaire);
    $scope.data.updateLumHash();
  };
  $scope.data.duplicateLuminaire = function (selected) {
    Shared.setModified();
    $scope.data.luminairesModified = true;

    var selectedLuminaire = selected.luminaire;

    $scope.data.luminaires.push({
      name: Shared.uniqueName($scope.data.luminaires, _.template('Luminaire <%= num %>')),
      fixture_type: selectedLuminaire.fixture_type,
      lamp_type: selectedLuminaire.lamp_type,
      power: selectedLuminaire.power,
      heat_gain_space_fraction: selectedLuminaire.heat_gain_space_fraction,
      heat_gain_radiant_fraction: selectedLuminaire.heat_gain_radiant_fraction
    });
    $scope.data.updateLumHash();
  };
  $scope.data.deleteLuminaire = function (selected, gridApi, luminaireGridApi) {
    Shared.setModified();
    $scope.data.luminairesModified = true;

    var luminaireIndex = $scope.data.luminaires.indexOf(selected.luminaire);

    $scope.data.luminaires.splice(luminaireIndex, 1);

    // Remove luminaire from lighting systems
    _.each(_.filter($scope.data.lightingSystems, {'luminaire_reference': [luminaireIndex]}), function (lightingSystem) {
      lightingSystem.luminaire_reference[0] = null;
      lightingSystem.power = 0;
    });

    // Update luminaire indices
    _.each($scope.data.lightingSystems, function (lightingSystem) {
      if (lightingSystem.luminaire_reference[0] > luminaireIndex) {
        lightingSystem.luminaire_reference[0]--;
      }
    });
    $scope.data.updateLumHash();

    // Update luminaire grid values
    luminaireGridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
    _.each($scope.data.spaces, function (space, spaceIndex) {
      if (space.lighting_input_method == 'Luminaires') $scope.data.calculateLPD(spaceIndex);
    });

    while (luminaireIndex > 0 && !gridApi.grid.rows[luminaireIndex - 1].visible) luminaireIndex--;
    if (luminaireIndex > 0) {
      gridApi.selection.toggleRowSelection($scope.data.luminaires[luminaireIndex - 1]);
    } else {
      selected.luminaire = null;
    }
  };

  $scope.data.addLightingSystem = function () {
    Shared.setModified();

    var spaceIndex = null;
    _.each($scope.data.spaces, function (space, index) {
      if (space.lighting_input_method == 'Luminaires') {
        spaceIndex = index;
        return false;
      }
    });

    var lightingSystem = {
      name: Shared.uniqueName($scope.data.lightingSystems, _.template('Lighting System <%= num %>')),
      space: spaceIndex,
      spaceOptions: $scope.data.spacesWithLuminaires(),
      luminaire_reference: [null],
      luminaire_count: [0],
      status: Enums.enums.interior_lighting_systems_status_enums[0],
      power_regulated: true,
      non_regulated_exclusion: null,
      luminaire_mounting_height: $scope.data.spaces[spaceIndex].floor_to_ceiling_height,
      power_adjustment_factor_credit_type: Enums.enums.interior_lighting_systems_power_adjustment_factor_credit_type_enums[0],
      power: 0
    };

    $scope.data.lightingSystems.push(lightingSystem);
  };
  $scope.data.duplicateLightingSystem = function (selected, newParent) {
    Shared.setModified();

    var selectedLightingSystem = selected.lightingSystem;

    var spaceIndex = newParent === undefined ? selectedLightingSystem.space : newParent;

    $scope.data.lightingSystems.push({
      name: Shared.uniqueName($scope.data.lightingSystems, _.template('Lighting System <%= num %>')),
      space: spaceIndex,
      spaceOptions: selectedLightingSystem.spaceOptions,
      luminaire_reference: selectedLightingSystem.luminaire_reference,
      luminaire_count: selectedLightingSystem.luminaire_count,
      status: selectedLightingSystem.status,
      power_regulated: selectedLightingSystem.power_regulated,
      non_regulated_exclusion: selectedLightingSystem.non_regulated_exclusion,
      luminaire_mounting_height: selectedLightingSystem.luminaire_mounting_height,
      power_adjustment_factor_credit_type: selectedLightingSystem.power_adjustment_factor_credit_type,
      power: selectedLightingSystem.power
    });
  };
  $scope.data.deleteLightingSystem = function (selected, gridApi) {
    Shared.setModified();

    var lightingSystemIndex = $scope.data.lightingSystems.indexOf(selected.lightingSystem);
    var spaceIndex = selected.lightingSystem.space;
    $scope.data.lightingSystems.splice(lightingSystemIndex, 1);
    $scope.data.calculateLPD(spaceIndex);
    while (lightingSystemIndex > 0 && !gridApi.grid.rows[lightingSystemIndex - 1].visible) lightingSystemIndex--;
    if (lightingSystemIndex > 0) {
      gridApi.selection.toggleRowSelection($scope.data.lightingSystems[lightingSystemIndex - 1]);
    } else {
      selected.lightingSystem = null;
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
        _.each($scope.data.storiesArr, function (story, key) {
          if (story.id == storyId) {
            storyIndex = key;
            return false;
          }
        });
        var storyBelow = null;
        if (storyIndex) storyBelow = $scope.data.storiesArr[storyIndex - 1].id;
        _.each($scope.data.spaces, function (space, spaceIndex) {
          // Spaces on lower story
          if (storyBelow && space.building_story_id == storyBelow) {
            compatibleAdjacentSpaces.push({
              id: spaceIndex,
              value: space.name
            });
          }
          // Spaces on same story (for plenums/attics)
          if (space.building_story_id == storyId && spaceIndex != surface.space) {
            compatibleAdjacentSpaces.push({
              id: spaceIndex,
              value: space.name
            });
          }
        });
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

  $scope.data.applySettingsCondition = function ($scope) {
    return !$scope.grid.appScope.applySettingsActive;
  };

  $scope.data.updateTotalExhaust = function (space) {
    space.total_exhaust = Shared.calculateTotalExhaust(space);
  };

  $scope.data.luminaireHeatGain = function (fixtureType) {
    if (fixtureType == 'RecessedWithLens') {
      return {
        heat_gain_space_fraction: 0.45,
        heat_gain_radiant_fraction: 0.67
      }
    } else if (fixtureType == 'RecessedOrDownlight') {
      return {
        heat_gain_space_fraction: 0.69,
        heat_gain_radiant_fraction: 0.58
      }
    } else if (fixtureType == 'NotInCeiling') {
      return {
        heat_gain_space_fraction: 1,
        heat_gain_radiant_fraction: 0.54
      }
    }
  };

  $scope.data.calculateLPD = function (spaceIndex) {
    var regulated = 0;
    var unregulated = 0;
    _.each(_.filter($scope.data.lightingSystems, {
      space: spaceIndex,
      power_regulated: true
    }), function (lightingSystem) {
      regulated += lightingSystem.power;
    });
    _.each(_.filter($scope.data.lightingSystems, {
      space: spaceIndex,
      power_regulated: false
    }), function (lightingSystem) {
      unregulated += lightingSystem.power;
    });

    // Avoid divide by zero
    if ($scope.data.spaces[spaceIndex].area) {
      $scope.data.spaces[spaceIndex].interior_lighting_power_density_regulated = regulated / $scope.data.spaces[spaceIndex].area;
      $scope.data.spaces[spaceIndex].interior_lighting_power_density_non_regulated = unregulated / $scope.data.spaces[spaceIndex].area;
    } else {
      $scope.data.spaces[spaceIndex].interior_lighting_power_density_regulated = 0;
      $scope.data.spaces[spaceIndex].interior_lighting_power_density_non_regulated = 0;
    }
  };

  // save
  $scope.submit = function () {
    if ($scope.data.luminairesModified) {
      $log.debug('Submitting luminaires');

      var params = Shared.defaultParams();
      params.data = $scope.data.luminaires;
      data.bulkSync('luminaires', params).then(success).catch(failure);
    } else {
      success('Luminaires were not modified');
    }

    function success(response) {
      if ($scope.data.luminairesModified) {
        toaster.pop('success', 'Luminaires successfully saved');
        $scope.data.luminairesModified = false;
      }

      var spaces = angular.copy($scope.data.spaces);
      var surfaces = angular.copy($scope.data.surfaces);
      var subsurfaces = angular.copy($scope.data.subsurfaces);
      var lightingSystems = angular.copy($scope.data.lightingSystems);
      _.each(spaces, function (space) {
        space.surfaces = [];
        space.interior_lighting_systems = [];
      });
      _.each(surfaces, function (surface, surfaceIndex) {
        if (surface.adjacent_space_reference != null) {
          surface.adjacent_space_reference = $scope.data.spaces[surface.adjacent_space_reference].name
        }
        surface.subsurfaces = _.where(subsurfaces, {'surface': surfaceIndex});
        spaces[surface.space].surfaces.push(surface);
      });
      _.each(lightingSystems, function (lightingSystem) {
        var spaceIndex = lightingSystem.space;
        lightingSystem.space = $scope.data.spaces[spaceIndex].name;
        lightingSystem.power_regulated = lightingSystem.power_regulated ? 1 : 0;
        var luminaireIndex = lightingSystem.luminaire_reference[0];
        if (luminaireIndex != null) {
          lightingSystem.luminaire_reference[0] = $scope.data.luminaires[luminaireIndex].name;
        }
        spaces[spaceIndex].interior_lighting_systems.push(lightingSystem);
      });

      $log.debug('Submitting spaces');

      var params = Shared.defaultParams();
      params.data = spaces;
      data.bulkSync('spaces', params).then(success).catch(failure);

      function success(response) {
        Shared.resetModified();
        toaster.pop('success', 'Spaces successfully saved');

        // if some spaces are already assigned to zones, recalculate exhaust systems
        if (!_.isEmpty($scope.data.zones)) {

          Shared.updateExhaustSystems($scope.data.zones, $scope.data.spaces, $scope.data.exhausts);
          // put exhaust systems back in systems hash
          $scope.data.systems = $scope.data.systems.concat($scope.data.exhausts);

          var params = Shared.defaultParams();
          params.data = $scope.data.systems;
          data.bulkSync('zone_systems', params).then(success).catch(failure);
        }

        function success(response) {
          toaster.pop('success', 'Exhaust systems updated');

          var params = Shared.defaultParams();
          params.data = $scope.data.zones;
          data.bulkSync('thermal_zones', params).then(success).catch(failure);

          function success(response) {
            toaster.pop('success', 'Thermal zones updated');
          }

          function failure(response) {
            $log.error('Failure updating thermal zones', response);
            toaster.pop('error', 'An error occurred while saving thermal zones', response.statusText);
          }
        }

        function failure(response) {
          $log.error('Failure updating exhaust systems', response);
          toaster.pop('error', 'An error occurred while saving exhaust systems', response.statusText);
        }

      }

      function failure(response) {
        $log.error('Failure submitting spaces', response);
        toaster.pop('error', 'An error occurred while saving spaces', response.statusText);
      }
    }

    function failure(response) {
      $log.error('Failure submitting luminaires', response);
      toaster.pop('error', 'An error occurred while saving luminaires', response.statusText);
    }
  };

}]);
