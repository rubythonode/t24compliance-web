json.array!(@buildings) do |building|
  json.extract! building, :id, :name, :function_classification_method, :relocatable_public_school_building, :whole_building_modeled, :building_azimuth, :total_story_count, :total_story_count_new, :total_story_count_existing, :total_story_count_altered, :above_grade_story_count, :above_grade_story_count_new, :above_grade_story_count_existing, :above_grade_story_count_altered, :living_unit_count, :living_unit_count_new, :living_unit_count_existing, :living_unit_count_altered, :total_floor_area, :nonresidential_floor_area, :residential_floor_area, :total_conditioned_volume, :plant_cooling_capacity, :plant_heating_capacity, :coil_cooling_capacity, :coil_heating_capacity
  json.url building_url(building, format: :json)
end
