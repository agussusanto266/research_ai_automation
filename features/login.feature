@smoke @login
Feature: SauceDemo login
  As a user of SauceDemo
  I want robust login automation
  So that auth flows remain stable

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
