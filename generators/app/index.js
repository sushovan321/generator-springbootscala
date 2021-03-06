var Generator = require('yeoman-generator');

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);

    this.copy = function(source, target) {
      this.fs.copy(
        this.templatePath(source),
        this.destinationPath(target)
      );
    }

    this.copyTpl = function(source, target) {
      this.fs.copyTpl(
        this.templatePath(source),
        this.destinationPath(target),
        this.templateProperites
      );
    }
  }

  prompting() {
    return this.prompt([ {
      type : 'input',
      name : 'name',
      message : 'What is name of your project?',
      default : this.appname,
      validate : input => /^([a-zA-Z0-9]*)$/.test(input) ? true : "Special characters are not allowed"
    },
      {
        type : 'input',
        name : 'package',
        message : 'What is your default scala package name?',
        default : 'com.' + this.appname,
        validate : input => /^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input) ? true : "Please provide valid package name"
      },
      {
        type : 'list',
        name : 'rdbms',
        message : 'Which relational database you want to configure for your project?',
        choices : [ 'None', 'Mysql' ],
        default : 'None'
      },
      {
        type : 'list',
        name : 'auth',
        message : 'Which authentication mechanism you want to configure for your project?',
        choices : [ 'None', 'JWT' ],
        default : 'None'
      },
      {
        type : 'confirm',
        name : 'elasticsearch',
        message : 'Do you want to add configuration for elasticsearch?',
        default : false
      },
      {
        type : 'confirm',
        name : 'docker',
        message : 'Do you want to add configuration for docker?',
        default : false
      } ]).then((answers) => {
      this.userinput = answers;
      this.packagedir = answers.package.replace(/\./g, "/"),
      this.capitalizedProjectName = this.userinput.name.charAt(0).toUpperCase() + this.userinput.name.slice(1)

      this.templateProperites = {
        NAME : this.userinput.name,
        CAPITALIZED_NAME : this.capitalizedProjectName,
        PACKAGE : this.userinput.package,
        RDBMS : this.userinput.rdbms,
        AUTH : this.userinput.auth,
        ELASTICSEARCH : this.userinput.elasticsearch,
        DOCKER : this.userinput.docker,
        SCALA_VERSION : 2.12
      };

    });
  }

  writing() {
    this.copy('gradlew', 'gradlew');
    this.copy('gradlew.bat', 'gradlew.bat');
    this.copy('gradle/wrapper/gradle-wrapper.jar', 'gradle/wrapper/gradle-wrapper.jar');
    this.copy('gradle/wrapper/gradle-wrapper.properties', 'gradle/wrapper/gradle-wrapper.properties');
    this.copyTpl('build.gradle', 'build.gradle');
    this.copyTpl('gradle.properties', 'gradle.properties');
    this.copyTpl('src/main/scala/apppackage/SpringbootscalaApplication.scala',
      'src/main/scala/' + this.packagedir + '/' + this.capitalizedProjectName + 'Application.scala');
    this.copyTpl('src/main/scala/apppackage/config/ApplicationProperties.scala',
      'src/main/scala/' + this.packagedir + '/config/ApplicationProperties.scala');
    this.copyTpl('src/main/scala/apppackage/config/WebConfig.scala',
      'src/main/scala/' + this.packagedir + '/config/WebConfig.scala');

    this.copyTpl('src/main/scala/apppackage/web/rest/SampleController.scala',
      'src/main/scala/' + this.packagedir + '/web/rest/SampleController.scala');
    this.copyTpl('src/main/scala/apppackage/service/SampleService.scala',
      'src/main/scala/' + this.packagedir + '/service/SampleService.scala');

    this.copyTpl('src/main/resources/application.yml',
      'src/main/resources/application.yml');
    this.copyTpl('src/main/resources/logback-spring.xml',
      'src/main/resources/logback-spring.xml');

    if (this.templateProperites.RDBMS !== 'None') {
      this.copyTpl('src/main/resources/liquibase',
        'src/main/resources/liquibase');
    }

    if (this.templateProperites.AUTH !== 'None') {
      if (this.templateProperites.AUTH === 'JWT') {
        if(this.templateProperites.RDBMS !== 'None') {
          this.copyTpl('src/main/scala/apppackage/config/JWTDBSecurityConfig.scala',
            'src/main/scala/' + this.packagedir + '/config/SecurityConfig.scala');
          this.copyTpl('src/main/scala/apppackage/security/jwt/JWTUserDetailService.scala',
            'src/main/scala/' + this.packagedir + '/security/jwt/JWTUserDetailService.scala');

          this.copyTpl('src/main/scala/apppackage/domain/User.scala',
            'src/main/scala/' + this.packagedir + '/domain/User.scala');
          this.copyTpl('src/main/scala/apppackage/domain/Authority.scala',
            'src/main/scala/' + this.packagedir + '/domain/Authority.scala');

          this.copyTpl('src/main/scala/apppackage/repository/UserRepository.scala',
            'src/main/scala/' + this.packagedir + '/repository/UserRepository.scala');
          this.copyTpl('src/main/scala/apppackage/repository/AuthorityRepository.scala',
            'src/main/scala/' + this.packagedir + '/repository/AuthorityRepository.scala');
        } else {
          this.copyTpl('src/main/scala/apppackage/config/JWTMemSecurityConfig.scala',
            'src/main/scala/' + this.packagedir + '/config/SecurityConfig.scala');
        }
        this.copyTpl('src/main/scala/apppackage/web/rest/vm/user/Login.scala',
          'src/main/scala/' + this.packagedir + '/web/rest/vm/user/Login.scala');
        this.copyTpl('src/main/scala/apppackage/web/rest/UsersController.scala',
          'src/main/scala/' + this.packagedir + '/web/rest/UsersController.scala');
        
        this.copyTpl('src/main/scala/apppackage/security/SecurityConstants.scala',
          'src/main/scala/' + this.packagedir + '/security/SecurityConstants.scala');
        this.copyTpl('src/main/scala/apppackage/security/jwt/JWTAuthenticationFilter.scala',
          'src/main/scala/' + this.packagedir + '/security/jwt/JWTAuthenticationFilter.scala');
        this.copyTpl('src/main/scala/apppackage/security/jwt/TokenAuthenticationService.scala',
          'src/main/scala/' + this.packagedir + '/security/jwt/TokenAuthenticationService.scala');
        
      }
    }

    if(this.userinput.elasticsearch) {
      this.copyTpl('src/main/scala/apppackage/config/ESConfig.scala',
        'src/main/scala/' + this.packagedir + '/config/ESConfig.scala');
    }

    if(this.userinput.docker) {
      this.copyTpl('Dockerfile',
        'Dockerfile');
      this.copyTpl('docker-compose.yml',
        'docker-compose.yml');
    }

    const testDir = (this.templateProperites.AUTH === 'None') ? "noauth" : "auth";

    this.copyTpl('src/test/scala/apppackage/' + testDir + '/AbstractTests.scala',
      'src/test/scala/' + this.packagedir + '/AbstractTests.scala');
    this.copyTpl('src/test/scala/apppackage/' + testDir + '/SampleControllerTests.scala',
      'src/test/scala/' + this.packagedir + '/SampleControllerTests.scala');
    this.copyTpl('src/test/resources',
      'src/test/resources');
  }

};