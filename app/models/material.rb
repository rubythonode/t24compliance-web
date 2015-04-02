class Material
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :code_category, type: String
  field :code_item, type: String
  field :framing_material, type: String
  field :framing_configuration, type: String
  field :framing_depth, type: String
  field :cavity_insulation, type: Float
  field :cavity_insulation_option, type: String
  field :composite_material_notes, type: String
  field :header_insulation, type: Float
  field :cmu_weight, type: String
  field :cmu_fill, type: String
  field :spandrel_panel_insulation, type: Float
  field :icces_report_number, type: String
  field :insulation_outside_waterproof_membrane, type: Integer

  belongs_to :project

  def self.children_models
    children = [

    ]
  end

  def self.xml_fields
    xml_fields = [
      { db_field_name: 'name', xml_field_name: 'Name' },
      { db_field_name: 'code_category', xml_field_name: 'CodeCat' },
      { db_field_name: 'code_item', xml_field_name: 'CodeItem' },
      { db_field_name: 'framing_material', xml_field_name: 'FrmMat' },
      { db_field_name: 'framing_configuration', xml_field_name: 'FrmConfig' },
      { db_field_name: 'framing_depth', xml_field_name: 'FrmDepth' },
      { db_field_name: 'cavity_insulation', xml_field_name: 'CavityIns' },
      { db_field_name: 'cavity_insulation_option', xml_field_name: 'CavityInsOpt' },
      { db_field_name: 'composite_material_notes', xml_field_name: 'CompositeMatNotes' },
      { db_field_name: 'header_insulation', xml_field_name: 'HeaderIns' },
      { db_field_name: 'cmu_weight', xml_field_name: 'CMUWt' },
      { db_field_name: 'cmu_fill', xml_field_name: 'CMUFill' },
      { db_field_name: 'spandrel_panel_insulation', xml_field_name: 'SpandrelPanelIns' },
      { db_field_name: 'icces_report_number', xml_field_name: 'ICCESRptNum' },
      { db_field_name: 'insulation_outside_waterproof_membrane', xml_field_name: 'InsOutsdWtrprfMemb' }
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

  def code_category_enums
    [
      '- specify -',
      'Air',
      'Bldg Board and Siding',
      'Building Membrane',
      'Composite',
      'Concrete',
      'Concrete Sandwich Panel',
      'Finish Materials',
      'ICF Wall',
      'Insulation Batt',
      'Insulation Board',
      'Insulation Loose Fill',
      'Insulation Other',
      'Insulation Spray Applied',
      'Masonry Materials',
      'Masonry Units Hollow',
      'Masonry Units Solid',
      'Masonry Units with Fill',
      'Metal Insulated Panel Wall',
      'Plastering Materials',
      'Roofing',
      'SIPS Floor',
      'SIPS Roof',
      'SIPS Wall',
      'Spandrel Panels Curtain Walls',
      'Straw Bale Wall',
      'Woods'
    ]
  end

  def framing_material_enums
    [
      '- specify -',
      'Wood',
      'Metal'
    ]
  end

  def framing_configuration_enums
    [
      '- specify -',
      'Wall16inOC',
      'Wall24inOC',
      'WallAWS24inOC',
      'WallAWS48inOC',
      'Floor16inOC',
      'Floor24inOC',
      'Roof16inOC',
      'Roof24inOC',
      'Roof48inOC'
    ]
  end

  def framing_depth_enums
    [
      '- specify -',
      '0_5In',
      '0_75In',
      '1In',
      '1_5In',
      '2In',
      '2_5In',
      '3In',
      '3_5In',
      '4In',
      '4_5In',
      '5In',
      '5_5In',
      '7_25In',
      '9_25In',
      '11_25In'
    ]
  end

  def cavity_insulation_option_enums
    [
      '- specify -'
    ]
  end

  def cmu_weight_enums
    [
      '- specify -',
      'LightWeight',
      'MediumWeight',
      'NormalWeight',
      'ClayUnit'
    ]
  end

  def cmu_fill_enums
    [
      '- specify -',
      'Solid',
      'Empty',
      'Insulated'
    ]
  end
end
