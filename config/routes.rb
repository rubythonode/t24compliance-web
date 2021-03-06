Rails.application.routes.draw do
  root to: 'users#home'

  devise_for :users
  resources :users do
    get 'admin', on: :collection
    get 'home', on: :collection
  end

  devise_scope :user do
    get '/login' => 'devise/sessions#new'
    get '/logout' => 'devise/sessions#destroy'
  end

  require 'sidekiq/web'
  require 'sidekiq-status/web'
  authenticate :user, lambda { |u| u.admin? } do
    mount Sidekiq::Web => '/sidekiq'
  end

  resources :inputs, only: [:index, :show] do
    get 'datafields'
    match 'datafields' => 'inputs#datafields', :via => [:get, :post]
  end

  get 'wizard' => 'projects#wizard'
  resources :buildings
  resources :projects do
    get 'download', on: :member
  end

  # TODO:  restrict to needed routes only (bulk_sync, index, show)

  # these belong to project. may not need routes for them
  resources :materials
  resources :construct_assemblies
  resources :door_constructions
  resources :fenestration_constructions
  resources :luminaires, only: [:index, :show] do
    post 'bulk_sync', on: :collection
  end

  # libraries
  resources :constructions, only: [:show, :index]
  resources :fenestrations, only: [:show, :index]
  resources :door_lookups, only: [:show, :index]
  resources :space_function_defaults, only: [:show, :index]
  resources :zip_codes, only: [:show, :index]

  # depend on project
  resources :construction_defaults     # only index, create for angular

  # depend on building
  resources :building_stories do
    post 'bulk_sync', on: :collection
  end

  # this handles air and zone systems
  resources :zone_systems do
    post 'bulk_sync', on: :collection
  end
  resources :fluid_systems do
    post 'bulk_sync', on: :collection
  end
  resources :spaces do
    post 'bulk_sync', on: :collection
  end
  resources :simulations, only: [:show, :index] do
    get 'download_report', on: :member
    post 'bulk_sync', on: :collection
  end
  resources :thermal_zones do
    post 'bulk_sync', on: :collection
  end
  resources :terminal_units do
    post 'bulk_sync', on: :collection
  end

  # don't need direct routes for these (accessed through other controllers)
  # resources :air_systems
  # resources :windows
  # resources :underground_floors
  # resources :fans
  # resources :coil_coolings
  # resources :air_segments
  # resources :roofs
  # resources :ceilings
  # resources :heat_rejections
  # resources :interior_walls
  # resources :exterior_floors
  # resources :pumps
  # resources :boilers
  # resources :chillers
  # resources :fluid_segments
  # resources :coil_heatings
  # resources :doors
  # resources :skylights
  # resources :underground_walls
  # resources :interior_floors
  # resources :exterior_walls
  # resources :interior_lighting_systems
  # resources :outside_air_controls
  # resources :water_heaters

  # non-revised below
  #   resources :holidays
  #
  #   resources :design_days
  #
  #   resources :recirculation_water_heaters
  #
  #   resources :recirculation_dhw_systems
  #
  #   resources :evaporative_coolers
  #
  #   resources :external_shading_objects
  #
  #   resources :curve_double_quadratics
  #
  #   resources :curve_linears
  #
  #   resources :schedules
  #
  #   resources :curve_cubics
  #
  #   resources :curve_quadratics
  #
  #   resources :schedule_weeks
  #
  #   resources :schedule_days
  #
  #   resources :cartesian_points
  #
  #   resources :poly_loops
end
