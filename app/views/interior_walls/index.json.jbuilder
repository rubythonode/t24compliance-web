json.array!(@interior_walls) do |interior_wall|
  json.extract! interior_wall, :id, :name, :status, :adjacent_space_reference, :construct_assembly_reference, :area, :exterior_solar_absorptance, :exterior_thermal_absorptance, :exterior_visible_absorptance, :interior_solar_absorptance, :interior_thermal_absorptance, :interior_visible_absorptance
  json.url interior_wall_url(interior_wall, format: :json)
end
