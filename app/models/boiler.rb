class Boiler
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :status, type: String
  field :type, type: String
  field :fuel_source, type: String
  field :draft_type, type: String
  field :fluid_segment_in_reference, type: String
  field :fluid_segment_out_reference, type: String
  field :has_bypass, type: Integer
  field :entering_temperature_design, type: Float
  field :leaving_temperature_design, type: Float
  field :capacity_rated, type: Float
  field :afue, type: Float
  field :combustion_efficiency, type: Float
  field :thermal_efficiency, type: Float
  field :hir_f_plr_curve_reference, type: String
  field :eir, type: Float
  field :fuel_full_load, type: Float
  field :heat_loss, type: Float
  field :unload_ratio_minimum, type: Float
  field :draft_fan_horse_power, type: Float
  field :parasitic_load, type: Float
  field :water_flow_capacity, type: Float

  belongs_to :fluid_system
  has_many :pumps, dependent: :destroy

  def self.children_models
    children = [
      { model_name: 'pump', xml_name: 'Pump' }
    ]
  end

  def self.xml_fields
    xml_fields = [
      { db_field_name: 'name', xml_field_name: 'Name' },
      { db_field_name: 'status', xml_field_name: 'Status' },
      { db_field_name: 'type', xml_field_name: 'Type' },
      { db_field_name: 'fuel_source', xml_field_name: 'FuelSrc' },
      { db_field_name: 'draft_type', xml_field_name: 'DraftType' },
      { db_field_name: 'fluid_segment_in_reference', xml_field_name: 'FluidSegInRef' },
      { db_field_name: 'fluid_segment_out_reference', xml_field_name: 'FluidSegOutRef' },
      { db_field_name: 'has_bypass', xml_field_name: 'HasBypass' },
      { db_field_name: 'entering_temperature_design', xml_field_name: 'EntTempDsgn' },
      { db_field_name: 'leaving_temperature_design', xml_field_name: 'LvgTempDsgn' },
      { db_field_name: 'capacity_rated', xml_field_name: 'CapRtd' },
      { db_field_name: 'afue', xml_field_name: 'AFUE' },
      { db_field_name: 'combustion_efficiency', xml_field_name: 'CombEff' },
      { db_field_name: 'thermal_efficiency', xml_field_name: 'ThrmlEff' },
      { db_field_name: 'hir_f_plr_curve_reference', xml_field_name: 'HIR_fPLRCrvRef' },
      { db_field_name: 'eir', xml_field_name: 'EIR' },
      { db_field_name: 'fuel_full_load', xml_field_name: 'FuelFullLd' },
      { db_field_name: 'heat_loss', xml_field_name: 'HtLoss' },
      { db_field_name: 'unload_ratio_minimum', xml_field_name: 'UnldRatMin' },
      { db_field_name: 'draft_fan_horse_power', xml_field_name: 'DraftFanHp' },
      { db_field_name: 'parasitic_load', xml_field_name: 'ParasiticLd' },
      { db_field_name: 'water_flow_capacity', xml_field_name: 'WtrFlowCap' }
    ]
  end

  # This method is autogenerated. Do not change directly.
  def to_sdd_xml(meta, xml)
    xml.send(meta[:xml_name]) do
      self.class.xml_fields.each do |field|
        if self[field[:db_field_name]]
          if self[field[:db_field_name]].is_a? Array
            logger.debug 'Translating to XML and the object is an Array'
            self[field[:db_field_name]].each_with_index do |instance, index|
              xml.send(:"#{field[:xml_field_name]}", instance, 'index' => index)
            end
          else
            xml.send(:"#{field[:xml_field_name]}", self[field[:db_field_name]])
          end
        end
      end

      # go through children if they have something to add, call their methods
      kids = self.class.children_models
      unless kids.nil? || kids.empty?
        kids.each do |k|
          models = send(k[:model_name].pluralize)
          models.each do |m|
            m.to_sdd_xml(k, xml)
          end
        end
      end
    end
  end

  # This method is autogenerated. Do not change directly.
  # Take the map of model name and xml name, and the hash (from the XML).
  def self.from_sdd_json(meta, h)
    o = nil
    if meta && h
      self_model = meta[:model_name].camelcase(:upper).constantize
      o = self_model.create_from_sdd_json(meta, h)
      if o
        o.create_children_from_sdd_json(meta, h)
        o.save!
        o.reload # in case of relationships being updated
      else
        fail "Could not create instance of #{self_model} for #{meta[:model_name]}"
      end
    end

    o
  end

  # This method is autogenerated. Do not change directly.
  def self.create_from_sdd_json(meta, h)
    new_h = {}

    # Find fields as defined by the XML
    self_model = meta[:model_name].camelcase(:upper).constantize
    self_model.xml_fields.each do |field|
      if h[field[:xml_field_name]]
        logger.debug "Field Data Type: #{self_model.fields[field[:db_field_name]].options[:type]}"
        if self_model.fields[field[:db_field_name]].options[:type].to_s == 'Array'
          logger.debug 'Data model has an array as the field'
          # check if the hash has an array, otherwise make it an array
          if h[field[:xml_field_name]].is_a? Array
            logger.debug 'XML/JSON field is already an Array'
            new_h[field[:db_field_name]] = h[field[:xml_field_name]]
          else
            new_h[field[:db_field_name]] = [h[field[:xml_field_name]]]
          end
        else
          new_h[field[:db_field_name]] = h[field[:xml_field_name]]
        end
      end
    end

    # new_h can be empty if the xml has no fields, but still create the object
    o = self_model.new(new_h)

    o
  end

  # This method is autogenerated. Do not change directly.
  def create_children_from_sdd_json(meta, h)
    # Go through the children
    self_model = meta[:model_name].camelcase(:upper).constantize
    kids = self_model.children_models
    unless kids.nil? || kids.empty?
      kids.each do |k|
        # check if the kids have a json object at this level
        if h[k[:xml_name]]
          logger.debug "XML child is #{k[:xml_name]}"
          logger.debug "Model name is #{k[:model_name]}"
          if h[k[:xml_name]].is_a? Array
            logger.debug "#{k[:xml_name]} is an array, will add all the objects"
            h[k[:xml_name]].each do |h_instance|
              klass = k[:model_name].camelcase(:upper).constantize
              if klass.respond_to? :from_sdd_json
                model = klass.from_sdd_json(k, h_instance)

                # Assign the foreign key on the object
                model["#{meta[:model_name]}_id"] = id
                model.save!
              else
                logger.warn "Class #{klass} does not have instance method 'from_sdd_json'"
              end
            end
          elsif h[k[:xml_name]].is_a? Hash
            logger.debug "#{k[:xml_name]} is a single object, will add only one"
            klass = k[:model_name].camelcase(:upper).constantize
            if klass.respond_to? :from_sdd_json
              model = klass.from_sdd_json(k, h[k[:xml_name]])

              # Assign the foreign key on the object
              model["#{meta[:model_name]}_id"] = id
              model.save!
            else
              logger.warn "Class #{klass} does not have instance method 'from_sdd_json'"
            end
          end
        end
      end
    end
  end

  def status_enums
    %w(New Existing)
  end

  def type_enums
    %w(HotWater Steam)
  end

  def fuel_source_enums
    %w(Gas Oil Electric)
  end

  def draft_type_enums
    %w(MechanicalNoncondensing Condensing Natural)
  end
end
