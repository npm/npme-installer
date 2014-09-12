FROM    centos:centos7
MAINTAINER Marcello de Sales (marcello_desales@intuit.com)

## RHEL/CentOS 7 64-Bit ##
RUN rpm -Uvh http://dl.fedoraproject.org/pub/epel/beta/7/x86_64/epel-release-7-1.noarch.rpm

# Default programs + Install Node.js and npm
RUN yum install -y git nodejs npm --enablerepo=epel

# upgrade npm to 2.x.x on the VM you have provisioned:
RUN npm install npm@2.0.0-beta.3 -g

# Create non-root user npm Enterprise must be installed from an account that has passwordless sudo
RUN /usr/sbin/useradd --create-home --shell /bin/bash npme && echo 'root:admin' | chpasswd && \
    mkdir -p /.config/configstore /.local /.cache /.npm && chown -R npme /.npm /usr/lib /.config /.local /.cache

RUN npm install npme -g

# Set the username which is to run the container based on the image being built.
USER npme

ENTRYPOINT ["npme"]
CMD ["--help"]
