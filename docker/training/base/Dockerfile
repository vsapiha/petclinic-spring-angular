FROM oraclelinux:9

RUN yum install -y epel-release && \
    yum -y update && \
    yum install -y unzip which iproute nano emacs openssh-server openssh-clients wget sudo vim less openssl supervisor git net-tools && \
    yum -y clean all

RUN groupadd -g 1000 elastic && \
    useradd -u 1000 -g 1000 elastic

WORKDIR /home/elastic

RUN ssh-keygen -t rsa -N "" -f /etc/ssh/ssh_host_key \
    && ssh-keygen -t rsa -N "" -f /etc/ssh/ssh_host_rsa_key \
    && ssh-keygen -t rsa -N "" -f /etc/ssh/ssh_host_ecdsa_key \
    && ssh-keygen -t rsa -N "" -f /etc/ssh/ssh_host_ed25519_key \
    && ssh-keygen -t rsa -N "" -f /etc/ssh/ssh_host_dsa_key \
    && mkdir -p /home/elastic/.ssh /etc/supervisor/conf.d /root/start-scripts/ /shared_folder/

COPY conf/id_rsa /home/elastic/.ssh/id_rsa
COPY conf/id_rsa.pub /home/elastic/.ssh/id_rsa.pub
COPY conf/sshd_config /etc/ssh/
COPY conf/hosts /etc/
COPY conf/supervisord.conf /etc/supervisor/supervisord.conf
COPY scripts/ /root/start-scripts/
COPY conf/startup.sh /root/
COPY conf/.vimrc /home/elastic/
COPY conf/.vimrc /home/root/

RUN touch /home/elastic/.ssh/authorized_keys \
    && cat /home/elastic/.ssh/id_rsa.pub >> /home/elastic/.ssh/authorized_keys \
    && chmod -R 600 /home/elastic/.ssh/id_* \
    && chown -R elastic:elastic /etc/ssh/ /home/elastic/ /shared_folder/ \
    && echo "set bg=dark" >> /etc/vimrc \
    && echo "elastic:rU998XXWEZ53DeCk" | chpasswd

EXPOSE 22

CMD ["/root/startup.sh"]
