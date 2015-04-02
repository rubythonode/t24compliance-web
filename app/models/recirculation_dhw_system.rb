class RecirculationDhwSystem
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :status, type: String
  field :type, type: String
  field :multiplier, type: Integer
  field :central_system, type: Integer
  field :distribution_type, type: String
  field :pump_power, type: Float
  field :pump_efficiency, type: Float
  field :system_story_count, type: Integer
  field :living_unit_count, type: Integer
  field :water_heater_count, type: Integer
  field :total_input_rating, type: Float
  field :total_tank_volume, type: Float
  field :baseline_recirculation_water_heater_reference, type: String
  field :use_default_loops, type: Integer
  field :pipe_length, type: Array
  field :pipe_diameter, type: Array
  field :pipe_location, type: Array
  field :loop_count, type: Integer
  field :pipe_extra_insulation, type: Integer
  field :annual_solar_fraction, type: Float

  has_many :recirculation_water_heaters, dependent: :destroy

  def self.children_models
    children = [
      { model_name: 'recirculation_water_heater', xml_name: 'RecircWtrHtr' }
    ]
  end

  def self.xml_fields
    xml_fields = [
      { db_field_name: 'name', xml_field_name: 'Name' },
      { db_field_name: 'status', xml_field_name: 'Status' },
      { db_field_name: 'type', xml_field_name: 'Type' },
      { db_field_name: 'multiplier', xml_field_name: 'Mult' },
      { db_field_name: 'central_system', xml_field_name: 'CentralSys' },
      { db_field_name: 'distribution_type', xml_field_name: 'DistType' },
      { db_field_name: 'pump_power', xml_field_name: 'PumpPwr' },
      { db_field_name: 'pump_efficiency', xml_field_name: 'PumpEff' },
      { db_field_name: 'system_story_count', xml_field_name: 'SysStoryCnt' },
      { db_field_name: 'living_unit_count', xml_field_name: 'LivingUnitCnt' },
      { db_field_name: 'water_heater_count', xml_field_name: 'WtrHtrCnt' },
      { db_field_name: 'total_input_rating', xml_field_name: 'TotInpRating' },
      { db_field_name: 'total_tank_volume', xml_field_name: 'TotTankVol' },
      { db_field_name: 'baseline_recirculation_water_heater_reference', xml_field_name: 'BaseRecircWtrHtrRef' },
      { db_field_name: 'use_default_loops', xml_field_name: 'UseDefaultLps' },
      { db_field_name: 'pipe_length', xml_field_name: 'PipeLen' },
      { db_field_name: 'pipe_diameter', xml_field_name: 'PipeDia' },
      { db_field_name: 'pipe_location', xml_field_name: 'PipeLctn' },
      { db_field_name: 'loop_count', xml_field_name: 'LpCnt' },
      { db_field_name: 'pipe_extra_insulation', xml_field_name: 'PipeExtraIns' },
      { db_field_name: 'annual_solar_fraction', xml_field_name: 'AnnualSolFrac' }
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
    %w(New Existing Altered)
  end

  def type_enums
    [
      '- specify -'
    ]
  end

  def distribution_type_enums
    [
      '- None -'
    ]
  end
end
