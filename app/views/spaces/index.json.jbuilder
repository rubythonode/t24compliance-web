json.array!(@spaces) do |space|

  json.(space, :id, :name, :building_story_id, :status, :conditioning_type, :supply_plenum_space_reference, :return_plenum_space_reference, :thermal_zone_reference, :area, :floor_area, :floor_z, :floor_to_ceiling_height, :volume, :space_function_defaults_reference, :space_function, :function_schedule_group, :occupant_density, :occupant_sensible_heat_rate, :occupant_latent_heat_rate, :occupant_schedule_reference, :infiltration_method, :design_infiltration_rate, :infiltration_schedule_reference, :infiltration_model_coefficient_a, :infiltration_model_coefficient_b, :infiltration_model_coefficient_c, :infiltration_model_coefficient_d, :envelope_status, :lighting_status, :interior_lighting_specification_method, :interior_lighting_power_density_regulated, :interior_lighting_regulated_schedule_reference, :interior_lighting_regulated_heat_gain_space_fraction, :interior_lighting_regulated_heat_gain_radiant_fraction, :interior_lighting_power_density_non_regulated, :interior_lighting_non_regulated_schedule_reference, :interior_lighting_non_regulated_heat_gain_space_fraction, :interior_lighting_non_regulated_heat_gain_radiant_fraction, :skylit_daylighting_installed_lighting_power, :primary_side_daylighting_installed_lighting_power, :secondary_side_daylighting_installed_lighting_power, :skylit100_percent_controlled, :primary_sidelit100_percent_controlled, :secondary_sidelit100_percent_controlled, :skylit_daylighting_reference_point_coordinate, :skylit_daylighting_controlled_lighting_power, :skylit_daylighting_control_lighting_fraction, :skylit_daylighting_illuminance_set_point, :primary_side_daylighting_reference_point_coordinate, :primary_side_daylighting_controlled_lighting_power, :primary_side_daylighting_control_lighting_fraction, :primary_side_daylighting_illuminance_set_point, :secondary_side_daylighting_reference_point_coordinate, :secondary_side_daylighting_controlled_lighting_power, :secondary_side_daylighting_control_lighting_fraction, :secondary_side_daylighting_illuminance_set_point, :daylighting_control_type, :minimum_dimming_light_fraction, :minimum_dimming_power_fraction, :number_of_control_steps, :glare_azimuth, :maximum_glare_index, :skylight_requirement_exception, :skylight_requirement_exception_area, :skylight_requirement_exception_fraction, :receptacle_power_density, :receptacle_schedule_reference, :receptacle_radiation_fraction, :receptacle_latent_fraction, :receptacle_lost_fraction, :gas_equipment_power_density, :gas_equipment_schedule_reference, :gas_equipment_radiation_fraction, :gas_equipment_latent_fraction, :gas_equipment_lost_fraction, :process_electrical_power_density, :process_electrical_schedule_reference, :process_electrical_radiation_fraction, :process_electrical_latent_fraction, :process_electrical_lost_fraction, :process_gas_power_density, :process_gas_schedule_reference, :process_gas_radiation_fraction, :process_gas_latent_fraction, :process_gas_lost_fraction, :commercial_refrigeration_epd, :commercial_refrigeration_equipment_schedule_reference, :commercial_refrigeration_radiation_fraction, :commercial_refrigeration_latent_fraction, :commercial_refrigeration_lost_fraction, :elevator_count, :elevator_power, :elevator_schedule_reference, :elevator_radiation_fraction, :elevator_latent_fraction, :elevator_lost_fraction, :escalator_count, :escalator_power, :escalator_schedule_reference, :escalator_radiation_fraction, :escalator_latent_fraction, :escalator_lost_fraction, :shw_fluid_segment_reference, :recirculation_dhw_system_reference, :hot_water_heating_rate, :recirculation_hot_water_heating_rate, :hot_water_heating_schedule_reference, :ventilation_per_person, :ventilation_per_area, :ventilation_air_changes_per_hour, :ventilation_per_space, :exhaust_per_area, :exhaust_air_changes_per_hour, :exhaust_per_space, :kitchen_exhaust_hood_length, :kitchen_exhaust_hood_style, :kitchen_exhaust_hood_duty, :kitchen_exhaust_hood_flow, :lab_exhaust_rate_type, :interior_lighting_power_density_prescriptive, :is_plenum_return, :high_rise_residential_integer, :high_rise_residential_conditioned_floor_area, :baseline_receptacle_power_density, :baseline_receptacle_schedule_reference, :receptacle_power_exceptional_condition, :baseline_gas_equipment_power_density, :baseline_gas_equipment_schedule_reference, :gas_equipment_power_density_exceptional_condition, :baseline_commercial_refrigeration_epd, :baseline_commercial_refrigeration_equipment_schedule_reference, :commercial_refrigeration_epd_exceptional_condition)

  json.interior_lighting_systems space.interior_lighting_systems do |light_sys|
    json.(light_sys, :id, :name, :status, :parent_space_function, :power_regulated, :non_regulated_exclusion, :luminaire_reference, :luminaire_count, :area_category_allowance_type, :allowance_length, :allowance_area, :tailored_method_allowance_type, :power_adjustment_factor_credit_type, :luminaire_mounting_height, :work_plane_height, :daylit_area_type)
  end

  json.interior_walls space.interior_walls do |interior_wall|
    json.(interior_wall, :id, :name, :area, :adjacent_space_reference, :construct_assembly_reference, :construction_library_id)
    json.set! :surface_type, 'Interior Wall'
    json.doors interior_wall.doors do |door|
      json.(door, :id, :name, :operation, :door_construction_reference, :area,:construction_library_id)
      json.set! :type, 'Door'
    end
  end

  json.exterior_walls space.exterior_walls do |exterior_wall|
    json.(exterior_wall, :id, :name, :area, :azimuth, :construct_assembly_reference, :construction_library_id)
    json.set! :surface_type, 'Exterior Wall'
    json.doors exterior_wall.doors do |door|
      json.(door, :id, :name, :operation, :door_construction_reference, :area, :construction_library_id)
      json.set! :type, 'Door'
    end

    json.windows exterior_wall.windows do |window|
      json.(window, :id, :name, :area, :fenestration_construction_reference, :construction_library_id)
      json.set! :type, 'Window'
    end
  end

  json.underground_walls space.underground_walls do |underground_wall|
    json.(underground_wall, :id, :name, :area, :height, :construct_assembly_reference, :interior_solar_absorptance, :interior_visible_absorptance,:interior_thermal_absorptance, :construction_library_id)
    json.set! :surface_type, 'Underground Wall'
  end

  json.underground_floors space.underground_floors do |underground_floor|
    json.(underground_floor, :id, :name, :area, :perimeter_exposed, :construct_assembly_reference, :interior_solar_absorptance, :interior_visible_absorptance,:interior_thermal_absorptance, :construction_library_id)
    json.set! :surface_type, 'Underground Floor'
  end

  json.exterior_floors space.exterior_floors do |exterior_floor|
    json.(exterior_floor, :id, :name, :area,:construct_assembly_reference, :construction_library_id)
    json.set! :surface_type, 'Exterior Floor'
  end

  json.interior_floors space.interior_floors do |interior_floor|
    json.(interior_floor, :id, :name, :area,:construct_assembly_reference, :adjacent_space_reference,:interior_solar_absorptance, :interior_visible_absorptance,:interior_thermal_absorptance,:construction_library_id)
    json.set! :surface_type, 'Interior Floor'
  end

  json.roofs space.roofs do |roof|
    json.(roof, :id, :name, :area, :azimuth, :construct_assembly_reference, :tilt, :interior_solar_absorptance, :interior_thermal_absorptance, :interior_visible_absorptance, :construction_library_id)
    json.set! :surface_type, 'Roof'
    json.skylights roof.skylights do |skylight|
      json.(skylight, :id, :name, :area, :fenestration_construction_reference, :construction_library_id)
      json.set! :type, 'Skylight'
    end
  end

end
