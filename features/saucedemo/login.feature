@smoke @login
Feature: SauceDemo login
  As a user of SauceDemo
  I want robust login automation
  So that auth flows remain stable

  @sanity
  Scenario: Sanity — standard_user can log in
    Given I open the SauceDemo login page
    When I login with username "standard_user" and password "secret_sauce"
    Then login should be "success"

  Scenario Outline: Login outcome validation
    Given I open the SauceDemo login page
    When I login with username "<username>" and password "<password>"
    Then login should be "<outcome>"
    And I should see message containing "<message>"

    Examples:
      | username        | password     | outcome | message                                                                    |
      | standard_user   | secret_sauce | success |                                                                            |
      | standard_user   | invalid_pass | failure | Username and password do not match any user in this service               |
      | locked_out_user | secret_sauce | failure | Sorry, this user has been locked out.                                     |

  @regression @login
  Scenario: problem_user can log in and reaches inventory
    Given I open the SauceDemo login page
    When I login with username "problem_user" and password "secret_sauce"
    Then login should be "success"

  @regression @login @slow
  Scenario: performance_glitch_user can log in within extended timeout
    Given I open the SauceDemo login page
    When I login with username "performance_glitch_user" and password "secret_sauce"
    Then login should be "success"
