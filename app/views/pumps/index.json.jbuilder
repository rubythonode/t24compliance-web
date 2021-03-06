json.array!(@pumps) do |pump|
  json.extract! pump, :id, :name, :status, :operation_control, :speed_control, :modeling_method, :count, :flow_capacity, :total_head, :flow_minimum, :minimum_speed_ratio, :motor_efficiency, :impeller_efficiency, :motor_hp
  json.url pump_url(pump, format: :json)
end
