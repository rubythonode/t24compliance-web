json.array!(@fans) do |fan|
  json.extract! fan, :id, :name, :control_method, :classification, :centrifugal_type, :modeling_method, :flow_capacity, :flow_minimum, :flow_efficiency, :total_static_pressure, :motor_bhp, :motor_hp, :motor_type, :motor_pole_count, :motor_efficiency, :motor_position
  json.url fan_url(fan, format: :json)
end
