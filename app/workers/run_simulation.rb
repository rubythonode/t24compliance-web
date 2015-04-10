# this is the workhorse to run the docker container.
# This method is run in the background as a delayed job task. If you change this file, then you will need to
# restart SideKiq

class RunSimulation
  include Sidekiq::Worker
  sidekiq_options retry: 1 #, backtrace: true

  def perform(simulation_id)
    @simulation = Simulation.find(simulation_id)
    success = false
    status_message = ''
    current_dir = Dir.pwd
    File.delete "#{@simulation.run_path}/docker_run.receipt" if File.exist? "#{@simulation.run_path}/docker_run.receipt"
    threads = []
    begin
      @simulation.status = 'started'
      @simulation.save!

      if Dir.exist? @simulation.run_path
        logger.warn "Run for '#{@simulation.project.name}' in directory '#{@simulation.run_path}' already exists. Deleting simulation results..."
        FileUtils.rm_rf @simulation.run_path
      end
      run_filename = 'in.xml'
      FileUtils.mkdir_p @simulation.run_path

      # save the xml instance
      @simulation.project.xml_save("#{@simulation.run_path}/#{run_filename}")
      fail "Simulation file does not exist: #{File.join(@simulation.run_path, run_filename)}" unless File.exist? File.join(@simulation.run_path, run_filename)

      # This section needs to go into an initializer
      # If you are using boot2docker, then you have to deal with all these shananigans
      # https://github.com/swipely/docker-api/issues/202
      ENV['DOCKER_URL'] = ENV['DOCKER_HOST'] if ENV['DOCKER_HOST']
      if ENV['DOCKER_URL']
        logger.info "Docker URL is #{ENV['DOCKER_URL']}:#{ENV['DOCKER_URL'].class}"
        cert_path = File.expand_path ENV['DOCKER_CERT_PATH']
        Docker.options = {
            client_cert: File.join(cert_path, 'cert.pem'),
            client_key: File.join(cert_path, 'key.pem'),
            ssl_ca_file: File.join(cert_path, 'ca.pem'),
            scheme: 'https' # This is important when the URL starts with tcp://
        }
        logger.info "Docker options are set to #{Docker.options}"
      else
        ENV['DOCKER_URL'] = 'unix:///var/run/docker.sock' unless ENV['DOCKER_URL']
        logger.info 'No Docker IP found. Assuming that you are running Docker locally (on linux with a socket) if not, set DOCKER_URL ENV variable to the Docker socket'
      end


      # Kill after 1 hour at the moment
      logger.info "Setting Excon timeouts to #{60*60} seconds"
      docker_container_timeout = 60 * 60 # 60 minutes  # how to catch a timeout error?  test this?
      Excon.defaults[:write_timeout] = docker_container_timeout
      Excon.defaults[:read_timeout] = docker_container_timeout
      Excon.defaults[:ssl_verify_peer] = false

      # check if docker is alive
      fail 'Docker is not running!' unless Docker.validate_version!

      Dir.chdir(@simulation.run_path)
      logger.info "Current working directory is: #{Dir.getwd}"

      run_command = %W(/var/cbecc-com-files/run.sh -i /var/cbecc-com-files/run/#{run_filename})
      logger.info "Docker run method is: #{run_command}"
      c = Docker::Container.create({'Cmd' => run_command,
                                    'Image' => 'nllong/cbecc-com',
                                    'AttachStdout' => true}
      )
      logger.info "Docker container is: #{c.inspect}"
      c.start('Binds' => ["#{@simulation.run_path}:/var/cbecc-com-files/run/"])

      # Per NEM: Check for tail gem. Most likely will have to be a separate thread.
      threads << Thread.new do
        # Add a Timeout!
        # Look at File::Tail (http://flori.github.io/file-tail/doc/index.html)
        (1..5).each do |c|
          logger.info "Checking log file -- iteration #{c}"
          sleep 10

          if File.exist? "#{@simulation.run_path}/docker_run.receipt"
            logger.info "Docker task has completed, killing the log watch thread"
            break
          end
        end

        # File::Tail::Logfile.tail(filename) do |line|
        #   break if File.exist("#{@simulation.run_path}/CbeccComWrapper.json")
        #   #    puts line
        #   #  end
        # end

      end

      # this command is kind of weird. From what I understand, this is the container timeout (defaults to 60 seconds)
      # This may be of interest: http://kimh.github.io/blog/en/docker/running-docker-containers-asynchronously-with-celluloid/
      logger.info "Threading docker wait..."
      threads << Thread.new do
        # remove the 'receipt' file
        File.delete "#{@simulation.run_path}/docker_run.receipt" if File.exist? "#{@simulation.run_path}/docker_run.receipt"
        begin
          c.wait(docker_container_timeout)
        rescue => e

        ensure
          File.open( "#{@simulation.run_path}/docker_run.receipt", 'w') { |f| f << Time.now }
          logger.info "docker wait finished"
        end
      end

      threads.each { |t|  t.join }

      # Kill the monitoring thread
      # t.kill

      stdout, stderr = c.attach(stream: false, stdout: true, stderr: true, logs: true)

      logger.debug stdout
      logger.info 'Finished running simulation'
      success = process_results

      unless @simulation.save!
        success = false
        status_message = 'Could not save the object back into the database'
      end
    rescue => e
      m = "Exception raised: #{e.message}:#{e.backtrace.join("\n")}"
      logger.error m
      @simulation.status_message = e.message

      # make sure to fail out so sidekiq knows that this is a dead job
      fail m
    ensure
      Dir.chdir current_dir
      @simulation.status = success ? 'completed' : 'error'
      update_percent_complete(100)
      @simulation.status_message = status_message
      @simulation.save!
    end
  end

  private

  def process_results
    # Clean up some of the files that are not needed
    %w(runmanager.db).each do |f|
      logger.debug "removing file: #{@simulation.run_path}/#{f}"
      File.delete File.join(@simulation.run_path, f) if File.exist? File.join(@simulation.run_path, f)
    end

    Dir["#{@simulation.run_path}/*"].each do |f|
      if f =~ /AnalysisResults-BEES.pdf/
        logger.info 'saving the compliance report path to model'
        @simulation.compliance_report_pdf_path = f
      elsif f =~ /.*\s-\sAnalysisResults-BEES.xml/
        logger.info "BEES XML #{f}"
        #@simulation.
      elsif f =~ /.*\s-\sAnalysisResults.xml/
        logger.info "XML #{f}"
      elsif f =~ /CbeccComWrapper.json/
        # Save the state based on the CbeccComWrapper.json file that is persisted
        json = MultiJson.load(File.read(f), symbolize_keys: true) if File.exist?(f)
        logger.info "pyCBECC responded with: #{json}"

        @simulation.cbecc_code = json.keys.first.to_s.to_i
        @simulation.cbecc_code_description = json.values.first
      elsif f =~ /.*\s-\sab.*/
        logger.info "Annual baseline results #{f}"
      elsif f =~ /.*\s-\szb.*/
        logger.info "Sizing simulation results #{f}"
      elsif f =~ /.*\s-\sap.*/
        logger.info "Annual proposed results #{f}"
      end
    end

    # parse the log file for any errors
    errors = []
    log_file = find_log_file
    if log_file && File.exist?(log_file)
      s = File.read log_file
      s.scan(/Error:\s{2}.*$/).each do |error|
        errors << error.chomp
      end

      @simulation.error_messages = errors
    end

    # success is defined as no error messages
    @simulation.error_messages.empty?
  end

  def update_percent_complete(percent)
    @simulation.percent_complete = percent
    @simulation.save!
  end

  def find_log_file
    Dir["#{@simulation.run_path}/*.log"].first
  end

end
