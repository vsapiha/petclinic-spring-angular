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
    mv /opt/apache-maven-$maven_version $MAVEN_HOME && \
    rm maven.tar.gz maven.tar.gz.sha512

#build the application
WORKDIR /usr/src/java-code
RUN git clone https://github.com/vsapiha/petclinic-spring-angular.git && \
    mvn -q -B -f /usr/src/java-code/petclinic-spring-angular/pom.xml package -DskipTests


WORKDIR /home/elastic

RUN cp -v /usr/src/java-code/petclinic-spring-angular/target/spring-petclinic-1.5.16.jar /home/elastic/

COPY conf/ /home/elastic
COPY scripts/ /root/start-scripts/

RUN curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar

RUN chown elastic:elastic /home/elastic/*.jar
RUN chown elastic:elastic /home/elastic/java-agent
RUN chmod a+x /root/start-scripts/*

EXPOSE 8080

CMD ["/root/startup.sh"]
