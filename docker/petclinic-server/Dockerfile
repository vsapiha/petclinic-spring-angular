FROM training/base:2.0.0

ARG maven_version=3.9.11

ENV MAVEN_HOME=/opt/maven
ENV PATH=$MAVEN_HOME/bin:$PATH

# Install Java 11
RUN yum -y update && \
    dnf -y install wget git java-11-openjdk && \
    yum -y clean all

# Install Maven 3.9.11
RUN wget -O maven.tar.gz "https://archive.apache.org/dist/maven/maven-3/$maven_version/binaries/apache-maven-$maven_version-bin.tar.gz" && \
    wget -O maven.tar.gz.sha512 "https://downloads.apache.org/maven/maven-3/$maven_version/binaries/apache-maven-$maven_version-bin.tar.gz.sha512" && \
    echo "$(cat maven.tar.gz.sha512)  maven.tar.gz" | sha512sum --check && \
    tar -xzf maven.tar.gz -C /opt && \
    mv /opt/apache-maven-$maven_version /opt/maven && \
    rm maven.tar.gz maven.tar.gz.sha512

#build the application
WORKDIR /usr/src/java-code
RUN git clone https://github.com/vsapiha/petclinic-spring-angular.git && \
    mvn -q -B -f /usr/src/java-code/petclinic-spring-angular/pom.xml package -DskipTests

WORKDIR /home/elastic

RUN mkdir /java-agent
RUN cp -v /usr/src/java-code/spring-petclinic/target/spring-petclinic-1.5.16.jar /home/elastic/

# COPY spring-petclinic-1.5.16.jar .
COPY elastic-apm-agent-1.55.0.jar ./java-agent
COPY opentelemetry-javaagent-2.18.0.jar ./java-agent

COPY conf/ /home/elastic
COPY scripts/ /root/start-scripts/

#RUN wget -O /java-agent/elastic-apm-agent-1.55.0.jar https://search.maven.org/remotecontent?filepath=co/elastic/apm/elastic-apm-agent/1.55.0/elastic-apm-agent-1.55.0.jar

RUN chown elastic:elastic /home/elastic/*.jar
RUN chown elastic:elastic /home/elastic/java-agent
RUN chmod a+x /root/start-scripts/*

EXPOSE 8080

CMD ["/root/startup.sh"]
