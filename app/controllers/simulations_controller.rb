class SimulationsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource :project # the resource is project
  before_action :set_simulation, only: [:show, :edit, :update, :destroy, :download_report]
  before_action :set_project, only: [:index, :update, :create, :bulk_sync]

  respond_to :json, :html

  # GET /simulations
  # GET /simulations.json
  def index
    @simulations = Simulation.all
    respond_with(@simulations)
  end

  # GET /simulations/1
  # GET /simulations/1.json
  def show
    # if there is a job_id, then grab the status of the job from sidekiq
    job = {}
    jobs_ahead = 0
    job['queue'] = {}

    if @simulation.job_id
      # this may be really slow if the queue gets large - is this ordered?
      Sidekiq::Queue.new.each do |j|
        jobs_ahead += 1
        break if j.jid == @simulation.job_id
      end

      job['queue'] = Sidekiq::Status::get_all @simulation.job_id
      job['queue']['size'] = Sidekiq::Queue.new.size
      job['queue']['jobs_ahead'] = jobs_ahead
      job['queue']['percent'] = Sidekiq::Status::at @simulation.job_id
      job['queue']['message'] = Sidekiq::Status::message @simulation.job_id
      logger.debug "queue information is #{job['queue']}"
    end

    # data # => {status: 'complete', update_time: 1360006573, vino: 'veritas'}
    # Sidekiq::Status::get     job_id, :vino #=> 'veritas'
    # Sidekiq::Status::at      job_id #=> 5
    # Sidekiq::Status::total   job_id #=> 100
    # Sidekiq::Status::message job_id #=> "Almost done"
    # Sidekiq::Status::pct_complete job_id #=> 5
    @data = @simulation.as_json(except: [:_id, :created_at, :updated_at, :project_id]).merge(job)
    @data[:id] = @simulation.id.to_s
    @data[:created_at] = @simulation.created_at
    @data[:updated_at] = @simulation.updated_at
    @data[:project_id] = @simulation.project_id.to_s
    respond_with @data
  end

  # GET /simulations/new
  def new
    @simulation = Simulation.new
  end

  # GET /simulations/1/edit
  def edit
  end

  # POST /simulations
  # POST /simulations.json
  def create
    @simulation = Simulation.new(simulation_params)

    respond_to do |format|
      if @simulation.save
        format.html { redirect_to @simulation, notice: 'Simulation was successfully created.' }
        format.json { render :show, status: :created, location: @simulation }
      else
        format.html { render :new }
        format.json { render json: @simulation.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /simulations/1
  # PATCH/PUT /simulations/1.json
  def update
    respond_to do |format|
      if @simulation.update(simulation_params)
        format.html { redirect_to @simulation, notice: 'Simulation was successfully updated.' }
        format.json { render :show, status: :ok, location: @simulation }
      else
        format.html { render :edit }
        format.json { render json: @simulation.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /simulations/1
  # DELETE /simulations/1.json
  def destroy
    @simulation.destroy
    respond_to do |format|
      format.html { redirect_to simulations_url, notice: 'Simulation was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def bulk_sync
    clean_params = simulation_params
    logger.info "CLEAN PARAMS: #{clean_params.inspect}"

    if @project
      @project.simulation.run

      logger.info "Simulation ID is #{@project.simulation.id}"

      respond_with @project.simulation
    else
      fail 'Could not find project to run'
    end
  end

  def download_report
    report_name = params[:report]

    # TODO: how to deal with report names that are not valid
    logger.info "seeing if #{report_name} is available for download"

    file = nil
    case report_name
      when 'compliance_xml'
        file = @simulation.compliance_report_xml
      when 'compliance_pdf'
        file = @simulation.compliance_report_pdf_path
      when 'openstudio_proposed'
        file = @simulation.openstudio_model_proposed
      when 'openstudio_baseline'
        file = @simulation.openstudio_model_baseline
      when 'analysis_xml'
        file = @simulation.analysis_results_xml
      when 'results_zip'
        file = @simulation.results_zip_file
    end

    if file && File.exist?(file)
      # replace the "in" in the filename
      new_filename = File.basename(file).gsub('in', @simulation.project.name.gsub(' ', '_'))
      send_data File.read(file), filename: new_filename, type: 'text/plain'
    else
      # TODO: how to error out here?
      # render :nothing => true, :status => :error
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_simulation
    @simulation = Simulation.find(params[:id])
  end

  def set_project
    @project = Project.find(params[:project_id])
    logger.info "Set project to #{@project}"
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def simulation_params
    logger.info 'validating parameters'
    # params.require(:simulation).permit(:filename)
    params.permit(:building_id, :project_id, :id, :report, data: [:action])
  end
end
