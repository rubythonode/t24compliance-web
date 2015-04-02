class FenestrationConstruction
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :fenestration_type, type: String
  field :fenestration_product_type, type: String
  field :assembly_context, type: String
  field :certification_method, type: String
  field :skylight_glazing, type: String
  field :skylight_curb, type: String
  field :operable_window_configuration, type: String
  field :greenhouse_garden_window, type: Integer
  field :fenestration_framing, type: String
  field :fenestration_panes, type: String
  field :glazing_tint, type: String
  field :window_divider, type: String
  field :diffusing, type: Integer
  field :shgc, type: Float
  field :shgc_center_of_glass, type: Float
  field :u_factor, type: Float
  field :u_factor_center_of_glass, type: Float
  field :visible_transmittance, type: Float
  field :visible_transmittance_center_of_glass, type: Float

  belongs_to :project

  def self.children_models
    children = [

    ]
  end

  def self.xml_fields
    xml_fields = [
      { db_field_name: 'name', xml_field_name: 'Name' },
      { db_field_name: 'fenestration_type', xml_field_name: 'FenType' },
      { db_field_name: 'fenestration_product_type', xml_field_name: 'FenProdType' },
      { db_field_name: 'assembly_context', xml_field_name: 'AssmContext' },
      { db_field_name: 'certification_method', xml_field_name: 'CertificationMthd' },
      { db_field_name: 'skylight_glazing', xml_field_name: 'SkyltGlz' },
      { db_field_name: 'skylight_curb', xml_field_name: 'SkyltCurb' },
      { db_field_name: 'operable_window_configuration', xml_field_name: 'OperableWinConfiguration' },
      { db_field_name: 'greenhouse_garden_window', xml_field_name: 'GreenhouseGardenWin' },
      { db_field_name: 'fenestration_framing', xml_field_name: 'FenFrm' },
      { db_field_name: 'fenestration_panes', xml_field_name: 'FenPanes' },
      { db_field_name: 'glazing_tint', xml_field_name: 'GlzTint' },
      { db_field_name: 'window_divider', xml_field_name: 'WinDivider' },
      { db_field_name: 'diffusing', xml_field_name: 'Diffusing' },
      { db_field_name: 'shgc', xml_field_name: 'SHGC' },
      { db_field_name: 'shgc_center_of_glass', xml_field_name: 'SHGCCOG' },
      { db_field_name: 'u_factor', xml_field_name: 'UFactor' },
      { db_field_name: 'u_factor_center_of_glass', xml_field_name: 'UFactorCOG' },
      { db_field_name: 'visible_transmittance', xml_field_name: 'VT' },
      { db_field_name: 'visible_transmittance_center_of_glass', xml_field_name: 'VTCOG' }
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

  def fenestration_type_enums
    %w(VerticalFenestration Skylight)
  end

  def assembly_context_enums
    %w(Manufactured FieldFabricated SiteBuilt)
  end

  def operable_window_configuration_enums
    [
      '- specify -',
      'CasementAwning',
      'Sliding'
    ]
  end

  def window_divider_enums
    [
      '- specify -',
      'TrueDividedLite',
      'DividerBtwnPanesLessThan7_16in',
      'DividerBtwnPanesGreaterThanOrEqualTo7_16in'
    ]
  end
end
