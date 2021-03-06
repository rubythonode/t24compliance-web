class InputsController < ApplicationController
  load_and_authorize_resource

  def dashboard
  end

  def index
    @inputs = Input.all.order_by(:display_name.asc)

    respond_to do |format|
      format.json do
        render json: @inputs.as_json
      end
      format.html
    end
  end

  def show
    @input = Input.find(params[:id])
    respond_to do |format|
      format.json do
        render json: @input.as_json
      end
      format.html
    end
  end

  def datafields
    @input = Input.find(params[:input_id])

    # save changes
    if request.post?

      @input.data_fields.each do |df|
        # save added fields
        if params[:remove_fields] && params[:remove_fields].include?(df['name'])
          df['remove'] = true
        else
          df['remove'] = false
        end

        if params[:set_as_constant_fields] && params[:set_as_constant_fields].include?(df['name'])
          df['set_as_constant'] = true
        else
          df['set_as_constant'] = false
        end

        df['constant_value'] = params[df['name'] + '_constant']
        df['comments'] = params[df['name'] + '_comments']
        df['conditional_control_field'] = params[df['name'] + '_cond_control']
      end
      @input.save!
    end

    respond_to do |format|
      format.html
    end
  end
end
