json.array!(@thermal_zones) do |thermal_zone|
  json.extract! thermal_zone, :id, :name, :type, :multiplier, :description, :supply_plenum_zone_reference, :return_plenum_zone_reference, :hvac_zone_count, :primary_air_conditioning_system_reference, :ventilation_system_reference, :cooling_design_supply_air_temperature, :cooling_design_supply_air_temperature_difference, :cooling_design_sizing_factor, :heating_design_supply_air_temperature, :heating_design_supply_air_temperature_difference, :heating_design_sizing_factor, :heating_design_maximum_flow_fraction, :ventilation_source, :ventilation_control_method, :ventilation_specification_method, :daylighting_control_lighting_fraction1, :daylighting_control_lighting_fraction2, :daylighting_control_type, :daylighting_minimum_dimming_light_fraction, :daylighting_minimum_dimming_power_fraction, :daylighting_number_of_control_steps, :exhaust_system_reference, :exhaust_fan_name, :exhaust_flow_simulated
  json.url thermal_zone_url(thermal_zone, format: :json)
end
