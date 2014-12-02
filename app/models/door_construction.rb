class DoorConstruction
  include Mongoid::Document
	include Mongoid::Timestamps
  field :name, type: String
  field :type, type: String
  field :certification_method, type: String
  field :u_factor, type: Float
  field :open, type: String

	belongs_to :project


	def children_models
		children = [

		]
	end

	def xml_fields
		xml_fields = [
			{"db_field_name"=>"type", "xml_field_name"=>"Type"},
			{"db_field_name"=>"certification_method", "xml_field_name"=>"CertificationMthd"},
			{"db_field_name"=>"u_factor", "xml_field_name"=>"UFactor"},
			{"db_field_name"=>"open", "xml_field_name"=>"Open"}
		]
	end

	def to_sdd_xml(xml)
		xml.send(:DrCons) do
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

	def type_enums
		[
			'- specify -',
			'MetalInsulatedSingleLayerSectionalDoor',
			'MetalInsulatedSwingingDoor',
			'MetalUninsulatedDoubleLayerDoor',
			'MetalUninsulatedSingleLayerDoor',
			'MetalUninsulatedSingleLayerRollupDoor',
			'WoodLessThan1.75inThickDoor',
			'WoodGreaterThanOrEqualTo1.75inThickDoor'
		]
	end

	def certification_method_enums
		[
			'- specify -',
			'NFRCRated',
			'CECDefaultPerformance'
		]
	end

	def open_enums
		[
			'- specify -',
			'Swinging',
			'NonSwinging'
		]
	end
end