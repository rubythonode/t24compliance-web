class HeatRejection
  include Mongoid::Document
	include Mongoid::Timestamps
  field :name, type: String
  field :status, type: String
  field :type, type: String

	belongs_to :fluid_system
	has_many :pumps


	def children_models
		children = [
			'pump'
		]
	end

	def xml_fields
		xml_fields = [
			{"db_field_name"=>"status", "xml_field_name"=>"Status"},
			{"db_field_name"=>"type", "xml_field_name"=>"Type"}
		]
	end

	def to_sdd_xml(xml)
		xml.send(:HtRej) do
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
			'Existing'
		]
	end

	def type_enums
		[
			'OpenTower',
			'ClosedTower',
			'GroundSourceHeatExchanger',
			'Lake',
			'Well'
		]
	end
end