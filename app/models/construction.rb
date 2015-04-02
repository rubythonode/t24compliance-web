class Construction
  # CONSTRUCTION LIBRARY
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :compatible_surface_type, type: String
  field :type, type: String
  field :framing_configuration, type: String
  field :framing_size, type: String
  field :cavity_insulation_r_value, type: Float
  field :continuous_insulation_r_value, type: Float
  field :continuous_insulation_material_name, type: String
  field :layers, type: Array
  field :slab_type, type: String
  field :slab_insulation_orientation, type: String
  field :slab_insulation_thermal_resistance, type: String

  index(compatible_surface_type: 1)
end
