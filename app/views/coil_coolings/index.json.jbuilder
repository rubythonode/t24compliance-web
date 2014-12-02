json.array!(@coil_coolings) do |coil_cooling|
  json.extract! coil_cooling, :id, :name, :type, :fluid_segment_in_reference, :fluid_segment_out_reference, :fluid_flow_rate_design, :number_cooling_stages, :capacity_total_gross_rated, :capacity_total_net_rated, :capacity_total_rated_stage_fraction, :dxseer, :dxeer, :dx_crankcase_control_temperature, :dx_crankcase_heat_capacity, :minimum_hot_gas_ratio, :condenser_type, :auxilliary_power
  json.url coil_cooling_url(coil_cooling, format: :json)
end
