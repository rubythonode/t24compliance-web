json.array!(@terminal_units) do |terminal_unit|
  json.extract! terminal_unit, :id, :name, :status, :type, :zone_served_reference, :count, :minimum_air_fraction_schedule_reference, :primary_air_segment_reference, :primary_air_flow_maximum, :primary_air_flow_minimum, :heating_air_flow_maximum, :reheat_control_method, :induced_air_zone_reference, :induction_ratio, :fan_power_per_flow, :parallel_box_fan_flow_fraction
end
