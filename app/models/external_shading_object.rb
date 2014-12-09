class ExternalShadingObject
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :status, type: String
  field :transmittance_schedule_reference, type: String
  field :solar_reflectance, type: Float
  field :visible_reflectance, type: Float

  has_many :poly_loops, dependent: :destroy
  belongs_to :project


  def self.children_models
    children = [
       { model_name: 'poly_loop', xml_name: 'PolyLp' }
    ]
  end

  def self.xml_fields
    xml_fields = [
      {:db_field_name=>"name", :xml_field_name=>"Name"},
      {:db_field_name=>"status", :xml_field_name=>"Status"},
      {:db_field_name=>"transmittance_schedule_reference", :xml_field_name=>"TransSchRef"},
      {:db_field_name=>"solar_reflectance", :xml_field_name=>"SolRefl"},
      {:db_field_name=>"visible_reflectance", :xml_field_name=>"VisRefl"}
    ]
  end


  # This method is autogenerated. Do not change directly.
  def to_sdd_xml(parent, xml)
    xml.send(parent[:xml_name]) do
      self.class.xml_fields.each do |field|
        xml.send(:"#{field[:xml_field_name]}", self[field[:db_field_name]]) if self[field[:db_field_name]]
      end
      # go through children if they have something to add, call their methods
      kids = self.class.children_models
      unless kids.nil? || kids.empty?
        kids.each do |k|
          models = self.send(k[:model_name].pluralize)
          models.each do |m|
            m.to_sdd_xml(k, xml)
          end
        end
      end
    end
  end
      
  # This method is autogenerated. Do not change directly.
  # Take the map of model name and xml name, and the hash (from the XML).
  def self.from_sdd_json(parent, h)
    o = nil
    if parent && h
      self_model = parent[:model_name].camelcase(:upper).constantize
      o = self_model.create_from_sdd_json(parent, h)
      if o
        o.create_children_from_sdd_json(parent, h)
        o.save!
        o.reload # in case of relationships being updated
      end
    end

    o
  end
  
  # This method is autogenerated. Do not change directly.
  def self.create_from_sdd_json(parent, h)
    new_h = {}

    # Find fields as defined by the XML
    self_model = parent[:model_name].camelcase(:upper).constantize
    self_model.xml_fields.each do |field|
      if h[field[:xml_field_name]]
        logger.debug "Field Data Type: #{self_model.fields[field[:db_field_name]].options[:type]}"
        if self_model.fields[field[:db_field_name]].options[:type].to_s == 'Array'
          logger.debug "Data model has an array as the field"
          # check if the hash has an array, otherwise make it an array
          if h[field[:xml_field_name]].is_a? Array
            logger.debug "XML/JSON field is already an Array"
            new_h[field[:db_field_name]] = h[field[:xml_field_name]]
          else
            new_h[field[:db_field_name]] = [h[field[:xml_field_name]]]
          end
        else
          new_h[field[:db_field_name]] = h[field[:xml_field_name]]
        end

      end
    end

    o = self_model.new(new_h) unless new_h.empty?

    o
  end

  # This method is autogenerated. Do not change directly.
  def create_children_from_sdd_json(parent, h)
    # Go through the children
    self_model = parent[:model_name].camelcase(:upper).constantize
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
                model["#{parent[:model_name]}_id"] = self.id
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
              model["#{parent[:model_name]}_id"] = self.id
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
    [
      'New',
      'Existing'
    ]
  end
end