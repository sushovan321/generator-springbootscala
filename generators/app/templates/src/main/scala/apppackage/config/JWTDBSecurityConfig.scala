package <%= PACKAGE %>.config

import javax.annotation.PostConstruct

import <%= PACKAGE %>.security.jwt.{JWTAuthenticationFilter, TokenAuthenticationService}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.{HttpSecurity, WebSecurity}
import org.springframework.security.config.annotation.web.configuration.{EnableWebSecurity, WebSecurityConfigurerAdapter}
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
class SecurityConfig @Autowired()(tokenAuthenticationService: TokenAuthenticationService, authenticationManagerBuilder: AuthenticationManagerBuilder, userDetailsService: UserDetailsService) extends WebSecurityConfigurerAdapter {

  @PostConstruct def init(): Unit = {
      authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder)
  }

  @Bean def passwordEncoder = new BCryptPasswordEncoder

  override def configure(web: WebSecurity): Unit = {
    web.ignoring()
      .antMatchers(HttpMethod.OPTIONS, "/api/**")
  }

  @Bean
  override def authenticationManager(): AuthenticationManager = super.authenticationManager()

  override def configure(http: HttpSecurity): Unit = {
    http.csrf().disable().sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
      .authorizeRequests()
      .antMatchers("/api/login").permitAll()
      .antMatchers("/api/**").authenticated()
      .and().addFilterBefore(new JWTAuthenticationFilter(tokenAuthenticationService),
        classOf[UsernamePasswordAuthenticationFilter])

  }
}
