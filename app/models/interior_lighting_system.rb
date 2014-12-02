class InteriorLightingSystem
  include Mongoid::Document
	include Mongoid::Timestamps
  field :name, type: String
  field :status, type: String
  field :parent_space_function, type: String
  field :schedule_reference, type: String
  field :power_regulated, type: Integer
  field :non_regulated_exclusion, type: String
  field :luminaire_reference, type: Array
  field :luminaire_count, type: Array
  field :area_category_allowance_type, type: String
  field :allowance_length, type: Float
  field :allowance_area, type: Float
  field :tailored_method_allowance_type, type: String
  field :power_adjustment_factor_credit_type, type: String
  field :interior_lighting_specification_method, type: String
  field :luminaire_mounting_height, type: Float
  field :work_plane_height, type: Float
  field :daylit_area_type, type: String

	belongs_to :space


	def children_models
		children = [

		]
	end

	def xml_fields
		xml_fields = [
			{"db_field_name"=>"status", "xml_field_name"=>"Status"},
			{"db_field_name"=>"parent_space_function", "xml_field_name"=>"ParentSpcFunc"},
			{"db_field_name"=>"schedule_reference", "xml_field_name"=>"SchRef"},
			{"db_field_name"=>"power_regulated", "xml_field_name"=>"PwrReg"},
			{"db_field_name"=>"non_regulated_exclusion", "xml_field_name"=>"NonRegExclusion"},
			{"db_field_name"=>"luminaire_reference", "xml_field_name"=>"LumRef"},
			{"db_field_name"=>"luminaire_count", "xml_field_name"=>"LumCnt"},
			{"db_field_name"=>"area_category_allowance_type", "xml_field_name"=>"AreaCatAllowType"},
			{"db_field_name"=>"allowance_length", "xml_field_name"=>"AllowLen"},
			{"db_field_name"=>"allowance_area", "xml_field_name"=>"AllowArea"},
			{"db_field_name"=>"tailored_method_allowance_type", "xml_field_name"=>"TailoredMthdAllowType"},
			{"db_field_name"=>"power_adjustment_factor_credit_type", "xml_field_name"=>"PAFCredType"},
			{"db_field_name"=>"interior_lighting_specification_method", "xml_field_name"=>"IntLtgSpecMthd"},
			{"db_field_name"=>"luminaire_mounting_height", "xml_field_name"=>"LumMntgHgt"},
			{"db_field_name"=>"work_plane_height", "xml_field_name"=>"WorkPlaneHgt"},
			{"db_field_name"=>"daylit_area_type", "xml_field_name"=>"DaylitAreaType"}
		]
	end

	def to_sdd_xml(xml)
		xml.send(:IntLtgSys) do
			xml_fields.each do |field|
				xml.send(:"#{field['xml_field_name']}", self[field['db_field_name']])
			end
			# go through children if they have something to add, call their methods
			kids = self.children_models
			unless kids.nil? or kids.empty?
				kids.each do |k|
					models = self.send(k.pluralize)
					models.each do |m|
						m.to_sdd_xml(xml)
					end
				end
			end
		end
	end

	def status_enums
		[
			'New',
			'Altered',
			'Existing',
			'Future'
		]
	end

	def parent_space_function_enums
		[
			'- specify -',
			'Auditorium Area',
			'Auto Repair Area',
			'Bar, Cocktail Lounge and Casino Areas',
			'Beauty Salon Area',
			'Classrooms, Lecture, Training, Vocational Areas',
			'Civic Meeting Place Area',
			'Commercial and Industrial Storage Areas (conditioned or unconditioned)',
			'Commercial and Industrial Storage Areas (refrigerated)',
			'Convention, Conference, Multipurpose and Meeting Center Areas',
			'Corridors, Restrooms, Stairs, and Support Areas',
			'Dining Area',
			'Dry Cleaning (Coin Operated)',
			'Dry Cleaning (Full Service Commercial)',
			'Electrical, Mechanical, Telephone Rooms',
			'Exercise Center, Gymnasium Areas',
			'Exhibit, Museum Areas',
			'Financial Transaction Area',
			'General Commercial and Industrial Work Areas, High Bay',
			'General Commercial and Industrial Work Areas, Low Bay',
			'General Commercial and Industrial Work Areas, Precision',
			'Grocery Sales Areas',
			'High-Rise Residential Living Spaces',
			'Hotel Function Area',
			'Hotel/Motel Guest Room',
			'Housing, Public and Common Areas',
			'Housing, Public and Common Areas',
			'Kitchenette or Residential Kitchen',
			'Laundry',
			'Library, Reading Areas',
			'Library, Stacks',
			'Lobby, Hotel',
			'Lobby, Main Entry',
			'Locker/Dressing Room',
			'Lounge, Recreation',
			'Malls and Atria',
			'Medical and Clinical Care',
			'Office (Greater than 250 square feet in floor area)',
			'Office (250 square feet in floor area or less)',
			'Parking Garage Building, Parking Area',
			'Parking Garage Area Dedicated Ramps',
			'Parking Garage Area Daylight Adaptation Zones',
			'Police Station and Fire Station',
			'Religious Worship Area',
			'Retail Merchandise Sales, Wholesale Showroom',
			'Sports Arena, Indoor Playing Area',
			'Theater, Motion Picture',
			'Theater, Performance',
			'Transportation Function',
			'Videoconferencing Studio',
			'Waiting Area'
		]
	end

	def non_regulated_exclusion_enums
		[
			'- specify -',
			'ThemeParksThemeAndSpecialEffects',
			'FilmOrPhotoStudioLightingSeparatelySwitched',
			'DanceFloorOrTheatrical',
			'TemporaryExhibitSeparatelySwitchedInCivicTransConvOrHotel',
			'ManufacturerInstalledInFreezerVendingFoodPrepScientificOrIndEquip',
			'ExamSurgicalNightOrEquipmentIntegratedInMedicalOrClinical',
			'PlantGrowthOrMaintWithMultiLevelAstroTimer',
			'LightingEquipmentForSale',
			'LightingDemonstrationEquipInLightingEducationFacilities',
			'CBCRequiredExitSign',
			'CBCRequiredExitwayOrEgressNormallyOff',
			'HotelMotelGuestroom',
			'HighRiseResidentialDwellingUnit',
			'TemporaryLightingSystems',
			'SmallAgriculturalBuilding',
			'SmallUnconditionedAgriculturalBuilding',
			'HistoricBuilding',
			'SmallNonresidentialParkingGarage',
			'SignageLighting',
			'ATMLighting',
			'SmallRefrigeratedCases',
			'ElevatorLighting'
		]
	end

	def area_category_allowance_type_enums
		[
			'- none specified -'
		]
	end

	def tailored_method_allowance_type_enums
		[
			'- none specified -'
		]
	end

	def power_adjustment_factor_credit_type_enums
		[
			'- none specified -',
			'PartialOnOccupantSensingControl',
			'OccupantSensingControls-1to125SF',
			'OccupantSensingControls-126to250SF',
			'OccupantSensingControls-251to500SF',
			'ManualDimming',
			'MultisceneProgrammableControls',
			'DemandResponsiveControl',
			'CombinedManualDimmingPlusPartialOnOccupantSensingControl'
		]
	end

	def daylit_area_type_enums
		[
			'- none -',
			'SkylitDaylit',
			'PrimarySidelit',
			'SecondarySidelit'
		]
	end
end