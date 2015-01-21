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

# Remove the default site which seems to be installed in the conf.d directory and is loaded.
bash 'delete_nginx_default_site' do
  cwd 'etc/nginx/conf.d'
  code <<-EOH
    rm -f default.conf
  EOH
end


# Set an selinux bool to allow socket connections (need to find the sebool to allow this)
bash "set_selinux_to_permissive" do
  user 'root'
  code <<-EOH
    setenforce 0
  EOH
end


# set iptables
include_recipe "iptables"

iptables_rule "default_ip_rules"


