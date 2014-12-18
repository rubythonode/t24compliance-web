json.array!(@fenestrations) do |fenestration|
  json.extract! fenestration, :id, :name, :type, :certification_method, :u_factor, :solar_heat_gain_coefficient, :visible_transmittance, :number_of_panes, :frame_type, :divider_type, :tint, :gas_fill, :low_emissivity_coating
end