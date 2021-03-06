cbecc.controller('SystemsCtrl', ['$scope', '$log', '$modal', 'toaster', 'uiGridConstants', 'data', 'Shared', 'Enums', 'project', 'systems', 'plants', 'zones', function ($scope, $log, $modal, toaster, uiGridConstants, data, Shared, Enums, project, systems, plants, zones) {

  // if system names change, must resave zones
  $scope.zones = zones;
  var update_zones = 0;

  // put all systems DATA in array for panels (even exhaust)
  $scope.systems = {
    ptac: [],
    fpfc: [],
    szac: [],
    pvav: [],
    vav: [],
    exhaust: []
  };
  // same for plants
  $scope.plants = {
    shw: [],
    hot_water: [],
    chilled_water: [],
    condenser: []
  };

  // system tabs META
  // this is used to initialize the grids and render active vertical tabs in the view
  $scope.systemTabs = {
    ptac: ['general', 'fan', 'coil_cooling', 'coil_heating'],
    fpfc: ['general', 'fan', 'coil_cooling', 'coil_heating'],
    szac: ['general', 'fan', 'coil_cooling', 'coil_heating'],
    pvav: ['general', 'fan', 'coil_cooling', 'coil_heating'],
    vav: ['general', 'fan', 'coil_cooling', 'coil_heating']
  };

  $scope.plantTabs = {
    hot_water: ['pump', 'boiler', 'coil_heating'],
    chilled_water: ['general', 'pump', 'chiller', 'coil_cooling'],
    condenser: ['pump', 'heat_rejection'],
    shw: ['water_heater']
  };

  // initialize all sub-system hashes
  _.each($scope.systemTabs, function (tabs, type) {
    _.each(tabs, function (tab) {
      $scope.systems[type][tab] = [];
    });
  });
  _.each($scope.plantTabs, function (tabs, type) {
    _.each(tabs, function (tab) {
      $scope.plants[type][tab] = [];
    });
  });

  // retrieve systems and process into view format
  // process exhaust system types here too (or they will get wiped out)
  _.each(systems, function (system) {
    var type = system.type.toLowerCase();
    $scope.systems[type].push(system);
  });

  _.each(plants, function (plant) {
    switch (plant.type) {
      case 'HotWater':
        $scope.plants.hot_water.push(plant);
        break;
      case 'ChilledWater':
        $scope.plants.chilled_water.push(plant);
        break;
      case 'CondenserWater':
        $scope.plants.condenser.push(plant);
        break;
      case 'ServiceHotWater':
        $scope.plants.shw.push(plant);
        break;
    }
  });

  $log.debug('Saved SHW:');
  $log.debug($scope.plants.shw);

  // add shw based on project settings
  $scope.project = project;
  if ($scope.project.exceptional_condition_water_heater == 'No') {
    addPlant('shw');
  }

  //**** INITIALIZE ****
  //collapsible panels
  $scope.systemPanels = [{
    title: 'PTAC Zone Systems',
    name: 'ptac',
    open: false
  }, {
    title: 'FPFC Zone Systems',
    name: 'fpfc',
    open: false
  }, {
    title: 'PSZ Systems',
    name: 'szac',
    open: false
  }, {
    title: 'PVAV Air Systems',
    name: 'pvav',
    open: false
  }, {
    title: 'VAV Air Systems',
    name: 'vav',
    open: false
  }];

  $scope.plantPanels = [{
    title: 'Service Hot Water',
    name: 'shw',
    open: false
  }, {
    title: 'Hot Water Plant',
    name: 'hot_water',
    open: false
  }, {
    title: 'Chilled Water Plant',
    name: 'chilled_water',
    open: false
  }, {
    title: 'Condenser Plant',
    name: 'condenser',
    open: false
  }];


  // initialize for grid
  $scope.selected = {
    ptac: null,
    fpfc: null,
    szac: null,
    pvav: null,
    vav: null
  };

  $scope.gridApi = {
    ptac: null,
    fpfc: null,
    szac: null,
    pvav: null,
    vav: null
  };

  $scope.gridPlantCols = {
    hot_water: {},
    chilled_water: {},
    condenser: {},
    shw: {}
  };
  var min_width = 150;
  $scope.gridPlantCols.hot_water.boiler = [{
    name: 'boiler_name',
    displayName: 'Name',
    field: 'boilers[0].name',
    enableHiding: false
  }, {
    name: 'boiler_draft_type',
    displayName: 'Draft Type',
    field: 'boilers[0].draft_type',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.boilers_draft_type_enums,
    enableHiding: false
  }, {
    name: 'boiler_capacity_rated',
    displayName: 'Rated Capacity',
    field: 'boilers[0].capacity_rated',
    enableHiding: false,
    type: 'number',
    filters: Shared.numberFilter(),
    secondLine: Shared.html('Btu / hr'),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'

  }, {
    name: 'boiler_thermal_efficiency',
    displayName: 'Thermal Efficiency',
    field: 'boilers[0].thermal_efficiency',
    enableHiding: false,
    secondLine: Shared.html('frac.'),
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }];
  $scope.gridPlantCols.hot_water.pump = [{
    name: 'pump_name',
    field: 'boilers[0].pump.name'
  }, {
    name: 'pump_operation_control',
    displayName: 'Operation',
    field: 'boilers[0].pump.operation_control',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.pumps_operation_control_enums,
    enableHiding: false
  }, {
    name: 'pump_speed_control',
    displayName: 'Speed Control',
    field: 'boilers[0].pump.speed_control',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.pumps_speed_control_enums,
    enableHiding: false
  }, {
    name: 'pump_flow_capacity',
    displayName: 'Design Flow Rate',
    field: 'boilers[0].pump.flow_capacity',
    enableHiding: false,
    secondLine: Shared.html('gpm'),
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'pump_total_head',
    displayName: 'Pump Head',
    secondLine: Shared.html('ft H<sub>2</sub>O'),
    field: 'boilers[0].pump.total_head',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_motor_efficiency',
    displayName: 'Motor Efficiency',
    field: 'boilers[0].pump.motor_efficiency',
    type: 'number',
    filters: Shared.numberFilter(),
    enableHiding: false
  }, {
    name: 'pump_impeller_efficiency',
    displayName: 'Impeller Efficiency',
    field: 'boilers[0].pump.impeller_efficiency',
    type: 'number',
    filters: Shared.numberFilter(),
    enableHiding: false
  }, {
    name: 'pump_motor_hp',
    displayName: 'Motor HP',
    secondLine: Shared.html('hp'),
    field: 'boilers[0].pump.motor_hp',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }];
  $scope.gridPlantCols.hot_water.coil_heating = [{
    name: 'name',
    enableCellEdit: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false
  }, {
    name: 'system_name',
    enableCellEdit: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false
  }, {
    name: 'system_type',
    enableCellEdit: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false
  }];
  $scope.gridPlantCols.chilled_water.general = [{
    name: 'name',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'temperature_control',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.fluid_systems_temperature_control_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'reset_supply_high',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'reset_supply_low',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'reset_outdoor_high',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'reset_outdoor_low',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }];
  $scope.gridPlantCols.chilled_water.chiller = [{
    name: 'chiller_name',
    displayName: 'Name',
    field: 'chillers[0].name',
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false
  }, {
    name: 'chiller_type',
    displayName: 'Type',
    field: 'chillers[0].type',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.chillers_type_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false
  }, {
    name: 'chiller_condenser_type',
    displayName: 'Condenser Type',
    field: 'chillers[0].condenser_type',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.chillers_condenser_type_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false

  }, {
    name: 'capacity_rated',
    field: 'chillers[0].capacity_rated',
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false,
    secondLine: Shared.html('Btu / hr'),
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'

  }, {
    name: 'kw_per_ton',
    displayName: 'kW per ton',
    field: 'chillers[0].kw_per_ton',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false

  }, {
    name: 'iplv_kw_per_ton',
    displayName: 'IPLV per ton',
    field: 'chillers[0].iplv_kw_per_ton',
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false,
    secondLine: Shared.html('Btu hr / W'),
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'

  }];
  $scope.gridPlantCols.chilled_water.pump = [{
    name: 'pump_name',
    field: 'chillers[0].pump.name',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_operation_control',
    displayName: 'Operation',
    field: 'chillers[0].pump.operation_control',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.pumps_operation_control_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_speed_control',
    displayName: 'Speed Control',
    field: 'chillers[0].pump.speed_control',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.pumps_speed_control_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_flow_capacity',
    displayName: 'Design Flow Rate',
    secondLine: Shared.html('gpm'),
    type: 'number',
    filters: Shared.numberFilter(),
    field: 'chillers[0].pump.flow_capacity',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_total_head',
    displayName: 'Pump Head',
    secondLine: Shared.html('ft H<sub>2</sub>O'),
    field: 'chillers[0].pump.total_head',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_motor_efficiency',
    displayName: 'Motor Efficiency',
    field: 'chillers[0].pump.motor_efficiency',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_impeller_efficiency',
    displayName: 'Impeller Efficiency',
    field: 'chillers[0].pump.impeller_efficiency',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_motor_hp',
    displayName: 'Motor HP',
    secondLine: Shared.html('hp'),
    field: 'chillers[0].pump.motor_HP',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }];
  $scope.gridPlantCols.chilled_water.coil_cooling = angular.copy($scope.gridPlantCols.hot_water.coil_heating);

  $scope.gridPlantCols.condenser.heat_rejection = [{
    name: 'heat_rejection_name',
    displayName: 'Name',
    field: 'heat_rejections[0].name',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'heat_rejection_type',
    displayName: 'Type',
    field: 'heat_rejections[0].type',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.heat_rejections_type_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'heat_rejection_modulation_control',
    displayName: 'Modulation Control',
    field: 'heat_rejections[0].modulation_control',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.heat_rejections_modulation_control_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'heat_rejection_capacity_rated',
    displayName: 'Capacity Rated',
    field: 'heat_rejections[0].capacity_rated',
    enableHiding: false,
    type: 'number',
    filters: Shared.numberFilter(),
    secondLine: Shared.html('Btu / hr'),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'heat_rejection_total_fan_hp',
    displayName: 'Total Fan HP',
    secondLine: Shared.html('hp'),
    field: 'heat_rejections[0].total_fan_hp',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'heat_rejection_fan_type',
    displayName: 'Fan Type',
    field: 'heat_rejections[0].fan_type',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.heat_rejections_fan_type_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }];
  $scope.gridPlantCols.condenser.pump = [{
    name: 'pump_name',
    field: 'heat_rejections[0].pump.name',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_operation_control',
    displayName: 'Operation',
    field: 'heat_rejections[0].pump.operation_control',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.pumps_operation_control_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_speed_control',
    displayName: 'Speed Control',
    field: 'heat_rejections[0].pump.speed_control',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.pumps_speed_control_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_flow_capacity',
    displayName: 'Design Flow Rate',
    secondLine: Shared.html('gpm'),
    type: 'number',
    filters: Shared.numberFilter(),
    field: 'heat_rejections[0].pump.flow_capacity',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_total_head',
    displayName: 'Pump Head',
    secondLine: Shared.html('ft<sup>2</sup> H<sub>2</sub>O'),
    field: 'heat_rejections[0].pump.total_head',
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_motor_efficiency',
    displayName: 'Motor Efficiency',
    type: 'number',
    filters: Shared.numberFilter(),
    field: 'heat_rejections[0].pump.motor_efficiency',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_impeller_efficiency',
    displayName: 'Impeller Efficiency',
    type: 'number',
    filters: Shared.numberFilter(),
    field: 'heat_rejections[0].pump.impeller_efficiency',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'pump_motor_hp',
    displayName: 'Motor HP',
    secondLine: Shared.html('hp'),
    type: 'number',
    filters: Shared.numberFilter(),
    field: 'heat_rejections[0].pump.motor_HP',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }];
  $scope.gridPlantCols.shw.water_heater = [{
    name: 'capacity_rated',
    displayName: 'Rated Capacity',
    field: 'water_heater.capacity_rated',
    secondLine: Shared.html('Btu / hr'),
    type: 'number',
    filters: Shared.numberFilter(),
    minWidth: min_width,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'draft_fan_power',
    displayName: 'Draft Fan Power',
    field: 'water_heater.draft_fan_power',
    secondLine: Shared.html('W'),
    type: 'number',
    filters: Shared.numberFilter(),
    minWidth: min_width,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    enableHiding: false
  }, {
    name: 'fuel_source',
    displayName: 'Fuel Source',
    field: 'water_heater.fuel_source',
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false,
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.water_heaters_fuel_source_enums
  }, {
    name: 'off_cycle_fuel_source',
    displayName: 'Off Cycle Fuel Source',
    field: 'water_heater.off_cycle_fuel_source',
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false,
    editableCellTemplate: 'ui-grid/dropdownEditor',
    minWidth: min_width + 50,
    editDropdownOptionsArray: Enums.enumsArr.water_heaters_off_cycle_fuel_source_enums
  }, {
    name: 'off_cycle_parasitic_losses',
    displayName: 'Off Cycle Parasitic Losses',
    field: 'water_heater.off_cycle_parasitic_losses',
    secondLine: Shared.html('W'),
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    minWidth: min_width + 50,
    enableHiding: false
  }, {
    name: 'on_cycle_fuel_source',
    displayName: 'On Cycle Fuel Source',
    field: 'water_heater.on_cycle_fuel_source',
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    enableHiding: false,
    editableCellTemplate: 'ui-grid/dropdownEditor',
    minWidth: min_width + 50,
    editDropdownOptionsArray: Enums.enumsArr.water_heaters_on_cycle_fuel_source_enums
  }, {
    name: 'storage_capacity',
    displayName: 'Storage Capacity',
    field: 'water_heater.storage_capacity',
    secondLine: Shared.html('gal'),
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    minWidth: min_width,
    enableHiding: false
  }, {
    name: 'thermal_efficiency',
    displayName: 'Thermal Efficiency',
    field: 'water_heater.thermal_efficiency',
    secondLine: Shared.html('frac.'),
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits',
    minWidth: min_width,
    enableHiding: false
  }, {
    name: 'standby_loss_fraction',
    displayName: 'Standby Loss Fraction',
    field: 'water_heater.standby_loss_fraction',
    headerCellTemplate: 'ui-grid/cbeccHeaderCell',
    type: 'number',
    filters: Shared.numberFilter(),
    minWidth: min_width + 50,
    enableHiding: false
  }];

  $scope.gridCols = {
    ptac: {},
    fpfc: {},
    szac: {},
    vav: {},
    pvav: {}
  };

  $scope.gridCols.ptac.general = [{
    name: 'name',
    displayName: 'System Name',
    enableHiding: false,
    minWidth: min_width,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }];
  $scope.gridCols.ptac.fan = [{
    name: 'name',
    displayName: 'System Name',
    enableHiding: false,
    minWidth: min_width,
    filters: Shared.textFilter(),
    pinnedLeft: true,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_name',
    displayName: 'Fan Name',
    field: 'fan.name',
    enableHiding: false,
    minWidth: min_width,
    filters: Shared.textFilter(),
    pinnedLeft: true,
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_classification',
    displayName: 'Classification',
    field: 'fan.classification',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.fans_classification_enums,
    enableHiding: false,
    minWidth: min_width,
    filters: Shared.textFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_centrifugal_type',
    displayName: 'Centrifugal Type',
    field: 'fan.centrifugal_type',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.fans_centrifugal_type_enums,
    enableHiding: false,
    minWidth: min_width,
    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
      if (row.entity.fan.classification != 'Centrifugal') {
        return 'disabled-cell';
      }
    },
    cellEditableCondition: function ($scope) {
      return ($scope.row.entity.fan.classification == 'Centrifugal');
    },
    filters: Shared.textFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_modeling_method',
    displayName: 'Modeling Method',
    field: 'fan.modeling_method',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.fans_modeling_method_enums,
    enableHiding: false,
    minWidth: min_width,
    filters: Shared.textFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_flow_efficiency',
    displayName: 'Flow Efficiency',
    field: 'fan.flow_efficiency',
    enableHiding: false,
    minWidth: min_width,
    type: 'number',
    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
      if (row.entity.fan.modeling_method != 'StaticPressure') {
        return 'disabled-cell';
      }
    },
    cellEditableCondition: function ($scope) {
      return ($scope.row.entity.fan.modeling_method == 'StaticPressure');
    },
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_total_static_pressure',
    displayName: 'Total Static Pressure',
    field: 'fan.total_static_pressure',
    enableHiding: false,
    type: 'number',
    secondLine: Shared.html('in. H<sub>2</sub>O'),
    minWidth: min_width + 20,
    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
      if (row.entity.fan.modeling_method != 'StaticPressure') {
        return 'disabled-cell';
      }
    },
    cellEditableCondition: function ($scope) {
      return ($scope.row.entity.fan.modeling_method == 'StaticPressure');
    },
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_motor_bhp',
    displayName: 'Motor BHP',
    secondLine: Shared.html('hp'),
    field: 'fan.motor_bhp',
    enableHiding: false,
    minWidth: min_width,
    type: 'number',
    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
      if (row.entity.fan.modeling_method != 'BrakeHorsePower') {
        return 'disabled-cell';
      }
    },
    cellEditableCondition: function ($scope) {
      return ($scope.row.entity.fan.modeling_method == 'BrakeHorsePower');
    },
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_motor_position',
    displayName: 'Motor Position',
    field: 'fan.motor_position',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.fans_motor_position_enums,
    enableHiding: false,
    minWidth: min_width,
    filters: Shared.textFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_motor_hp',
    displayName: 'Motor HP',
    secondLine: Shared.html('hp'),
    field: 'fan.motor_hp',
    enableHiding: false,
    minWidth: min_width,
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_motor_type',
    displayName: 'Motor Type',
    field: 'fan.motor_type',
    minWidth: min_width,
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.fans_motor_type_enums,
    enableHiding: false,
    filters: Shared.textFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_motor_pole_count',
    displayName: 'Motor Pole Count',
    field: 'fan.motor_pole_count',
    enableHiding: false,
    minWidth: min_width,
    filters: Shared.numberFilter(),
    type: 'number',
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }, {
    name: 'fan_motor_efficiency',
    displayName: 'Motor Efficiency',
    field: 'fan.motor_efficiency',
    enableHiding: false,
    minWidth: min_width,
    type: 'number',
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCellWithUnits'
  }];
  $scope.gridCols.ptac.coil_cooling = [{
    name: 'name',
    displayName: 'System Name',
    enablePinning: false,
    enableHiding: false,
    filters: Shared.textFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'coil_cooling_name',
    displayName: 'Coil Name',
    field: 'coil_cooling.name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }];
  $scope.gridCols.ptac.coil_heating = [{
    name: 'name',
    displayName: 'System Name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'coil_heating_name',
    displayName: 'Coil Name',
    field: 'coil_heating.name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }];
  $scope.gridCols.fpfc.general = [{
    name: 'name',
    displayName: 'System Name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }];
  $scope.gridCols.fpfc.general = angular.copy($scope.gridCols.ptac.general);
  $scope.gridCols.fpfc.coil_heating = angular.copy($scope.gridCols.ptac.coil_heating);
  $scope.gridCols.fpfc.coil_cooling = angular.copy($scope.gridCols.ptac.coil_cooling);
  $scope.gridCols.fpfc.fan = angular.copy($scope.gridCols.ptac.fan);
  $scope.gridCols.szac.general = [{
    name: 'name',
    displayName: 'System Name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'sub_type',
    displayName: 'Sub Type',
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.air_systems_sub_type_enums,
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }];
  $scope.gridCols.szac.fan = angular.copy($scope.gridCols.ptac.fan);
  $scope.gridCols.szac.coil_cooling = [{
    name: 'name',
    displayName: 'System Name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'coil_cooling_name',
    displayName: 'Coil Name',
    field: 'coil_cooling.name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'coil_cooling_dxeer',
    displayName: 'EER',
    field: 'coil_cooling.dxeer',
    enableHiding: false,
    filters: Shared.numberFilter(),
    type: 'number',
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }];
  $scope.gridCols.szac.coil_heating = [{
    name: 'name',
    displayName: 'System Name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'coil_heating_name',
    displayName: 'Coil Name',
    field: 'coil_heating.name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'coil_heating_furnace_afue',
    displayName: 'Furnace AFUE',
    field: 'coil_heating.furnace_afue',
    enableHiding: false,
    type: 'number',
    enablePinning: false,
    filters: Shared.numberFilter(),
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }];
  $scope.gridCols.pvav.general = [{
    name: 'name',
    displayName: 'System Name',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'reheat_control_method',
    displayName: 'Reheat Control',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.air_systems_reheat_control_method_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
  }, {
    name: 'cooling_control',
    displayName: 'Cooling Control',
    enableHiding: false,
    filters: Shared.textFilter(),
    enablePinning: false,
    editableCellTemplate: 'ui-grid/dropdownEditor',
    editDropdownOptionsArray: Enums.enumsArr.air_systems_cooling_control_enums,
    headerCellTemplate: 'ui-grid/cbeccHeaderCell'
    /*   }, {
     name: 'cool_reset_supply_high',
     displayName: 'Cool Reset Supply High',
     enableHiding: false,
     filters: Shared.textFilter(),
     headerCellTemplate: 'ui-grid/cbeccHeaderCell'
     }, {
     name: 'cool_reset_supply_low',
     displayName: 'Cool Reset Supply Low',
     enableHiding: false,
     filters: Shared.textFilter(),
     headerCellTemplate: 'ui-grid/cbeccHeaderCell'  */
  }];
  $scope.gridCols.pvav.fan = angular.copy($scope.gridCols.ptac.fan);
  $scope.gridCols.pvav.coil_heating = angular.copy($scope.gridCols.ptac.coil_heating);
  $scope.gridCols.pvav.coil_cooling = angular.copy($scope.gridCols.szac.coil_cooling);
  $scope.gridCols.vav.general = angular.copy($scope.gridCols.pvav.general);
  $scope.gridCols.vav.fan = angular.copy($scope.gridCols.fpfc.fan);
  $scope.gridCols.vav.coil_heating = angular.copy($scope.gridCols.fpfc.coil_heating);
  $scope.gridCols.vav.coil_cooling = angular.copy($scope.gridCols.fpfc.coil_cooling);

  //**** CREATE GRIDS ****
  // System Grids
  $scope.gridOptions = {
    ptac: {},
    fpfc: {},
    szac: {},
    pvav: {},
    vav: {}
  };
  $scope.gridSystemApi = {
    ptac: {},
    fpfc: {},
    szac: {},
    pvav: {},
    vav: {}
  };

  _.each($scope.systemTabs, function (tabs, type) {
    if (_.contains(['ptac', 'fpfc', 'szac', 'pvav', 'vav'], type)) {
      _.each(tabs, function (tab) {
        $scope.gridOptions[type][tab] = {
          columnDefs: $scope.gridCols[type][tab],
          enableCellEditOnFocus: true,
          enableRowHeaderSelection: true,
          enableRowSelection: true,
          enableSorting: true,
          enableFiltering: true,
          enableSelectAll: false,
          multiSelect: false,
          data: $scope.systems[type],
          onRegisterApi: function (gridApi) {
            $scope.gridSystemApi[type] = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
              if (row.isSelected) {
                $scope.selected[type] = row.entity;
              } else {
                // No rows selected
                $scope.selected[type] = null;
              }
            });

            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
              if (newValue != oldValue) {
                Shared.setModified();

                if (_.contains(['name', 'coil_heating_name', 'coil_cooling_name'], colDef.name)) {
                  // update connected coils
                  $scope.display_coils_heating = calculateCoilsHeating();
                  $scope.display_coils_cooling = calculateCoilsCooling();
                }

                var systemIndex = $scope.systems[type].indexOf(rowEntity);
                if (colDef.name == 'name') {
                  var unique = Shared.checkUnique($scope.systems[type], newValue, systemIndex);
                  if (!unique) {
                    rowEntity.name = oldValue;
                  } else {
                    // go through primary_air_conditioning_system_reference on zones and update if needed
                    $log.debug('System name changed from', oldValue, 'to', newValue);
                    _.each($scope.zones, function (zone) {
                      if (zone.primary_air_conditioning_system_reference == oldValue) {
                        $log.debug('Updating zone:', zone.name);
                        zone.primary_air_conditioning_system_reference = newValue;
                        update_zones = 1;
                      }
                    });
                  }
                } else if (colDef.name == 'fan_classification') {
                  rowEntity.fan.centrifugal_type = null;
                  gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
                } else if (colDef.name == 'fan_modeling_method') {
                  rowEntity.fan.motor_bhp = null;
                  rowEntity.fan.flow_efficiency = null;
                  rowEntity.fan.total_static_pressure = null;
                  gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
                }
              }
            });
          }
        };
      });
    }
  });

  // coil totals for plants
  $scope.display_coils_heating = calculateCoilsHeating();
  $scope.display_coils_cooling = calculateCoilsCooling();

  // Plant Grids
  $scope.gridPlantOptions = {
    hot_water: {},
    chilled_water: {},
    shw: {},
    condenser: {}
  };

  $scope.gridPlantApi = {
    hot_water: {},
    chilled_water: {},
    shw: {},
    condenser: {}
  };

  _.each($scope.plantTabs, function (tabs, type) {
    _.each(tabs, function (tab) {
      $scope.gridPlantOptions[type][tab] = {
        columnDefs: $scope.gridPlantCols[type][tab],
        enableCellEditOnFocus: true,
        enableSorting: false,
        enableColumnMenus: false,
        enableFiltering: false,
        onRegisterApi: function (gridApi) {
          $scope.gridPlantApi[type][tab] = gridApi;

          gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            if (newValue != oldValue) {
              Shared.setModified();

              if (colDef.name == 'chiller_condenser_type') {
                // add / remove condenser
                if (newValue == 'Fluid') {
                  addPlant('condenser');
                } else if (newValue == 'Air') {
                  $scope.plants.condenser = [];
                }
              }
            }
          });
        }
      };
      if (tab == 'coil_heating') {
        $scope.gridPlantOptions[type][tab].data = 'display_coils_heating';
      } else if (tab == 'coil_cooling') {
        $scope.gridPlantOptions[type][tab].data = 'display_coils_cooling';
      } else {
        $scope.gridPlantOptions[type][tab].data = $scope.plants[type];
      }
    });
  });

  //**** VIEW HELPERS: TABS & CLASSES ****
  $scope.tabClasses = {};

  function initTabs(name) {
    switch (name) {
      case 'ptac':
        $scope.tabClasses.ptac = {
          general: 'default',
          fan: 'default',
          coil_cooling: 'default',
          coil_heating: 'default'
        };
        break;
      case 'fpfc':
        $scope.tabClasses.fpfc = {
          general: 'default',
          fan: 'default',
          coil_cooling: 'default',
          coil_heating: 'default'
        };
        break;
      case 'szac':
        $scope.tabClasses.szac = {
          general: 'default',
          fan: 'default',
          coil_cooling: 'default',
          coil_heating: 'default'
        };
        break;
      case 'pvav':
        $scope.tabClasses.pvav = {
          general: 'default',
          fan: 'default',
          coil_cooling: 'default',
          coil_heating: 'default'
        };
        break;
      case 'vav':
        $scope.tabClasses.vav = {
          general: 'default',
          fan: 'default',
          coil_cooling: 'default',
          coil_heating: 'default'
        };
        break;
      case 'hot_water':
        $scope.tabClasses.hot_water = {
          pump: 'default',
          boiler: 'default',
          coil_heating: 'default'
        };
        break;
      case 'chilled_water':
        $scope.tabClasses.chilled_water = {
          general: 'default',
          pump: 'default',
          chiller: 'default',
          coil_cooling: 'default'
        };
        break;
      case 'condenser':
        $scope.tabClasses.condenser = {
          pump: 'default',
          heat_rejection: 'default'
        };
        break;
      case 'shw':
        $scope.tabClasses.shw = {
          water_heater: 'default'
        };
        break;
    }
  }

  $scope.getTabClass = function (panelName, tabName) {
    return 'btn btn-' + $scope.tabClasses[panelName][tabName];
  };

  $scope.setActiveTab = function (panelName, tabName) {
    if (!$scope.isActiveTab(panelName, tabName)) {
      $scope.selected[panelName] = null;
      initTabs(panelName);
      $scope.tabClasses[panelName][tabName] = 'primary';
    }
  };

  $scope.isActiveTab = function (panelName, tabName) {
    return $scope.tabClasses.hasOwnProperty(panelName) ? $scope.tabClasses[panelName][tabName] == 'primary' : false;
  };

  $scope.hasSystems = function (panelName) {
    return $scope.systems[panelName].length;
  };

  $scope.hasPlant = function (panelName) {
    // always show shw
    if (panelName == 'shw') return 1;
    return $scope.plants[panelName].length;
  };

  $scope.hasSHW = function () {
    // see if shw is added (set in project tab)
    return $scope.plants['shw'].length;
  };

  $scope.noSystems = function () {
    var count = 0;
    _.each($scope.systems, function (systems) {
      count += systems.length;
    });
    return count;
  };

  $scope.noPlants = function () {
    var count = 0;
    _.each($scope.plants, function (plants) {
      count += plants.length;
    });
    return count;
  };

  // Initialize active tabs
  // TODO: clean this up
  $scope.setActiveTab('ptac', 'general');
  $scope.setActiveTab('fpfc', 'general');
  $scope.setActiveTab('szac', 'general');
  $scope.setActiveTab('pvav', 'general');
  $scope.setActiveTab('vav', 'general');
  $scope.setActiveTab('hot_water', 'pump');
  $scope.setActiveTab('chilled_water', 'general');
  $scope.setActiveTab('condenser', 'pump');
  $scope.setActiveTab('shw', 'water_heater');

  //**** ADD ****
  // add functions
  // NOTE:  this also adds fields that are defaulted.
  // They won't be shown to users, but will be passed to rails
  $scope.addSystem = function (type) {
    Shared.setModified();

    var name;
    switch (type) {
      case 'ptac':
        name = Shared.uniqueName($scope.systems.ptac, _.template('PTAC <%= num %>'));
        $scope.systems.ptac.push({
          name: name,
          type: 'PTAC',
          fan: {
            name: name + ' Fan',
            control_method: 'ConstantVolume'
          },
          coil_cooling: {
            name: name + ' Cooling Coil',
            type: 'DirectExpansion',
            condenser_type: 'Air'
          },
          coil_heating: {
            name: name + ' Heating Coil',
            type: 'HotWater'
          }
        });
        break;
      case 'fpfc':
        name = Shared.uniqueName($scope.systems.fpfc, _.template('FPFC <%= num %>'));
        $scope.systems.fpfc.push({
          name: name,
          type: 'FPFC',
          fan: {
            name: name + ' Fan',
            control_method: 'ConstantVolume'
          },
          coil_cooling: {
            name: name + ' Cooling Coil',
            type: 'ChilledWater'
          },
          coil_heating: {
            name: name + ' Heating Coil',
            type: 'HotWater'
          }
        });
        break;
      case 'szac':
        name = Shared.uniqueName($scope.systems.szac, _.template('PSZ <%= num %>'));
        $scope.systems.szac.push({
          name: name,
          type: 'SZAC',
          sub_type: 'SinglePackage',
          fan: {
            name: name + ' Fan',
            control_method: 'ConstantVolume'
          },
          coil_cooling: {
            name: name + ' Cooling Coil',
            type: 'DirectExpansion'
          },
          coil_heating: {
            name: name + ' Heating Coil',
            type: 'Furnace',
            fuel_source: 'NaturalGas'
          }
        });
        break;
      case 'pvav':
        name = Shared.uniqueName($scope.systems.pvav, _.template('PVAV <%= num %>'));
        $scope.systems.pvav.push({
          name: name,
          type: 'PVAV',
          cooling_control: 'WarmestResetFlowFirst',
          fan: {
            name: name + ' Fan',
            control_method: 'VariableSpeedDrive'
          },
          coil_cooling: {
            name: name + ' Cooling Coil',
            type: 'DirectExpansion',
            fuel_source: 'Electric',
            number_cooling_stages: 2
          },
          coil_heating: {
            name: name + ' Heating Coil',
            type: 'HotWater'
          }
        });
        break;
      case 'vav':
        name = Shared.uniqueName($scope.systems.vav, _.template('VAV <%= num %>'));
        $scope.systems.vav.push({
          name: name,
          type: 'VAV',
          fan: {
            name: name + ' Fan',
            control_method: 'VariableSpeedDrive'
          },
          coil_cooling: {
            name: name + ' Cooling Coil',
            type: 'ChilledWater'
          },
          coil_heating: {
            name: name + ' Heating Coil',
            type: 'HotWater'
          }
        });
        break;
    }
    addDependentPlants(type);
    $scope.display_coils_heating = calculateCoilsHeating();
    $scope.display_coils_cooling = calculateCoilsCooling();
  };

  // this doesn't seem to be working from addSystem function
  function calculateCoilsHeating() {
    var hcoils = [];
    if ($scope.plants.hot_water.length) {
      _.each($scope.systems, function (systems, type) {
        _.each($scope.systems[type], function (item) {
          if (item['coil_heating']['type'] === 'HotWater') {
            hcoils.push({
              name: item['coil_heating']['name'],
              system_name: item['name'],
              system_type: item['type']
            });
          }
        });
      });
    }
    return hcoils;
  }

  function calculateCoilsCooling() {
    var ccoils = [];
    if ($scope.plants.chilled_water.length) {
      _.each($scope.systems, function (systems, type) {
        _.each($scope.systems[type], function (item) {
          if (item['coil_cooling']['type'] === 'ChilledWater') {
            ccoils.push({
              name: item['coil_cooling']['name'],
              system_name: item['name'],
              system_type: item['type']
            });
          }
        });
      });
    }
    return ccoils;
  }

  function addDependentPlants(name) {
    $log.debug('adding dependent plants for: ', name);
    switch (name) {
      case 'ptac':
        // hot_water plant only
        addPlant('hot_water');
        break;
      case 'fpfc':
        // hot and chilled water
        // condenser will be added automatically if condenser_type = fluid
        addPlant('hot_water');
        addPlant('chilled_water');
        break;
      case 'szac':
        // nothing to add
        break;
      case 'pvav':
        // hot_water plant only
        addPlant('hot_water');
        break;
      case 'vav':
        // hot and chilled water
        // condenser will be added automatically if condenser_type = fluid
        addPlant('hot_water');
        addPlant('chilled_water');
        break;
    }
  }

  // add plants (if none exist)
  function addPlant(name) {
    switch (name) {
      case 'hot_water':
        if (!$scope.plants.hot_water.length) {
          $log.debug('adding hot_water plant');
          $scope.plants.hot_water.push({
            name: 'BaseHWSystem',
            type: 'HotWater',
            fluid_segments: [{
              name: 'BaseHWPrimSupSeg',
              type: 'PrimarySupply'
            }, {
              name: 'BaseHWPrimRetSeg',
              type: 'PrimaryReturn'
            }],
            boilers: [{
              name: 'Base Blr',
              type: 'HotWater',
              fuel_source: 'Gas',
              fluid_segment_in_reference: 'BaseHWPrimRetSeg',
              fluid_segment_out_reference: 'BaseHWPrimSupSeg',
              pump: {
                name: 'Base HW Pump'
              }
            }]
          });
        }
        break;
      case 'chilled_water':
        if (!$scope.plants.chilled_water.length) {
          $log.debug('adding chilled_water plant');
          $scope.plants.chilled_water.push({
            name: 'BaseChWSystem',
            type: 'ChilledWater',
            temperature_control: 'OutsideAirReset',
            fluid_segments: [{
              name: 'BaseChWPrimSupSeg',
              type: 'PrimarySupply'
            }, {
              name: 'BaseChWPrimRetSeg',
              type: 'PrimaryReturn'
            }],
            chillers: [{
              name: 'Base Chlr',
              type: 'Centrifugal',
              fuel_source: 'Electric',
              condenser_type: 'Air',
              evaporator_fluid_segment_in_reference: 'BaseChWPrimRetSeg',
              evaporator_fluid_segment_out_reference: 'BaseChWPrimSupSeg',
              pump: {
                name: 'Base ChW Pump'
              }
            }]
          });
        }
        break;
      case 'condenser':
        if (!$scope.plants.condenser.length) {
          $log.debug('adding condenser');
          $scope.plants.condenser.push({
            name: 'BaseCWSystem',
            type: 'CondenserWater',
            fluid_segments: [{
              name: 'BaseCWPrimSupSeg',
              type: 'PrimarySupply'
            }, {
              name: 'BaseCWPrimRetSeg',
              type: 'PrimaryReturn'
            }],
            heat_rejections: [{
              name: 'Base Tower',
              fluid_segment_in_reference: 'BaseCWPrimRetSeg',
              fluid_segment_out_reference: 'BaseCWPrimSupSeg',
              pump: {
                name: 'Base CW Pump'
              }
            }]
          });
        }
        break;
      case 'shw':
        if (!$scope.plants.shw.length) {
          $log.debug('adding SHW');
          $scope.plants.shw.push({
            name: 'SHWFluidSys',
            type: 'ServiceHotWater',
            fluid_segments: [{
              name: 'SHWSupply',
              type: 'PrimarySupply'
            }, {
              name: 'SHWMakeup',
              type: 'MakeupFluid',
              source: 'MunicipalWater'
            }],
            water_heater: {
              name: 'WaterHeater',
              fluid_segment_out_reference: 'SHWSupply',
              fluid_segment_makeup_reference: 'SHWMakeup'
            }
          });
        }
    }
  }


  $scope.duplicateSystem = function (type) {
    Shared.setModified();

    var new_item = angular.copy($scope.selected[type]);
    delete new_item.$$hashKey;
    var prefix = (type == 'szac') ? 'PSZ' : type.toUpperCase();
    new_item.name = Shared.uniqueName($scope.systems[type], _.template(prefix + ' <%= num %>'));
    $scope.systems[type].push(new_item);
    // recalculate coils
    $scope.display_coils_heating = calculateCoilsHeating();
    $scope.display_coils_cooling = calculateCoilsCooling();
  };

  $scope.deleteSystem = function (type) {
    Shared.setModified();

    var index = $scope.systems[type].indexOf($scope.selected[type]);
    $scope.systems[type].splice(index, 1);
    while (index > 0 && !$scope.gridSystemApi[type].grid.rows[index - 1].visible) index--;
    if (index > 0) {
      $scope.gridSystemApi[type].selection.toggleRowSelection($scope.systems[type][index - 1]);
    } else {
      $scope.selected[type] = null;
    }
    //recalculate coils
    $scope.display_coils_heating = calculateCoilsHeating();
    $scope.display_coils_cooling = calculateCoilsCooling();

    // remove plants if necessary (use coil information to remove)
    if (!$scope.display_coils_heating.length) {
      // remove hot_water plant
      $scope.plants.hot_water = [];
    }
    if (!$scope.display_coils_cooling.length) {
      // remove chilled_water plant (and condenser)
      $scope.plants.chilled_water = [];
      $scope.plants.condenser = [];
    }
  };

  //**** SAVE ****
  $scope.submit = function () {
    $log.debug('Submitting systems');
    $scope.errors = {}; //clean up server errors

    $log.debug($scope.systems);
    var params;

    function success(response) {
      // now save plants
      // collapse all plant types into 1 array for saving
      var plants = [];
      _.each($scope.plants, function (plant) {
        _.each(plant, function (p) {
          plants.push(p);
        });
      });
      params = Shared.defaultParams();
      params.data = plants;
      $log.debug('Submitting plants');
      $log.debug(plants);
      data.bulkSync('fluid_systems', params).then(success).catch(failure);

      function success(response) {
        toaster.pop('success', 'Systems and Plants successfully saved');
        // update zones?
        if (update_zones) {
          params = Shared.defaultParams();
          params.data = $scope.zones;
          data.bulkSync('thermal_zones', params).then(success).catch(failure);
        } else {
          Shared.resetModified();
        }

        function success(response) {
          Shared.resetModified();
          toaster.pop('success', 'Zones HVAC system references successfully updated.');
        }

        // zones update failure
        function failure(response) {
          $log.error('Failure updating zones from systems tab', response);
          toaster.pop('error', 'An error occurred while updating zones');
        }

      }

      // plants update failure
      function failure(response) {
        $log.error('Failure submitting plants', response);
        toaster.pop('error', 'An error occurred while saving plants');
      }
    }

    // systems update failure
    function failure(response) {
      $log.error('Failure submitting systems', response);
      toaster.pop('error', 'An error occurred while saving systems');
    }

    // collapse all system types into 1 array for saving
    var systems = [];
    _.each($scope.systems, function (system) {
      _.each(system, function (s) {
        systems.push(s);
      });
    });

    // first save systems
    params = Shared.defaultParams();
    params.data = systems;
    data.bulkSync('zone_systems', params).then(success).catch(failure);

  };

  //**** Modal Settings ****
  $scope.openSystemCreatorModal = function () {
    var modalInstance = $modal.open({
      backdrop: 'static',
      controller: 'ModalSystemCreatorCtrl',
      templateUrl: 'systems/systemCreator.html',
      windowClass: 'wide-modal'
    });

    modalInstance.result.then(function (system) {
      Shared.setModified();

      for (var i = 0; i < system.quantity; ++i) {
        // explicitly set type and subtype if needed here.
        var sys_type = '';
        var subtype = '';
        if (system.type.indexOf('pvav_') > -1) {
          sys_type = 'pvav';
          subtype = system.type.split('_')[1];
        } else if (system.type.indexOf('vav_') > -1) {
          sys_type = 'vav';
          subtype = system.type.split('_')[1];
        } else {
          sys_type = system.type;
        }
        $log.debug('SYSTEM TYPE: ', sys_type);

        $scope.addSystem(sys_type);
      }
    }, function () {
      // Modal canceled
    });
  };

  $scope.expandAll = function () {
    _.each(['systemPanels', 'plantPanels'], function (panelType) {
      _.each($scope[panelType], function (panel) {
        panel.open = true;
      });
    });
  };
  $scope.collapseAll = function () {
    _.each(['systemPanels', 'plantPanels'], function (panelType) {
      _.each($scope[panelType], function (panel) {
        panel.open = false;
      });
    });
  };

}]);
