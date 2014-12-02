json.array!(@construct_assemblies) do |construct_assembly|
  json.extract! construct_assembly, :id, :name, :compatible_surface_type, :exterior_solar_absorptance, :exterior_thermal_absorptance, :exterior_visible_absorptance, :interior_solar_absorptance, :interior_thermal_absorptance, :interior_visible_absorptance, :slab_type, :slab_insulation_orientation, :slab_insulation_thermal_resistance, :field_applied_coating, :crrc_initial_reflectance, :crrc_aged_reflectance, :crrc_initial_emittance, :crrc_aged_emittance, :crrc_initial_sri, :crrc_aged_sri, :crrc_product_id, :material_reference
  json.url construct_assembly_url(construct_assembly, format: :json)
end
