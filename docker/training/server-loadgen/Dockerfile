FROM training/base:2.0.0

# docker run -it --rm --network es_bridge training/server-loadgen:2.0.0 bash
ARG jmeter_version=5.6.3

ENV JMETER_HOME=/opt/jmeter

ENV PATH=$JMETER_HOME/bin:$PATH

# Install Java 11
RUN yum -y update && \
    dnf -y install wget git java-11-openjdk && \
    yum -y clean all

# Install Apache JMeter
RUN wget -O apache-jmeter-$jmeter_version.tgz https://dlcdn.apache.org//jmeter/binaries/apache-jmeter-$jmeter_version.tgz && \
    wget -O apache-jmeter-$jmeter_version.tgz.sha512 https://www.apache.org/dist/jmeter/binaries/apache-jmeter-$jmeter_version.tgz.sha512 && \
    echo "$(cat apache-jmeter-$jmeter_version.tgz.sha512)" | sha512sum --check && \
    tar -xzf apache-jmeter-$jmeter_version.tgz -C /opt && \
    mv /opt/apache-jmeter-$jmeter_version ${JMETER_HOME} && \
    rm apache-jmeter-$jmeter_version.tgz apache-jmeter-$jmeter_version.tgz.sha512


COPY jmeter-petclinic-server.jmx ${JMETER_HOME}

RUN mkdir /opt/data_files
COPY *.csv /opt/data_files/

COPY entrypoint.sh /

WORKDIR	${JMETER_HOME}

CMD ["/bin/bash", "/entrypoint.sh"]
