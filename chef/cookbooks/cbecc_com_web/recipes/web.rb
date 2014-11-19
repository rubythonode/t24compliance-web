#
# Author:: Nicholas Long (<nicholas.long@.nrel.gov>)
# Cookbook Name:: cbecc_com_web
# Recipe:: web
#

# add users in a deploy group
node[:cbecc_com_web][:deploy_users].each do |u|
  group "deploy" do
    members u
    append true

    only_if "getent passwd #{u}"
  end

  group "rbenv" do
    members u
    append true

    only_if "getent passwd #{u}"
  end
end

user 'deploy' do
  gid 'deploy'
  shell "/bin/bash"
  system true
  action :create
end

# setup the www directory and the sticky bit
directory "/var/www" do
#  user 'deploy'
  group 'deploy'
  mode '02775'
end

# # setup the www directory
# %w(/etc/nginx/sites-available /etc/nginx/sites-enabled).each do |d|
#   directory d do
#     #user 'www-data'
#     group 'deploy'
#     mode '0775'
#   end
# end

# cron 'cbecc_com_json_backup' do
#   minute '0'
#   hour '6'
#   user 'root'
#   command %Q{
#     cd ~ && curl -SL http://localhost/inputs.json -o inputs_$(date +%Y%m%d_%H%M%S).json
#   }
# end

# Set an selinux bool to allow for the connection

# set ip tables
include_recipe "iptables"
iptables_rule "default_ip_rules"


