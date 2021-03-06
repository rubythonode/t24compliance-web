# Simple Role Syntax
# ==================
# Supports bulk-adding hosts to roles, the primary server in each group
# is considered to be the first unless any hosts have the primary
# property set.  Don't declare `role :all`, it's a meta role.

set :rbenv_custom_path, '/opt/rbenv'
# set :rbenv_type, :system
set :user, ask('User name:', 'typically your NREL username')
set :rbenv_ruby, 'jruby-1.7.15'
set :branch, :develop
set :tmp_dir, "/home/#{fetch(:user)}/tmp"
set :rails_env, 'staging'
set :nginx_server_name, 'rordev-web.development.nrel.gov'
set :branch, :develop
server 'rordev-web.development.nrel.gov', user: ENV['USER'], roles: %w(web app db)
