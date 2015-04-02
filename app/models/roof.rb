class Roof
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :status, type: String
  field :construct_assembly_reference, type: String
  field :area, type: Float
  field :azimuth, type: Float
  field :tilt, type: Float
  field :interior_solar_absorptance, type: Float
  field :interior_thermal_absorptance, type: Float
  field :interior_visible_absorptance, type: Float
  field :field_applied_coating, type: Integer
  field :crrc_initial_reflectance, type: Float
  field :crrc_aged_reflectance, type: Float
  field :crrc_initial_emittance, type: Float
  field :crrc_aged_emittance, type: Float
  field :crrc_initial_sri, type: Integer
  field :crrc_aged_sri, type: Integer
  field :crrc_product_id, type: String
  field :roof_aged_solar_reflectance, type: Float
  field :roof_aged_thermal_emittance, type: Float
  # should not go in XML:
  field :construction_library_id, type: BSON::ObjectId

  belongs_to :space
  has_many :skylights, dependent: :destroy, autosave: true
  has_many :poly_loops, dependent: :destroy

  def self.children_models
    children = [
      { model_name: 'skylight', xml_name: 'Skylt' },
      { model_name: 'poly_loop', xml_name: 'PolyLp' }
    ]
  end

  def self.xml_fields
    xml_fields = [
      { db_field_name: 'name', xml_field_name: 'Name' },
      { db_field_name: 'status', xml_field_name: 'Status' },
      { db_field_name: 'construct_assembly_reference', xml_field_name: 'ConsAssmRef' },
      { db_field_name: 'area', xml_field_name: 'Area' },
      { db_field_name: 'azimuth', xml_field_name: 'Az' },
      { db_field_name: 'tilt', xml_field_name: 'Tilt' },
      { db_field_name: 'interior_solar_absorptance', xml_field_name: 'IntSolAbs' },
      { db_field_name: 'interior_thermal_absorptance', xml_field_name: 'IntThrmlAbs' },
      { db_field_name: 'interior_visible_absorptance', xml_field_name: 'IntVisAbs' },
      { db_field_name: 'field_applied_coating', xml_field_name: 'FieldAppliedCoating' },
      { db_field_name: 'crrc_initial_reflectance', xml_field_name: 'CRRCInitialRefl' },
      { db_field_name: 'crrc_aged_reflectance', xml_field_name: 'CRRCAgedRefl' },
      { db_field_name: 'crrc_initial_emittance', xml_field_name: 'CRRCInitialEmittance' },
      { db_field_name: 'crrc_aged_emittance', xml_field_name: 'CRRCAgedEmittance' },
      { db_field_name: 'crrc_initial_sri', xml_field_name: 'CRRCInitialSRI' },
      { db_field_name: 'crrc_aged_sri', xml_field_name: 'CRRCAgedSRI' },
      { db_field_name: 'crrc_product_id', xml_field_name: 'CRRCProdID' },
      { db_field_name: 'roof_aged_solar_reflectance', xml_field_name: 'RoofAgedSolRefl' },
      { db_field_name: 'roof_aged_thermal_emittance', xml_field_name: 'RoofAgedThrmlEmittance' }
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

  # Set the construction id by doing a look up on the construction
  def set_construction_id
    fail "No construction assembly reference specified for #{name}" unless construct_assembly_reference

    cons = Construction.where(name: construct_assembly_reference).first
    fail "Could not find construction '#{construct_assembly_reference}' in construction library" unless cons

    self.construction_library_id = cons.id

    save!
  end

  def status_enums
    %w(New Existing Altered)
  end
end
