Feature: OrangeHRM Login

  Background:
    Given I am on the OrangeHRM login page

  @smoke @login @orangehrm
  Scenario Outline: EP - Login outcome with valid and invalid credentials
    When I sign in with username "<username>" and password "<password>"
    Then the OrangeHRM login result should be "<outcome>"

    Examples:
      | username | password     | outcome |
      | Admin    | admin123     | success |
      | Admin    | wrongpass    | failure |
      | nobody   | admin123     | failure |

  @regression @login @orangehrm
  Scenario: BVA - Empty username field shows Required validation
    When I sign in with username "" and password "admin123"
    Then I should see an OrangeHRM error containing "Required"

  @regression @login @orangehrm
  Scenario: BVA - Empty password field shows Required validation
    When I sign in with username "Admin" and password ""
    Then I should see an OrangeHRM error containing "Required"

  @regression @login @orangehrm
  Scenario: BVA - Both fields empty shows Required on both fields
    When I sign in with username "" and password ""
    Then I should see an OrangeHRM error containing "Required"

  @regression @login @orangehrm
  Scenario: ST - Failed login leaves user on login page with editable form
    When I sign in with username "Admin" and password "wrongpass"
    Then the OrangeHRM login result should be "failure"
    And the OrangeHRM login form should still be visible

  @regression @login @orangehrm
  Scenario: ST - Forgot password link navigates to reset page
    When I click the forgot password link
    Then I should be on the OrangeHRM password reset page

  @regression @login @orangehrm
  Scenario: EG - SQL injection payload in username field does not grant access
    When I sign in with username "' OR '1'='1" and password "anything"
    Then the OrangeHRM login result should be "failure"

  @regression @login @orangehrm
  Scenario: EG - Navigate directly to dashboard without login redirects to login
    When I navigate directly to the OrangeHRM dashboard
    Then I should be redirected to the OrangeHRM login page
